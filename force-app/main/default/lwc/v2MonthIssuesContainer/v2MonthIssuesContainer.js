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

const profiles = ["System Administrator", "Billings"];

const currentDate = new Date();

const getSate = (prodLineItem, date, profile, permissions) => {
    console.log('#### permissions ---> ', JSON.parse(JSON.stringify(permissions)));

    let d = new Date();
    //let isMonthCurrentOrHigher = date.getFullYear() >= d.getFullYear() && date.getMonth() + 1 >= d.getMonth() + 1;
    //let isMonthCurrentOrHigher = date.getFullYear() >= d.getFullYear() && date.getMonth() >= d.getMonth();
    //let current = parseInt(d.getFullYear().toString() + d.getMonth().toString().padStart());
    //let issuedate = parseInt(date.getFullYear().toString() + date.getMonth().toString());

    let current = parseInt(d.getFullYear().toString() + d.getMonth().toString().padStart(2, "0"));
    let issuedate = parseInt(date.getFullYear().toString() + date.getMonth().toString().padStart(2, "0"));
    if (date.getFullYear() === 2020) {
        console.log("**** current ---> ", current);
        console.log("**** issuedate ---> ", issuedate);
    }
    let isMonthCurrentOrHigher = issuedate >= current;

    let defaultCssClass = "month-container ";

    // if(prodLineItem){
    //     if(isMonthCurrentOrHigher){
    //         return defaultCssClass + "selectedEnabled";
    //     } else {
    //         return defaultCssClass + "selectedDisabled";
    //     }
    // } else {
    //     if(isMonthCurrentOrHigher){
    //         return defaultCssClass + "unselectedEnabled";
    //     } else {
    //         return defaultCssClass + "unselectedDisabled";
    //     }
    // }

    // if(prodLineItem){
    //     if(isMonthCurrentOrHigher || profiles.includes(profile)){
    //         defaultCssClass += "selectedEnabled";
    //     } else {
    //         defaultCssClass += "selectedDisabled";
    //     }
    // } else {
    //     if(isMonthCurrentOrHigher || profiles.includes(profile)){
    //         defaultCssClass += "unselectedEnabled";
    //     } else {
    //         defaultCssClass += "unselectedDisabled";
    //     }
    // }

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

const generateDummyData = () => {
    //console.log('*** Months ---> ', months);
    let monthIssueArray = [];
    months.forEach(month => {
        monthIssueArray.push(
            {
                productId: month.number,
                productLineItem: null,
                name: month.name,
                number: month.number,
                state: getSate(Math.random() >= 0.5, month.number, this.profile, )
                //state: getSate(Math.random() >= 0.5, month.number, this.profile)
            }
        );
    });

    //console.log('*** monthIssueArray ---> ', monthIssueArray);
    return monthIssueArray;
};

export default class V2MonthIssuesContainer extends LightningElement {
    @api monthissueproducts;
    @api existingolis = [];
    @api profile;
    @api permissions;
    
    @track monthIssueList;
    @track lastYear = "Last Year (" + (currentDate.getFullYear() - 1) + ")";
    @track currentYear = "Current Year (" + currentDate.getFullYear() + ")";
    @track nextYear = "Next Year (" + (currentDate.getFullYear() + 1) + ")";
    @track platformClassStr = "";
    @track totalAmount = 0.00;

    connectedCallback(){
        //console.log('#### monthissueproducts ---> ', JSON.parse(this.monthissueproducts));
        //console.log('#### existingolis ---> ', this.existingolis.length);

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
            let currentYearIssuesList = this.template.querySelectorAll('.current-year c-v2-month-issue');

            for(let i=0;i<currentYearIssuesList.length;i++){
                if(!currentYearIssuesList[i].getCurrentState().includes("unselectedEnabled")){
                    currentYearIssuesList[i].toggleMonthIssue();
                }
            }
        } else if (yearType === "next") {
            let nextYearIssuesList = this.template.querySelectorAll('.next-year c-v2-month-issue')
       
            for(let i=0;i<nextYearIssuesList.length;i++){
                if(!nextYearIssuesList[i].getCurrentState().includes("unselectedEnabled")){
                    nextYearIssuesList[i].toggleMonthIssue();
                }
            }
        }

    }

    getMonthIssuesByYear(products, olis){
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
                productLineItem: null,
                productName: product.Name,
                listPrice: 0,
                monthName: monthName,
                number: monthNumber,
                year: issueYear,
                closeDate: dt,
                strYear: "",
                state: getSate(false, dt, this.profile, this.permissions),
                isSelected: null,
                status: "Pipeline",
                platform: product.Family,
                subCategory: ""
            }

            //console.log('==== newMonthIssue ---> ', newMonthIssue);

            if (olis) {
                let oliIndex = olis.length;
                while(oliIndex--){
                    let oli = olis[oliIndex];
                    if (oli.Product2Id === product.Id) {
                        newMonthIssue.productLineItem = oli.Id;
                        newMonthIssue.state = getSate(true, dt, this.profile, this.permissions);
                        newMonthIssue.oli = oli;
                        newMonthIssue.isSelected = true;
                        newMonthIssue.listPrice = oli.TotalPrice;
                        newMonthIssue.status = oli.V2SACL1__Status__c;
                        olis.splice(oliIndex, 1);
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
                //Add list price amount to total amount if oli exist.
                if (newMonthIssue.oli) {
                    this.totalAmount += newMonthIssue.listPrice;
                }
            } else if (newMonthIssue.year === currentDate.getFullYear() + 1) {
                newMonthIssue.strYear = "nextYear";
                container.nextYear.push(newMonthIssue);
                //Add list price amount to total amount if oli exist.
                if (newMonthIssue.oli) {
                    this.totalAmount += newMonthIssue.listPrice;
                }
            }
        });

        container.plarform = products[0].Family;

        return container;
    }


    setSelectedMonthIssue(event){
        //console.log('>>>>> Executed setSelectedMonthIssue');
        
        let monthIssueContainer = event.detail;
        //console.log('>>>>> monthIssue ---> ', JSON.parse(JSON.stringify(monthIssueContainer)));
        // console.log('>>>>> monthIssue ---> ', monthIssue.productId);
        // let length = this.monthIssueList[monthIssue.strYear].length;
        // for(let index = 0; index < length; index++) {
        //     if (this.monthIssueList[monthIssue.strYear][index].productId === monthIssue.productId) {
        //         this.monthIssueList[monthIssue.strYear][index].isSelected = monthIssue.isSelected;
        //     }
        // };

        // console.log('>>>>> MonthIssue (un)selected list ---> ', this.monthIssueList[monthIssue.strYear]);

        // let monthIssueContainer = this.monthIssueList;
        // //Send changes to Platform selection component
        // this.dispatchEvent(new CustomEvent('selectproduct', {detail: {monthIssueContainer}}));

        //this.dispatchEvent(new CustomEvent(monthIssueContainer.eventName, {detail: monthIssueContainer.localMonthIssue}));
        this.dispatchEvent(new CustomEvent("selectmonthissue", {detail: monthIssueContainer.localMonthIssue}));

        //this.loadPlaformsByYear();

    }

    loadPlaformsByYear(oliList){
        console.log('**** existingolis ---> ', this.existingolis);
        let olis = this.existingolis.length > 0 ? JSON.parse(JSON.stringify(this.existingolis)) : null;
        //let olis = this.existingolis.length > 0 ? this.existingolis : null;
        this.monthIssueList = this.getMonthIssuesByYear(JSON.parse(oliList), olis);
    }

    setTotalAmount(event){
        this.totalAmount = parseFloat(event.target.value);
        this.splitTotalAmount();
    }
    
    splitTotalAmount(){
        if (this.totalAmount) {
            let filteredOlis = [...this.monthIssueList.currentYear, ...this.monthIssueList.nextYear].filter(issue => issue.isSelected);
            let olisQuantity = filteredOlis.length;
            let splitPrice = this.totalAmount / olisQuantity;
        
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