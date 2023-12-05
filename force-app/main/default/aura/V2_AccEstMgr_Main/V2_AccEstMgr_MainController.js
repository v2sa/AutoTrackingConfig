({  
    doInit : function(component, event, helper) {
        let apexMethodName = 'getDefaultSettings';
        
        let params = {};
        
        let successActionsCallback = function(response){
            let responseValue = response.getReturnValue();
            component.set('v.defaultSettings', responseValue);
            //Send event that scripts loaded
            var scriptsLoadedEvt = $A.get("e.c:V2_Util_ScriptsLoadedEvt");        
            scriptsLoadedEvt.fire();
        }
        
        //Perform Apex Call
        util.performApexCall(component, apexMethodName, params, successActionsCallback);
    }
})