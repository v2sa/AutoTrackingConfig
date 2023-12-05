import { LightningElement, track, api, wire } from 'lwc';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import getMetadata from '@salesforce/apex/V2_PipelineMgr.getMetadata';
import savePipelineDetails from '@salesforce/apex/V2_PipelineMgr.savePipelineDetails';
import jquery from '@salesforce/resourceUrl/jQuery224';
import { loadScript } from 'lightning/platformResourceLoader';
import getPipelineDetailStatusOptions from '@salesforce/apex/V2_PipelineMgr.getPipelineDetailStatusOptions';
import getPipelineDetailSubcategoryOptions from '@salesforce/apex/V2_PipelineMgr.getPipelineDetailSubCategoryOptions';
import getUserInfo from '@salesforce/apex/V2_PipelineMgr.getUserInfo';
import getPermissions from '@salesforce/apex/V2_PipelineMgr.getPermissions';
import userId from '@salesforce/user/Id';

const monthIssueCols = [
    { label: 'Product Name', fieldName: 'V2SACL1__Product_Name__c' },
    { label: 'List Price', fieldName: 'listPrice', type: 'number', cellAttributes: { alignment: 'left' } },
    { label: 'Status', fieldName: 'status', editable: true },
    { label: 'Month Close Date', fieldName: 'closeDate', type: 'date' }
];

const productProgramCols = [
    { label: 'Product Name', fieldName: 'V2SACL1__Product_Name__c' },
    { label: 'List Price', fieldName: 'listPrice', type: 'number', cellAttributes: { alignment: 'left' } },
    { label: 'Status', fieldName: 'status', editable: true },
    { label: 'Program', fieldName: 'program' }
];

export default class V2PipelineMgrPlatformSelection extends LightningElement {
    @api title = "";
    @api waseditbuttonclicked = false;

    @track platforms = [];
    @track pipelineDetails = [];
    @api pipelinedetails;
    @api platformproducts;
    @api recordid;
    @track editPipelineDetailsModalActive = false;
    @track pipelineDetailsToDelete = new Set();
    @track pipelineDetailsByPlatforms = {};
    @track windowTitle;
    @track isEdit = false;
    @api iseditscreen;
    @track monthIssueCols = monthIssueCols;
    @track productProgramCols = productProgramCols;
    @track tableLoadingState = false;
    @track platformElementsIds = new Set();
    @track savingChanges = false;
    @api caneditstatus;
    @track currentProfile = "";
    @track userInfo = {};
    @track permissions;

    @track subCategoryOptions = [];

    closeModal() {
        this.dispatchEvent(new CustomEvent('modalclosed'));
    }

    showEditLineItemModal() {
        this.windowTitle = "Edit Pipeline Details";
        this.isEdit = true;
    }

    showPlatformsModal() {
        this.windowTitle = "Select your Platforms";
        this.isEdit = false;
    }

    connectedCallback() {
        getUserInfo({ userId: userId })
            .then(result => {
                console.log('&&&& profile ---> ', result);
                this.userInfo = result;
                this.currentProfile = result.Profile.Name; //To be removed
            })
            .catch(error => {
                this.notifyUser('Product Selector Error', 'An error occured while getting User Info.', 'error');
            });

        getPermissions({})
            .then(result => {
                this.permissions = result;
                console.log("***** permissions --> " + JSON.parse(JSON.stringify(result)));
            })
            .catch(error => {
                console.error(error);
                this.notifyUser('Product Selector Error', 'An error occured while getting the User Permissions', 'error');
            });



        getPipelineDetailStatusOptions()
            .then(results => {
                this.statusOptions = results;

            })
            .catch(error => {
                this.notifyUser('Product Selector Error', 'An error occured while getting options from status field.', 'error');
            });

        getPipelineDetailSubcategoryOptions().then(results => {
                this.subCategoryOptions = results;
            })
            .catch(error => {
                this.notifyUser('Product Selector Error', 'An error occured while getting options from Sub-category field.', 'error');
            });


        this.isEdit = this.iseditscreen;

        this.windowTitle = this.title;
        /*---- Get the Existing Pipeline Details ----*/
        if (this.pipelinedetails) {
            this.pipelineDetails = JSON.parse(this.pipelinedetails);
        }

        let params = { opportunityId: this.recordid };
        getMetadata(params)
            .then(results => {
                /*---- Get the Poducts by Platform ----*/
                let resProd = results.prodsByPlatform;

                this.platforms = this.getPlatforms(resProd);
            })
            .catch(error => {
                this.notifyUser('Product Selector Error', 'An error occured while getting metadata.', 'error');
                console.error('Product Selector Error', error);
            });
    }

    generateUUIDV4() { //This function returns unique id
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
            var r = Math.random() * 16 | 0,
                v = c === 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        });
    }

    getPlatforms(platformsParam) {
        let platNames = [];
        for (let property in platformsParam) {
            if (platformsParam.hasOwnProperty(property)) {
                let plat = platformsParam[property.toString()];
                //Get the Opportunity Products for the current platform if exists
                let pipelineDetailList = [];
                let inactivePipelineDetailList = [];
                let activePipelineDetailsList = [];
                for (let index = 0; index < this.pipelineDetails.length; index++) {
                    const existingPipelineDetail = this.pipelineDetails[index];
                    if (existingPipelineDetail.Product2.Family === plat.platform) {

                        const currentCloseDate = new Date(existingPipelineDetail.Product2.V2SACL1__Month_Issue_Close_Date__c);
                        const dt = new Date();

                        const alreadyPast = currentCloseDate.getFullYear() < dt.getFullYear() && currentCloseDate.getMonth() < dt.getMonth();

                        let newPipelineDetail = {
                            uniqueId: "",
                            pipelineDetailId: existingPipelineDetail.Id,
                            product2Id: existingPipelineDetail.Product2Id,
                            name: existingPipelineDetail.V2SACL1__Product_Name__c,
                            status: existingPipelineDetail.V2SACL1__Status__c ? existingPipelineDetail.V2SACL1__Status__c : "Pipeline",
                            subCategory: existingPipelineDetail.V2SACL1__Sub_Category__c ? existingPipelineDetail.V2SACL1__Sub_Category__c : "",
                            listPrice: existingPipelineDetail.TotalPrice,
                            closeDate: existingPipelineDetail.Product2.V2SACL1__Month_Issue_Close_Date__c,
                            isSelected: true,
                            cellClass: existingPipelineDetail.V2SACL1__Status__c === "Lost/Dead" || alreadyPast ? 'platform-disabled' : ""
                        };


                        if (newPipelineDetail.status !== "Lost/Dead" || alreadyPast) {
                            newPipelineDetail.uniqueId = this.generateUUIDV4();
                            activePipelineDetailsList.push(newPipelineDetail);
                        } else {
                            inactivePipelineDetailList.push(newPipelineDetail);
                        }
                    }

                }

                let genId = this.generateUUIDV4();

                let newPlat = {
                    id: genId,
                    inputId: genId + "-input",
                    name: plat.platform,
                    isProgram: plat.isProgram,
                    requiredMultiSelect: plat.requiredMultiSelect,
                    products: JSON.stringify(plat.products),
                    pipelineDetailList: pipelineDetailList,
                    inactivePipelineDetailList: inactivePipelineDetailList,
                    activePipelineDetailsList: activePipelineDetailsList,
                    getAllPipelineDetails: function() {
                        let fullList = [...inactivePipelineDetailList, ...activePipelineDetailsList];
                        return fullList;
                    },
                    removedPipelineDetailList: []
                };

                platNames.push(newPlat);

            }

        }
        return platNames;
    }

    notifyUser(title, message, variant) {
        if (this.notifyViaAlerts) {
            // Notify via alert
            // eslint-disable-next-line no-alert
            alert(`${title}\n${message}`);
        } else {
            // Notify via toast
            const toastEvent = new ShowToastEvent({ title, message, variant });
            this.dispatchEvent(toastEvent);
        }
    }


    handlePlatformChanges(event) {
        /*------------- Reload and re-calculate Platform Program -------------*/
        let platform = JSON.parse(JSON.stringify(event.detail.platform));
        if (platform) {
            for (let i = 0; i < this.platforms.length; i++) {
                if (this.platforms[i].name === platform.name) {
                    this.platforms[i] = platform;
                    break;
                }
            }
        }

    }

    setPlatformState(event) {
        let platformElementId = "#" + event.currentTarget.id.replace("-input", "");
        let checked = event.currentTarget.checked;

        if (!checked) {
            this.template.querySelector(platformElementId).classList.add("platform-disabled");
            this.platformElementsIds.add(platformElementId);
        } else {
            this.template.querySelector(platformElementId).classList.remove("platform-disabled");
            this.platformElementsIds.delete(platformElementId);
        }

    }


    savePipelineDetails() {
        //Get Pipeline Details to insert
        let pipelineDetailListToupsert = [];
        let tempPlatforms = JSON.parse(JSON.stringify(this.platforms));
        for (let i = 0; i < tempPlatforms.length; i++) {
            let currentPlatform = tempPlatforms[i];
            for (let j = 0; j < currentPlatform.activePipelineDetailsList.length; j++) {
                const element = currentPlatform.activePipelineDetailsList[j];

                let closeDateShort = null;

                if (element.closeDate) {
                    let d = new Date(element.closeDate);
                    closeDateShort = d.getFullYear() + "-" + (d.getMonth() + 1) + "-" + d.getDate();
                } 

                let pipelineDetail = {
                    Id: element.pipelineDetailId,
                    Product2Id: element.product2Id,
                    OpportunityId: this.recordid,
                    TotalPrice: element.listPrice,
                    V2SACL1__Status__c: element.status,
                    V2SACL1__Sub_Category__c: element.subCategory
                }

                pipelineDetailListToupsert.push(pipelineDetail);

            }
        }

        //Get the Pipeline Details to delete        
        let params = { pipelineDetailsToUpsertJson: JSON.stringify(pipelineDetailListToupsert) };

        this.savingChanges = true;

        savePipelineDetails(params)
            .then(result => {

                this.notifyUser("Pipeline Detail records were updated.", "", "success");

                //Create a dispatch custom event to update the Opportunity Detail Page from the Aura wrapper component.
                this.dispatchEvent(new CustomEvent('detailssaved', {}));

                this.closeModal();
            })
            .catch(error => {
                this.savingChanges = false;
                this.notifyUser('Add Error', error.body.message, 'error');
                this.notifyUser('Add Error', 'An error occurred while saving Opportunity products.', 'error');
                
                // eslint-disable-next-line no-console
                console.error('Add error', JSON.stringify(error));
            });
    }

    lostFocus(event) {
        event.currentTarget.focus();
    }

    reCalculateMonthIssues(event) {
        let detail = JSON.parse(JSON.stringify(event.detail));

        for (let i = 0; i < this.platforms.length; i++) {
            const currentPlatform = this.platforms[i];
            let runningTotal = 0.00;

            if (currentPlatform.name === detail.platform) {
                for (let j = 0; j < currentPlatform.pipelineDetailEditList.length; j++) {
                    const currentPipelineDetail = currentPlatform.pipelineDetailEditList[j];

                    runningTotal += currentPipelineDetail.listPrice;
                    let pipelineDetailMonth = new Date(currentPipelineDetail.closeDate).getMonth();
                    let currentMonth = new Date().getMonth();

                    if (pipelineDetailMonth >= currentMonth) {
                        currentPlatform.pipelineDetailEditList[j].listPrice = detail.splitPrice;
                    }
                }
                currentPlatform.runningTotal = runningTotal;
                this.platforms[i] = currentPlatform;
                break;
            }
        }
    }

    get existPipelineDetails() {
        let containsPipelineDetails = false;

        for (let i = 0; i < this.platforms.length; i++) {
            const currentPlatform = this.platforms[i];
            if (currentPlatform.activePipelineDetailsList.length > 0) {
                containsPipelineDetails = true;
                break;
            }

        }

        return containsPipelineDetails;
    }



}