({
	init: function (cmp, event, helper) {
        helper.loadingDataTable(cmp);
    },
	
	//Get all Attachments selected in the data table	    
    selectedRows: function (cmp, event) {
        let selectedRows = event.getParam('selectedRows');
        if(selectedRows.length >= 2) cmp.set('v.isActive', false);
        else cmp.set('v.isActive', true);
        cmp.set('v.selectedAttachments', selectedRows);
    },
    
    merge: function (cmp, event, helper){
       	let selectedAttachments = cmp.get('v.selectedAttachments');
        console.log(selectedAttachments);
        let mergeSelectedAttachments = cmp.get("c.mergeSelectedAttachments");
        mergeSelectedAttachments.setParams({
            "attachments": selectedAttachments
        });
        
        mergeSelectedAttachments.setCallback(this, function(response){
            var state = response.getState();
            if (state === "SUCCESS") {
                var toastEvent = $A.get("e.force:showToast");
                toastEvent.setParams({
                    "title": "Success!",
                    "message": "The Merge happened successfully.",
                    "type":"Success"
                });
                helper.loadingDataTable(cmp);
                toastEvent.fire();
                
            }else{
                console.log(state);
            }
        });
        $A.enqueueAction(mergeSelectedAttachments);
    }
})