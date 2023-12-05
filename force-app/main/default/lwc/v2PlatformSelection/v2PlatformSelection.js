import { LightningElement, track, api, wire } from 'lwc';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import getMetadata from '@salesforce/apex/V2_ProdSel.getMetadata';
import saveOLIs from '@salesforce/apex/V2_ProdSel.saveOpportunityLineItems';
import jquery from '@salesforce/resourceUrl/jQuery224';
import { loadScript } from 'lightning/platformResourceLoader';
import getOliStatusOptions from '@salesforce/apex/V2_ProdSel.getOliStatusOptions';
import getOliSubcategoryOptions from '@salesforce/apex/V2_ProdSel.getOliSubCategoryOptions';
import getUserInfo from '@salesforce/apex/V2_ProdSel.getUserInfo';
import getPermissions from '@salesforce/apex/V2_ProdSel.getPermissions';
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

export default class V2PlatformSelection extends LightningElement {
    @api title = "";
    @api waseditbuttonclicked = false;

    @track platforms = [];
    @track OLIs = [];
    @api opplineitems;
    @api platformproducts;
    @api recordid;
    @track editLineItemsModalActive = false;
    @track olisToDelete = new Set();
    @track olisByPlatforms = {};
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
    //@wire(getUserInfo, { userId: userId }) userData;

    //@track statusOptions = [];
    @track subCategoryOptions = [];

    closeModal() {
        this.dispatchEvent(new CustomEvent('modalclosed'));
    }

    showEditLineItemModal() {
        this.windowTitle = "Edit Line Items";
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



        getOliStatusOptions()
            .then(results => {
                this.statusOptions = results;

            })
            .catch(error => {
                this.notifyUser('Product Selector Error', 'An error occured while getting options from status field.', 'error');
            });

        getOliSubcategoryOptions().then(results => {
                this.subCategoryOptions = results;
            })
            .catch(error => {
                this.notifyUser('Product Selector Error', 'An error occured while getting options from Sub-category field.', 'error');
            });


        this.isEdit = this.iseditscreen;

        this.windowTitle = this.title;
        /*---- Get the Existing OLIs ----*/
        if (this.opplineitems) {
            this.OLIs = JSON.parse(this.opplineitems);
        }

        console.log('LR', this.opplineitems);
        console.log('LR', this.OLIs);

        let params = { opportunityId: this.recordid };
        getMetadata(params)
            .then(results => {
                /*---- Get the Poducts by Platform ----*/
                let resProd = results.prodsByPlatform;
                console.log('**************platforms');
                console.log(resProd);

                this.platforms = this.getPlatforms(resProd);
            })
            .catch(error => {
                this.notifyUser('Product Selector Error', 'An error occured while getting metadata.', 'error');
                //console.error('Product Selector Error', JSON.stringify(error));
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
                let oliList = [];
                let inactiveOliList = [];
                let activeOlisList = [];
                for (let index = 0; index < this.OLIs.length; index++) {
                    const existingOli = this.OLIs[index];
                    if (existingOli.Product2.Family === plat.platform) {

                        const currentCloseDate = new Date(existingOli.Product2.V2SACL1__Month_Issue_Close_Date__c);
                        const dt = new Date();

                        const alreadyPast = currentCloseDate.getFullYear() < dt.getFullYear() && currentCloseDate.getMonth() < dt.getMonth();

                        let newOli = {
                            uniqueId: "",
                            oppLineItemId: existingOli.Id,
                            product2Id: existingOli.Product2Id,
                            name: existingOli.V2SACL1__Product_Name__c,
                            status: existingOli.V2SACL1__Status__c ? existingOli.V2SACL1__Status__c : "Pipeline",
                            subCategory: existingOli.V2SACL1__Sub_Category__c ? existingOli.V2SACL1__Sub_Category__c : "",
                            listPrice: existingOli.TotalPrice,
                            closeDate: existingOli.Product2.V2SACL1__Month_Issue_Close_Date__c,
                            isSelected: true,
                            cellClass: existingOli.V2SACL1__Status__c === "Lost/Dead" || alreadyPast ? 'platform-disabled' : ""
                        };


                        if (newOli.status !== "Lost/Dead" || alreadyPast) {
                            newOli.uniqueId = this.generateUUIDV4();
                            activeOlisList.push(newOli);
                            //oliList.push(existingOli);
                        } else {
                            inactiveOliList.push(newOli);

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
                    oliList: oliList,
                    inactiveOliList: inactiveOliList,
                    activeOlisList: activeOlisList,
                    getAllOlis: function() {
                        let fullList = [...inactiveOliList, ...activeOlisList];
                        return fullList;
                    },
                    removedOliList: []
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


    saveOpportunityLineItems() {
        //Get OLIs to insert
        let oliListToupsert = [];
        let tempPlatforms = JSON.parse(JSON.stringify(this.platforms));
        for (let i = 0; i < tempPlatforms.length; i++) {
            let currentPlatform = tempPlatforms[i];
            for (let j = 0; j < currentPlatform.activeOlisList.length; j++) {
                const element = currentPlatform.activeOlisList[j];

                let closeDateShort;

                if (element.closeDate) {
                    let d = new Date(element.closeDate);
                    closeDateShort = d.getFullYear() + "-" + (d.getMonth() + 1) + "-" + d.getDate();
                } else {
                    closeDateShort = null;
                }

                let oli = {
                    Id: element.oppLineItemId,
                    Product2Id: element.product2Id,
                    OpportunityId: this.recordid,
                    TotalPrice: element.listPrice,
                    Quantity: 1,
                    //V2SACL1__Month_Issue_Close_Date__c: closeDateShort,
                    V2SACL1__Status__c: element.status,
                    V2SACL1__Sub_Category__c: element.subCategory
                }

                oliListToupsert.push(oli);

            }
        }

        //Get the OLIs to delete        
        let params = { OLIsToUpsertJson: JSON.stringify(oliListToupsert) };

        this.savingChanges = true;

        saveOLIs(params)
            .then(result => {

                this.notifyUser("Opportunity Line Item records were updated.", "", "success");

                //Create a dispatch custom event to update the Opportunity Detail Page from the Aura wrapper component.
                this.dispatchEvent(new CustomEvent('linessaved', {}));

                this.closeModal();
            })
            .catch(error => {
                this.savingChanges = false;
                this.notifyUser('Add Error', error.body.message, 'error');
                this.notifyUser('Add Error', 'An error occurred while saving Opportunity products.', 'error');
                
                // eslint-disable-next-line no-console
                console.error('Add error', JSON.stringify(error));
                //this.errors = [error];
            });
    }

    lostFocus(event) {
        console.log('### event ---> ', event.currentTarget);
        event.currentTarget.focus();
        //document.getElementById('save-button').focus();
    }

    reCalculateMonthIssues(event) {
        let detail = JSON.parse(JSON.stringify(event.detail));

        for (let i = 0; i < this.platforms.length; i++) {
            const currentPlatform = this.platforms[i];
            let runningTotal = 0.00;

            if (currentPlatform.name === detail.platform) {
                for (let j = 0; j < currentPlatform.oliEditList.length; j++) {
                    const currentOli = currentPlatform.oliEditList[j];

                    runningTotal += currentOli.listPrice;
                    let oliMonth = new Date(currentOli.closeDate).getMonth();
                    let currentMonth = new Date().getMonth();

                    if (oliMonth >= currentMonth) {
                        currentPlatform.oliEditList[j].listPrice = detail.splitPrice;
                    }
                }
                currentPlatform.runningTotal = runningTotal;
                this.platforms[i] = currentPlatform;
                break;
            }
        }
    }

    get existOLIs() {
        let containsOlis = false;

        for (let i = 0; i < this.platforms.length; i++) {
            const currentPlatform = this.platforms[i];
            // if (currentPlatform.inactiveOliList.length > 0 || currentPlatform.activeOlisList.length > 0) {
            //     containsOlis = true;
            //     break;
            // }
            if (currentPlatform.activeOlisList.length > 0) {
                containsOlis = true;
                break;
            }

        }

        console.log("====== This track has changed!!!!");

        return containsOlis;
    }



}