import { LightningElement, track, api } from 'lwc';

export default class V2MultiSelectPicklist extends LightningElement {
    @track mslabel;
    @track maxSelectedShow = 2;
    @api msoptions;
    @track showFilter = true;
    @track showRefreshButton = true;
    @track showClearButton = true;
    @track msname = "Select a value..";
    @track selectedOptions = [];
    @track selectedLabel = "Select a value..";
    @track initializationCompleted = false;

    connectedCallback(){
        let self = this;

        if(!this.initializationCompleted){
            //Attaching document listener to detect clicks
            this.template.addEventListener("click", function(event){
                //handle click component
                self.handleClick(event, 'component');
            });
            /*//Document listner to detect click outside multi select component
            document.addEventListener("click", function(event){
                self.handleClick(event, 'document');
            });*/
            //Marking initializationCompleted property true
            self.initializationCompleted = true;
            //Set picklist name
            self.setPickListName();
        }
    }

    onInputChange (event) {
        //get input box's value
        var inputText = event.target.value;
        //Filter options
        this.filterDropDownValues(inputText);
    }

    /**
     * This function will be called when refresh button is clicked
     * This will clear all selections from picklist and rebuild a fresh picklist
     * */
    onRefreshClick () {
        //clear selected options
        this.selectedOptions = [];
        //Clear check mark from drop down items
        this.rebuildPicklist();
        //Set picklist name
        this.setPickListName();
    }
   

    /**
     * This function will be called when clear button is clicked
     * This will clear any current filters in place
     * */
    onClearClick () {
        //clear filter input box
        this.template.querySelectorAll('.ms-filter-input')[0].value = '';
        //reset filter
        this.resetAllFilters();
    }   

    /**
     * This function will close all multi-select drop down on the page
     * */
    closeAllDropDown () {
        //Close drop down by removing slds class
        Array.from(this.template.querySelectorAll('.ms-picklist-dropdown')).forEach(function(node){
            node.classList.remove('slds-is-open');
        });
    }

    /**
     * This function will be called on drop down button click
     * It will be used to show or hide the drop down
     * */
    onDropDownClick (dropDownDiv) {
        //Getting classlist from component
        var classList = Array.from(dropDownDiv.classList);
        if(!classList.includes("slds-is-open")){
            this.closeAllDropDown();
            //Open dropdown by adding slds class
            dropDownDiv.classList.add('slds-is-open');
        } else{
            this.closeAllDropDown();
        }
    }

    /**
     * This function will handle clicks on within and outside the component
     * */
    handleClick(event, where){
        var self = this;
        //getting target element of mouse click
        var tempElement = event.target;
    
        var outsideComponent = true;

        //click indicator
        //1. Drop-Down is clicked
        //2. Option item within dropdown is clicked
        //3. Clicked outside drop-down
        //loop through all parent element
        while(tempElement){
            if(tempElement.className){
                if(tempElement.className.includes('ms-list-item')){
                    //2. Handle logic when picklist option is clicked
                    //Handling option click in helper function
                    if(where === 'component'){
                        self.onOptionClick(event.target);
                    }
                    outsideComponent = false;
                    break;
                } else if(tempElement.className.includes('ms-dropdown-items')){
                    //3. Clicked somewher within dropdown which does not need to be handled
                    //Break the loop here
                    outsideComponent = false;
                    break;
                } else if(tempElement.className.includes('ms-picklist-dropdown')){
                    //1. Handle logic when dropdown is clicked
                    if(where === 'component'){
                        self.onDropDownClick(tempElement);
                    }
                    outsideComponent = false;
                    break;
                } else if(tempElement.className.includes('ms-filter-input')){
                    outsideComponent = false;
                    break;
                }
                //get parent node
                tempElement = tempElement.parentNode;
            } else {
                break;
            }
        } 
        if(outsideComponent){
            this.closeAllDropDown();
        }
    }

    /**
     * This function will be used to filter options based on input box value
     * */
    rebuildPicklist () {
        var allSelectElements = this.template.querySelectorAll("li");
        Array.from(allSelectElements).forEach(function(node){
            node.classList.remove('slds-is-selected');
        });
    }

    filterDropDownValues (inputText) {
        var allSelectElements = this.template.querySelectorAll("li");
        Array.from(allSelectElements).forEach(function(node){
            if(!inputText){
                node.style.display = "block";
            }
            else if(node.dataset.label.toString().toLowerCase().indexOf(inputText.toString().trim().toLowerCase()) != -1){
                node.style.display = "block";
            } else{
                node.style.display = "none";
            }
        }); 
    }

    /**
     * This function clear the filters
     * */
    resetAllFilters () {
        this.filterDropDownValues('');
    }

    setPickListName(){
        let self = this;
        const maxSelectionShow = self.maxSelectedShow;
        //Set drop-down name based on selected value
        if(self.selectedOptions.length < 1){
            self.selectedLabel = self.msname;
        } else if(self.selectedOptions.length > maxSelectionShow){
            self.selectedLabel = self.selectedOptions.length + ' Options Selected';
        } else{
            var selections = '';
            self.selectedOptions.forEach(option => {
                selections += option.label+',';
            });
            self.selectedLabel = selections.slice(0, -1);
        }
    }
    
    /**
     * This function will be called when an option is clicked from the drop down
     * It will be used to check or uncheck drop down items and adding them to selected option list
     * Also to set selected item value in input box
     * */
    onOptionClick (ddOption) {
        //get clicked option id-name pair
        var clickedValue = {"label": ddOption.closest("li").getAttribute('data-label'),
                            "value": ddOption.closest("li").getAttribute('data-value')};

        //Get all selected options
        var selectedOptions = this.selectedOptions;

        //Boolean to indicate if value is alredy present
        var alreadySelected = false;

        //Looping through all selected option to check if clicked value is already present
        selectedOptions.forEach((option,index) => {
            if(option.value === clickedValue.value){
                //Clicked value already present in the set
                selectedOptions.splice(index, 1);
                //Make already selected variable true   
                alreadySelected = true;
                //remove check mark for the list item
                ddOption.closest("li").classList.remove('slds-is-selected');
            }
        });

        //If not already selected, add the element to the list
        if(!alreadySelected){
            selectedOptions.push(clickedValue);
            //Add check mark for the list item
                ddOption.closest("li").classList.add('slds-is-selected');
        }
        //Set picklist label
        this.setPickListName();

        const changeEvent = new CustomEvent('change', {
            detail: {
                value: selectedOptions,
                newSelected: clickedValue
            }
        });
        this.dispatchEvent(changeEvent);
    }

    get labelAvailable() {
        return this.mslabel || '';
    }
}