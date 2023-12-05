public class ConfigurationLogBulkCmpBatch implements Database.Batchable<String>, Database.Stateful, Database.AllowsCallouts{
    public List<ConfigurationLogCmpController.FilePropertyWrapper> finalFilePropertiesList;
    public List<String> componentList;
    public String searchCriteria;
    public String sessionId;
    public String jsonConfigLog;
    
    public ConfigurationLogBulkCmpBatch(List<String> componentList, String searchCriteria, String sessionId, String jsonConfigLog){
        this.finalFilePropertiesList = new List<ConfigurationLogCmpController.FilePropertyWrapper>();
        this.componentList = componentList;
        this.searchCriteria = searchCriteria == null? '': searchCriteria;
        this.sessionId = sessionId;
        this.jsonConfigLog = jsonConfigLog;
    }
    
    public List<String> start(Database.BatchableContext bc){
        return componentList;
    }
    
    public void execute(Database.BatchableContext bc, List<String> cmpList){
        List<ConfigurationLogCmpController.FilePropertyWrapper> filePropertiesList = new List<ConfigurationLogCmpController.FilePropertyWrapper>();
        
        if(String.isBlank(sessionId)){
            return;
        }
        
        try {
        	MetadataService.MetadataPort service = ConfigurationLogCmpController.createService(sessionId);
        	List<MetadataService.ListMetadataQuery> queries = new List<MetadataService.ListMetadataQuery>();
            
        	for(String component: cmpList) {
        		MetadataService.ListMetadataQuery metadataQuery = new MetadataService.ListMetadataQuery();
        		metadataQuery.type_x = component;
        		queries.add(metadataQuery);    
        	}
            
            // Perform a query to get the Salesforce verision being used to access the Metadata API
            List<Configuration_Log_Configuration__mdt> logsMDT = [SELECT Salesforce_Version__c FROM Configuration_Log_Configuration__mdt where DeveloperName='Component_List'];
            Integer salesforceVersion = null;
            
            if(logsMDT.size() > 0)
                salesforceVersion = Integer.valueOf(logsMDT.get(0).Salesforce_Version__c);
            else 
                salesforceVersion = Integer.valueOf(new MetadataService.MetadataPort().endpoint_x.substringAfterLast('/'));
            
            // Perform the call to the Metadata API
        	MetadataService.FileProperties[] fileProperties = service.listMetadata(queries, salesforceVersion); 
            
            // Use an object wrapper to be able to access the object from the Lightning Component
            for(MetadataService.FileProperties fileProperty : fileProperties) {
                ConfigurationLogCmpController.FilePropertyWrapper filePropRecord = new ConfigurationLogCmpController.FilePropertyWrapper();
                filePropRecord.createdById = fileProperty.createdById;
                filePropRecord.createdDate   = fileProperty.createdDate;
                filePropRecord.createdByName = fileProperty.createdByName;
                filePropRecord.fileName  = fileProperty.fileName ;
                filePropRecord.fullName  = fileProperty.fullName ;
                filePropRecord.Id  = fileProperty.Id ;
                filePropRecord.lastModifiedById  = fileProperty.lastModifiedById ;
                filePropRecord.lastModifiedByName = fileProperty.lastModifiedByName ;
                filePropRecord.lastModifiedDate = fileProperty.lastModifiedDate ;
                filePropRecord.manageableState  = fileProperty.manageableState ;
                filePropRecord.namespacePrefix  = fileProperty.namespacePrefix ;
                filePropRecord.componentType = fileProperty.type_x;
            	filePropertiesList.add(filePropRecord);   
            }
            	
        } catch (Exception e){
            System.debug('THERE IS AN EXCEPTION' + e.getMessage());
            filePropertiesList = new List<ConfigurationLogCmpController.FilePropertyWrapper>();
        } 
    	
        // Apply the secondary filters (Date, UserIds, etc) to the returned filePropertiesList
        finalFilePropertiesList.addAll(ConfigurationLogCmpController.applyFilter(searchCriteria, filePropertiesList));    
    }
    
    public void finish(Database.BatchableContext bc){
        Configuration_Log__c configLogObject = ConfigurationLogCmpController.getOrCreateConfigLogObject(jsonConfigLog);
        Attachment csv = ConfigurationLogCmpController.saveAttachment(finalFilePropertiesList, configLogObject);
    }
}