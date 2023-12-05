({
	calculatePercentageVariance : function(component) {
		let byEstim = component.get('v.baseYearEstimatesTotal');
        let pyEstim = component.get('v.prevToBYActualsTotal');
  
        let perc = 0;
        
        if(byEstim > 0 && pyEstim > 0){
           	perc = (byEstim / pyEstim - 1) * 100;
        } else {
            perc = byEstim - pyEstim;
        }     
        console.log(+perc.toFixed(2));
        return Math.round(+perc.toFixed(2));;
	}
})