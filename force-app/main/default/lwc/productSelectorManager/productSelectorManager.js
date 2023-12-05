import { LightningElement, api, wire, track } from 'lwc';
import  getPipelineLineItemTableColumns from '@salesforce/apex/ProductSelectorManagerController.getPipelineLineItemTableColumns';
import  getPipeLineProductLineItems from '@salesforce/apex/ProductSelectorManagerController.getPipeLineProductLineItems';
import processPipelineProductLIDate from '@salesforce/apex/ProductSelectorManagerController.processPipelineProductLIDate';
import { updateRecord } from 'lightning/uiRecordApi';

import { refreshApex } from '@salesforce/apex';

import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import getStatusValues from '@salesforce/apex/ProductSelectorManagerController.getStatusValues';
import saveStatus from '@salesforce/apex/ProductSelectorManagerController.saveStatus';
import getNamespace from '@salesforce/apex/ProductSelectorManagerController.getNamespace';

export default class ProductSelectorManager extends LightningElement {
    
    @api recordId;
    @track pipelineLineItemId = '';
    @track showModal = false;
    @track columns = [];
    @track totalAmount = 0;
    @track openMonthSelector = false;
    @track data = [];
    @track draftValues = [];

    showStatusSelector = false;
    statusOptions;
    namespace;

    constructor() {
        super();
        this.template.addEventListener('cancel', this.handleCancel);

        //This is to manage the change month event
        this.template.addEventListener('changemonth',  evt => {
            processPipelineProductLIDate({
                processPipelineProductLineItemId: this.pipelineLineItemId,
                month: evt.detail.month,
                year: evt.detail.year
            }).then(() => {
                this.loadTableData();
            }).catch ((error) => {
                console.log("THE ERROR",error);
                this.dispatchEvent(
                    new ShowToastEvent({
                        title: 'Error',
                        message: 'An Error Occured!' + error.body.message,
                        variant: 'error'
                    })
                );
            });
        });

        
        
    }

    //This will happen before render
    connectedCallback(){
        let columns = [];

       getNamespace().then((result) => {
            this.namespace = result;
       }).catch((error) => {
            console.log("Error with namespace");
       });

        //fetch fieldsets to generate table columns dynamically 
        getPipelineLineItemTableColumns({
            fieldSetApiName: 'Pipeline_Line_Item_Manager_Fieldset', objectApiName: 'Pipeline_Product_Line_Item__c' 
        }).then((fieldsets) => {
            fieldsets.forEach(function(fieldSet){
                //create the structure of the columns for the table
                let columnObj = {};
                
                columnObj["label"] = fieldSet.label;

                if(fieldSet.label.includes("Brand")){
                    columnObj["label"] = "Brand";
                }

                columnObj["type"] = fieldSet.type;
                columnObj["fieldName"] = fieldSet.fieldApiName;
            
                if(fieldSet.fieldApiName.includes("Amount__c")){
                    columnObj["editable"] = true;
                    columnObj["cellAttributes"] = {
                        alignment: 'left'
                    };
                }

                if(fieldSet.label == "Status"){
                    columnObj["label"] = fieldSet.label
                    columnObj["type"] = "button";
                    columnObj["typeAttributes"] = {
                        name: "statusSelector",
                        label: { fieldName: fieldSet.fieldApiName },
                        variant: "base"
                    };
                    //columnObj["editable"] = true;
                }

                if(fieldSet.fieldApiName.includes("Start_Date__c")){
                    columnObj["label"] = "Month";
                    columnObj["type"] = "button";
                    columnObj["typeAttributes"] = {
                        name: "monthSelector",
                        label: { fieldName: fieldSet.fieldApiName },
                        variant: "base"
                    };   
                    //columnObj["editable"] = true;
                }

                
                columns.push(columnObj);
                
            });
            this.columns = columns;
        }).catch((error) => {
            console.log(error);
        });
        this.loadTableData();
    }

    renderedCallback(){
        
    }

    //The status options
    @wire( getStatusValues )
    statusValueOptions({error,data}){
        if(data){
            let statusOptions = [];
            for(var key in data){
                let obj = {};
                obj["label"] = data[key];
                obj["value"] = key;
                statusOptions.push(obj);
            }
            //The list of options
            this.statusOptions = statusOptions;

        } else if(error){
            console.log("THE ERRROR",error);
        }
    }

    loadTableData(){
        //fetch all Pipeline_Product_Line_Item__c related to the actual Opportunity
        getPipeLineProductLineItems({
            searchCriteria: `{"searchCriteria":[{"Opportunity__c":{"type":"id","value":"${this.recordId}"}}]}`,
            fieldSetApiName: "Pipeline_Line_Item_Manager_Fieldset",
            objectApiName: "Pipeline_Product_Line_Item__c",
            limitRecords: null

        }).then((pipelineItems) => {
            let months = {
                '01' : 'Jan',
                '02' : 'Feb',
                '03' : 'Mar',
                '04' : 'Apr',
                '05' : 'May',
                '06' : 'Jun',
                '07' : 'Jul',
                '08' : 'Aug',
                '09' : 'Sept',
                '10' : 'Oct',
                '11' : 'Nov',
                '12' : 'Dec'
            }

            let total = 0;
            var newList = this.parseReferenceData(pipelineItems);
            var namespace = this.namespace;
            pipelineItems.forEach(function(pipelineItem){
                //Sums all amounts where the status of the line item is different than Lost to be displayed above the table
                let statusField = (namespace != "" && namespace != undefined)? (namespace + "Status__c"): "Status__c";
                let amountField = (namespace != "" && namespace != undefined)? (namespace + "Amount__c"): "Amount__c";
                if(pipelineItem[statusField] != 'Lost')
                    total += pipelineItem[amountField];
                
                //reassign fields to match with the table columns
                let productName = (namespace != "" && namespace != undefined)? (namespace + "Pipeline_Product__r.Name"): "Pipeline_Product__r.Name";
                let brandField = (namespace != "" && namespace != undefined)? (namespace + "Pipeline_Product__r." + namespace + "Pipeline_Brand__c"): 'Pipeline_Product__r.Pipeline_Brand__c';
                let familyField = (namespace != "" && namespace != undefined)? (namespace + "Family__c"): "Family__c";
                pipelineItem[productName] = pipelineItem[productName];
                pipelineItem[brandField] = pipelineItem[brandField];
                pipelineItem[familyField] = pipelineItem[familyField];

                //give a new format to the date 
                let startdate = (namespace != "" && namespace != undefined)? (namespace + "Start_Date__c"): "Start_Date__c";
                let splitedDate = pipelineItem[startdate].split('-');
                pipelineItem[startdate] = `${months[splitedDate[1]]} ${splitedDate[0]}`; 
            });

            //send the data from the table to the paginator
            //this.template.querySelector('c-paginator').tableDataInformation(pipelineItems);
            this.data = pipelineItems;
            this.totalAmount =  total;
            //this.data = pipelineItems;
        }).catch((error) => {
            console.log('lwc error', error);
        });
    }

    parseReferenceData(data){
        var arrayList = [];
        for(var i = 0,size = data.length; i < size; i++){
            var element = data[i];
            for(var key in element){
                let lastString = key.slice(key.length - 3);
                if(lastString === "__r"){
                    var referenceField = element[key];
                    for(var objKey in referenceField){
                        let stringValue = key + "." + objKey;
                        let value =  referenceField[objKey];
                        //Adding the referced fields to obtain refernce data
                        element[stringValue] = value;
                    }
                }
            }
            arrayList.push(element);
        }
        return arrayList;
    }

    //updates a row of the table
    handleSave2(event) {
        this.draftValues = event.detail.draftValues;
        const recordInputs = this.draftValues.slice().map(draft => {
            const fields = Object.assign({}, draft);
            return { fields };
        });

        // Updateing the records using the UiRecordAPi
        const promises = recordInputs.map(recordInput => updateRecord(recordInput));
        Promise.all(promises).then(res => {
            this.dispatchEvent(
                new ShowToastEvent({
                    title: 'Success',
                    message: 'Records Updated Successfully!!',
                    variant: 'success'
                })
            );
            this.loadTableData();
        }).catch(error => {
            this.dispatchEvent(
                new ShowToastEvent({
                    title: 'Error',
                    message: 'An Error Occured!!',
                    variant: 'error'
                })
            );
        }).finally(() => {
            this.draftValues = [];
        });
    }

    //This method uses the name key defined in the column to get the action for the button.
    callRowAction (event) {
        let actionName = event.detail.action.name;
        if(actionName == "monthSelector"){
            this.pipelineLineItemId = event.detail.row.Id; 
            this.openMonthSelector = true;
        }

        if(actionName == "statusSelector"){
            this.showStatusSelector = true;    
            this.pipelineLineItemId = event.detail.row.Id;
        }
        
    }

    handleChangeMonth(event){
        //console.log('whatever');
    }

    handleCancel(event){
        this.openMonthSelector = false;
    }

    //Show Modal
    handleShowModal(event){
        this.showModal = true;
    }

    //Close the modal
    handleCloseModal(event){
        this.showModal = false;
    }

    

    handleStatusCancel(event){
        this.showStatusSelector = false;
    }
    handleSaveStatus(event){
        let status = event.detail.status;
        let pipelineId = this.pipelineLineItemId;
        saveStatus({status: status,pipelineLineItemId: pipelineId})
        .then((result) => {
            this.showStatusSelector = false;
            this.loadTableData();
            /*this.dispatchEvent(
                new ShowToastEvent({
                    title: 'Success',
                    message: 'Records Updated Successfully!!',
                    variant: 'success'
                })
            );*/
        }).catch((error) => {
            this.dispatchEvent(
                new ShowToastEvent({
                    title: 'Error',
                    message: 'The status was unable to save ' + error,
                    variant: 'error'
                })
            );
        });
    }

    handleRefreshTableEvt(event){
        console.log("THE REFRESH EVT ON THE MANAGER");
        this.loadTableData();
    }
}