import { LightningElement, wire, track,api } from 'lwc';
import getPipelineProductTableColumns from '@salesforce/apex/ProductSearchController.getPipelineProductTableColumns';
import getPipelineProductData from '@salesforce/apex/ProductSearchController.getPipeLineProducts';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import { getPicklistValuesByRecordType } from 'lightning/uiObjectInfoApi';
import checkPicklistValues from '@salesforce/apex/ProductSearchController.checkForPickListValues';
import getBrandOptions from '@salesforce/apex/ProductSearchController.getBrandOptions';
import getNamespace from '@salesforce/apex/ProductSearchController.getNamespace';
import getPipelineLinetItemProductTableColumns from '@salesforce/apex/ProductSearchController.getPipelineLineItemProductTableColumns';
import loadProductSelectorConfiguration from '@salesforce/apex/ProductSearchController.loadProductSelectorConfiguration'
import PIPELINE_PRODUCT_OBJECT from '@salesforce/schema/Pipeline_Product__c';
import userId from '@salesforce/user/Id';
import saveItems from '@salesforce/apex/ProductSearchController.saveItems';
import { getRecordNotifyChange } from 'lightning/uiRecordApi';



export default class ProductSearch extends LightningElement {

     //The namespace of the org
     namespacePrefix;
    
    //Product selection confgiuration records
    productSelectorConfiguration;

    //Selected editable fields
    selectedEditableFields;

    //The columns for the table
    columns;

    //The data for the table search
    data = [];

    //The criteria for the name search;
    nameSearchCriteria = {};
    //The criteria for the brand search;
    brandSearchCriteria = {};
    //The criteria for the family/Platform search;
    familySearchCriteria = {};

    //This is for the brand options
    brandOptions = [];

    //These are the Platform option or Family options
    platformOptions = [];

    //To show the spinner when loadingdata
    loadingData = false;

    //The erros shown in the table
    tableErrors ={};

    //Data for the selected table
    dataSelected = [];
    //Columns for the selected table
    columnsSelected = [];
    selectedTableErrors ={};

    objectApiName = '';
    pipelineProductRecordTypeId = '';
    pipelineLineItemRecordTypeId = '';

    //Status fields for selected tabled.
    statusOptions = [];

    //Style for the search tabled
    styleHeight;

    showDateModal = false;

    draftValues = [];
    //To check when there is no data
    emptyDataList = true;

    loadingSearch = true;

    emptyDataSelected = true;

    rowIdByFieldsList = {};

    //The user Id
    userIdVar;

    //The Opportunity Id
    @api
    opportunityId;

    //Default value for the picklist Brand if only on value.
    defaultBrand;

    recordAmount;


    //This will happen before render
    connectedCallback(){
        this.invokeAllMethods();
    }

    async invokeAllMethods(){
        try {
            //Setting the user Id
            this.userIdVar = userId;
            //Getting the namespace of the org
            const namespace = await getNamespace();
            //Getting the information for the custom metadata type
            const configuration = await loadProductSelectorConfiguration();
            const searchTableColumns = await getPipelineProductTableColumns({"fieldSetApiName" : "Product_Selector_Field_Set", "objectApiName": "Pipeline_Product__c"});
            //Getting the columns fro the selected table
            const selectedProductTable = await getPipelineLinetItemProductTableColumns({"fieldSetApiName" : "Pipeline_Line_Item_Fieldset", "objectApiName": "Pipeline_Product_Line_Item__c"});
            //Getting the picklist values for the filters
            
            var userRecordType = (namespace != "" && namespace != undefined)? (configuration[namespace + "Use_Pipeline_Line_Item_Record_Type_Value__c"]): configuration["Use_Pipeline_Line_Item_Record_Type_Value__c"];
            var recordTypeDeveloperName = (namespace != "" && namespace != undefined)? (configuration[namespace + "Pipeline_Product_Record_Type_Name__c"]): configuration["Pipeline_Product_Record_Type_Name__c"];
            const thePicklistValues = await checkPicklistValues({objectApiName : 'Pipeline_Product__c', 
                customMedatadeveloperName: 'Selector_Configuration', 
                picklistFieldApiName : 'Family__c', 
                useRecordType : userRecordType, 
                recordTypeDeveloperName : recordTypeDeveloperName
            });
            //Getting the brands
            let useUserBrandsObject = (namespace != "" && namespace != undefined)? (configuration[namespace + "Use_User_Brands_Object__c"]):configuration["Use_User_Brands_Object__c"];
            const brandOption = await getBrandOptions({userId : userId.toString(), userUserBrandsObject : useUserBrandsObject});

            if(configuration){
                let recordAmount = (namespace != "" && namespace != undefined)? (configuration[namespace + "Record_Amount__c"]) : configuration["Record_Amount__c"];
                var height = recordAmount * 50;
                this.recordAmount = recordAmount;
                //Setting the height of the table based on how many records to show.
                this.styleHeight = "max-height:" + height.toString() + "px;overflow-y:scroll";
                //Getting the select editable fields fields
                for(var key in configuration){
                    var stringKey = key.toString();
                    if(stringKey.includes("Selected_Products_Editable_Fields__c")){
                        var editableValues = configuration[stringKey].split("\n");
                        var newList = [];
                        //Removing the carrage enter that the field has
                        for(var i =0, size = editableValues.length; i < size; i++){
                            var theValue = editableValues[i];
                            newList.push(theValue.replace("\n","").trim());
                        }
                        this.selectedEditableFields = newList;
                        break;
                    }
                }
                
                this.productSelectorConfiguration = configuration;
            }

            

            if(searchTableColumns){
                //Adding the add button to the search table
                const columnsList = [];
                const addbuttonColumn = new Object();
                addbuttonColumn.type = "addRowButton";
                addbuttonColumn.label = "";
                addbuttonColumn.fieldName = "Id";
                let productNameField = (namespace != "" && namespace != undefined)? (namespace + "Pipeline_Brand__r." + namespace + "Brand_Name__c"): "Pipeline_Brand__r.Brand_Name__c";
                let familyFieldName = (namespace != "" && namespace != undefined)? (namespace + "Family__c"): "Family__c";
                let dateField = (namespace != "" && namespace != undefined)? (namespace + "Date__c"): "Date__c";
                addbuttonColumn.typeAttributes = { 
                    productName : { fieldName: "Name" }, 
                    brandName: { fieldName: productNameField }, 
                    familyName: { fieldName : familyFieldName},
                    dateField : dateField,
                    dateValue : {fieldName : dateField},
                    familyType : {fieldName : familyFieldName}
                };
                //PUshing the add button
                columnsList.push(addbuttonColumn);
                //Creating the columns
                for(var i=0,size = searchTableColumns.length; i < size; i++){
                    const tableColumn = searchTableColumns[i];
                    const columnObj = {};

                    columnObj["label"] = tableColumn.label;
                    columnObj["fieldName"] = tableColumn.fieldApiName;
                    columnObj["sortable"] = true;
                    if(tableColumn.type == "date"){
                        //Data table setting the date to a day less when type = date
                        columnObj["type"] = "date-local";
                    } else {
                        columnObj["type"] = tableColumn.type;
                    }
                    
                    columnsList.push(columnObj);
                }
                this.columns = columnsList; 
            }

            if(selectedProductTable){
                //Creating the delete icon for the selected table
                const selectedColumnsList = [];
                const deletebuttonColumn = new Object();
                deletebuttonColumn.type = "deleteRowButton";
                deletebuttonColumn.label = "";
                deletebuttonColumn.fieldName = "Id";
                //Creating the columns
                for(var i=0,size = selectedProductTable.length; i < size; i++){
                    const tableColumn = selectedProductTable[i];
                    let selectedcolumnObj = {};
                    var selectedEditableFields = this.selectedEditableFields;
                    var familyTypeFieldApi = (namespace != "" && namespace != undefined)? (namespace + "Pipeline_Product__r." + namespace + "Family__c"): "Pipeline_Product__r.Family__c";
                    //CHECKING IF THE FIELD IS IN THE EDITABLE FIELDS
                    if(selectedEditableFields.indexOf(tableColumn.fieldApiName.toString()) >= 0){
                         //These are the inputs that will appear on the selected table.
                        selectedcolumnObj["type"] = "rowInput";
                        selectedcolumnObj["fieldName"] = tableColumn.fieldApiName;
                        selectedcolumnObj["label"] = tableColumn.label;
                        selectedcolumnObj["editable"] = true;
                        
                        if(tableColumn.type === "currency"){
                            selectedcolumnObj["typeAttributes"] = {
                                typeName : "number", 
                                label : "",
                                formatter : "currency", 
                                step: "0.01",
                                //The will map to the value of the column with the fieldName of Id
                                rowId: { fieldName : "Id"},
                                name: tableColumn.fieldApiName
                            };
                        } /*else {
                            selectedcolumnObj["typeAttributes"] = {
                                typeName : tableColumn.type, 
                                label : "",
                                rowId: { fieldName : "Id"},
                                name: tableColumn.fieldApiName,
                                familyType : { fieldName : familyTypeFieldApi }
                            };
                        }*/

                        if(tableColumn.type === "picklist"){
                            let usePicklistRecordType = (namespace != "" && namespace != undefined)? (configuration[namespace + "Use_Pipeline_Line_Item_Record_Type_Value__c" ]): configuration["Use_Pipeline_Line_Item_Record_Type_Value__c" ];
                            let recordTypeNameForPicklistValues = (namespace != "" && namespace != undefined)? (configuration[namespace + "Line_Item_Record_Type_Name__c" ]): configuration["Line_Item_Record_Type_Name__c" ];

                            selectedcolumnObj["typeAttributes"] = {
                                typeName : tableColumn.type, 
                                label : "" , 
                                name: tableColumn.fieldApiName,
                                usePicklistRecordType: usePicklistRecordType,
                                recordTypeNameForPicklistValues: recordTypeNameForPicklistValues,
                                rowId: { fieldName : "Id"},
                                value : "Pipeline"
                            };
                            selectedcolumnObj["wrapText"] = true;
                            selectedcolumnObj["cellAttributes"] = { class: 'cell-height'};
                             
                        }

                        if(tableColumn.type === "date"){
                            selectedcolumnObj["typeAttributes"] = {
                                typeName : tableColumn.type, 
                                label : "" , 
                                name: tableColumn.fieldApiName,
                                rowId: { fieldName : "Id"},
                                value : { fieldName: tableColumn.fieldApiName },
                                family : {fieldName : familyTypeFieldApi }
                            };
                        }
                        
                    } else {
                        selectedcolumnObj["type"] = tableColumn.type; 
                        selectedcolumnObj["label"] = tableColumn.label;
                        selectedcolumnObj["fieldName"] = tableColumn.fieldApiName;
                        selectedcolumnObj["sortable"] = true;
                    }
                    
                    selectedColumnsList.push(selectedcolumnObj);
                }
                //Adding the delete button
                selectedColumnsList.push(deletebuttonColumn);
                this.columnsSelected = selectedColumnsList; 
            }

            if(brandOption){
                var optionsList = [];
                //None value
                let obj = {label : "--None--",value: "--None--"};
                if(brandOption.length == 1){
                    this.defaultBrand = brandOption[0];
                } else {
                    this.defaultBrand = "--None--";
                }
                optionsList.push(obj);
                for(var i=0,size = brandOption.length; i< size; i++){

                    let obj = { label : brandOption[i], value: brandOption[i]};
                    optionsList.push(obj);
                }
                this.brandOptions = optionsList;
            }

            if(thePicklistValues){
                //Verify the recordType Id
                if(Object.keys(thePicklistValues).length === 0){
                    this.showToast("Error","error","Please verify Record Type name in the product selector configuration."); 
                    //TODO: Fire an event and CLOSE THE MODAL
                    return;
                } else {
                    var keySelected = '';
                    var optionsList = [];
                    let obj = {label:"--None--",value:"--None--"};
                    optionsList.push(obj);
                    for(var key in thePicklistValues){
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
                        this.pipelineProductRecordTypeId = keySelected;
                       
                    } else {
                        this.platformOptions = optionsList;
                    }
                    
                }    
            }
            this.loadingSearch = false;
        } catch (error){
            console.log("asyncInvoke -> THE ERROR ",error);
            this.showToast("Error","error",error.toString());  
        }
    }

    renderedCallback(){
        //This is listening to the paginator event
        this.template.addEventListener('paginatordataevent', evt => {
            this.data = evt.detail.data;
        });
    }

    @wire(getPicklistValuesByRecordType, { objectApiName: PIPELINE_PRODUCT_OBJECT, recordTypeId:'$pipelineProductRecordTypeId' }) 
    FamilyPicklistValues({error, data}) {
        if(data) {
            var platformOptions = [];
            var obj = {attributes: null,label: "--None--", validFor: Array(0),value: "--None--"};
            platformOptions.push(obj);
            var values = [];
            //Finding the Family picklist field property
            for(var key in data.picklistFieldValues){
                if(key.search("Family__c") >= 0){
                    values = data.picklistFieldValues[key].values;
                    break;
                }
            }
            //Adding the values to the options list
            for(var i = 0, size = values.length; i < size; i++){
                platformOptions.push(values[i]);
            }
            this.platformOptions = JSON.parse(JSON.stringify(platformOptions));
        } else if(error) {
            console.log("IN THE ERROR",error);
            this.showToast("Error","error",error.body.message);
        }
    }

    setCriteria(event,criteria,criteriaName){

        this.loadingData = !this.loadingData;
        if(criteriaName == "name"){
            this.nameSearchCriteria = criteria;
        }
        
        if(criteriaName == "family"){
            this.familySearchCriteria = criteria;
        }

        if(criteriaName == "brand"){
            this.brandSearchCriteria = criteria;
        }

        this.searchProducts();

    }

    handleClick(event) {
        this.loadingData = !this.loadingData;
        this.searchProducts();
    }

    //Handling the Key Press when Enter is pressed on the search input box
    handleOSearchnKeyPress(event){
        const keyPressed = event.keyCode;
        const textValue = event.target.value;
        var nameSearchCriteria = this.nameSearchCriteria;
        if(keyPressed === 13){
            if(textValue){
                
                nameSearchCriteria["Name"] = {"type" : "text", "value":textValue};
                this.nameSearchCriteria = nameSearchCriteria;
                //this.searchProducts();
            }
            //This is to show the spiinner
            this.loadingData = !this.loadingData;
            this.searchProducts();
        }
    }

    //This method will handle the change for the brands picklist
    handleBrandChange(event){
        //This is to show the spiinner
         this.loadingData = !this.loadingData;
        const textValue = event.target.value;
        var brandSearchCriteria  = this.brandSearchCriteria;
        if(textValue === "--None--"){
            this.brandSearchCriteria = {};
        } else {
            let fieldApiName = ( this.namespacePrefix != "" && this.namespacePrefix != undefined) ? (this.namespacePrefix + "Pipeline_Brand__r." + this.namespacePrefix + "Brand_Name__c") : "Pipeline_Brand__r.Brand_Name__c";
            brandSearchCriteria[fieldApiName] = {"type" : "text", "value":textValue};
            this.brandSearchCriteria = brandSearchCriteria;
        }
        //Calling the search products method
        this.searchProducts(); 
    }

    //This method is to handle the change of the Family Field
    handleFamilyChange(event){
        //This is to show the spiinner
        this.loadingData = !this.loadingData;
        const textValue = event.target.value;
        var familySearchCriteria  = this.familySearchCriteria;
        if(textValue === "--None--"){
            this.familySearchCriteria = {};
        } else {
            let fieldApiName = ( this.namespacePrefix != "" && this.namespacePrefix != undefined) ? (this.namespacePrefix + "Family__c") : "Family__c";
            familySearchCriteria[fieldApiName] = {"type" : "text", "value":textValue};
            this.familySearchCriteria = familySearchCriteria;
        }

        //Calling the search products method
        this.searchProducts();
    }

    /**
     * Searching the produts
    */
    searchProducts(){
        const criteria = {};
        criteria["searchCriteria"] = [];
        var searchCriteria = [];

        //Filter for getting Active products
        let fieldApiName = ( this.namespacePrefix != "" && this.namespacePrefix != undefined) ? (this.namespacePrefix + "Is_Active__c") : "Is_Active__c";
        var activeSearchCriteria = {};
        activeSearchCriteria[fieldApiName] = {"type" : "boolean", "value":"true"};
        searchCriteria.push(activeSearchCriteria);

        //Getting the value from the search input
        var nameInput = this.template.querySelector(".searchInput").value;

        var brandValue = this.template.querySelector(".brandCombobox").value;

        var platformValue = this.template.querySelector(".platformCombobox").value;
        if(Object.keys(this.nameSearchCriteria).length !== 0){
            searchCriteria.push(this.nameSearchCriteria);
        }else {
            if(nameInput != ""){
                searchCriteria.push({"Name" : {"type": "text","value":nameInput}});
            }
        }
        if(Object.keys(this.brandSearchCriteria).length !== 0){
            searchCriteria.push(this.brandSearchCriteria);
        }else {
            if(brandValue != "--None--"){
                var brandfieldApiName =  ( this.namespacePrefix != "" && this.namespacePrefix != undefined) ? (this.namespacePrefix + "Pipeline_Brand__r." + this.namespacePrefix + "Brand_Name__c") : "Pipeline_Brand__r.Brand_Name__c";
                var brandObj = {};
                brandObj[brandfieldApiName] = {"type": "text","value":brandValue} ;
                searchCriteria.push(brandObj);
            }
        }
        if(Object.keys(this.familySearchCriteria).length !== 0){
            searchCriteria.push(this.familySearchCriteria);
        }else {
            if(platformValue != "--None--"){
                var familyFieldApi = ( this.namespacePrefix != "" && this.namespacePrefix != undefined)? (this.namespacePrefix + "Family__c"): "Family__c";
                var famObj= {};
                famObj[familyFieldApi] = {"type": "text","value":platformValue};
                searchCriteria.push(famObj);
            }
        }
        if(searchCriteria.length > 0){
            criteria["searchCriteria"] = searchCriteria;
            const jsonCriteria = JSON.stringify(criteria);
            getPipelineProductData({searchCriteria : jsonCriteria, objectApiName: 'Pipeline_Product__c',
                                        fieldSetApiName:'Product_Selector_Field_Set',limitRecords: 2000})
            .then((result) => {
                //This is to show the spiinner
                this.loadingData = false;
                if(result.length === 0){
                    this.emptyDataList = true;
                    //Clearing out the list with the old values;
                    this.data = JSON.parse(JSON.stringify([]));
                } else {
                    this.emptyDataList = false;
                    //Checking for reference fields
                    var newList = [];
                    newList = this.parseReferenceData(result);
                    //var datalist = new Array(newList);
                    //send the data from the table to the paginator
                    this.template.querySelector('c-paginator').tableDataInformation(newList);
                    //this.data = JSON.parse(JSON.stringify(newList)); 
                    //Clearing the search criteria
                    this.nameSearchCriteria = {};
                    this.brandSearchCriteria = {};
                    this.familySearchCriteria = {};  
                }
            }).catch((error) => {
                console.log("Error",error);
                this.showToast("Error","error",error.message); 
            });
        } else {
            //This is to show the spiinner
            this.loadingData = false; 
        }
        
    }

    showToast(title,type,message){
        const evt = new ShowToastEvent({
            title: title,
            message: message,
            variant: type,
        });
        this.dispatchEvent(evt);
    }

    //THIS METHOD IS TO GET ALL THE DATA IN THE relationship field
    //i.e. Pipeline_Brand__r.Brand_Name__c 
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

    handleAddRow(event){        
        var dataList = [];
        var columnsList = this.columnsSelected;
        var dataSelected = this.dataSelected;
        let obj = {};

        //Adding the Id to the table.
        obj["Id"] = event.detail.rowId;
        //Checking for the existant value
        var returnedElement = this.checkElementInList(obj,dataSelected);
        if(!returnedElement){
            for(var i =0,size = columnsList.length; i < size; i++){
                let element = columnsList[i];
                if(element.fieldName == "Id"){
                    continue;
                }
                if(element.fieldName.includes("Pipeline_Product__r.Name")){
                    obj[element.fieldName] = event.detail.productName;
                    
                }else if(element.fieldName.includes("Pipeline_Brand__c")){
                    obj[element.fieldName] = event.detail.brandName;
                }else if(element.fieldName.includes("Family__c")){
                    obj[element.fieldName] = event.detail.familyName;
                    
                } else if(element.fieldName.includes("Status__c")){
                    //THe default value for the list when status is included
                    obj[element.fieldName] = "Pipeline";
                }else if((element.fieldName.includes("Start_Date__c") > 0) || (element.fieldName.includes("End_Date__c"))) {
                    //This is setting the value on the date fields
                    let dateValue = event.detail.dateValue;
                    if(dateValue){
                        obj[element.fieldName] = dateValue;

                    } else {
                        obj[element.fieldName] = "";
                    }

                } else  {
                    obj[element.fieldName] = "";
                }
                
                //let objtType = this.getFieldTypeObj(element.type);
            }
            //Adding the object to the data of the table
            dataSelected.push(obj);
            //THIS IS FOR THE Selected table COMPONENT TO REFRESH
            //deep clone the the array of data 
            let newList = JSON.parse(JSON.stringify(dataSelected));
            this.dataSelected = JSON.parse(JSON.stringify(newList));
            //To know if the list is empty. Setting the list to full
            this.emptyDataSelected = false;
        } else {
            this.showToast("Error","error","You have already selected the element.");
        }
        
        
    }
    handleDeleteRow(event){
        
        const rowId = event.detail.rowId;
        var dataSelected = this.dataSelected;
        var newDataSelectedList = [];
        for(var i = 0,size=dataSelected.length; i < size; i++){
            let element = dataSelected[i];
            if(element.Id === rowId){
                dataSelected.splice(i,1);
                newDataSelectedList = dataSelected;
                break;
            }
        }
        this.dataSelected = JSON.parse(JSON.stringify(newDataSelectedList))
        if(this.dataSelected.length == 0){
            this.emptyDataSelected = true;
        }

    }

    getFieldTypeObj(column){
        let objType = {};
        if(column.type === "currency"){
            objType["type"] = column.type;
            objType["typeAttributes"] = { currencyCode: "USD"};
        } else if(column.type === "date"){
            objType["type"] = "date-local";
            objType["typeAttributes"] = { month: "2-digit", day: "2-digit"};
        } else if(column.type === "text"){
            objType["type"] = "text";
        }
        return objType;
    }

    getRecordTypeOrPicklistvalues(objectApiName,customMedataTypeName,picklistFieldApiName,useRecordType,recordTypeDeveloperName){
        var returnObject = {};
        //Getting Family Picklist value                             
        checkPicklistValues({objectApiName : objectApiName, 
            customMedatadeveloperName: customMedataTypeName, 
            picklistFieldApiName : picklistFieldApiName, 
            useRecordType : useRecordType, 
            recordTypeDeveloperName : recordTypeDeveloperName})
        .then((result) => {
            //Verify the recordType Id
            if(Object.keys(result).length === 0){
                this.showToast("Error","error","Please verify Record Type name in the product selector configuration."); 
                //TODO: Fire an event and CLOSE THE MODAL
                return;
            } else {
                var keySelected = '';
                var optionsList = [];
                let obj = {label:"--None--",value:"--None--"};
                optionsList.push(obj);
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
                    returnObject["recordTypeId"] = keySelected;
                    //this.recordTypeId = keySelected;
                } else {
                    returnObject["options"] = optionsList;
                    //this.platformOptions = optionsList;
                } 
            }
        }).catch((error) => {
            this.showToast("Error","error",error.message);
        });  
        
    }

    //This method checks for empty values.
    /**
     * This is a method to check for empty fields and to create the error message to show on the table
     * The following is an example of an error message
     * /*errors.rows["a024x000003yHA8AAM"] = { title: 'Testing Errors',
                                                messages: ["Testing Errors Amount","Testing Erros status"],
                                            fieldNames: ["Amount__c","Start_Date__c","End_Date__c","Status__c"]
                                        };
    
            errors.rows["a024x000003yH9yAAE"] = { title: 'Testing Errors',
                                                messages: ["Testing Errors Amount","Testing Erros status"],
                                                fieldNames: ["Amount__c","Start_Date__c","End_Date__c","Status__c"]
        }; 
        The table will recieve the error with on object containing the rows which it will through the message
    */
    checkEmptyFields(){
        var isValid = true;
        var columnsSelected = this.columnsSelected;
        var dataSelected = this.dataSelected;
        let title = 'Errors';
        let messages = ['Please correct the fields highlighted.','Verify that the date fields are correly inputted.','Amount value is incorrect.'];
        let fieldsNameInOrder = [];
        let tableTitle = "Found Errors";
        let tableMessages = 'You are missing data in the fields highlighted';
        var errors = { rows:{},table:{}};
        var rows= {};
        //This will create the error messages.
        //Checks if the value in the data list are empty for each row.
        if(dataSelected.length > 0){
            dataSelected.forEach((element) => {
            
                let fieldNames = [];
                var emptyCounter = 0;
                for(var key in element){
                    if(element[key] == ""){
                       
                        rows[element.Id] = { title: title, messages: messages};
                        fieldNames.push(key);
                    } else {
                        emptyCounter++;
                        fieldNames.push("");
                    }
                }
                if(Object.keys(rows).length > 0){
                    
                    if(emptyCounter != fieldNames.length){
                        rows[element.Id]["fieldNames"] = fieldNames;
                    }
                    
                    
                }
            });
            //Checking for erros.
            if(Object.keys(rows).length > 0){
                //This means that there are errors
                isValid = false;
            }
            errors.rows = rows;
            errors.table.title = "We found some errors.";
            errors.table.messages = ["Please revise."];
            console.log("THE ERRORS",errors);
            this.selectedTableErrors = JSON.parse(JSON.stringify(errors));
            return isValid;  
                                            
        }
    }
    //This method will set the error on the field for any validation.
    setErrorOnField(element,fieldApiName,isAddError){
        let title = 'Errors';
        let messages = ['Please correct the fields highlighted.','Verify that the date fields are correly inputted.','Amount value is incorrect.'];
        let fieldsNameInOrder = [];
        let tableTitle = "Found Errors";
        let tableMessages = 'You are missing data in the fields highlighted';
        var errors = { rows:{},table:{}};
        let rows = {};
        if(isAddError){
            //let selectedErrors = this.selectedTableErrors;
            rows[element.Id] = { title: title,
                                                messages: messages,
                                            fieldNames: [fieldApiName]
                                        };
        } else {
            errors = { rows:{},table:{}};
            //let selectedErrors = this.selectedTableErrors;
            errors.rows[element.Id] = {};
        }
        errors.rows = rows;
        errors.table.title = "We found some errors.";
        errors.table.messages = ["Please revise."];
        return errors; 
        
                                 
    }

    checkElementInList(element,list){
        let returnedElement = list.find(arrElement => {
            if(arrElement.Id == element.Id){
                return arrElement;
            }
        });
        return returnedElement;
    }

    handleInputEvent(event){
        var rowId = event.detail.rowId;
        var value = event.detail.rowvalue;
        var fieldApiName = event.detail.fieldApiName;
        var dataList = this.dataSelected;
        var fieldType = event.detail.type.toLowerCase();
        var newList = [];
        var element = {Id : rowId};
        let isValidDate = false;
        let isValidField = false;
        var currentSelectedErrors = this.selectedTableErrors;
        

        //The returned element.Getting the element from the list.
        var returnedElement = this.checkElementInList(element,dataList);
        if(fieldType.includes("date")){
            isValidDate = this.validateDate(returnedElement,value);
        }

        if(fieldType.includes("currency") || fieldType.includes("number")){
           isValidField = this.validateNumberFields(returnedElement,value);
        }

        if(isValidDate || isValidField){
            if(returnedElement){
                returnedElement[fieldApiName] = value;

                dataList.find( arrElement => {
                    if(arrElement.Id == rowId){
                        arrElement = returnedElement;
                    }   
                });
                if(Object.keys(currentSelectedErrors).length > 0){
                    //Search for Error and Clear the error
                    this.selectedTableErrors = {};
                }
                this.dataSelected = JSON.parse(JSON.stringify(dataList));
                //this.draftSelectedTableErrors = selectedTableErrors;
            }
        } else {
            this.checkEmptyFields();
            let errors = this.setErrorOnField(returnedElement,fieldApiName,true);
            //Launching for other errors

            currentSelectedErrors.rows = errors.rows;
            currentSelectedErrors.table = errors.table;
                                               
            this.selectedTableErrors = JSON.parse(JSON.stringify(currentSelectedErrors));

            this.showToast("Error","error","End Date field cannot be lower than the Start Date. Amount field should greater than zero and not empty");
            
            //this.showToast("Error","error","Amount field has to be greater than cero and not empty");
        
            //event.stopPropagation();
        }
        
    }

    validateDate(element,newValue){
        //TODO: Check if Start Date is not empty and then validate that the Enddate is greater then start date.
        var isValid = false;
        var keyList = Object.keys(element);
        var oldEndDate;
        var oldStartDate;
        keyList.forEach( arrElement => {
            if(arrElement.includes("End_Date__c")){
                oldEndDate = element[arrElement];
            }

            if(arrElement.includes("Start_Date__c")){
                oldStartDate = element[arrElement];
            }
        });
        
        
        var newValueParsed = new Date(newValue);
        var startDateParsed = (oldStartDate != "")? new Date(oldStartDate): null;
        var endDateParsed = (oldEndDate != "" )? new Date(oldEndDate): null;
        
        //For the End Date
        if(startDateParsed){
            if(newValueParsed >= startDateParsed){
                isValid = true;
            }
            //For the Start Date
        } else if(endDateParsed){
            if(newValueParsed >= endDateParsed){
                isValid = false;
            } else {
                isValid = true;
            }  
        } 
        if(startDateParsed == null && endDateParsed == null) {
            //All dates are empty
            isValid = true;
        }
        
        return isValid;
    }

    //Search for the error and use a list of fields to eliminate te errrors for the specific cell
    searchForErrorAndClear(element,fields){
        var columnsSelected = this.columnsSelected;
        var dataSelected = this.dataSelected;
        //Getting the column names
        var currentSelectedErrors = this.selectedTableErrors;
        var objectValues = Object.values(currentSelectedErrors);
        var newErrosObj = {};
        var isChanged = false;
        for(var i = 0,size = objectValues.length; i < size; i++){
            var errorRow = objectValues[i];
            var rows = {};
            for(var key in errorRow){
                var elementId = element["Id"];
                if(elementId === key){
                    isChanged = true;
                    fields.forEach((fieldName) => {
                        var indexFound = errorRow.fieldNames.indexOf(fieldName);
                        if(indexFound >= 0){
                            errorRow.fieldNames.splice(indexFound,1);
                            //This means there are no erros.
                            if(errObj.fieldNames.length == 0){
                                errorRow.messages = [];
                                errorRow.table = {};
                                objectValues[i] = {};
                            } else {
                                objectValues[i] = errorRow;
                                rows = errorRow;
                                
                            }
                        }
                    });
                } 
            }
            newErrosObj.rows = rows;
        }
       
        //currentSelectedErrors.rows = rows;
        if(Object.keys(newErrosObj).length > 0 && isChanged){
            this.selectedTableErrors = newErrosObj;
        }            
    }

    validateNumberFields(element,value){
        var isValid = false;
        if(value > 0){
            isValid = true;
        }
        return isValid;
    }

    @api
    saveMethod(){
        var currentData = this.dataSelected;
        var productListToSave = [];
        var isValid = this.checkEmptyFields();
        if(isValid){
            currentData.forEach((element) => {
                let product = {};
                product["Id"] = element.Id;
                for(var key in element){
                    if(key.includes("Start_Date__c")){
                        product["Start_Date__c"] = element[key];
                    }

                    if(key.includes("End_Date__c")){
                        product["End_Date__c"] = element[key];
                    }

                    if(key.includes("Family__c")){
                        product["Family__c"] = element[key];
                    }

                    if(key.includes("Amount__c")){
                        product["Amount__c"] = element[key];
                    }

                    if(key.includes("Status__c")){
                        product["Status__c"] = element[key];
                    }                   
                }

                productListToSave.push(product);
                
            });

            if(productListToSave.length > 0){
                let parsedJson = JSON.stringify(productListToSave);
                saveItems({jsonproductItems: parsedJson , opportunityId: this.opportunityId })
            .then((result) => {
                this.showToast("Success","success","Your products have been added successfully.");
                const refreshTableEvt = new CustomEvent('refreshtableevt',{
                    bubbles: true,
                    composed: true
                });
                this.dispatchEvent(refreshTableEvt);
                const closeModalEvt = new CustomEvent('closemodalevt',{
                    bubbles: true,
                    composed: true
                });
                this.dispatchEvent(closeModalEvt);
                
                
                //Refresh Opp for new data.
                getRecordNotifyChange([{recordId: this.opportunityId}]);
                
            }).catch((error) => {
                console.log(error);
                this.showToast("Error","error",error.body.message);
            });
            }
                
        } else {
            console.log("Not valid");
            this.showToast("Error","error","Please correct all the errors.");    
        }
        
    }

}