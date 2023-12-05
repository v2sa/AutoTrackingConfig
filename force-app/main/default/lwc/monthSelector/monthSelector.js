import { LightningElement, api, wire } from 'lwc';

const monthEnum = { JAN: 1,
                    FEB:2,
                    MAR:3,
                    APR:4,
                    MAY:5,
                    JUN:6,
                    JUL:7,
                    AUG:8,
                    SEP:9,
                    OCT:10,
                    NOV:11,
                    DEC:12
                    };

export default class MonthSelector extends LightningElement {

    @api PipelineProductLineItemId;

    year = 0;
    showPrevious = false;
    showConfirmation = false;
    month = '';
    monthNumber = 0;

    connectedCallback(){
        //To get this year;
        var todaysDate = new Date();
        this.year = todaysDate.getFullYear();
    }

    //This method is for changing the month
    onClickMonthHandler(event){
        let month = event.target.label;
        let oldMonth = this.month;
        this.template.querySelector("." + month).variant = "brand";
        if(oldMonth != ""){
            this.template.querySelector("."+oldMonth).variant = "";
        }
        this.monthNumber = monthEnum[month];
        this.month = month;
    }

    handleCancel(event){
        const cancelEvent = CustomEvent('cancel', {
            bubbles: true, 
            composed: true,
            cancelable: true,
            detail: {

            }
        });
        this.dispatchEvent(cancelEvent);
    }

    incrementYear(event){
        this.year++;
        this.showPrevious = true;
    }

    decrementYear(event){
        var year = this.year;
        year--;
        var todaysDate = new Date();
        var todaysYear = todaysDate.getFullYear();
        if(year == todaysYear){
            this.showPrevious = false;
        }
        this.year = year;
    }

    hanldeSave(event){
        this.showConfirmation = true;
    }

    closeConfirmation(event){
        this.showConfirmation = false;
    }

    handleSaveConfirmation(event){
        let month = this.monthNumber;
        let year = this.year;
        console.log("IN THE SAVE AFTER CONFIRMATION");
        console.log("THE MONTH",month);
        console.log("THE MONTH",year);
        const monthEvent = CustomEvent('changemonth', {
            bubbles: true, 
            composed: true,
            cancelable: true,
            detail: {
                month: month,
                year: year
            } 
        });
        this.dispatchEvent(monthEvent);
        this.handleCancel(event);
    }

}