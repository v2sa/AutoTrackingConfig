import { LightningElement, api, track } from 'lwc';

export default class Paginator extends LightningElement {
    @track tableData = [];
    @track page = 1; //this will initialize 1st page
    @track items = []; //it contains all the records.
    @track startingRecord = 1; //start record position per page
    @track endingRecord = 0; //end record position per page
    @track pageSize = 0; //default value we are assigning
    @track totalRecountCount = 0; //total record count received from all retrieved records
    @track totalPage = 0; //total number of page is needed to display all records

    @api thePageSize;

    connectedCallback(){
        this.pageSize = this.thePageSize;
    }

    //receives the table data via this method
    @api
    tableDataInformation(data){
        this.tableData = data;
        this.items = this.tableData;
        this.totalRecountCount = this.tableData.length; //here it is 23
        this.totalPage = Math.ceil(this.totalRecountCount / this.pageSize); //here it is 5
        this.endingRecord = this.pageSize;
        this.tableData = this.items.slice(0,this.pageSize);
        this.sendProcessedData(this.tableData);
    }

    //send the data back to the table after being processed
    sendProcessedData(data){
        const paginatorDataEvent = CustomEvent('paginatordataevent', {
            bubbles: true, 
            composed: true,
            cancelable: true,
            detail: {
                data: data
            } 
        });
        this.dispatchEvent(paginatorDataEvent);         
    }

    //clicking on previous button this method will be called
    previousHandler() {
        if (this.page > 1) {
            this.page = this.page - 1; //decrease page by 1
            this.displayRecordPerPage(this.page);
        }

        this.sendProcessedData(this.tableData);
        
    }

    //clicking on next button this method will be called
    nextHandler() {
        if((this.page<this.totalPage) && this.page !== this.totalPage){
            this.page = this.page + 1; //increase page by 1
            this.displayRecordPerPage(this.page);            
        }

        this.sendProcessedData(this.tableData);            
    }

    //this method displays records page by page
    displayRecordPerPage(page){

        /*let's say for 2nd page, it will be => "Displaying 6 to 10 of 23 records. Page 2 of 5"
        page = 2; pageSize = 5; startingRecord = 5, endingRecord = 10
        so, slice(5,10) will give 5th to 9th records.
        */
        this.startingRecord = ((page -1) * this.pageSize) ;
        this.endingRecord = (this.pageSize * page);

        this.endingRecord = (this.endingRecord > this.totalRecountCount) 
                            ? this.totalRecountCount : this.endingRecord; 

        this.tableData = this.items.slice(this.startingRecord, this.endingRecord);

        //increment by 1 to display the startingRecord count, 
        //so for 2nd page, it will show "Displaying 6 to 10 of 23 records. Page 2 of 5"
        this.startingRecord = this.startingRecord + 1;
    }
}