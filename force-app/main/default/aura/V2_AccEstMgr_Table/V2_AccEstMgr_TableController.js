({
    forceFocus : function(component, event, helper) {
        component.find('leftArrowBtn').focus();
    },
    
    adjustTotalsRow : function(component, event, helper) {
        let bfsYear = event.getParam("BFSYear");
    	let selYearTotals = component.get('v.selYearEstimatesTotalPerQuartList');
        let quarterIx = event.getParam("quarterIndex");
        let accIx = event.getParam("accountIndex"); 
        let channelIx = event.getParam("channelIndex"); 
        
        selYearTotals[quarterIx] = selYearTotals[quarterIx] - 
            event.getParam("prevValue") + event.getParam("newValue");       
      
        component.set('v.selYearEstimatesTotalPerQuartList',selYearTotals);
        
        let recordsList = component.get('v.recordsList');
        console.log('passed through adjust total');
        
        recordsList[accIx].listPlanSnapshots[quarterIx].quarterTotal = 
            recordsList[accIx].listPlanSnapshots[quarterIx].quarterTotal - 
            event.getParam("prevValue") + event.getParam("newValue");
        
        let baseYearTotal = component.get('v.baseYearTotal');
                
        let baseYear = component.get('v.defaultSettings').Base_Year__c;
  
        if(bfsYear == baseYear){
            baseYearTotal = baseYearTotal - 
            	event.getParam("prevValue") + event.getParam("newValue");
            
            recordsList[accIx].baseYearTotal = recordsList[accIx].baseYearTotal - 
            	event.getParam("prevValue") + event.getParam("newValue");
            
            recordsList[accIx].totalsByChannel[channelIx].baseYearTotal = 
                recordsList[accIx].totalsByChannel[channelIx].baseYearTotal - 
            	event.getParam("prevValue") + event.getParam("newValue");
        }
        
        component.set('v.recordsList',recordsList);
        component.set('v.baseYearTotal',baseYearTotal);
    },
    
	leftArrowFunction : function(component, event, helper) {
        function checkFlag() {
            if(window.isSaving) {
               	window.setTimeout(checkFlag, 100); /* this checks the flag every 100 milliseconds*/
            } else {
              	helper.leftArrowFunction(component);
            }
        }
        checkFlag();
        
	},
    rightArrowFunction : function(component, event, helper) {
        function checkFlag() {
            if(window.isSaving) {
               	window.setTimeout(checkFlag, 100); /* this checks the flag every 100 milliseconds*/
            } else {
              	helper.rightArrowFunction(component);
            }
        }
        checkFlag();        
	},
    
    viewMoreData : function(component, event, helper) {
        let isViewMore = true;
        helper.getEstimatesList(component, component.get('v.offset'), isViewMore);
    },
    
    reloadTable : function(component, event, helper) {
        component.set('v.offset', 0);
        component.set('v.SelectedAccountList',event.getParam('selectedAccountList'));
   		component.set('v.SelectedAccountName',event.getParam('selectedAccountName'));
        helper.getEstimatesList(component, 0);
    },
    
    doInit : function(component, event, helper) { 
        helper.calculateYearHeadersWidth(component);
        
        let baseYear = parseInt(component.get('v.defaultSettings').Base_Year__c);
		console.log(component.get('v.defaultSettings'));
        component.set('v.LeftYear',{ quarters : 4, width : 100, year: baseYear});
        component.set('v.RightYear',{ quarters : 0, width : 0 , year: baseYear});
     
        component.set('v.SelectedAccountList', 'My Estimated Accounts');
        helper.getEstimatesList(component, 0); 
        
        //add event to resize window 
        window.addEventListener("resize", function(){
            helper.calculateYearHeadersWidth(component);
        });
	},
    
    expandAll : function(component, event, helper) { 
        let isExpand = true;
    	helper.sendEventToExpandCollapseRows(isExpand);
    },
    
    collapseAll : function(component, event, helper) { 
    	let isExpand = false;
    	helper.sendEventToExpandCollapseRows(isExpand);
    }
})