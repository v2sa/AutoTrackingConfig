import { LightningElement, track, api } from 'lwc';

const quarterMonths = [3,6,9];

export default class V2PipelineMgrMonthIssue extends LightningElement {
    @api monthissueparam;
    @track monthIssue;
    @track enabledByMouseDown;

    connectedCallback() {
        this.monthIssue = JSON.parse(JSON.stringify(this.monthissueparam));
        this.setState();
    }

    setState(){
        if(quarterMonths.includes(this.monthIssue.number + 1)){
            this.monthIssue.state += " month-quarter";
        }
    }

    get getState() {
        return this.monthIssue.state;
    }

    enableMonthIssue() {
        window.isToggling = true;

        if (this.monthIssue.state.includes("unselectedEnabled")) {
            this.enabledByMouseDown = true;
            this.monthIssue.isSelected = null;
            this.monthIssue.state = this.monthIssue.state.replace("unselectedEnabled", "selectedEnabled");
            this.monthIssue.isSelected = true;
            this.monthIssue.uniqueId = this.generateUUIDV4();
            let eventName = "selectmonthissue";

            this.dispatchEvent(new CustomEvent('selectmonthissue', {detail: {localMonthIssue: this.monthIssue, eventName}}));
        }else{
            this.enabledByMouseDown = false;
        }
    }

    enableIssueByDragging() {
        if (!window.isToggling) {
            return;
        }
        this.enableMonthIssue();
    }

    @api
    getCurrentState() {
        return this.monthIssue.state;
    }

    @api
    toggleMonthIssue() {
        this.monthIssue.isSelected = null;

        let eventName = "";
        let unSelected = false;
        if (this.monthIssue.state.includes("unselectedEnabled")) {
            this.monthIssue.state = this.monthIssue.state.replace("unselectedEnabled", "selectedEnabled");
            this.monthIssue.isSelected = true;
            eventName = "selectmonthissue";
        } else {
            this.monthIssue.state = this.monthIssue.state.replace("selectedEnabled", "unselectedEnabled");
            this.monthIssue.isSelected = false;
            eventName = "removemonthissue";
            unSelected = true;
        }

        this.dispatchEvent(new CustomEvent('selectmonthissue', {detail: {localMonthIssue: this.monthIssue, eventName}}));

        if (unSelected) {
            //Remove Opp Line Item Id
            this.monthIssue.productLineItem = null;
        }
    }

    toggleMonthIssueByClick() {
        if(!this.enabledByMouseDown){
            this.toggleMonthIssue();
        }
    }

    generateUUIDV4(){//This function returns unique id
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
            var r = Math.random() * 16 | 0, v = c === 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        });
    }
}