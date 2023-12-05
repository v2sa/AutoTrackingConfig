import { LightningElement, wire,api } from 'lwc';


export default class StatusSelector extends LightningElement {

    value;
    @api options;
    showConfirmation = false;
    

    handleChange(event){
        console.log("the value",event.detail.value);
        this.value = event.detail.value;
    }

    handleCancel(event){
        const cancelEvent = CustomEvent('statuscancel');
        this.dispatchEvent(cancelEvent);
    }

    handleSave(event){
        this.showConfirmation = true;
    }

    handleSaveConfirmation(event){
        let status = this.value;
        const savestatus = new CustomEvent('savestatus',{
            bubble : true,
            composed:false,
            detail: {
                status: status
            }
        });
        this.dispatchEvent(savestatus);
        console.log("THE SAVE CONFIRMATION");
    }

    closeConfirmation(event){
        this.showConfirmation =false;
    }
}