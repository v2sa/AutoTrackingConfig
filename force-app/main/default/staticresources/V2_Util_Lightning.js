/**
 *  JS Library V2_Util_Lightning contains common and generalised methods which are used in various V2SA code of the overall delivered solution.
 *  Please review available methods and uncomment if any one is necessary for newly developed code/solutions.
*/

(function (context) {
  	var util = {};
  	var _util = {};
    
    /** 
     * @description 	Search on Enter keypress
     * @param callback  Receives a function to be called
     * @return			None
     * 
        Example:
        util.executeOnEnter(event, function(){
            component.set('v.searchVal','');
            helper.searchParticipantsByText(component);
        });
     * 
    */
    util.executeOnEnter = function(event, callback){
        if (event.keyCode === 13) {
            callback && callback();
        }
    }
     
    //INTERNAL
    _util.hideSpinner = function(component){
         var spinner = component.find("mySpinner");
         $A.util.addClass(spinner, "slds-hide");
    }
    
    //INTERNAL
    _util.showSpinner = function(component){
        var spinner = component.find("mySpinner");
        $A.util.removeClass(spinner, "slds-hide");
    }

    /** 
     * @description 	Performs call to Apex method
     * @param 			component, 
     * 					apexMethod, 
     * 					params, 
     * 					successActionsCallback, 
     * 					errorActionsCallback(optional), 
     * 					showSpinner(optional)
     * @return			None
     * 
        Example:
        loadProducts : function(component, event, apexMethod, searchText) {
        
            let params = {textToSearch : searchText, meetingSummaryID: component.get('v.recordId') };
            let successActionsCallback = function(response){
                    component.set('v.searchedParticipants', response.getReturnValue());
            }
            let errorActionsCallback  = null; //No Custom Error Action
            let showSpinner = true;
            
            //Perform Apex Call
            util.performApexCall(component, apexMethod, params, successActionsCallback, errorActionsCallback, showSpinner);
        
		}
     * 
    */
    util.performApexCall = function(component, apexMethod, params, successActionsCallback, errorActionsCallback, showSpinner){
        
        //Show the Spinner
        if(showSpinner && showSpinner == true){
        	_util.showSpinner(component);            
        }
        
        //Call apex controller
        var apexAction = component.get('c.'+ apexMethod);
        apexAction.setParams(params);
        
         var callback = function(response){
            var respState = response.getState();
            if(respState == 'SUCCESS'){
                successActionsCallback(response);
            }else{
                if(errorActionsCallback){
                    errorActionsCallback(response);
                }else{
                    let errors = response.getError();
                    console.log('*******ERRORS DURING SERVER CALL******');
                    _util.showToastError(response);
                }
            } 
             //Hide the Spinner
            if(showSpinner && showSpinner == true){
             	_util.hideSpinner(component);     
            }
        }
            
        apexAction.setCallback(this, callback);
        $A.enqueueAction(apexAction);        
    }
        
    /** 
     * @description 	Show error message inside a callback action (INTERNAL)
     * @param 			response
     * @return			None
    */
    _util.showToastError = function(response){                
    	//Paremeters needed
        var errors = response.getError();
        
        var title = errors[0].pageErrors ? errors[0].pageErrors[0].statusCode : '';
        var message = errors[0].pageErrors ? errors[0].pageErrors[0].message : errors[0].message;
        var type = 'error';
    
        var toastEvent = $A.get("e.force:showToast");
    	//If you're using Preview from Dev Console this won't work, you'd have to test it in lightning experience.
    	if(toastEvent == null){
            alert(message);
        }else{
            toastEvent.setParams({
                "title" : title,
                "message": message,
                "type": type
            });
            toastEvent.fire();
        }
    }
    
    /** 
     * @description 	This method is to show other type of pop-up message, like success messages
     * @param 			title, 
     * 					message,
     * 					type (error, warning, success, or info)
     * @return			None
     * 
        Example:
        showToastMessage('Success Message', 'Products were saved successfuly!', 'success')
     * 
    */
    util.showToastMessage = function(title, message, type){  
        var toastEvent = $A.get("e.force:showToast");
        //If you're using Preview from Dev Console toast event is not recognized.
        if(toastEvent == null){
            alert(message);
        }else{
            toastEvent.setParams({
                "title" : title,
                "message": message,
                "type": type
            });
            toastEvent.fire();
        }
    }
    
    /** 
     * @description 	Initializes jquery lookup in the Seller field
     * @param 			component current component 
     * 					listAttribute attribute containing the list to get the available options from
     * 					inputClass HTML class to identify the lookup component with
     * @return			None
     * 
        Example:
        		util.initLookupComponent(component, 'Sellers', 'js-typeahead-seller', 
                                 function (node, a, item, event) {
                                     //Update seller and set current wrapper to isChanged
                                     var OLIWrapper = component.get("v.OLIWrapper");
                                     OLIWrapper.OLI.Seller__c = item.Id;
                                     OLIWrapper.sellerName = item.Name;
                                     OLIWrapper.isChanged = true;
                                     component.set("v.OLIWrapper", OLIWrapper);
                                     
                                     //Show save/cancel buttons
                                     document.getElementsByClassName("buttons-container")[0].style.display = "flex";
                                 });
     * 
    */
    util.initLookupComponent = function(data, inputClass, displayField, callback) {
        if($ && $.typeahead && data.length > 0 ){
            $.typeahead({
                input: '.'+inputClass,
                order: "asc",
                cancelButton: false,
                href: null,
                source: {
                    object: {
                        href: null,
                        display: displayField,
                        data: data,
                        ajax: null
                    },
                },
                template: function (query, item) {
                    return '<span class="row">' +
                        '<span class="objectname">{{'+displayField+'}}</span>' +
                        '</span>'
                },
                callback: {
                    onClick : function (node, a, item, event) {
                        callback && callback(node, a, item, event);
                    },
                }
            });
        }
    },
    
    context.util = util;
})(this);
