import { LightningElement,api,wire } from 'lwc';
import PIPELINE_PRODUCT_LINE_ITEM_OBJECT from '@salesforce/schema/Pipeline_Product_Line_Item__c';
import checkPicklistValues from '@salesforce/apex/ProductSearchController.checkForPickListValues';
import { getPicklistValuesByRecordType } from 'lightning/uiObjectInfoApi';

export default class DatatableInputText extends LightningElement {

    @api
    typeName;

    @api 
    name;

    @api
    label

    @api
    value;

    @api
    formatter;

    @api
    step;

    @api
    required;

    showPicklist = false;

    showInputField = false;

    @api
    picklistOptions;

    @api
    placeholder;

    @api
    usePicklistRecordType;

    @api
    recordTypeNameForPicklistValues;

    @api rowId;

    pipelineItemRecordTypeId = '';

    showFormattedDate = false;

    @api family;

    isEvent = false;

    connectedCallback(){
        if(this.typeName === "picklist"){
            this.showPicklist = true;
            if(this.usePicklistRecordType){
                checkPicklistValues({objectApiName : 'Pipeline_Product_Line_Item__c', 
                    customMedatadeveloperName: 'Selector_Configuration', 
                    picklistFieldApiName : 'Status__c', 
                    useRecordType : this.usePicklistRecordType, 
                    recordTypeDeveloperName : this.recordTypeNameForPicklistValues
                }).then((result) => {
                    if(Object.keys(result).length === 0){
                        this.showToast("Error","error","Please verify Record Type name in the product selector configuration."); 
                        //TODO: Fire an event and CLOSE THE MODAL
                        return;
                    } else {
                        var keySelected = '';
                        var optionsList = [];
                        
                        for(var key in result){
                            //Detecting the Record Type returned
                            //var thekey = key;
                            if((key.length === 15 || key.length === 18) && key.substring(0,3) === '012'){
                                keySelected = key;
                                break;
                            } else {
                                //Getting the general picklist values
                                let obj = {label:key,value:key};
                                optionsList.push(obj); 
                            }
                            
                        }
                        
                        if(keySelected !== ""){
                            //returnObject["recordTypeId"] = keySelected;
                            this.pipelineItemRecordTypeId = keySelected;
                            //this.objectApiName = "Pipeline_Product__c";
                           
                        } else {
                            //returnObject["options"] = optionsList;
                            this.picklistOptions = optionsList;
                        }
                        
                    }    
                }).catch((error) => {
                    console.log("THE ERROR IN THE STATUS PICKLIST ",error);
                });
            }
        } else {
            //Showing the input field
            this.showInputField = true;
        }

        //Checking for when the date is prodivded. This mean it's an event with intial date.
        if(this.typeName == "date" &&  this.value != ""){
            this.isEvent = true;
        }

    }

    renderedCallback(){
        console.log("RENDERING");
        //Checking for when the date is prodivded. This mean it's an event with intial date.
        if(this.typeName == "date" && this.isEvent){
            if(this.name.includes("End_Date__c") && this.value != null && this.value != ""){
                this.showInputField = false;
            }

            if(this.name.includes("Start_Date__c") && this.value != null && this.value != ""){
                this.showFormattedDate = true;
                this.showInputField = false;
                
            }
        }
    }

   
    @wire(getPicklistValuesByRecordType, { objectApiName: PIPELINE_PRODUCT_LINE_ITEM_OBJECT, recordTypeId:'$pipelineItemRecordTypeId' }) 
    StatusPicklistValues({error, data}) {
        if(data) {
            var statusOptions = [];
            var values = [];
            //Finding the Family picklist field property
            for(var key in data.picklistFieldValues){
                if(key.search("Status__c") >= 0){
                    values = data.picklistFieldValues[key].values;
                    break;
                }
            }
            //Adding the values to the options list
            for(var i = 0, size = values.length; i < size; i++){
                statusOptions.push(values[i]);
            }
            this.picklistOptions = JSON.parse(JSON.stringify(statusOptions));
        } else if(error) {
            this.showToast("Error","error",error.toString());
        }
    }

    handleOnBlur(event){
        console.log("handleOnBlur -> IN THE EVENT",event.target.value);
        let value = event.target.value;
        const inputEvent = CustomEvent('inputevent',{
            composed: true,
            bubbles: true,
            cancelable: true,
            detail: {
                rowId: this.rowId,
                rowvalue: value,
                fieldApiName: this.name,
                type: this.typeName
                
            }   
        });
        this.dispatchEvent(inputEvent);
    }

    handleChange(event){
        console.log("THE EVENT ON THE COMBO -> ",event.target.value);
        let value = event.target.value;
        const comboEvent = CustomEvent('comboboxchange',{
            composed: true,
            bubbles: true,
            cancelable: true,
            detail: {
                rowId: this.rowId,
                rowvalue: value,
                fieldApiName: this.name,
                type: this.typeName
                
            }   
        });
        this.dispatchEvent(comboEvent);
    }

    showToast(title,type,message){
        const evt = new ShowToastEvent({
            title: title,
            message: message,
            variant: type,
        });
        this.dispatchEvent(evt);
    }
}