public class ConfigurationLogCmpController {

    @AuraEnabled
    /**
    * @description This method searches for FilePropertyWrapper that fit a particular search criteria.
    * @param componentList List of Strings that contain the components that will be used query the Metadata API
    * @param searchCriteria String in the format of JSON where the extra criteria is included (UserIds, Dates, etc.)
    * @param sessionId String containing the sessionId for the session.
	* @return the Configuration_Log__c object that the attachment was added to.
	*/
    public static List<ConfigurationLogCmpController.FilePropertyWrapper> searchForComponents(List<String> componentList, String searchCriteria, String sessionId){
        List<ConfigurationLogCmpController.FilePropertyWrapper> filePropertiesList = new List<ConfigurationLogCmpController.FilePropertyWrapper>();
        
        if(String.isBlank(sessionId))
            return filePropertiesList;
        
        if(componentList == null)
            componentList = new List<String>();
        
        if(searchCriteria == null)
            searchCriteria = '';
        
        try {
        	
            List<MetadataService.FileProperties> fileProperties = new List<MetadataService.FileProperties>();

            Integer metadaListLimit = 0;
            List<String> componentListTemp = new List<String>();
            for (Integer i = 0; i < componentList.size(); i++) {
                if (metadaListLimit > 2) {
                    metadaListLimit = 0;
                    fileProperties.addAll(metadataListCallouts(componentListTemp, sessionId));
                    componentListTemp.clear();
                    System.debug(fileProperties);
                }
                componentListTemp.add(componentList[i]);
                metadaListLimit++;
            }
            System.debug(!componentListTemp.isEmpty());
            if (!componentListTemp.isEmpty()) {
                fileProperties.addAll(metadataListCallouts(componentListTemp, sessionId));
                componentListTemp.clear();
            }

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
        return ConfigurationLogCmpController.applyFilter(searchCriteria, filePropertiesList);    
    }

    private static List<MetadataService.FileProperties> metadataListCallouts(List<String> componentList, String sessionId) {
        MetadataService.MetadataPort service = createService(sessionId);
        List<MetadataService.ListMetadataQuery> queries = new List<MetadataService.ListMetadataQuery>();
            
        for(String component: componentList) {
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
        return fileProperties; 
    }
    
    
    /**
    * @description This method fires the batch apex for all components
    * @param componentList List of Strings that contain the components that will be used query the Metadata API
    * @param searchCriteria String in the format of JSON where the extra criteria is included (UserIds, Dates, etc.)
    * @param sessionId String containing the sessionId for the session.
	* @return the Configuration_Log__c object that the attachment was added to.
	*/
    @AuraEnabled
    public static Boolean fireBulkInsertBatch(List<String> componentList, String searchCriteria, String sessionId, String jsonConfigLog){
        AsyncApexJob[] job = [SELECT Id, Status, ApexClassID 
                            FROM AsyncApexJob 
                            WHERE ApexClass.Name = 'ConfigurationLogBulkCmpBatch' 
                            AND Status = 'Processing' LIMIT 1];
        if(job.size() > 0){
            return false;
        }
        else {
            ConfigurationLogBulkCmpBatch batch = new ConfigurationLogBulkCmpBatch(componentList, searchCriteria, sessionId, jsonConfigLog);
        	Database.executeBatch(batch, 3);
            return true;
        }
        
    }
    
    public static void BulkCmpBatch(List<String> componentList, String searchCriteria, String sessionId, String jsonConfigLog) {
        List<ConfigurationLogCmpController.FilePropertyWrapper> filePropertiesList = new List<ConfigurationLogCmpController.FilePropertyWrapper>();
        
        if(componentList == null)
            componentList = new List<String>();
        
        if(searchCriteria == null)
            searchCriteria = '';

        try {
            ConfigurationLogBulkCmpBatch batch = new ConfigurationLogBulkCmpBatch(componentList, searchCriteria, sessionId, jsonConfigLog);
            Database.executeBatch(batch, 3);
        } catch (Exception e) {
            System.debug('THERE IS AN EXCEPTION' + e.getMessage());
            filePropertiesList = new List<ConfigurationLogCmpController.FilePropertyWrapper>();
        }
    }
    
    /**
     * @description This method gets all the components supported by the configuration Log search functionality.
     * @return List of a formatted JSON of all components supported i.e. { label: 'English', value: 'en' }
     */
    @AuraEnabled
    public static List<Map<String,String>> getAllComponents(){
        
        String priorityComponents = 'ApexClass ApexComponent ApexPage ApexTrigger ApprovalProcess AuraDefinitionBundle ' +
            'CompactLayout CustomField CustomObject Dashboard DuplicateRule FlexiPage Flow FlowDefinition GlobalValueSet ' +
            'Layout LightningComponentBundle ListView PermissionSet Profile QuickAction RecordType Report ReportType ' +
            'Role SharingRules ValidationRule';
        
        List<Configuration_Log_Configuration__mdt> logsMDT = [SELECT Salesforce_Version__c FROM Configuration_Log_Configuration__mdt where DeveloperName='Component_List'];
        Integer METADATA_API_VERSION = null;
        
        if(logsMDT.size() > 0)
            METADATA_API_VERSION = Integer.valueOf(logsMDT.get(0).Salesforce_Version__c);
        else 
            METADATA_API_VERSION = Integer.valueOf(new MetadataService.MetadataPort().endpoint_x.substringAfterLast('/'));
            

		List<Map<String, String>> componentsMapList = new List<Map<String, String>>();
        
        MetadataService.MetadataPort service = new MetadataService.MetadataPort();
		service.SessionHeader = new MetadataService.SessionHeader_element();
		service.SessionHeader.sessionId = UserInfo.getSessionId();
        				
        MetadataService.DescribeMetadataResult describeResult = service.describeMetadata(METADATA_API_VERSION);
        System.debug('describeResult: ' + JSON.serialize(describeResult));
        List<String> metadataTypeNames = new List<String>();
        List<String> metadataTypeNamesComponents = new List<String>();
        
        for(MetadataService.DescribeMetadataObject metadataObject : describeResult.metadataObjects){
            if(priorityComponents.contains(metadataObject.xmlName)){
                metadataTypeNamesComponents.add(metadataObject.xmlName);
            } else {
                metadataTypeNames.add(metadataObject.xmlName);
            }
			// Include child Metadata Types (such as CustomField, ValidationRule etc..)
            if(metadataObject.childXmlNames!=null){
                
                for(String childXmlName : metadataObject.childXmlNames){
                    System.debug(childXmlName);
                    if(childXmlName!=null){
                        if(priorityComponents.contains(childXmlName)){
                            metadataTypeNamesComponents.add(childXmlName);
                        } else {
                            metadataTypeNames.add(childXmlName);
                        }
                	}
                }
            }
        }
        
        // Sort Metadata Types
		metadataTypeNames.sort();
        metadataTypeNamesComponents.sort();
        metadataTypeNamesComponents.addAll(metadataTypeNames);
        
        for(String metadataTypeName : metadataTypeNamesComponents){
            Map<String, String> labelKeyMap = new Map<String, String>();
            labelKeyMap.put('label', metadataTypeName);
			labelKeyMap.put('value', metadataTypeName);
            
            componentsMapList.add(labelKeyMap);
        }
        System.debug('metadataTypeNamesComponents.size(): ' + metadataTypeNamesComponents.size());
        
        return componentsMapList;
    }
    
    
    @TestVisible
    /**
    * @description This method is used to create a MetadataPort for the session
    * @param sessionId String containing the sessionId for the session.
	* @return the MetadataPort object that was just created.
	*/
    public static MetadataService.MetadataPort createService(String sessionId) {
        MetadataService.MetadataPort service = new MetadataService.MetadataPort();
        service.SessionHeader = new MetadataService.SessionHeader_element();
        service.SessionHeader.sessionId = sessionId;
        
        return service;
    }
    
    @AuraEnabled 
    /**
    * @description This method will save an attachment in the Configuration_Log__c record Notes & Attachments section
    * @param jsonConfigLog String in JSON format representing a Configuration_Log__c object
    * @param jsonTable String in JSON format representing an array of FilePropertyWrapper objects
	* @return the Configuration_Log__c object that the attachment was added to.
	*/
    public static Configuration_Log__c saveConfigLogAttchment(String jsonConfigLog, String jsonTable) 
    {        
        List<ConfigurationLogCmpController.FilePropertyWrapper> configLogTable = ConfigurationLogVFPageController.parseJsonData(jsonTable);
        Configuration_Log__c configLogObject = ConfigurationLogCmpController.getOrCreateConfigLogObject(jsonConfigLog);
        
        Attachment csv = saveAttachment(configLogTable, configLogObject); 
        return configLogObject;        
    }
    
    @AuraEnabled 
    /**
    * @description This method will save an attachment in the Configuration_Log__c record Notes & Attachments section
    * @param jsonConfigLog String in JSON format representing a Configuration_Log__c object
    * @param jsonTable String in JSON format representing an array of FilePropertyWrapper objects
	* @return the Configuration_Log__c object that the attachment was added to.
	*/
    public static Configuration_Log__c saveConfigLogPackage(String jsonConfigLog, String jsonTable) 
    {        
        List<ConfigurationLogCmpController.FilePropertyWrapper> configLogTable = ConfigurationLogVFPageController.parseJsonData(jsonTable);
        Configuration_Log__c configLogObject = ConfigurationLogCmpController.getOrCreateConfigLogObject(jsonConfigLog);
        
        Attachment csv = saveAttachmentPackage(configLogTable, configLogObject); 
        return configLogObject;        
    }
    
    @AuraEnabled
    /*
     * @description This method will search for the Configuration Log object based on Id;
     * In case none is found or no Id is sent it will instead create a record.
     * @param jsonConfigLog String in JSON format representing a Configuration_Log__c object
     * @return The Configuration_Log__c object found or created.
	*/
    public static Configuration_Log__c getOrCreateConfigLogObject(String jsonConfigLog) {
         Map<String, Object> configLogMap = new Map<String, Object>();
        
        try {
            if(!String.isBlank(jsonConfigLog))
                configLogMap = (Map<String, Object>) JSON.deserializeUntyped(jsonConfigLog);
        } catch(Exception e) {
            return null; // Malformed JSON
        }
        
        Configuration_Log__c configLogObject = null;
        if(configLogMap.get('Id') != null){
            try{
                configLogObject = ConfigurationLogVFPageController.getConfigLogObject(configLogMap.get('Id').toString());
                if(configLogMap.get('Description__c') != null && 
                   configLogObject.Description__c != configLogMap.get('Description__c').toString()){
                    configLogObject.Description__c = configLogMap.get('Description__c').toString();
                    update configLogObject;
                }
            }catch(Exception e){
                e.getStackTraceString();
            }
           	
	           	
        }
            
        if(configLogObject == null){
            configLogObject = saveConfigLogObject(configLogMap);
        } 
            
        
        return configLogObject;
    }
    
    @TestVisible
    /* 
	*  @description This method will create a new Configuration Log Object 
    *  (Only in case, none is selected or the Id of one isn't found)
    *  @param configLogMap Map representing a JSON object that contains the Configuration_Log__c fields
	*  @return the Configuration_Log__c object that was created.
	*/
    private static Configuration_Log__c saveConfigLogObject(Map<String, Object> configLogMap) {
        if(configLogMap == null)
            return null;
        
        if(configLogMap.isEmpty())
            return null;
        
        Configuration_Log__c configLogObject = null;
        if(configLogMap.get('Name') != null) {
            configLogObject = new Configuration_Log__c();
            configLogObject.Name = configLogMap.get('Name').toString();
            if(configLogMap.get('Description__c') != null)
            	configLogObject.Description__c = configLogMap.get('Description__c').toString();
            
            insert configLogObject;
        }
        
        return configLogObject;            
    }
    
    /* 
     * @description This method converts a List of FilePropertyWrapper into a CSV file 
     * to insert as an attachment to the config log record.
     * @param configLog List of FilePropertyWrapper that will be added to the CSV file
     * @param configLogObject Configuration_Log__c object where the attachment will be added
     * @returns the Attachment object that was added to the record.
	 */
    public static Attachment saveAttachment(List<ConfigurationLogCmpController.FilePropertyWrapper> configLog, Configuration_Log__c configLogObject) {
        if(configLogObject == null || configLog == null || configLog.size() == 0)
            return null;
        
        Attachment attch = new Attachment();    
        String headers = 'createdById,createdByName,createdDate,fileName,fullName,Id,lastModifiedById,lastModifiedByName,lastModifiedByDate,manageableState,namespacePrefix,componentType\n';
        String rows = '';
        
        Map<String, String> components = new Map<String, String>();
        
        for(ConfigurationLogCmpController.FilePropertyWrapper log : configLog) {
            List<Object> objects = new List<Object> {log.createdById, log.createdByName, log.createdDate, log.fileName, log.fullName, log.Id, log.lastModifiedById, log.lastModifiedByName, log.lastModifiedDate, log.manageableState, log.namespacePrefix, log.componentType};
            rows += String.format('{0},{1},{2},{3},{4},{5},{6},{7},{8},{9},{10},{11}\n', objects);
            
            if(components.get(log.componentType) == null) 
                components.put(log.componentType, log.componentType);
        }
        
        try {
            String filename = configLogObject.Name + ' ';
            List<String> componentList = new List<String>(components.keySet()); 
            
            /*for(Integer i = 0; i < componentList.size(); i++) {
                filename += componentList.get(i);
                
                if((i + 1) != componentList.size())
                    filename += ', ';
            }*/
            
            Blob file = Blob.valueOf(headers + rows);
            attch.Body = file;
            attch.Name = filename + DateTime.now() + '.csv';
            attch.ParentId = configLogObject.Id; 
            attch.IsPrivate = false;
            System.debug('????');
            insert attch; 
            return attch;
        } catch(DmlException e) {
            return null;
        }
    }
    
    /* 
     * @description This method converts a List of FilePropertyWrapper into an Package.xml file 
     * to insert as an attachment to the config log record.
     * @param configLog List of FilePropertyWrapper that will be added to the XML file
     * @param configLogObject Configuration_Log__c object where the attachment will be added
     * @returns the Attachment object that was added to the record.
	 */
    public static Attachment saveAttachmentPackage(List<ConfigurationLogCmpController.FilePropertyWrapper> configLog, Configuration_Log__c configLogObject) {
        if(configLogObject == null || configLog == null || configLog.size() == 0)
            return null;
        
        try {
            Attachment attch = ConfigurationLogHelper.getPackageXmlFile(configLog);                
            attch.ParentId = configLogObject.Id; 
            
            if(attch != null)
            	insert attch; 
            
            return attch;
        } catch(DmlException e) {
            return null;
        }
    }
    
    /* 
    * @description This method is used to apply the search criteria filter to the FileProperty list 
    * obtained from the Metadata Service 
    * @param jsonFilter String in the format of JSON containing the search criteria to filter by
    * @param listToFilter List of FilePropertyWrapper that will be filtered 
	* @return List of FilePropertyWrapper filtered by the search criteria.
	*/
    public static List<ConfigurationLogCmpController.FilePropertyWrapper> applyFilter(String jsonFilter, List<ConfigurationLogCmpController.FilePropertyWrapper> listToFilter) {
        List<ConfigurationLogCmpController.FilePropertyWrapper> toReturn = new List<ConfigurationLogCmpController.FilePropertyWrapper>();
        
        if(String.isBlank(jsonFilter))
            return listToFilter;
        
        // Deserialize search criteria JSON to create the filter to be applied
        Map<String, Object> filterMap;
        
        try {
             filterMap = (Map<String, Object>) JSON.deserializeUntyped(jsonFilter);
        } catch(Exception e) {
            return listToFilter;
        }
        
        Object[] componentTypes = (Object[]) filterMap.get('componentTypes');
        Object[] userIds = (Object[]) filterMap.get('Ids');
        
        Boolean usingCreated = null; // Determines it is using Created Date or Last Modified Date to both sort and filter by. Null value uses no date to filter by but sorts by created date
        ConfigurationLogCmpController.compareCreatedDate = true;
        Map<String, Object> dateMap = null;
        
        if(filterMap.get('createdDate') != null) {
            usingCreated = true;
            
            if(!(filterMap.get('createdDate') instanceof String))
        		dateMap = (Map<String, Object>) filterMap.get('createdDate');
        } else if(filterMap.get('lastModifiedDate') != null) {
            usingCreated = false;
        	ConfigurationLogCmpController.compareCreatedDate = false;
            
            if(!(filterMap.get('lastModifiedDate') instanceof String))
        		dateMap = (Map<String, Object>) filterMap.get('lastModifiedDate');
        }
        
        Date startDate = null, endDate = null; // Asignation of dates to filter by
        if(usingCreated != null && dateMap != null) {
            if(dateMap.get('startDate') != null) {
                try {
                    String[] dateStringArr = ((Object) dateMap.get('startDate')).toString().split('-');
                    startDate = Date.newInstance(Integer.valueOf(dateStringArr[0]), Integer.valueOf(dateStringArr[1]), Integer.valueOf(dateStringArr[2]));
                } catch(Exception e) {
                    startDate = null;
                }
            }
            
            if(dateMap.get('endDate') != null) {
                try {
                    String[]  dateStringArr = ((Object) dateMap.get('endDate')).toString().split('-');
                    endDate = Date.newInstance(Integer.valueOf(dateStringArr[0]), Integer.valueOf(dateStringArr[1]), Integer.valueOf(dateStringArr[2]));
                } catch(Exception e) {
                    endDate = null;
                }
            }
        }
        
        // Apply every valid condition filter to the list and add the elements that pass to the filtered list
        for(ConfigurationLogCmpController.FilePropertyWrapper var : listToFilter) {
            Boolean toAdd = true;
           	
            if(componentTypes != null)
                toAdd = toAdd && componentTypes.contains(var.componentType);
            
            if(userIds != null)
                toAdd = toAdd && (userIds.contains(var.createdById) || userIds.contains(var.lastModifiedById));
            
            if(usingCreated != null) {
                DateTime varDateUsed = usingCreated ? var.createdDate : var.lastModifiedDate;
              
                if(startDate != null)
                    toAdd = toAdd && (Date.newInstance(varDateUsed.year(), varDateUsed.month(), varDateUsed.day())
                                      >= Date.newInstance(startDate.year(), startDate.month(), startDate.day()));
                
                if(endDate != null)
                    toAdd = toAdd && (Date.newInstance(varDateUsed.year(), varDateUsed.month(), varDateUsed.day())
                                      <= Date.newInstance(endDate.year(), endDate.month(), endDate.day()));
            }
            
            if(toAdd)
                toReturn.add(var);
        }
        
        toReturn.sort();        
        return toReturn;
    }
    
    public static Boolean compareCreatedDate;
    
    public class FilePropertyWrapper implements Comparable {
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
}