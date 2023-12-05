({
	sendEventToReloadTable : function(component) {
		let reloadTableEvent = $A.get("e.c:V2_AccEstMgr_reloadTableEvent");
        reloadTableEvent.setParams({'selectedAccountList': component.get('v.selAccList'), 
                                    'selectedAccountName': component.find("searchTxt").get("v.value")
                                   });
        
        reloadTableEvent.fire();
	}
})