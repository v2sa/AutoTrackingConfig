import { LightningElement, track, api } from 'lwc';

const months = [
    {name: 'Jan', number: 1},
    {name: 'Feb', number: 2},
    {name: 'Mar', number: 3},
    {name: 'Apr', number: 4},
    {name: 'May', number: 5},
    {name: 'Jun', number: 6},
    {name: 'Jul', number: 7},
    {name: 'Aug', number: 8},
    {name: 'Sep', number: 9},
    {name: 'Oct', number: 10},
    {name: 'Nov', number: 11},
    {name: 'Dec', number: 12}
];

const currentDate = new Date();

const getSate = (prodLineItem, date, permissions) => {
    console.log('#### permissions ---> ', JSON.parse(JSON.stringify(permissions)));

    let d = new Date();

    let current = parseInt(d.getFullYear().toString() + d.getMonth().toString().padStart(2, "0"));
    let issuedate = parseInt(date.getFullYear().toString() + date.getMonth().toString().padStart(2, "0"));

    let isMonthCurrentOrHigher = issuedate >= current;

    let defaultCssClass = "month-container ";

    let allowSelectPreviousMonths = false

    if (permissions) {
        if (permissions.length > 0) {
            allowSelectPreviousMonths = permissions[0].V2SACL1__Allow_Select_Previous_Months__c;
        }
    }

    if(prodLineItem){
        if(isMonthCurrentOrHigher || allowSelectPreviousMonths){
            defaultCssClass += "selectedEnabled";
        } else {
            defaultCssClass += "selectedDisabled";
        }
    } else {
        if(isMonthCurrentOrHigher || allowSelectPreviousMonths){
            defaultCssClass += "unselectedEnabled";
        } else {
            defaultCssClass += "unselectedDisabled";
        }
    }

    return defaultCssClass;
}

export default class V2PipelineMgrMonthIssuesContainer extends LightningElement {
    @api monthissueproducts;
    @api existingPipelineDetails = [];
    @api profile;
    @api permissions;
    
    @track monthIssueList;
    @track lastYear = "Last Year (" + (currentDate.getFullYear() - 1) + ")";
    @track currentYear = "Current Year (" + currentDate.getFullYear() + ")";
    @track nextYear = "Next Year (" + (currentDate.getFullYear() + 1) + ")";
    @track platformClassStr = "";
    @track totalAmount = 0.00;

    connectedCallback(){
        this.loadPlaformsByYear(this.monthissueproducts);
    }

    get options() {
        return [
            { label: 'New', value: 'new' },
            { label: 'In Progress', value: 'inProgress' },
            { label: 'Finished', value: 'finished' },
        ];
    }

    clearMonthIssues(evt){

        let yearType = evt.currentTarget.dataset.year;
        console.log('***** evt ---> ', yearType);

        if (yearType === "current") {
            let currentYearIssuesList = this.template.querySelectorAll('.current-year c-v2-pipeline-mgr-month-issue');

            for(let i=0;i<currentYearIssuesList.length;i++){
                if(!currentYearIssuesList[i].getCurrentState().includes("unselectedEnabled")){
                    currentYearIssuesList[i].toggleMonthIssue();
                }
            }
        } else if (yearType === "next") {
            let nextYearIssuesList = this.template.querySelectorAll('.next-year c-v2-pipeline-mgr-month-issue')
       
            for(let i=0;i<nextYearIssuesList.length;i++){
                if(!nextYearIssuesList[i].getCurrentState().includes("unselectedEnabled")){
                    nextYearIssuesList[i].toggleMonthIssue();
                }
            }
        }

    }

    getMonthIssuesByYear(products, pipelineDetails){
        this.totalAmount = 0.00;

        let container = {
            lastYear: [],
            currentYear: [],
            nextYear: [],
            plarform: null
        };

        products.forEach(product => {
            console.log('*********antes');

            console.log(product);
            let dt = new Date(product.V2SACL1__Month_Issue_Close_Date__c);
            let monthNumber = dt.getMonth();

            console.log('==== months ---> ', monthNumber);

            let monthName = months[monthNumber].name;

            let issueYear = dt.getFullYear();

            let newMonthIssue = {
                uniqueId: null,
                productId: product.Id,
                pipelineDetailId: null,
                productName: product.Name,
                listPrice: 0,
                monthName: monthName,
                number: monthNumber,
                year: issueYear,
                closeDate: dt,
                strYear: "",
                state: getSate(false, dt, this.permissions),
                isSelected: null,
                status: "Pipeline",
                platform: product.Family,
                subCategory: ""
            }

            if (pipelineDetails) {
                let pipelineDetailIndex = pipelineDetails.length;
                while(pipelineDetailIndex--){
                    let pipelineDetail = pipelineDetails[pipelineDetailIndex];
                    if (pipelineDetail.V2SACL1__Pipeline_Product__c === product.Id) {
                        newMonthIssue.pipelineDetailId = pipelineDetail.Id;
                        newMonthIssue.state = getSate(true, dt, this.profile, this.permissions);
                        newMonthIssue.pipelineDetail = pipelineDetail;
                        newMonthIssue.isSelected = true;
                        newMonthIssue.listPrice = pipelineDetail.TotalPrice;
                        newMonthIssue.status = pipelineDetail.V2SACL1__Status__c;
                        pipelineDetails.splice(pipelineDetailIndex, 1);
                        break;
                    }
                }
            }

            

            if (newMonthIssue.year === currentDate.getFullYear() - 1) {
                newMonthIssue.strYear = "lastYear";
                container.lastYear.push(newMonthIssue);
            } else if (newMonthIssue.year === currentDate.getFullYear()) {
                newMonthIssue.strYear = "currentYear";
                container.currentYear.push(newMonthIssue);
                //Add list price amount to total amount if pipelineDetail exist.
                if (newMonthIssue.pipelineDetail) {
                    this.totalAmount += newMonthIssue.listPrice;
                }
            } else if (newMonthIssue.year === currentDate.getFullYear() + 1) {
                newMonthIssue.strYear = "nextYear";
                container.nextYear.push(newMonthIssue);
                //Add list price amount to total amount if pipelineDetail exist.
                if (newMonthIssue.pipelineDetail) {
                    this.totalAmount += newMonthIssue.listPrice;
                }
            }
        });

        container.plarform = products[0].Family;

        return container;
    }


    setSelectedMonthIssue(event){
        let monthIssueContainer = event.detail;
        
        this.dispatchEvent(new CustomEvent("selectmonthissue", {detail: monthIssueContainer.localMonthIssue}));
    }

    loadPlaformsByYear(pipelineDetailList){
        let pipelineDetails = this.existingPipelineDetails.length > 0 ? JSON.parse(JSON.stringify(this.existingPipelineDetails)) : null;
        this.monthIssueList = this.getMonthIssuesByYear(JSON.parse(pipelineDetailList), pipelineDetails);
    }

    setTotalAmount(event){
        this.totalAmount = parseFloat(event.target.value);
        this.splitTotalAmount();
    }
    
    splitTotalAmount(){
        if (this.totalAmount) {
            let filteredPipelineDetails = [...this.monthIssueList.currentYear, ...this.monthIssueList.nextYear].filter(issue => issue.isSelected);
            let pipelineDetailsQuantity = filteredPipelineDetails.length;
            let splitPrice = this.totalAmount / pipelineDetailsQuantity;
        
            let platformName = this.monthIssueList.currentYear[0].platform
            this.dispatchEvent(new CustomEvent('totalamountchange', {
                detail: {
                    splitPrice: splitPrice, platform: platformName
                }
            }));
        }
    }

    get productsInNextYear(){
        return this.monthIssueList.nextYear.length > 0;
    }

}