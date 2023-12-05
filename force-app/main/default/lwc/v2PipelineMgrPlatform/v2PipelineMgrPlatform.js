import { LightningElement, track, api } from 'lwc';


const productProgramCols = [
    {label: 'Product Name', fieldName: 'name', cellAttributes: { class: { fieldName: 'cellClass' }}},
    {label: 'List Price', fieldName: 'listPrice', type: 'number', editable: true, cellAttributes: { class: { fieldName: 'cellClass' }, alignment: 'left'}},
    {label: 'Status', fieldName: 'status', editable: true, cellAttributes: { class: { fieldName: 'cellClass' }}},
    {label: 'Program', fieldName: 'program', cellAttributes: { class: { fieldName: 'cellClass' }}},
    {label: 'Sub-Category', fieldName: 'subCategory', cellAttributes: { class: { fieldName: 'cellClass' }}}
];

const insightsOptions = [
    {label: "Insights Research", value: "Insights Research"},
    {label: "Insights Stories", value: "Insights Stories"},
    {label: "Insights Special Feature", value: "Insights Special Feature"}
];

const brandVoiceOptions = [
    {label: "Premium", value: "BrandVoice Premium"},
    {label: "Elite", value: "BrandVoice Elite"},
    {label: "Stories", value: "BrandVoice Stories"},
    {label: "Special Feature", value: "BrandVoice Special Feature"}
];

const subCategoryPlatforms = ["Insights", "BrandVoice"];

export default class V2PipelineMgrPlatform extends LightningElement {
    @api platformparam;
    @api isedit;
    @api recordid;
    @api statusoptions;
    @api subCategoryOptions;
    @api caneditstatus;
    @api profile;
    @api requireMultiSelectPicklist = false;
    @api userinfo;
    @api permissions;
    
    @track platform;
    @track stateClass = "";
    @track isCheckedState;
    @track monthIssueCols;
    @track productProgramCols;
    @track allPipelineDetailsList =[];
    @track runningTotal;
    @track totalAmount;
    @track subCategorySelection;
    @track newSelection;
    @track categoryOptions;
    @track renderTable = true;
    @track markedLostList = [];

    connectedCallback(){
        this.platform = JSON.parse(JSON.stringify(this.platformparam));
        this.refreshAllPipelineDetailsList();

        let statusColumn;

        if(this.caneditstatus){
            statusColumn = {
                label: 'Status',
                type: 'v2PicklistColumn',
                fieldName: 'status',
                typeAttributes: {
                    options: this.statusoptions
                },
                editable: true,
                cellAttributes: { class: { fieldName: 'cellClass' }}
            };
        } else {
            statusColumn = {label: 'Status', fieldName: 'status', type: 'text', cellAttributes: { class: { fieldName: 'cellClass' }}}
        }

        let subCategoryColumn = {label: 'Sub-Category', fieldName: 'subCategory', type: 'text', cellAttributes: { class: { fieldName: 'cellClass' }}}

        this.monthIssueCols = [
            {label: 'Product Name', fieldName: 'name', cellAttributes: { class: { fieldName: 'cellClass' }}},
            {label: 'List Price', fieldName: 'listPrice', type: 'number', editable: true, cellAttributes: { class: { fieldName: 'cellClass' }, alignment: 'left'}}, 
            {label: 'Month Close Date', fieldName: 'closeDate', type: 'date', cellAttributes: { class: { fieldName: 'cellClass' }}}
        ];

        this.monthIssueCols.push(statusColumn);

        this.productProgramCols = [
            {label: 'Product Name', fieldName: 'name', cellAttributes: { class: { fieldName: 'cellClass' }}},
            {label: 'List Price', fieldName: 'listPrice', type: 'number', editable: true, cellAttributes: { class: { fieldName: 'cellClass' }, alignment: 'left'}},
        ];

        this.productProgramCols.push(statusColumn);


        if (subCategoryPlatforms.includes(this.platform.name)) {
            this.monthIssueCols.push(subCategoryColumn);
            this.productProgramCols.push(subCategoryColumn);
        }

        this.getTotalAmont();
        this.stateClass = this.platform.activePipelineDetailsList.length > 0 ? "" : "platform-disabled";
        this.isCheckedState = this.platform.activePipelineDetailsList.length > 0;

    }

    getCategoryOptionsBasedOnPlatform() {
        
        switch (this.platform.name) {
            case "Insights":
                return insightsOptions;

            case "BrandVoice":
                return brandVoiceOptions;
        
            default:
                return this.subCategoryOptions;
        }
        
    }

    get getSubCategoryOptions() {
        return this.getCategoryOptionsBasedOnPlatform();
    }

    renderedCallback(){
        this.expandChevronOnExistingPipeDetails();
    }

    get platformState(){
        return this.stateClass;
    }

    setPlatformState(event){
        let checked = event.currentTarget.checked;
        this.isCheckedState = checked;

        // eslint-disable-next-line no-empty
        if (!checked) {
            this.stateClass = "platform-disabled"

            for (let i = 0; i < this.platform.activePipelineDetailsList.length; i++) {
                this.platform.activePipelineDetailsList[i].status = "Lost/Dead";
            }

            this.dispatchPlatform("platformchanges");
            this.refreshAllPipelineDetailsList();            

        // eslint-disable-next-line no-empty
        } else {
            this.stateClass = "";

            //Set active section of the accordion
            this.expandChevron();
        }

        
    }

    @api getPlaformProgramSelection(){
        let tempPlatform = null;

        if (this.platform.isProgram) {
            /*------------- Reload and re-calculate Platform Program -------------*/
            let container = this.template.querySelector('c-v2-platform-program-container').getProductSelection();
            let selectionList = [...container.selection];
            let newSelectionList = [];

            selectionList.forEach(prod => {
                let newPipelineDetail = {
                    pipelineDetailId: prod.pipelineDetailId,
                    product2Id: prod.Id,
                    name: prod.title,
                    status: prod.status,
                    listPrice: prod.ListPrice, //Check this later to switch to Total Price
                    program: prod.program,
                    subCategory: prod.subCategory
                };
                newSelectionList.push(newPipelineDetail);
            });


            tempPlatform = JSON.parse(JSON.stringify(this.platform));

            tempPlatform.pipelineDetailEditList = newSelectionList;
            this.platform = tempPlatform;
        } 

        return tempPlatform;
    }

    dispatchPlatform(eventName){
        this.dispatchEvent(new CustomEvent(eventName, {detail: {platform: this.platform}}));
        this.refreshRunningTotal();
    }

    handleProgramSelectionChange(event){
        let detail = JSON.parse(JSON.stringify(event.detail));

        if (!detail.removedRecordId) {
            let pipelineDetailsSelectedList = [];

            for (let i = 0; i < detail.selection.length; i++) {
                const element = detail.selection[i];
                let newPipelineDetail = {
                    uniqueId: this.generateUUIDV4(),
                    pipelineDetailId: element.pipelineDetailId,
                    product2Id: element.id,
                    name: element.title,
                    status: 'Pipeline',
                    listPrice: 0.00,
                    subCategory: element.subCategory,
                    cellClass: "slds-cell-edit slds-is-edited"
                };
            
                pipelineDetailsSelectedList.push(newPipelineDetail);
            }
        
        
            if (this.platform.name === detail.platform) {
                this.platform.activePipelineDetailsList = pipelineDetailsSelectedList;
            }
        
            this.dispatchPlatform("platformchanges");
            this.refreshAllPipelineDetailsList();
        }
    }

    setSelectedMonthIssue(event){
        let pipelineDetailReceived = JSON.parse(JSON.stringify(event.detail));

        //If unselected then add to the inactive pipelineDetail list.
        if (pipelineDetailReceived.isSelected === false) {
            if (pipelineDetailReceived.productLineItem) {
                //Add to the inactive list
                pipelineDetailReceived.status = "Lost/Dead";
                this.platform.inactivePipelineDetailList.push(this.getNewPipelineDetail(pipelineDetailReceived, false));
            }

            //Remove from the active list
            for (let i = 0; i < this.platform.activePipelineDetailsList.length; i++) {
                const element = this.platform.activePipelineDetailsList[i];
                if (element.uniqueId === pipelineDetailReceived.uniqueId) {
                    this.platform.activePipelineDetailsList.splice(i, 1);
                    break;
                }
            }
        } else if(pipelineDetailReceived.isSelected === true) {
            //Remove it from the removedPipelineDetailList in case was added before
            let newPipelineDetail = this.getNewPipelineDetail(pipelineDetailReceived, true);
    
            if (this.platform.name === pipelineDetailReceived.platform) {
                this.platform.activePipelineDetailsList.push(newPipelineDetail);
            }
        }        

        this.dispatchPlatform("platformchanges");
        this.calculateAndSplitTotalAmount();
    }

    getNewPipelineDetail(pipelineDetailReceived, isNew){
        let newPipelineDetail = {
            uniqueId: pipelineDetailReceived.uniqueId,
            oppLineItemId: pipelineDetailReceived.productLineItem,
            product2Id: pipelineDetailReceived.productId,
            name: pipelineDetailReceived.productName,
            status: pipelineDetailReceived.status,
            subCategory: pipelineDetailReceived.subCategory,
            listPrice: isNew ? 0.00 : pipelineDetailReceived.listPrice,
            closeDate: pipelineDetailReceived.closeDate,
            cellClass: pipelineDetailReceived.status === "Lost/Dead" ? 'platform-disabled' : "slds-cell-edit slds-is-edited"
        };

        return newPipelineDetail;
    }

    get displaySelection(){
        return this.isedit ? "hide" : "display";
    }

    get displayEdit(){
        return this.isedit ? "display" : "hide";
    }

    get displayMultiSelectPicklist(){
        return this.platform.requiredMultiSelect;
    }

    get getAllPipelineDetails() {
        return this.allPipelineDetailsList;
    }

    refreshAllPipelineDetailsList(){
        this.allPipelineDetailsList = [...this.platform.activePipelineDetailsList, ...this.platform.inactivePipelineDetailList];
        this.refreshRunningTotal();
    }

    handleRowAction(event){
        let draftValue = JSON.parse(JSON.stringify(event.detail.draftValues[0]));
        console.log("==== row --> ", draftValue);


        let value;
        if (draftValue.id) {
            value = draftValue.id.replace("row-", "");
        } else {
            value = draftValue.uniqueId.replace("row-", "");
        }
        let index = parseInt(value, 10 );

        let item = {...this.allPipelineDetailsList[index]};
        let pipelineDetailIndex = -1;

        for (let i = 0; i < this.platform.activePipelineDetailsList.length; i++) {
            const element = this.platform.activePipelineDetailsList[i];
            if(element.uniqueId === item.uniqueId){
                pipelineDetailIndex = i;
                break;
            }
        }

        if (pipelineDetailIndex >= 0) {
            for (const key in draftValue) {
                if (item.hasOwnProperty(key)) {
                    // item[key.toString()] = draftValue[key.toString()];
                    let myValue = draftValue[key.toString()];
                    let a = isNaN(Number(myValue)) ? myValue : Number(myValue);
                    item[key.toString()] = a;
                    item.cellClass = "slds-cell-edit slds-is-edited";
                }
            }
    
            this.platform.activePipelineDetailsList[pipelineDetailIndex] = item;
    
            console.log("====== Item ---> ", item);

            this.dispatchPlatform("platformchanges");
        }

        this.refreshAllPipelineDetailsList();

    }

    refreshRunningTotal(){
        let total = 0.00;
        for (let i = 0; i < this.allPipelineDetailsList.length; i++) {
            const currentPipelineDetail = this.allPipelineDetailsList[i];
            total += currentPipelineDetail.listPrice;
        }

        this.runningTotal = total;
    }

    setTotalAmount(event){
        if(!event.target.value) {
            this.totalAmount = 0;
            return;
        }
        
        this.totalAmount = parseFloat(event.target.value);

        this.calculateAndSplitTotalAmount();
    }

    calculateAndSplitTotalAmount(){
        //Split the amount into the active PipelineDetails

        let clonePipelineDetailList = [...JSON.parse(JSON.stringify(this.platform.activePipelineDetailsList))]

        //Set amount only for new Pipeline Details
        let filteredList = clonePipelineDetailList.filter(function(pipelineDetail) {
            return pipelineDetail.oppLineItemId === null || pipelineDetail.oppLineItemId === "" || pipelineDetail.oppLineItemId === undefined;
        });

        let count = filteredList.length;

        let splitResult = this.totalAmount / count;

        for (let i = 0; i < this.platform.activePipelineDetailsList.length; i++) {
            let pipelineDetail = this.platform.activePipelineDetailsList[i];
            if (pipelineDetail.oppLineItemId === null || pipelineDetail.oppLineItemId === "" || pipelineDetail.oppLineItemId === undefined) {
                this.platform.activePipelineDetailsList[i].listPrice = splitResult;
            }
            
        }

        this.refreshAllPipelineDetailsList();
        this.dispatchPlatform("platformchanges");
    }

    getTotalAmont(){
        this.totalAmount = 0.00;

        if (this.platform.isProgram) {
            for (let i = 0; i < this.platform.pipelineDetailList.length; i++) {
                this.totalAmount += this.platform.pipelineDetailList[i].TotalPrice;
            }
        } else {
            for (let i = 0; i < this.platform.activePipelineDetailsList.length; i++) {
                this.totalAmount += this.platform.activePipelineDetailsList[i].listPrice;
            }
        }
        
    }

    @api expandChevron(){
        const accordion = this.template.querySelector('.example-accordion');
        accordion.activeSectionName = this.platform.name;
    }



    @api expandChevronOnExistingPipeDetails(){
        const itemCount = this.allPipelineDetailsList.length + this.platform.pipelineDetailList.length;

        if (itemCount > 0) {
            this.expandChevron();
        }
    }

    get amountLabel(){
        return this.platform.isProgram ? "Product Amount" : "Campaign Amount";
    }

    get displayClass(){
        return this.allPipelineDetailsList.length === 0 && this.isedit ? "hide" : "display";
    }

    handleChangeSubCategory(event){
        this.subCategorySelection = JSON.parse(JSON.stringify(event.detail.value));
        this.newSelection = JSON.parse(JSON.stringify(event.detail.newSelected.value));
        console.log('@@@@@ subCategorySelection ---> ', this.subCategorySelection);
        this.calculatePipelineDetailsBySubCategory();
    }

    @api calculatePipelineDetailsBySubCategory(){
        this.renderTable = false;

        if (this.subCategorySelection.length === 1) {
            let cleanOriginal1 = JSON.parse(JSON.stringify(this.platform.activePipelineDetailsList));
            for (let i = 0; i < cleanOriginal1.length; i++) {
                cleanOriginal1[i].subCategory = this.newSelection;
            }
            this.platform.activePipelineDetailsList = cleanOriginal1;

          }
  
          if (this.subCategorySelection.length > 1) {
            let cleanOriginal = JSON.parse(JSON.stringify(this.platform.activePipelineDetailsList));
  
            for (let i = 0; i < cleanOriginal.length; i++) {
                cleanOriginal[i].uniqueId = this.generateUUIDV4(); //Assign a new Unique id so it doesn't have conflict with the original one.
                cleanOriginal[i].subCategory = this.newSelection;
            }
  
            this.platform.activePipelineDetailsList.push(...cleanOriginal);
          }

        this.refreshAllPipelineDetailsList();

        this.dispatchPlatform("platformchanges");
        this.renderTable = true;
    }

    generateUUIDV4(){//This function returns unique id
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
            var r = Math.random() * 16 | 0, v = c === 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        });
    }

    get platformIsMagazineOrLive() {
        return this.platform.name === 'Live';
    }

    getSelectedRows(event) {
        this.markedLostList = event.detail.selectedRows;
    }

    get displayMarkBookedButton() {
        return this.permissions.length > 0 && this.permissions[0].V2SACL1__Mark_booked_button_enabled__c;
    }

    markStatust(event) {
        let status = event.currentTarget.dataset.status;
        let currentPlatform = JSON.parse(JSON.stringify(this.platform));
        for (let i = 0; i < this.markedLostList.length; i++) {
            const row = this.markedLostList[i];
            if (row.oppLineItemId || status === 'Booked') {
                for (let j = 0; j < currentPlatform.activePipelineDetailsList.length; j++) {
                    const pipelineDetail = currentPlatform.activePipelineDetailsList[j];
                    
                    if (pipelineDetail.uniqueId === row.uniqueId && pipelineDetail.status !== "Lost/Dead") {
                        currentPlatform.activePipelineDetailsList[j].status = status;
                        break;
                    }
                }
            }
            
        }

        this.platform = currentPlatform;

        this.refreshAllPipelineDetailsList();

        this.dispatchPlatform("platformchanges");
    }
}