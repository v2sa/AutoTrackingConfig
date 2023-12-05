({
    searchMethod : function(component,event) {
        //Getting the users selected
        var selectedUsers = component.get("v.selectedLookUpRecords");
        var jsonSearchCriteria = component.get("v.jsonSearchCriteria");
        
        console.log('jsonSearchCriteria:', JSON.stringify(jsonSearchCriteria));
                
        component.set("v.activeSave", "true");
        component.set("v.activeGenerate", "true");
        
        if(!$A.util.isEmpty(jsonSearchCriteria)){
            if(jsonSearchCriteria.hasOwnProperty("createdDate")){
                if(!$A.util.isEmpty(jsonSearchCriteria.createdDate)){
                    var startDateVal = component.find("startDate").get('v.value');
                    var endDateVal = component.find("endDate").get('v.value');
                    
                    if(startDateVal == null && jsonSearchCriteria.createdDate.hasOwnProperty('startDate')) 
                        delete jsonSearchCriteria.createdDate['startDate'];
                    
                    if(endDateVal  == null && jsonSearchCriteria.createdDate.hasOwnProperty('endDate')) 
                        delete jsonSearchCriteria.createdDate['endDate'];
                }
            } else if(jsonSearchCriteria.hasOwnProperty("lastModifiedDate")) {
                if(!$A.util.isEmpty(jsonSearchCriteria.lastModifiedDate)){
                    var startDateVal = component.find("startDate").get('v.value');
                    var endDateVal = component.find("endDate").get('v.value');
                    
                    if(startDateVal == null && jsonSearchCriteria.lastModifiedDate.hasOwnProperty('startDate')) 
                        delete jsonSearchCriteria.lastModifiedDate['startDate'];
                    
                    if(endDateVal  == null && jsonSearchCriteria.lastModifiedDate.hasOwnProperty('endDate')) 
                        delete jsonSearchCriteria.lastModifiedDate['endDate'];
                }
            }
            
            //Loading the spinner
            component.set("v.isLoading","true");
            if(!$A.util.isEmpty(selectedUsers)){
                let Ids = [];
                for(var i=0,size=selectedUsers.length;i < size;i++){
                    var userObj = selectedUsers[i];
                    Ids.push(userObj.Id);
                }
                if(!$A.util.isEmpty(Ids)){
                    jsonSearchCriteria["Ids"] = Ids;
                }else {
                    jsonSearchCriteria["Ids"] = [];
                }
                component.set("v.jsonSearchCriteria",jsonSearchCriteria);
            }
            
            //Calling the apex method to execute the search
            var searchAction = component.get("c.searchForComponents");
            var sessionId = component.get("v.sessionId");
            var componentsList = jsonSearchCriteria.componentTypes;
            if(componentsList == undefined || componentsList.length == 0){
                this.showToast(component,event,"Error!","error","You dont have any components selected. Please select components.");
                component.set("v.isLoading","false");
                return;
            }
            searchAction.setParams({
                "componentList": componentsList,
                "searchCriteria": JSON.stringify(jsonSearchCriteria),
                "sessionId": sessionId
            });
            
            //This action will call the controller to do the Callout for the metadata needed.
            searchAction.setCallback(this, function(response){
                component.set("v.isLoading","false");
                
                component.set("v.activeSave", "false");
                component.set("v.activeGenerate", "false");
                component.set("v.activeBulkSave", "false");
                
                let state = response.getState();
                if(state === "SUCCESS"){
                    let result = response.getReturnValue();
                    if(!$A.util.isEmpty(result)){
                        component.set("v.data",result);
                        //Stopping the spinner
                        //this.showToast(component,event,"Success!","success","The results returned");
                    }
                } else {
                    var errors = response.getError();
                    let messages = "";
                    for(var error in errors){
                        messages += "\n" + error.message;
                    }
                    
                    this.showToast(component,event,"Error!","error",messages); 
                }
            });
            
            $A.enqueueAction(searchAction);
        } else {
            this.showToast(component,event,"Error!","error","You dont have any components selected. Please select components.");
        }
        
    },
    
    activeBulkSaveMethod: function (component, event, jsonConfigLog) {
        var selectedUsers = component.get("v.selectedLookUpRecords");
        var jsonSearchCriteria = component.get("v.jsonSearchCriteria");

        if(!$A.util.isEmpty(jsonSearchCriteria)){
            
            if(jsonSearchCriteria.hasOwnProperty("createdDate")){
                if(!$A.util.isEmpty(jsonSearchCriteria.createdDate)){
                    var startDateVal = component.find("startDate").get('v.value');
                    var endDateVal = component.find("endDate").get('v.value');
                    
                    if(startDateVal == null && jsonSearchCriteria.createdDate.hasOwnProperty('startDate')) 
                        delete jsonSearchCriteria.createdDate['startDate'];
                    
                    if(endDateVal  == null && jsonSearchCriteria.createdDate.hasOwnProperty('endDate')) 
                        delete jsonSearchCriteria.createdDate['endDate'];
                }
            } else if(jsonSearchCriteria.hasOwnProperty("lastModifiedDate")) {
                if(!$A.util.isEmpty(jsonSearchCriteria.lastModifiedDate)){
                    var startDateVal = component.find("startDate").get('v.value');
                    var endDateVal = component.find("endDate").get('v.value');
                    
                    if(startDateVal == null && jsonSearchCriteria.lastModifiedDate.hasOwnProperty('startDate')) 
                        delete jsonSearchCriteria.lastModifiedDate['startDate'];
                    
                    if(endDateVal  == null && jsonSearchCriteria.lastModifiedDate.hasOwnProperty('endDate')) 
                        delete jsonSearchCriteria.lastModifiedDate['endDate'];
                }
            }
            
            if(!$A.util.isEmpty(selectedUsers)){
                let Ids = [];
                for(var i=0,size=selectedUsers.length;i < size;i++){
                    var userObj = selectedUsers[i];
                    Ids.push(userObj.Id);
                }
                if(!$A.util.isEmpty(Ids)){
                    jsonSearchCriteria["Ids"] = Ids;
                }else {
                    jsonSearchCriteria["Ids"] = [];
                }
                component.set("v.jsonSearchCriteria",jsonSearchCriteria);
            }
            
            var saveAction = component.get("c.fireBulkInsertBatch");
            var sessionId = component.get("v.sessionId");
            var componentListMap = component.get("v.componentOptions");
            var componentList = [];
            
            componentListMap.forEach(element => {
                componentList.push(element.value);
            });
            
            saveAction.setParams({
                "componentList": componentList,
                "searchCriteria": JSON.stringify(jsonSearchCriteria),
                "sessionId": sessionId,
                "jsonConfigLog": jsonConfigLog
            });
            
            saveAction.setCallback(this, function(response) {
                let state = response.getState();
                if(state === "SUCCESS"){
                    let result = response.getReturnValue();
                    console.log(result);
                    if(result == false){
                        this.showToast(component,event,"Error","error",
                             "There's a batch of components being processed at the moment, please try again in a few minutes.");
                    }
                    else{
                        this.showToast(component,event,"Success!","success",
                                       "A batch is going to start procceding now, please check in a few minutes in the configuration log object.");
                    }
                } else {
                    var errors = response.getError();
                    let messages = "";
                    for(var error in errors){
                        messages += "\n" + error.message;
                    }
                    
                }
            });
            $A.enqueueAction(saveAction);
            
        }  else {
            this.showToast(component,event,"Error!","error","You dont have any components selected. Please select components.");
        }
    },
    
    showToast: function(component,event,title,type,message){
        var toastEvent = $A.get("e.force:showToast");
        if(toastEvent){
            toastEvent.setParams({
                "title": title,
                "message": message,
                "type": type
            });
            toastEvent.fire();
        } else {
            this.showMessage(component,event,type,message);
        }
        
    },
    
    validateDate: function(component,event){
        var validated = false;
        var jsonSearchCriteria = component.get("v.jsonSearchCriteria");
        if(!jsonSearchCriteria.hasOwnProperty("createdDate") && !jsonSearchCriteria.hasOwnProperty("lastModifiedDate")){
            this.clearField(component,event,"startDate");
            this.clearField(component,event,"endDate");
            this.showToast(component,event,"Error","error","Please select the Created Date or Last Modified Date.");
            return;    
        }else {
            validated = true;
        } 
        return validated;
    },
    
    clearField: function(component,event,fieldId){
        component.find(fieldId).set("v.value","");        
    },
    
    getConfigLogNarrative : function(component, event, jsonConfigLog){
        let action = component.get("c.getOrCreateConfigLogObject");
        action.setParams({
            "jsonConfigLog": jsonConfigLog
        });
        
        component.set("v.created_id", "");
        
        action.setCallback(this, function(response){
            let state = response.getState();
            if (state === "SUCCESS") {
                let configLogObj = response.getReturnValue();
                
                //The narrative for the projectcreated_id
                console.log('Narrative: ', configLogObj.Description__c);
                component.set("v.projectNarrative", configLogObj.Description__c);
            } else {
                var errors = response.getError();
                let messages = "";
                for(var error in errors){
                    messages += "\n" + error.message;
                }
                
                this.showToast(component,event,"Error!","error",messages);
            }
        });
        
        $A.enqueueAction(action);
        
    },
    
    saveConfigLogObj : function(component, event, jsonConfigLog, jsonTable){
        let action = component.get("c.getOrCreateConfigLogObject");
        action.setParams({
            "jsonConfigLog": jsonConfigLog
        });
        
        action.setCallback(this, function(response){
            let state = response.getState();
            if (state === "SUCCESS") {
                let configLogObj = response.getReturnValue();
                component.set("v.created_id", configLogObj.Id);
                
                var printPDFProcedure = component.get("v.printPDF");
                var dataToSend = {
                    "ConfigurationLogId": configLogObj.Id,
                    "ConfigurationLogTable": jsonTable
                };
                
                // Invoke VF page js method
                printPDFProcedure(JSON.stringify(dataToSend), function(){
                    
                });
                //this.showToast(component,event,"Success!","success","Document saved!");
            } else {
                var errors = response.getError();
                let messages = "";
                for(var error in errors){
                    messages += "\n" + error.message;
                }
                
                this.showToast(component,event,"Error!","error",messages);
            }
        });
        
        $A.enqueueAction(action);
        
    },
    
    saveConfigLogAttachment: function(component, event, jsonConfigLog, jsonTable){
        let action = component.get("c.saveConfigLogAttchment");
        action.setParams({
            "jsonConfigLog": jsonConfigLog,
            "jsonTable": jsonTable
        });
        
        action.setCallback(this, function(response){
            let state = response.getState();
            if (state === "SUCCESS") {
                if(response.getReturnValue == null){
                    this.showToast(component, event, "Error", "error", "The document was not saved!");
                } else {
                    this.showToast(component,event,"Success!","success","Document saved!");
                    component.set("v.activeSave", "true");
                    let configLogObj = response.getReturnValue();
                    component.set("v.created_id", configLogObj.Id);
                }
            } else {
                var errors = response.getError();
                let messages = "";
                for(var error in errors){
                    messages += "\n" + error.message;
                }
                
                this.showToast(component,event,"Error!","error",messages);
            }
        });
        
        $A.enqueueAction(action);
    },
    
    saveConfigLogPackage: function(component, event, jsonConfigLog, jsonTable){
        let action = component.get("c.saveConfigLogPackage");
        action.setParams({
            "jsonConfigLog": jsonConfigLog,
            "jsonTable": jsonTable
        });
        
        action.setCallback(this, function(response){
            let state = response.getState();
            if (state === "SUCCESS") {
                if(response.getReturnValue == null){
                    this.showToast(component, event, "Error", "error", "The document was not saved!");
                } else {
                    this.showToast(component,event,"Success!","success","Document saved!");
                    component.set("v.activeGenerate", "true");
                    let configLogObj = response.getReturnValue();
                    component.set("v.created_id", configLogObj.Id);
                }
            } else {
                var errors = response.getError();
                let messages = "";
                for(var error in errors){
                    messages += "\n" + error.message;
                }
                
                this.showToast(component,event,"Error!","error",messages);
            }
        });
        
        $A.enqueueAction(action);
    },
    
    getConfigurationLogComponents: function(component,event){
        var getAction = component.get("c.getAllComponents");
        getAction.setCallback(this,function(response){
            var state = response.getState();
            if(state === "SUCCESS" && component.isValid()){
                var result = response.getReturnValue();
                console.log(result);
                component.set("v.componentOptions",result);
            }else {
                var errors = response.getError();
                let messages = "";
                for(var error in errors){
                    messages += "\n" + error.message;
                }
                
                this.showToast(component,event,"Error!","error",messages);
            }
        });
        $A.enqueueAction(getAction);
    },
    
    handleCloseMessage: function(component,event){
        var warningMessageCmp = component.find("warningMessage");
        $A.util.addClass(warningMessageCmp,"slds-hide");
    },
    
    showMessage: function(component,event,type,message){
        var warningMessageCmp = component.find("warningMessage");
        var successMessageCmp = component.find("successMessage");
        //Clear the hash in order for the page to move to location
        window.location.hash = '';
        if(!$A.util.isEmpty(message)){
            component.set("v.errorMessage",message);
        }
        if(type === "error"){
            $A.util.removeClass(warningMessageCmp,"slds-hide");
            
            window.location.hash = '#warningMessage';
        } else if(type === "success"){
            $A.util.removeClass(successMessageCmp,"slds-hide");
            window.location.hash = '#successMessage';
        }
    },
    
    handleSuccessCloseMessage: function(component,event){
        var successMessageCmp = component.find("successMessage");
        $A.util.addClass(successMessageCmp,"slds-hide");
    }
})