({
    doInit : function(component, event, helper) {
        console.log("in the init");
        //Getting the resource for the images
        var url = $A.get("$Resource.configurationLogGuideImages");
        component.set("v.imagesUrl",url);
    },
    selectedTab: function(component,event,helper){
        var selectedTab = event.getSource();
        console.log("ON THE SELECTED TAB");
    }

})