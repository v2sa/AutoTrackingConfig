({
	searchEstimatesByAccountFilter : function(component, event, helper) {
        component.find("searchTxt").set("v.value",'');
		helper.sendEventToReloadTable(component);
	},

    searchByEnter : function(component, event, helper) {
        //Search when user presses enter
        var callback = function(){
            component.set('v.selAccList','');
			helper.sendEventToReloadTable(component);
        }
        util.executeOnEnter(event, callback);
	},
    
    doInit : function(component, event, helper){        
        //Load Account List Options
        let apexMethodName = 'getFilterOptions';
        
        let params = {};
        
        let successActionsCallback = function(response){
            var list = response.getReturnValue().listLocalSelect;           
            component.set('v.accListsOptions', list);
        }
        
        //Perform Apex Call
        util.performApexCall(component, apexMethodName, params, successActionsCallback);
    },
})