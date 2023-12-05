import { LightningElement,api } from 'lwc';

export default class DatatableDeleteButton extends LightningElement {
    @api rowId;

    fireDeleteRow(){
        console.log("IN THE DELETE ROW EVENT");
        const deleteRow = CustomEvent('deleterow', {
            composed: true,
            bubbles: true,
            cancelable: true,
            detail: {
                rowId: this.rowId
            }
        });
        this.dispatchEvent(deleteRow);
    }
}