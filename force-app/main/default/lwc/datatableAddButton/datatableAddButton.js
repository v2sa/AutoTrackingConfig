import { LightningElement ,api} from 'lwc';

import { baseNavigation } from 'lightning/datatableKeyboardMixins';
// For the render() method
import template from './datatableAddButton.html';

export default class DatatableAddButton extends LightningElement {
    @api rowId;

    @api productName;

    @api brandName;
    
    @api familyName;
    
    @api dateValue;

    @api dateField;

    @api familyType;

    fireAddRow() {
        const event = CustomEvent('addrow', {
            composed: true,
            bubbles: true,
            cancelable: true,
            detail: {
                rowId: this.rowId,
                productName : this.productName,
                brandName : this.brandName,
                familyName : this.familyName,
                dateField : this.dateField,
                dateValue : this.dateValue
            }
        });
        this.dispatchEvent(event);
    }
}