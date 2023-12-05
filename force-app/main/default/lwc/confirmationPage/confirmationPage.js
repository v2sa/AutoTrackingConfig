import { LightningElement } from 'lwc';

export default class ConfirmationPage extends LightningElement {


    handleNo(event){
        this.dispatchEvent(new CustomEvent('closeconfirmation',{
            bubble : true,
            composed:false
        }));
    }

    handleYes(event){
        this.dispatchEvent(new CustomEvent('saveconfirmation',{
            bubble : true,
            composed:false
        }));
    }
}