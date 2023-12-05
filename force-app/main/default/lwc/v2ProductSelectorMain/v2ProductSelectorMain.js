import { LightningElement, track, api, wire } from 'lwc';
import { NavigationMixin } from 'lightning/navigation';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import { getRecord } from 'lightning/uiRecordApi';
import getMetadata from '@salesforce/apex/V2_ProdSel.getMetadata';
import getOLI from '@salesforce/apex/V2_ProdSel.getExistingOLIsByPlatform';

import cssStaticResource from '@salesforce/resourceUrl/cssStaticResource';
import { loadStyle } from 'lightning/platformResourceLoader';

//export default class V2ProductSelectorMain extends LightningElement {
export default class V2ProductSelectorMain extends NavigationMixin(LightningElement) {
    @track columns = [];
    @track data = [];
    @track tableLoadingState = false;
    @track productCount = 0;
    @track platformSelectionModalActive = false;
    @track editLineItemsModalActive = false;
    @track products = [];
    @track olis;
    @track platformWindowHeader;
    @track isEdit = false;
    @track containProducts = false;
    @track wasEditButtonClicked = false;
    @track canEditStatus = false;
    @api recordId;

    handleShowPlatformSelection() {
        this.isEdit = false;
        this.wasEditButtonClicked = false;
        this.platformWindowHeader = "Select your Platforms";
        this.platformSelectionModalActive = true;
    }

    handlePlatformSelectionModalClose(event){
        this.platformSelectionModalActive = false;
        this.isEdit = false;
        this.connectedCallback();
    }

    handleShowEditLineItemsContainer(){
        this.isEdit = true;
        this.wasEditButtonClicked = true;
        this.platformSelectionModalActive = true;
    }

    connectedCallback() {
        loadStyle(this, cssStaticResource + '/cssStaticResource3.css')
        .then(() => { /* callback */ });


        function disableToggle() {
          window.isToggling = false;
        }
        
        function initializeDragDatesFunctionality() {
            document.body.onmouseup = disableToggle;
        }
        
        initializeDragDatesFunctionality();

        let params = {opportunityId: this.recordId}
        getMetadata(params)
        .then(results => {
            console.log("**** Results ---> ", results);
            if (results) {
                this.canEditStatus  = results.fields.canEditStatus;
            }

            /*---- Get the Columns Fields ----*/
            let cols = [];
            for (let index = 0; index < results.fields.coreColumns.length; index++) {
                const col = results.fields.coreColumns[index];

                if (col.V2SACL1__Type__c === "url") {
                    cols.push({label: col.MasterLabel, fieldName: 'url', type: col.V2SACL1__Type__c, initialWidth: col.V2SACL1__ColumnWidth__c, cellAttributes: { alignment: 'left' },
                    typeAttributes: { 
                        label: {
                            fieldName: col.V2SACL1__ApiName__c
                        },
                        target: '_blank'
                    }});
                } else {
                    cols.push({label: col.MasterLabel, fieldName: col.V2SACL1__ApiName__c, type: col.V2SACL1__Type__c, initialWidth: col.V2SACL1__ColumnWidth__c, cellAttributes: { alignment: 'left' }});
                }
                
            }

            this.columns = cols;
            console.log('********=>BT ');
            console.log(cols);
            /*---- Get the Poducts by Platform ----*/
            this.products = results.prodsByPlatform;

            /*---- Get the Existing OLIs ----*/
            getOLI({opportunityId: this.recordId})
            .then(async olis => {
                if(olis.length > 0){
                    this.containProducts = true;
                    this.data = [];

                    for (let i = 0; i < olis.length; i++) {
                        const element = olis[i];
                        if (element.OLIs) {
                            for (let j = 0; j < element.OLIs.length; j++) {
                                const currentOli = element.OLIs[j];

                                currentOli.url = "/lightning/r/OpportunityLineItem/"+ currentOli.Id + "/view";
                                this.data.push(currentOli);
                            }
                            this.productCount = this.data.length;
                        }
                        
                    }
                    
                    this.olis = JSON.stringify(this.data);
                }
                
            })
            .catch(error => {
                this.notifyUser('Product Selector Error', 'An error occured while getting Existing OLIs.', 'error');
                //console.error('Product Selector Error', JSON.stringify(error));
                console.error('Product Selector Error: ', error);
            });
        })
        .catch(error => {
            this.notifyUser('Product Selector Error', 'An error occured while getting metadata.', 'error');
            //console.error('Product Selector Error', JSON.stringify(error));
            console.error('Product Selector Error: ', error);
        });
    }

    setUrl(oli){
        //Generate URLs
        this.oliRecordPage = {
            type: 'standard__recordPage',
            attributes: {
                recordId: "00k8A000003yCYCQA2",
                objectApiName: "OpportunityLineItem",
                actionName: 'view'
            }
        };
        this[NavigationMixin.GenerateUrl](this.oliRecordPage).then( url => {
            
            oli.url = url;
            this.data.push(oli);
        });
    }

    pushData(newOli) {
        this.data.push(newOli);
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

    get testProducts(){
        return JSON.stringify(this.products);
    }

    get oliData() {
        console.log("===//// Data ---> ", this.data);
        return this.data;
    }

    handleLinesSaved() {
        this.dispatchEvent(new CustomEvent('refreshpage'));
    }

    @wire(getRecord, { recordId: '$recordId', fields: [] })
    wiredOpportunity({ error, data }) {
        if (data) {
            this.connectedCallback();
        } else if (error) {
            console.log(error);
        }
    }
}