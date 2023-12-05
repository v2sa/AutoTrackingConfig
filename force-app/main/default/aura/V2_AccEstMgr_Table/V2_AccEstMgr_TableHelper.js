({	
    leftArrowFunction : function(component) {        
        var isRightArrow = false;
        this.recalculateQuartersShown(component, isRightArrow);
        
		var leftYear = component.get('v.LeftYear');
        var rightYear = component.get('v.RightYear');
        
        if(leftYear.quarters == 4){
            rightYear.quarters = 3;
            rightYear.year = leftYear.year;
            leftYear.quarters = 1;
            leftYear.year = leftYear.year - 1;
        } else {
            leftYear.quarters++;
            rightYear.quarters--;
        }
         
        component.set('v.RightYear', rightYear);
        component.set('v.LeftYear', leftYear);
        component.set('v.offset', 0);
        let isViewMore = false;
        
        let recordsList = component.get('v.recordsList');
        
        let newPagin = this.calculateAccountsListSize(recordsList);
        
        this.getEstimatesList(component, 0, isViewMore, 
                              newPagin);
	},
    
    rightArrowFunction : function(component) {
        var isRightArrow = true;
        this.recalculateQuartersShown(component, isRightArrow);        
        
		var leftYear = component.get('v.LeftYear');
        var rightYear = component.get('v.RightYear');
        
        if(leftYear.quarters == 4){
            rightYear.year = leftYear.year + 1;            
        }
        
        if(rightYear.quarters == 3){
            rightYear.quarters = 0;
            leftYear.year = rightYear.year;
            leftYear.quarters = 4;
        } else {
            rightYear.quarters++;
            leftYear.quarters--;
        }
         
        component.set('v.RightYear', rightYear);
        component.set('v.LeftYear', leftYear);
        component.set('v.offset', 0);
        
        let isViewMore = false;
        
        let recordsList = component.get('v.recordsList');
        
        let newPagin = this.calculateAccountsListSize(recordsList);
        
        this.getEstimatesList(component, 0, isViewMore, 
                              newPagin);
	},
    
    calculateCollapseSectionWidth: function(){
        let quartersElementsArray = document.getElementsByTagName('thead')[0].querySelectorAll("th");
        let widthOfQuarters = 0;
        for(var i = 0; i < 4; i++) {
            widthOfQuarters += quartersElementsArray[i].clientWidth;
        }
        document.getElementById("collapse-btns-section").style.minWidth = widthOfQuarters - 56 + 'px';        
    },
    
	calculateYearHeadersWidth : function(component) {
        let rightYear = component.get('v.RightYear');
        let leftYear = component.get('v.LeftYear');
              
        if(rightYear && leftYear) {
            let quartersElementsArray = document.getElementsByTagName('thead')[0].querySelectorAll("th");
            if(leftYear.quarters !== 4){
                
                var widthOfQuarters = 0;
                
                for(var i = 4; i < (4+(leftYear.quarters || 0)); i++) {
                    widthOfQuarters += quartersElementsArray[i].clientWidth;
                }
                
                
                let yearHeadersDiv = document.getElementById('year-headers');
                let yearHeadersWidth = yearHeadersDiv.clientWidth;
                leftYear.width =  widthOfQuarters/yearHeadersWidth*100;
                rightYear.width = (yearHeadersWidth - widthOfQuarters)/yearHeadersWidth*100;            
            }else{
                leftYear.width =100;
                rightYear.width = 0;
            }
            component.set('v.LeftYear', leftYear);
            component.set('v.RightYear', rightYear);
        }
        this.calculateCollapseSectionWidth();
        
	},
    
    recalculateQuartersShown : function(component, isRightArrow) {
		var self = this;
        var newQuartersShown = [];
        var quartersShown = component.get('v.quartersShown');        
        var quartersShownMap = component.get('v.quartersMap');

        quartersShown.forEach(function(quarterName){
            var quarterNumber = quartersShownMap[quarterName];
            
            if(isRightArrow){
                if(quarterNumber ==4){
                    quarterNumber = 1;
                }else{
                    quarterNumber++;
                }
            }else{
                if(quarterNumber == 1){
                    quarterNumber = 4;
                }else{
                    quarterNumber--;
                }                
            }
            newQuartersShown.push(self.getKeyByValue(quartersShownMap, quarterNumber)); 
        });
        component.set('v.quartersShown', newQuartersShown);
	},
    
    getKeyByValue : function(object, value) {
        for(var prop in object ) {
            if(object.hasOwnProperty( prop ) ) {
                 if(object[prop] === value )
                     return prop;
            }
        }
    },
    
    calculateAccountsListSize : function(newRecordsList){
        let newOffset = 0;
        if(newRecordsList[newRecordsList.length-1] && 
           	newRecordsList[newRecordsList.length-1].accountName == 'New Business'){
            newOffset = newRecordsList.length - 1;
        }else{
            newOffset = newRecordsList.length;
        }
        return newOffset;
    },
    
    getEstimatesList : function(component, offset, isViewMore, paginSize){
        var self = this;
       	var leftYear = component.get('v.LeftYear');
        var quartersShown = component.get('v.quartersShown');  
        var quartersShownMap = component.get('v.quartersMap');
        var year = leftYear.year;
        
        var startQuarterNumber = quartersShownMap[quartersShown[0]];
         
        let apexMethodName = 'getEstimateSummaryData';
        let selAccList = component.get('v.SelectedAccountList');
        let selAccName = component.get('v.SelectedAccountName');
        
        let params = {year: year, quarter: startQuarterNumber, accountList: selAccList, accountName: selAccName,
                      offset: offset, paginationSize: paginSize || component.get('v.paginationSize')};
        console.log(params);
        let successActionsCallback = function(response){
            var responseValue = response.getReturnValue();
            console.log(responseValue);
			component.set('v.showViewMore', responseValue.showViewMore);
            
            let baseYearTotal = component.get('v.baseYearTotal');
            let prevToBYActualsTotal = component.get('v.prevToBYActualsTotal');
            let selYearEstimatesTotalPerQuartList = component.get('v.selYearEstimatesTotalPerQuartList');
            let prevYearActualsTotalPerQuartList = component.get('v.prevYearActualsTotalPerQuartList');
            
            let responseSumCY = responseValue.selYearEstimatesTotalPerQuartList;
            let responseSumLY = responseValue.prevYearActualsTotalPerQuartList;
               
            let newRecordsList = [];
            
            let currRecordsList = component.get('v.recordsList');
                
            if(currRecordsList[currRecordsList.length-1] && 
               currRecordsList[currRecordsList.length-1].accountName == 'New Business'){
                currRecordsList.pop();
            }
            
            if(isViewMore){
                
                newRecordsList = newRecordsList.concat(currRecordsList);
            
                baseYearTotal += responseValue.baseYearTotal;
                prevToBYActualsTotal += responseValue.prevToBYActualsTotal;
                
                for(let i = 0; i<4; i++){
                    selYearEstimatesTotalPerQuartList[i] += responseSumCY[i];
                    prevYearActualsTotalPerQuartList[i] += responseSumLY[i];
                }           
            } else{
                baseYearTotal = responseValue.baseYearTotal;
                prevToBYActualsTotal = responseValue.prevToBYActualsTotal;
                
                selYearEstimatesTotalPerQuartList = responseSumCY;
            	prevYearActualsTotalPerQuartList = responseSumLY;
            }      
            
            let totalsVariance = baseYearTotal - prevToBYActualsTotal;
                                    
            newRecordsList = newRecordsList.concat(response.getReturnValue().listAccWithSnapwrapper);
                                    
            component.set('v.recordsList', newRecordsList);
            
            component.set('v.selYearEstimatesTotalPerQuartList', selYearEstimatesTotalPerQuartList);
            component.set('v.prevYearActualsTotalPerQuartList', prevYearActualsTotalPerQuartList);
            
            component.set('v.baseYearTotal',baseYearTotal);
            component.set('v.prevToBYActualsTotal',prevToBYActualsTotal);
            
            let newOffset = self.calculateAccountsListSize(newRecordsList);
            
            
            
            component.set('v.offset', newOffset);
            
            var totalsChangedEvt = $A.get("e.c:V2_AccEstMgr_TotalsChangedEvent");      
            totalsChangedEvt.setParams({"baseYearEstimatesTotal" : baseYearTotal, 
                                        "prevToBYActualsTotal" : prevToBYActualsTotal, 
                                        "totalsVariance" : totalsVariance});        
        	totalsChangedEvt.fire();
            self.calculateYearHeadersWidth(component);                
        }
        
        //Perform Apex Call
        util.performApexCall(component, apexMethodName, params, successActionsCallback, null, true);        
    },
    
    sendEventToExpandCollapseRows : function(isExpand){
        var collapseExpandEvt = $A.get("e.c:V2_AccEstMgr_CollapseOrExpandRowsEvent");      
        collapseExpandEvt.setParams({"isExpand" : isExpand});        
        collapseExpandEvt.fire();
    }
})