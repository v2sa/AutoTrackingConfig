({
    doInit: function (component, event, helper) {
        //Getting all the option for the components list.
        helper.getConfigurationLogComponents(component,event);
        
        //These are all the columns for the FileProperties Object in salesforce. You can find more information on the field in the following link:
        //https://developer.salesforce.com/docs/atlas.en-us.api_meta.meta/api_meta/meta_retrieveresult.htm
        component.set('v.columns', [
            {label: 'Created By Id', fieldName: 'createdById', type: 'text'},
            {label: 'Created By', fieldName: 'createdByName', type: 'text'},
            {label: 'Created Date', fieldName: 'createdDate', type: 'date'},
            {label: 'File Name', fieldName: 'fileName', type: 'text'},
            {label: 'Full Name', fieldName: 'fullName', type: 'text'},
            {label: 'Id', fieldName: 'id', type: 'text'},
            {label: 'Last Modified By Id', fieldName: 'lastModifiedById', type: 'text'},
            {label: 'Last Modified Name', fieldName: 'lastModifiedByName', type: 'text'},
            {label: 'Last Modified Date', fieldName: 'lastModifiedDate', type: 'date'},
            {label: 'Manageable State', fieldName: 'manageableState', type: 'text'},
            {label: 'Namespace', fieldName: 'namespacePrefix', type: 'text'},
            {label: 'Type', fieldName: 'componentType', type: 'text'}
        ]);       
        
        //Hiding the error section
        helper.handleCloseMessage(component,event);
        
        //Hiding the success message
        helper.handleSuccessCloseMessage(component,event);
        
        //Testing the show error
        //helper.showToast(component,event,"Error","error","EL MALDITO MESANJE");
    },
    
    search: function(component,event,helper){
        helper.searchMethod(component,event);
    },
    
    generate_xml: function(component,event,helper){
        var projectCmp = component.find("projectName");
        var projectName = projectCmp.get("v.SearchKeyWord");
        var projectSelectedRecords = projectCmp.get("v.lstSelectedRecords");
        var objProject = {};
        var dataProject = component.get("v.data");
        
        if(!$A.util.isEmpty(projectName)) {
            objProject["Name"] = projectName;   
            objProject["Id"] =  component.get("v.created_id");   
        }
        
        if(!$A.util.isEmpty(projectSelectedRecords)){
            console.log(projectSelectedRecords[0]);
            objProject["Name"] = projectSelectedRecords[0].Name;
            objProject["Id"] = projectSelectedRecords[0].Id;
        } 
        
        //The narrative for the project
        var projectNarrative = component.get("v.projectNarrative");
        if(!$A.util.isEmpty(projectNarrative)){
            objProject["Description__c"] = projectNarrative;
        }
        
        if(!objProject.hasOwnProperty('Name')) {
            helper.showToast(component,event,"Error","error",
                             "You have not selected a Configuration Log record or have not set a name for the Configuration Log.");
            return;
        }
        
        if(dataProject.length == 0){
            helper.showToast(component,event,"Error","error",
                             "The result table must not be empty!");
            return;
        }
        
        helper.saveConfigLogPackage(component, event, JSON.stringify(objProject), JSON.stringify(dataProject));   
    },
    
    handleConfigLogChange: function(component,event,helper){
        
        var projectCmp = component.find("projectName");
        var projectSelectedRecords = projectCmp.get("v.lstSelectedRecords");
        var objProject = {};
        
        if(!$A.util.isEmpty(projectSelectedRecords)) {
            objProject["Name"] = projectSelectedRecords[0].Name;
            objProject["Id"] = projectSelectedRecords[0].Id;
        } 
        
        if(!objProject.hasOwnProperty('Name')) {
            component.set("v.projectNarrative", '');
            return;
        }
        
        helper.getConfigLogNarrative(component, event, JSON.stringify(objProject));
    },

    bulkSave: function(component, event, helper) {
        var projectCmp = component.find("projectName");
        var projectName = projectCmp.get("v.SearchKeyWord")
        var projectSelectedRecords = projectCmp.get("v.lstSelectedRecords");
        var objProject = {};
        
        if(!$A.util.isEmpty(projectSelectedRecords)){
            objProject["Name"] = projectSelectedRecords[0].Name;
            objProject["Id"] = projectSelectedRecords[0].Id;
        } 
        
        //The narrative for the project
        var projectNarrative = component.get("v.projectNarrative");
        
        if(!$A.util.isEmpty(projectNarrative)){
            objProject["Description__c"] = projectNarrative;
        }
        
        if(!objProject.hasOwnProperty('Name')) {
        	helper.showToast(component,event,"Error","error",
                             "You have not selected a Configuration Log record or have not set a name for the Configuration Log.");
            return;
        }
        
        helper.activeBulkSaveMethod(component, event, JSON.stringify(objProject));

    },
    
    handleComponentOnChange: function(component,event,helper){
        var selectedOptionValue = event.getParam("value");        
        var jsonSearchCriteria = component.get("v.jsonSearchCriteria");
        if(selectedOptionValue.length > 50){ //|| jsonSearchCriteria.componentTypes.length > 3){
            helper.showToast(component,event,"Error","error","You cannot select more than 50 components. Please see the Information page for more details.");
            component.find("componentList").set("values","");
            return;
        }
        jsonSearchCriteria.componentTypes = selectedOptionValue;
        component.set("v.jsonSearchCriteria",jsonSearchCriteria);
    },
    
    handleDateOnChange: function(component, event, helper){
        var selectedValue = event.getParam("value").toString();
        var jsonSearchCriteria = component.get("v.jsonSearchCriteria");
        
        helper.clearField(component,event,"startDate");
        helper.clearField(component,event,"endDate");
        
        if(selectedValue === "createdDate"){
            if(jsonSearchCriteria.hasOwnProperty("lastModifiedDate")){
                delete jsonSearchCriteria["lastModifiedDate"];
            }
            jsonSearchCriteria[selectedValue] = "";
            
        }
        if(selectedValue === "lastModifiedDate"){
            if(jsonSearchCriteria.hasOwnProperty("createdDate")){
                delete jsonSearchCriteria["createdDate"];
            }
            jsonSearchCriteria[selectedValue] = "";
        }        
        component.set("v.jsonSearchCriteria",jsonSearchCriteria);
    },
    
    handleSelectedDate: function(component, event, helper){
        var selectedValue = event.getParam("value").toString();
        var sourceId = event.getSource().getLocalId().toString();
        var obj = {};
        obj[sourceId] = selectedValue;
        var validated = helper.validateDate(component,event);
        var jsonSearchCriteria = component.get("v.jsonSearchCriteria");
        if(validated){
            if(jsonSearchCriteria.hasOwnProperty("createdDate")){
                if($A.util.isEmpty(jsonSearchCriteria.createdDate)){
                    jsonSearchCriteria.createdDate = obj;
                }else {
                    jsonSearchCriteria.createdDate[sourceId] = selectedValue;
                }
            } else {
                if($A.util.isEmpty(jsonSearchCriteria.lastModifiedDate)){
                    jsonSearchCriteria.lastModifiedDate = obj;
                }else {
                    jsonSearchCriteria.lastModifiedDate[sourceId] = selectedValue;
                }
            }
            component.set("v.jsonSearchCriteria",jsonSearchCriteria);
        }
    },
    
    downloadPDF: function(component, event, helper) {
        var projectCmp = component.find("projectName");
        var projectName = projectCmp.get("v.SearchKeyWord");
        var projectSelectedRecords = projectCmp.get("v.lstSelectedRecords");
        var objProject = {};
        var dataProject = component.get("v.data");
        
        if(!$A.util.isEmpty(projectName)) {
            objProject["Name"] = projectName;  
            objProject["Id"] =  component.get("v.created_id");  
        }
        
        if(!$A.util.isEmpty(projectSelectedRecords)){
            objProject["Name"] = projectSelectedRecords[0].Name;
            objProject["Id"] = projectSelectedRecords[0].Id;
        } 
        
        //The narrative for the project
        var projectNarrative = component.get("v.projectNarrative");
        if(!$A.util.isEmpty(projectNarrative)){
            objProject["Description__c"] = projectNarrative;
        }
        
        if(!objProject.hasOwnProperty('Name')) {
            helper.showToast(component,event,"Error","error",
                             "You have not selected a Configuration Log record or have not set a name for the Configuration Log.");
            return;
        }
        
        if(dataProject.length == 0){
            helper.showToast(component,event,"Error","error",
                             "The result table must not be empty!");
            return;
        }
        
        helper.saveConfigLogObj(component, event, JSON.stringify(objProject), dataProject);
      
    },
    
    save: function(component,event,helper){
        var projectCmp = component.find("projectName");
        var projectName = projectCmp.get("v.SearchKeyWord");
        var projectSelectedRecords = projectCmp.get("v.lstSelectedRecords");
        var objProject = {};
        var dataProject = component.get("v.data");
        
        if(!$A.util.isEmpty(projectName)) {
            objProject["Name"] = projectName;   
            objProject["Id"] =  component.get("v.created_id");   
        }
        
        if(!$A.util.isEmpty(projectSelectedRecords)){
            objProject["Name"] = projectSelectedRecords[0].Name;
            objProject["Id"] = projectSelectedRecords[0].Id;
        } 
        
        //The narrative for the project
        var projectNarrative = component.get("v.projectNarrative");
        
        if(!$A.util.isEmpty(projectNarrative)){
            objProject["Description__c"] = projectNarrative;
        }
        
        if(!objProject.hasOwnProperty('Name')) {
            helper.showToast(component,event,"Error","error",
                             "You have not selected a Configuration Log record or have not set a name for the Configuration Log.");
            return;
        }
        
        if(dataProject.length == 0){
            helper.showToast(component,event,"Error","error",
                             "The result table must not be empty!");
            return;
        }
        
        helper.saveConfigLogAttachment(component, event, JSON.stringify(objProject), JSON.stringify(dataProject));
    },
    
    handleClose: function(component,event,helper){
        helper.handleCloseMessage(component,event);
    },
    
    handleSuccessClose: function(component,event,helper){
        helper.handleSuccessCloseMessage(component,event);
    }
})