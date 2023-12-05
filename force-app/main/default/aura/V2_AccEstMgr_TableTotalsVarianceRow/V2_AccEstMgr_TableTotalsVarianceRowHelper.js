({
    calculatePercentageVariance : function(byEstim, pyEstim) {
        let perc = 0;
        
        if(byEstim > 0 && pyEstim > 0){
           	perc = (byEstim / pyEstim - 1) * 100;
        } else {
            perc = byEstim - pyEstim;
        }  
        return Math.round(+perc.toFixed(2));
	},
    
	updateVariances : function(component) {
        let self = this;
		let baseYearTotal = component.get('v.baseYearTotal');        
        let prevToBYActualsTotal = component.get('v.prevToBYActualsTotal');
        let newTotVariance = baseYearTotal - prevToBYActualsTotal;
        
        component.set('v.totalPercentageVari',self.calculatePercentageVariance(baseYearTotal, prevToBYActualsTotal));
        
        if(component.get('v.totalVariance') != newTotVariance){
            component.set('v.totalVariance', newTotVariance);
        }
                
        let selYearEstimatesTotalPerQuartList = component.get('v.selYearEstimatesTotalPerQuartList');
        let prevYearActualsTotalPerQuartList = component.get('v.prevYearActualsTotalPerQuartList');
        
        let newVarianceList = [];
        let variancePercList = [];
        
        let setNewVariance = false;
        let varianceList = component.get('v.varianceList');
        
        
        for(let i = 0; i<4 ;i++){            
            newVarianceList.push(selYearEstimatesTotalPerQuartList[i] - prevYearActualsTotalPerQuartList[i]);
            variancePercList.push(self.calculatePercentageVariance(selYearEstimatesTotalPerQuartList[i],prevYearActualsTotalPerQuartList[i]));
            if(newVarianceList[i] != varianceList[i]){
                setNewVariance = true;
            }
        }
        
        if(setNewVariance){
			component.set('v.variancePercList',variancePercList);            
            component.set('v.varianceList',newVarianceList);
        }  
	}
})