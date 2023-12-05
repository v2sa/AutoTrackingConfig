({
	loadingDataTable : function(cmp) {
		//Column definition for the Lightning Data Table
        cmp.set('v.columns', [
            {label: 'Name', fieldName: 'linkName', type: 'url',
             typeAttributes: { 
                label: {
                    fieldName: 'Name'
                }
             }
            },
            {label: 'Last Modified Date', fieldName: 'LastModifiedDate', type: 'date',
            	typeAttributes: {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                    second: '2-digit',
                    hour12: true
  				}
            }
        ]);
        
        //Get all Attachments related to a Configuration_Log__c
        let configLogAttachments = cmp.get("c.getConfigLogAttachments");
        configLogAttachments.setParams({
            "configurationLogId": cmp.get("v.recordId")
        });
        configLogAttachments.setCallback(this, function(response){
            var state = response.getState();
            if (state === "SUCCESS") {
                let results = response.getReturnValue();
                //Traverse the list of Attachments and add a link to allow users to download the Attachments
                results.forEach(function(result){
					result.linkName = '/lightning/r/Attachment/'+result.Id+'/view';
				});
                cmp.set("v.attachments", results);
                
                if(results.length > 0){
                    cmp.set("v.attachmentExist", true);
                }
            }
        });
        $A.enqueueAction(configLogAttachments);
	}
})