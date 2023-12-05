({
    rerender : function (component, helper) {
        this.superRerender();
		helper.updateVariances(component);
    },
    
    afterRender  : function (component, helper) {
        this.superAfterRender();
        helper.updateVariances(component);
    },
})