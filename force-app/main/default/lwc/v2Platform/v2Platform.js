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

export default class V2Platform extends LightningElement {
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
    @track allOLIsList =[];
    @track runningTotal;
    @track totalAmount;
    @track subCategorySelection;
    @track newSelection;
    @track categoryOptions;
    @track renderTable = true;
    @track markedLostList = [];

    connectedCallback(){
        this.platform = JSON.parse(JSON.stringify(this.platformparam));
        this.refreshAllOLIsList();

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
            //{label: 'Product Name', fieldName: 'name'},
            {label: 'List Price', fieldName: 'listPrice', type: 'number', editable: true, cellAttributes: { class: { fieldName: 'cellClass' }, alignment: 'left'}}, 
            //{label: 'Status', fieldName: 'status', type: 'text', cellAttributes: { class: { fieldName: 'cellClass' }}},
            {label: 'Month Close Date', fieldName: 'closeDate', type: 'date', cellAttributes: { class: { fieldName: 'cellClass' }}}
        ];

        this.monthIssueCols.push(statusColumn);

        this.productProgramCols = [
            {label: 'Product Name', fieldName: 'name', cellAttributes: { class: { fieldName: 'cellClass' }}},
            //{label: 'Product Name', fieldName: 'name'},
            {label: 'List Price', fieldName: 'listPrice', type: 'number', editable: true, cellAttributes: { class: { fieldName: 'cellClass' }, alignment: 'left'}},
            //{label: 'Status', fieldName: 'status', type: 'text', cellAttributes: { class: { fieldName: 'cellClass' }}}
        ];

        this.productProgramCols.push(statusColumn);


        if (subCategoryPlatforms.includes(this.platform.name)) {
            console.log('paso por aqui');
            this.monthIssueCols.push(subCategoryColumn);
            this.productProgramCols.push(subCategoryColumn);
        }

        this.getTotalAmont();
        this.stateClass = this.platform.activeOlisList.length > 0 ? "" : "platform-disabled";
        this.isCheckedState = this.platform.activeOlisList.length > 0;

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
        this.expandChevronOnExistingLines();
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

            for (let i = 0; i < this.platform.activeOlisList.length; i++) {
                this.platform.activeOlisList[i].status = "Lost/Dead";
            }

            this.dispatchPlatform("platformchanges");
            this.refreshAllOLIsList();            

        // eslint-disable-next-line no-empty
        } else {
            this.stateClass = "";

            //Set active section of the accordion
            this.expandChevron();
        }

        
    }

    @api getPlaformProgramSelection(){

        console.log('&&&& getPlaformProgramSelection function ');

        let tempPlatform = null;

        console.log('&&&& this.platform ---> ', JSON.parse(JSON.stringify(this.platform)));

        if (this.platform.isProgram) {
            /*------------- Reload and re-calculate Platform Program -------------*/
            let container = this.template.querySelector('c-v2-platform-program-container').getProductSelection();
            let selectionList = [...container.selection];
            let newSelectionList = [];

            //let runningTotal = 0.00;

            selectionList.forEach(prod => {
                //runningTotal += prod.ListPrice;
                let newOli = {
                    oppLineItemId: prod.oppLineItemId,
                    product2Id: prod.Id,
                    name: prod.title,
                    status: prod.status,
                    listPrice: prod.ListPrice, //Check this later to switch to Total Price
                    program: prod.program,
                    subCategory: prod.subCategory
                };
                newSelectionList.push(newOli);
            });


            tempPlatform = JSON.parse(JSON.stringify(this.platform));

            tempPlatform.oliEditList = newSelectionList;
            //tempPlatform.runningTotal = runningTotal;
            console.log('&&&& tempPlatform ---> ', tempPlatform);
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
        console.log("**** detail ---> ", detail);

        if (!detail.removedRecordId) {
            let olisSelectedList = [];

            for (let i = 0; i < detail.selection.length; i++) {
                const element = detail.selection[i];
                let newOli = {
                    uniqueId: this.generateUUIDV4(),
                    oppLineItemId: element.oppLineItemId,
                    product2Id: element.id,
                    name: element.title,
                    status: 'Pipeline',
                    listPrice: 0.00,
                    subCategory: element.subCategory,
                    cellClass: "slds-cell-edit slds-is-edited"
                };
            
                olisSelectedList.push(newOli);
            }
        
        
            if (this.platform.name === detail.platform) {
                //this.platform.oliEditList = olisSelectedList;
                this.platform.activeOlisList = olisSelectedList;
            
                //removed items
                // if (detail.removedRecordId) {
                //     this.platform.removedOliList.push(detail.removedRecordId);
                // }
                
            }
        
            //this.dispatchEvent(new CustomEvent("programproductselection", {detail: {platform: this.platform}}));
            this.dispatchPlatform("platformchanges");
            this.refreshAllOLIsList();
            //this.refreshRunningTotal();
        }

        
    }


    setSelectedMonthIssue(event){
        let oliReceived = JSON.parse(JSON.stringify(event.detail));
        console.log('//// KLK event ----> ', oliReceived);
        //console.log('//// KLK tempPlatforms ----> ', tempPlatforms);

        //If unselected then add to the inactive oli list.
        if (oliReceived.isSelected === false) {
            if (oliReceived.productLineItem) {
                //Add to the inactive list
                oliReceived.status = "Lost/Dead";
                this.platform.inactiveOliList.push(this.getNewOli(oliReceived, false));
            }

            //Remove from the active list
            for (let i = 0; i < this.platform.activeOlisList.length; i++) {
                const element = this.platform.activeOlisList[i];
                //if (element.oppLineItemId === oliReceived.productLineItem) {
                if (element.uniqueId === oliReceived.uniqueId) {
                    this.platform.activeOlisList.splice(i, 1);
                    break;
                }
            }
        } else if(oliReceived.isSelected === true) {
            //Remove it from the removedOliList in case was added before
            // if (oliReceived.productLineItem) {
            //     let index = this.platform.removedOliList.indexOf(oliReceived.productLineItem);
            //     if (index > -1) {
            //         //this.platform.removedOliList.splice(index, 1);
            //     }
            // }

            //Add the oli
            // let newOli = {
            //     oppLineItemId: oliReceived.productLineItem,
            //     product2Id: oliReceived.productId,
            //     name: oliReceived.productName,
            //     status: oliReceived.status,
            //     //listPrice: oliReceived.ListPrice,
            //     listPrice: 0.00,
            //     closeDate: oliReceived.closeDate
            // };
            let newOli = this.getNewOli(oliReceived, true);
    
            if (this.platform.name === oliReceived.platform) {
                //this.platform.oliEditList.push(newOli);
                this.platform.activeOlisList.push(newOli);
                console.log('//// KLK this.platform ----> ', this.platform);
            }
        }        

        this.dispatchPlatform("platformchanges");
        //this.refreshAllOLIsList();
        //this.refreshRunningTotal();
        this.calculateAndSplitTotalAmount();
    }

    getNewOli(oliReceived, isNew){
        let newOli = {
            uniqueId: oliReceived.uniqueId,
            oppLineItemId: oliReceived.productLineItem,
            product2Id: oliReceived.productId,
            name: oliReceived.productName,
            status: oliReceived.status,
            subCategory: oliReceived.subCategory,
            //listPrice: oliReceived.ListPrice,
            listPrice: isNew ? 0.00 : oliReceived.listPrice,
            closeDate: oliReceived.closeDate,
            cellClass: oliReceived.status === "Lost/Dead" ? 'platform-disabled' : "slds-cell-edit slds-is-edited"
        };

        return newOli;
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

    get getAllOLIs() {
        return this.allOLIsList;
    }

    refreshAllOLIsList(){
        this.allOLIsList = [...this.platform.activeOlisList, ...this.platform.inactiveOliList];
        //this.allOLIsList = [...JSON.parse(JSON.stringify(this.platform.activeOlisList)), ...JSON.parse(JSON.stringify(this.platform.inactiveOliList))];

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

        let item = {...this.allOLIsList[index]};
        let oliIndex = -1;

        for (let i = 0; i < this.platform.activeOlisList.length; i++) {
            const element = this.platform.activeOlisList[i];
            if(element.uniqueId === item.uniqueId){
                oliIndex = i;
                break;
            }
        }

        if (oliIndex >= 0) {
            for (const key in draftValue) {
                if (item.hasOwnProperty(key)) {
                    // item[key.toString()] = draftValue[key.toString()];
                    let myValue = draftValue[key.toString()];
                    let a = isNaN(Number(myValue)) ? myValue : Number(myValue);
                    item[key.toString()] = a;
                    item.cellClass = "slds-cell-edit slds-is-edited";
                }
            }
    
            this.platform.activeOlisList[oliIndex] = item;
    
            console.log("====== Item ---> ", item);

            this.dispatchPlatform("platformchanges");
        }

        this.refreshAllOLIsList();

    }

    refreshRunningTotal(){
        let total = 0.00;
        for (let i = 0; i < this.allOLIsList.length; i++) {
            const currentOli = this.allOLIsList[i];
            total += currentOli.listPrice;
        }

        this.runningTotal = total;
    }

    setTotalAmount(event){
        if(!event.target.value) {
            this.totalAmount = 0;
            return;
        }
        
        this.totalAmount = parseFloat(event.target.value);

        // //Split the amount into the active OLIs

        // // let count = this.platform.activeOlisList.length;
        // let cloneOliList = [...JSON.parse(JSON.stringify(this.platform.activeOlisList))]

        // //Set amount only for new OLIs
        // let filteredList = cloneOliList.filter(function(oli) {
        //     return oli.oppLineItemId === null || oli.oppLineItemId === "" || oli.oppLineItemId === undefined;
        // });

        // let count = filteredList.length;

        // let splitResult = this.totalAmount / count;

        // for (let i = 0; i < this.platform.activeOlisList.length; i++) {
        //     let oli = this.platform.activeOlisList[i];
        //     if (oli.oppLineItemId === null || oli.oppLineItemId === "" || oli.oppLineItemId === undefined) {
        //         this.platform.activeOlisList[i].listPrice = splitResult;
        //     }
            
        // }

        // this.refreshAllOLIsList();
        // this.dispatchPlatform("platformchanges");

        this.calculateAndSplitTotalAmount();
    }

    calculateAndSplitTotalAmount(){
        //Split the amount into the active OLIs

        // let count = this.platform.activeOlisList.length;
        let cloneOliList = [...JSON.parse(JSON.stringify(this.platform.activeOlisList))]

        //Set amount only for new OLIs
        let filteredList = cloneOliList.filter(function(oli) {
            return oli.oppLineItemId === null || oli.oppLineItemId === "" || oli.oppLineItemId === undefined;
        });

        let count = filteredList.length;

        let splitResult = this.totalAmount / count;

        for (let i = 0; i < this.platform.activeOlisList.length; i++) {
            let oli = this.platform.activeOlisList[i];
            if (oli.oppLineItemId === null || oli.oppLineItemId === "" || oli.oppLineItemId === undefined) {
                this.platform.activeOlisList[i].listPrice = splitResult;
            }
            
        }

        this.refreshAllOLIsList();
        this.dispatchPlatform("platformchanges");
    }

    getTotalAmont(){
        this.totalAmount = 0.00;

        if (this.platform.isProgram) {
            for (let i = 0; i < this.platform.oliList.length; i++) {
                this.totalAmount += this.platform.oliList[i].TotalPrice;
            }
        } else {
            for (let i = 0; i < this.platform.activeOlisList.length; i++) {
                this.totalAmount += this.platform.activeOlisList[i].listPrice;
            }
        }
        
    }

    @api expandChevron(){
        const accordion = this.template.querySelector('.example-accordion');
        accordion.activeSectionName = this.platform.name;
    }



    @api expandChevronOnExistingLines(){
        const itemCount = this.allOLIsList.length + this.platform.oliList.length;

        if (itemCount > 0) {
            this.expandChevron();
        }
    }

    get amountLabel(){
        return this.platform.isProgram ? "Product Amount" : "Campaign Amount";
    }

    get displayClass(){
        return this.allOLIsList.length === 0 && this.isedit ? "hide" : "display";
    }

    handleChangeSubCategory(event){
        this.subCategorySelection = JSON.parse(JSON.stringify(event.detail.value));
        this.newSelection = JSON.parse(JSON.stringify(event.detail.newSelected.value));
        console.log('@@@@@ subCategorySelection ---> ', this.subCategorySelection);
        this.calculateOLIsBySubCategory();
    }

    @api calculateOLIsBySubCategory(){


        this.renderTable = false;

        // let counter = 1;
        // let lengthActiveOli = this.platform.activeOlisList.length;
        // let originalList = [...this.platform.activeOlisList];

        if (this.subCategorySelection.length === 1) {
            let cleanOriginal1 = JSON.parse(JSON.stringify(this.platform.activeOlisList));
            for (let i = 0; i < cleanOriginal1.length; i++) {
                cleanOriginal1[i].subCategory = this.newSelection;
            }
            this.platform.activeOlisList = cleanOriginal1;

          }
  
          if (this.subCategorySelection.length > 1) {
            let cleanOriginal = JSON.parse(JSON.stringify(this.platform.activeOlisList));
  
            for (let i = 0; i < cleanOriginal.length; i++) {
                cleanOriginal[i].uniqueId = this.generateUUIDV4(); //Assign a new Unique id so it doesn't have conflict with the original one.
                cleanOriginal[i].subCategory = this.newSelection;
            }
  
            this.platform.activeOlisList.push(...cleanOriginal);
          }

        this.refreshAllOLIsList();

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
        console.log("==== displayMarkBookedButton ---> ", this.permissions[0]);
        return this.permissions.length > 0 && this.permissions[0].V2SACL1__Mark_booked_button_enabled__c;
    }

    markStatust(event) {
        let status = event.currentTarget.dataset.status;
        let currentPlatform = JSON.parse(JSON.stringify(this.platform));
        for (let i = 0; i < this.markedLostList.length; i++) {
            const row = this.markedLostList[i];
            if (row.oppLineItemId || status === 'Booked') {
                for (let j = 0; j < currentPlatform.activeOlisList.length; j++) {
                    const oli = currentPlatform.activeOlisList[j];
                    
                    if (oli.uniqueId === row.uniqueId && oli.status !== "Lost/Dead") {
                        currentPlatform.activeOlisList[j].status = status;
                        break;
                    }
                }
            }
            
        }

        this.platform = currentPlatform;

        this.refreshAllOLIsList();

        this.dispatchPlatform("platformchanges");
    }
}