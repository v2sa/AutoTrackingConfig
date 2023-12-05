import { LightningElement, api,wire } from 'lwc';
import LightningDatatable from 'lightning/datatable';
import addRow from './addRow.html';
import deleteRow from './deleteRow.html';
import rowInput from './rowInput.html';

export default class ProductSelectorDatatable extends LightningDatatable {
    static customTypes = {
        addRowButton: {
            template: addRow,
            standardCellLayout: true,
            // Provide template data here if needed
            typeAttributes: ['productName', 'brandName','familyName','dateField','dateValue','familyType']
        },
        deleteRowButton: {
            template: deleteRow,
            standardCellLayout: true
            // Provide template data here if needed
            //typeAttributes: ['attrA', 'attrB']
        },
        rowInput: {
            template: rowInput,
            standardCellLayout: true,
            typeAttributes: ['typeName','name','label','value','formatter','step','options','placeholder','usePicklistRecordType','recordTypeNameForPicklistValues','rowId','family']
        }
       //more custom types here
    };
}