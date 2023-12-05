({
	updateValues : function(component, event, helper) {
		component.set('v.baseYearEstimatesTotal', event.getParam("baseYearEstimatesTotal"));
        component.set('v.prevToBYActualsTotal', event.getParam("prevToBYActualsTotal"));
        component.set('v.totalsVariance', event.getParam("totalsVariance"));
        
        let perc = helper.calculatePercentageVariance(component);
     
        component.set('v.percentageVariance', perc);
        
	},
    
    adjustTotals : function(component, event, helper) {
        let bfsYear = event.getParam("BFSYear");
        let PYActualsTotal = component.get('v.prevToBYActualsTotal');
        let baseYearTotal = component.get('v.baseYearEstimatesTotal');
        
		let newBaseYearTotal = baseYearTotal - event.getParam("prevValue") + event.getParam("newValue");
        
        if(bfsYear == component.get('v.defaultSettings').Base_Year__c){
             component.set('v.baseYearEstimatesTotal',newBaseYearTotal);
        }
        component.set('v.totalsVariance', 
           component.get('v.baseYearEstimatesTotal')-component.get('v.prevToBYActualsTotal'));
        
        let perc = helper.calculatePercentageVariance(component);
        component.set('v.percentageVariance', perc);

	},
})