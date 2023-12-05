import { LightningElement, wire, api } from 'lwc';


export default class ProductSearchModal extends LightningElement {
    

    @api
    recordId;

    closeModal(){
        //Closing the productModal component.
        this.dispatchEvent(new CustomEvent('closemodal'));
    }

    handleSave(event){
        //Fire event to check for the fields
        /*const validityCheck = CustomEvent('checkfields',{
            bubble: true,
            composed: true
        });*/
        console.log("CLICKED THE SAVE BUTTON");
        //publish(this.messageContext, checkValidity, {});
        this.template.querySelector('c-product-search').saveMethod();
    }
}