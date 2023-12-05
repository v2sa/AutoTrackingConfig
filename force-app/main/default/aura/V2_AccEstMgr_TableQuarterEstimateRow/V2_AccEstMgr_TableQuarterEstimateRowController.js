({
	doInit : function(component) {
      	let wrapper = component.get('v.AEMWrapper');
        let chanIndex = component.get('v.channelIndex');
        let quartIndex = component.get('v.quarterIndex');
        
        component.set('v.selYearQF', wrapper.listPlanSnapshots[quartIndex].
                      listChannQFs[chanIndex].selYearQF);
        component.set('v.prevYearActualValue', wrapper.listPlanSnapshots[quartIndex].
                      listChannQFs[chanIndex].selYearQF.Previous_Year_Actual__c || 0);
      
        component.set('v.BFSYear', wrapper.listPlanSnapshots[quartIndex].BFS.Year__c);
	},
    
    savePrevValue : function(component) {
    	component.set('v.prevValue',component.get('v.selYearQF').Quarterly_Estimate__c);
    },

    itemChange : function(component) {
        window.isSaving = true;
        let prevValue = component.get('v.prevValue');
        let selYearQF = component.get('v.selYearQF');
        
        if(!selYearQF.Quarterly_Estimate__c && !selYearQF.Id){
            window.isSaving = false;
            return;
        }
        
        selYearQF.Quarterly_Estimate__c = !(selYearQF.Quarterly_Estimate__c) ? 0 :
        	parseInt(selYearQF.Quarterly_Estimate__c);
        
        console.log('passed save');
        console.log(selYearQF.Quarterly_Estimate__c);
        
        prevValue = component.get('v.prevValue') ? component.get('v.prevValue') : 0;

        var estimateChangedEvt = $A.get("e.c:V2_AccEstMgr_EstimateChangedEvent");      
        estimateChangedEvt.setParams({"prevValue" : prevValue, 
                                      "quarterIndex" : component.get('v.quarterIndex'),
                                      "newValue" : selYearQF.Quarterly_Estimate__c || 0,
                                      "accountIndex" : component.get('v.accountIndex'),
                                      "BFSYear" : component.get('v.BFSYear'),
                                      "channelIndex" : component.get('v.channelIndex')
                                     });   
        
        estimateChangedEvt.fire();
        
        component.set('v.prevValue',component.get('v.selYearQF').Quarterly_Estimate__c);
                
        let apexMethodName = 'save';
        let wrapper = component.get('v.AEMWrapper');
        let chanIndex = component.get('v.channelIndex');
        let quartIndex = component.get('v.quarterIndex');
        
        let params = {quarterForecastJson: JSON.stringify(component.get('v.selYearQF')), 
                      year: component.get('v.BFSYear'), 
                      channel: component.get('v.channelName'), 
                      accountId : wrapper.accountId};
   
        let successActionsCallback = function(response){
            let responseValue = response.getReturnValue();
            console.log('save succeeded');
            component.get("v.AEMWrapper").listPlanSnapshots[quartIndex].
            listChannQFs[chanIndex].selYearQF = responseValue;
            component.set('v.selYearQF',responseValue);
              
            component.set('v.prevYearActualValue', wrapper.listPlanSnapshots[quartIndex].
                      listChannQFs[chanIndex].selYearQF.Previous_Year_Actual__c || 0);
      
            window.isSaving = false;
        }
            
        //Perform Apex Call
        util.performApexCall(component, apexMethodName, params, successActionsCallback);      
     }
})