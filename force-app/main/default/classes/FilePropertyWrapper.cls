public with sharing class FilePropertyWrapper {
    @AuraEnabled
    public String createdById {get; set;}
    @AuraEnabled
    public String createdByName {get; set;}
    @AuraEnabled
    public DateTime createdDate {get; set;}
    @AuraEnabled
    public String fileName {get; set;}
    @AuraEnabled
    public String fullName {get; set;}
    @AuraEnabled
    public String id {get; set;}
    @AuraEnabled
    public String lastModifiedById {get; set;}
    @AuraEnabled
    public String lastModifiedByName {get; set;}
    @AuraEnabled
    public DateTime lastModifiedDate {get; set;}
    @AuraEnabled
    public String manageableState {get; set;}
    @AuraEnabled
    public String namespacePrefix {get; set;}
    @AuraEnabled
    public String componentType {get; set;}
        
    public Integer compareTo(Object compareTo) {
        FilePropertyWrapper compareToCasted = (FilePropertyWrapper) compareTo;
        
        Integer returnValue = 0;
        if(compareCreatedDate)
        {
            if (this.createdDate.getTime() > compareToCasted.createdDate.getTime()) {
                returnValue = 1;
            } else if (this.createdDate.getTime() < compareToCasted.createdDate.getTime()) {
                returnValue = -1;
            }    
        }   
        else {
            if (this.lastModifiedDate.getTime() > compareToCasted.lastModifiedDate.getTime()) {
                returnValue = 1;
            } else if (this.lastModifiedDate.getTime() < compareToCasted.lastModifiedDate.getTime()) {
                returnValue = -1;
            }     
        }
            
        return returnValue;       
    }
        
       
    public FilepropertyWrapper(){}
    
    public FilePropertyWrapper(String createdById, String createdByName, DateTime createdDate, String fileName, String fullName, String Id, String lastModifiedById,
                               String lastModifiedByName, DateTime lastModifiedByDate, String manageableState, String namespacePrefix, String componentType){
                                this.createdById = createdById;
                                this.createdByName = createdByName;
                                this.createdDate = createdDate;
                                this.fileName = fileName;
                                this.fullName = fullName;
                                this.Id = Id;
                                this.lastModifiedById = lastModifiedById;
                                this.lastModifiedByName = lastModifiedByName;
                                this.lastModifiedDate = lastModifiedByDate;
                                this.manageableState = manageableState;
                                this.namespacePrefix = namespacePrefix;
                                this.componentType = componentType;
    }
}