import { LightningElement, track, api } from 'lwc';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';

import apexSearch from '@salesforce/apex/V2_PipelineMgr_LookupController.search';


export default class V2PipelineMgrPlatformProgramContainer extends LightningElement {
    // Use alerts instead of toast to notify user
    @api notifyViaAlerts = false;
    @api existingprogrampipelinedetails;
    @api platformname;
    @api opportunityid;
    
    @track platName;
    @track isMultiEntry = true;
    @track initialSelection = [];
    @track errors = [];

    connectedCallback(){
        this.setInitialSelectedProducts();
        this.platName = this.platformname;
    }

    handleSearch(event) {
        apexSearch(event.detail)
            .then(results => {
                this.template.querySelector('c-v2-pipeline-mgr-platform-program-lookup').setSearchResults(results);
            })
            .catch(error => {
                this.notifyUser('Lookup Error', 'An error occured while searching with the lookup field.', 'error');
                // eslint-disable-next-line no-console
                console.error('Lookup error', JSON.stringify(error));
                this.errors = [error];
            });
    }

    handleSelectionChange(event) {
        let removedRecordId = null;

        if (event.detail) {
            if (event.detail.removedRecordId) {
                removedRecordId = event.detail.removedRecordId;
            }
            
        }

        this.errors = [];
        let selection = this.template.querySelector('c-v2-pipeline-mgr-platform-program-lookup').getSelection();
        let detail = JSON.parse(JSON.stringify({selection: selection, platform: this.platName, removedRecordId}));
        this.dispatchEvent(new CustomEvent('programselectionchange', {detail: detail}));
    }

    notifyUser(title, message, variant) {
        if (this.notifyViaAlerts){
            // Notify via alert
            // eslint-disable-next-line no-alert
            alert(`${title}\n${message}`);
        } else {
            // Notify via toast
            const toastEvent = new ShowToastEvent({ title, message, variant });
            this.dispatchEvent(toastEvent);
        }
    }

    setInitialSelectedProducts(){
        let list = this.existingprogrampipelinedetails;
        let temPipelinedetailList = [];
        for (let index = 0; index < list.length; index++) {
            const currentPipelineDetail = list[index];
            let newPipelinedetail = {
                id: currentPipelineDetail.Product2Id,
                sObjectType: 'Product2',
                icon: 'standard:product',
                title: currentPipelineDetail.V2SACL1__Product_Name__c,
                subtitle: '',
                oppLineItemId: currentPipelineDetail.Id,
                status: currentPipelineDetail.V2SACL1__Status__c,
                program: currentPipelineDetail.V2SACL1__BrandVoice_Program__c,
                listPrice: currentPipelineDetail.ListPrice,
                subCategory: currentPipelineDetail.V2SACL1__Sub_Category__c
            };
            temPipelinedetailList.push(newPipelinedetail);
        }

        this.initialSelection = temPipelinedetailList;
    }

    @api getProductSelection(){
        let selection = this.template.querySelector('c-v2-pipeline-mgr-platform-program-lookup').getSelection();
        return {selection, platform: this.platName};
    }
}