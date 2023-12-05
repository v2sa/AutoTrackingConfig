import { LightningElement, track, api } from 'lwc';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';

import apexSearch from '@salesforce/apex/V2_ProSel_LookupController.search';



export default class V2PlatformProgramContainer extends LightningElement {
    // Use alerts instead of toast to notify user
    @api notifyViaAlerts = false;
    @api existingprogramolis;
    @api platformname;
    @api opportunityid;
    
    @track platName;
    @track isMultiEntry = true;
    @track initialSelection = [];
    @track errors = [];

    

    /*handleLookupTypeChange(event) {
        this.initialSelection = [];
        this.errors = [];
        this.isMultiEntry = event.target.checked;
    }*/

    connectedCallback(){
        this.setInitialSelectedProducts();
        this.platName = this.platformname;
    }

    handleSearch(event) {
        apexSearch(event.detail)
            .then(results => {
                //console.log('++++ Results -->', results['Handler']);
                this.template.querySelector('c-v2-platform-program-lookup').setSearchResults(results);
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

        console.log('@@@@@ hey ---> ');
        this.errors = [];
        let selection = this.template.querySelector('c-v2-platform-program-lookup').getSelection();
        console.log('@@@@@ selection ---> ', selection);
        let detail = JSON.parse(JSON.stringify({selection: selection, platform: this.platName, removedRecordId}));
        console.log('@@@@@ detail ---> ', detail);
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
        //let list = JSON.parse(this.existingprogramolis);
        let list = this.existingprogramolis;
        console.log('+++ list olis program --> ', list);
        let temOliList = [];
        for (let index = 0; index < list.length; index++) {
            const currentOli = list[index];
            let newOli = {
                id: currentOli.Product2Id,
                sObjectType: 'Product2',
                icon: 'standard:product',
                title: currentOli.V2SACL1__Product_Name__c,
                subtitle: '',
                oppLineItemId: currentOli.Id,
                status: currentOli.V2SACL1__Status__c,
                program: currentOli.V2SACL1__BrandVoice_Program__c,
                listPrice: currentOli.ListPrice,
                subCategory: currentOli.V2SACL1__Sub_Category__c
            };
            temOliList.push(newOli);
        }

        this.initialSelection = temOliList;

        console.log('+++ this.initialSelection --> ', this.initialSelection);
    }

    // handleSelectionChange(event){
    //     //const selection = this.template.querySelector('c-v2-platform-program-lookup').getSelection();
    //     const selectionContainer = JSON.parse(JSON.stringify(event.detail));
    //     console.log('$$$$$ selectionContainer --> ', selectionContainer);
    //     this.dispatchEvent(new CustomEvent('selectprogramproduc', {detail: {selectionContainer, platName: this.platName}}));
    // }

    @api getProductSelection(){
        let selection = this.template.querySelector('c-v2-platform-program-lookup').getSelection();
        console.log('@@@@@ selection ---> ', selection);
        return {selection, platform: this.platName};
        //this.dispatchEvent(new CustomEvent(''), {detail: selection});
    }
}