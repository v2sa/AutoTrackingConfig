public with sharing class ConfigurationLogVFPageController {
    public List<ConfigurationLogCmpController.FilePropertyWrapper> configLog {get; set;} 
    
    public String jsonData {get; set;}
    public String configLogId {get; set;}
    
    public Configuration_Log__c configLogObject {get; set;}
    
    public ConfigurationLogVFPageController() {
    }
    
    /* 
	* @description This method is used to obtain the Configuration Log Object being used in the session.
	* @param recordId String representing the Id of the object that wants to be queried
	* @return the Configuration_Log__c object.
	*/
    public static Configuration_Log__c getConfigLogObject(String recordId) {
        try {
        	return [Select Name, Description__c From Configuration_Log__c Where Id = :recordId];             
        } catch(QueryException e) {
            return null;
        }       
    }
    
    /* 
     * @desciption This method takes a JSON (Array of MetadataService.FileProperties) and convert it to a List of FilePropertiesWrapper
	 * To use to populate the configuration log changes table for the PDF attachment. 
	 * @param jsonString String in the format of JSON that contains an array of FilePropertyWrapper
	 * @return a List of FilePropertyWrapper
	*/
    public static List<ConfigurationLogCmpController.FilePropertyWrapper> parseJsonData(String jsonString) {
        if(String.isBlank(jsonString))
            return new List<ConfigurationLogCmpController.FilePropertyWrapper>();
        
        List<ConfigurationLogCmpController.FilePropertyWrapper> toReturn = new List<ConfigurationLogCmpController.FilePropertyWrapper>();
        List<Object> configLogJson = null;
        
        try {
            configLogJson = (List<Object>) JSON.deserializeUntyped(jsonString);
        } catch(Exception e) {
            return new List<ConfigurationLogCmpController.FilePropertyWrapper>();
        }
        
        for(Object log : configLogJson) {
            Map<String, Object> logMap = (Map<String, Object>) log;
            ConfigurationLogCmpController.FilePropertyWrapper toAdd = new ConfigurationLogCmpController.FilePropertyWrapper();
            
            if(logMap.get('createdById') != null) 
                toAdd.createdById = logMap.get('createdById').toString();
            if(logMap.get('createdByName') != null) 
                toAdd.createdByName = logMap.get('createdByName').toString();
            if(logMap.get('fileName') != null){
                toAdd.fileName = '';
                String[] splitText = logMap.get('fileName').toString().split('/');
                toAdd.fileName += splitText[0] + '/ \n ' + stringFormattingForPDF(splitText[1]);
            }
                
            if(logMap.get('fullName') != null){
                toAdd.fullName = stringFormattingForPDF(logMap.get('fullName').toString());
            } 
            
            if(logMap.get('id') != null) 
                toAdd.Id = logMap.get('id').toString();
            if(logMap.get('lastModifiedById') != null) 
                toAdd.lastModifiedById = logMap.get('lastModifiedById').toString();
            if(logMap.get('lastModifiedByName') != null) 
                toAdd.lastModifiedByName = logMap.get('lastModifiedByName').toString();
            if(logMap.get('manageableState') != null) 
                toAdd.manageableState = logMap.get('manageableState').toString();
            if(logMap.get('namespacePrefix') != null) 
                toAdd.namespacePrefix = logMap.get('namespacePrefix').toString();
            if(logMap.get('componentType') != null) 
                toAdd.componentType = logMap.get('componentType').toString();
            
            if(logMap.get('createdDate') != null) {
                String jsonDate = '"' + ((Object) logMap.get('createdDate')).toString() + '"';
                try {
                	toAdd.createdDate = (Datetime) JSON.deserialize(jsonDate, Datetime.class);
                } catch(Exception e) {
                    toAdd.createdDate = null;
                }
            }
            
            if(logMap.get('lastModifiedDate') != null) {
                String jsonDate = '"' + ((Object) logMap.get('lastModifiedDate')).toString() + '"';
                try {
                	toAdd.lastModifiedDate = (Datetime) JSON.deserialize(jsonDate, Datetime.class);
                } catch(Exception e) {
                    toAdd.lastModifiedDate = null;
                }
            }
            
            toReturn.add(toAdd);
        }
        
        return toReturn;
    }
    
    /* 
     * @description This method starts a download for the PDF generate by the VF Page. 
     * @return a PageReference to start the download.
	*/
    public PageReference downloadPDF4() {      
        configLog = parseJsonData(this.jsonData);          
        configLogObject = getConfigLogObject(this.configLogId);
        
        if(configLog == null || configLog.size() == 0 || configLogObject == null)
            return null;
        
        System.PageReference pageRef = Page.GeneratePDF;
        pageRef.getHeaders().put('content-disposition', 'attachment; filename=ConfigLog-' + configLogObject.Name + '-' + Date.today() + '.pdf'); 
                
        return pageRef;        
    }
    
    /* 
     * @description This method format a text to fit in the PDF conlumn 
     * @return a processed string.
	*/
    private static String stringFormattingForPDF(String text){
        if(text != null && text.length() > 0){
            if(text.length() <= 31){
                return text;
            }else if(text.length() > 31 && text.length() <= 90){
                return text.substring(0, 31) + ' \n ' + 
                    text.substring(31, text.length()); 
            }else {
               return text.substring(0, 31) + ' \n ' + 
                   text.substring(31, 90) + ' \n ' + 
                   text.substring(90, text.length());
            }
        }
        
        return text;
    }
}