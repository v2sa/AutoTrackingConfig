import { LightningElement, track, api, wire } from 'lwc';
import { NavigationMixin } from 'lightning/navigation';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import { getRecord } from 'lightning/uiRecordApi';
import getMetadata from '@salesforce/apex/V2_PipelineMgr.getMetadata';
import getPipelineDetails from '@salesforce/apex/V2_PipelineMgr.getExistingPipelineDetailsByPlatform';

import cssStaticResource from '@salesforce/resourceUrl/cssStaticResource';
import { loadStyle } from 'lightning/platformResourceLoader';

export default class V2PipelineMgrMain extends NavigationMixin(LightningElement) {
    @track columns = [];
    @track data = [];
    @track tableLoadingState = false;
    @track productCount = 0;
    @track platformSelectionModalActive = false;
    @track editDetailsModalActive = false;
    @track products = [];
    @track pipelineDetails;
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

    handleShowEditPipelineDetailsContainer(){
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
            /*---- Get the Poducts by Platform ----*/
            this.products = results.prodsByPlatform;

            /*---- Get the Existing Pipeline Details ----*/
            getPipelineDetails({opportunityId: this.recordId})
            .then(async pipelineDetails => {
                if(pipelineDetails.length > 0){
                    this.containProducts = true;
                    this.data = [];

                    for (let i = 0; i < pipelineDetails.length; i++) {
                        const element = pipelineDetails[i];
                        if (element.pipelineDetails) {
                            for (let j = 0; j < element.pipelineDetails.length; j++) {
                                const currPipelineDetail = element.pipelineDetails[j];

                                currPipelineDetail.url = "/lightning/r/OpportunityLineItem/"+ currPipelineDetail.Id + "/view";
                                this.data.push(currPipelineDetail);
                            }
                            this.productCount = this.data.length;
                        }
                        
                    }
                    
                    this.pipelineDetails = JSON.stringify(this.data);
                }
                
            })
            .catch(error => {
                this.notifyUser('Pipeline Manager Error', 'An error occured while getting Existing Pipeline Details.', 'error');
                console.error('Pipeline Manager Error: ', error);
            });
        })
        .catch(error => {
            this.notifyUser('Pipeline Manager Error', 'An error occured while getting metadata.', 'error');
            console.error('Pipeline Manager Error: ', error);
        });
    }

    pushData(newPipelineDetail) {
        this.data.push(newPipelineDetail);
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

    get pipelineDetailData() {
        console.log("===//// Data ---> ", this.data);
        return this.data;
    }

    handlePipelineDetailsSaved() {
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