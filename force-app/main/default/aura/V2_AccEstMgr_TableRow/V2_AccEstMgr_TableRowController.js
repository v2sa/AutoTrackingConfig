({ 
    toggleQuarterForecastSection: function(component, event, helper){
		component.set('v.isOpen', !component.get('v.isOpen'));
    },
    
    collapseOrExpand: function(component, event, helper){
        component.set('v.isOpen', event.getParam('isExpand'));
    },
})