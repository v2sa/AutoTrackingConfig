public class ConfigurationLogHelper {
    
    public static Attachment getPackageXmlFile(List<ConfigurationLogCmpController.FilePropertyWrapper> configLog) {
        if(configLog == null || configLog.size() == 0)
            return null;
        
        Map<String, Set<String>> components = new Map<String, Set<String>>();
        
        for(ConfigurationLogCmpController.FilePropertyWrapper log : configLog) {
            if(components.get(log.componentType) == null) 
                components.put(log.componentType, new Set<String>());
            
            components.get(log.componentType).add(log.fullName);
        }
        
        Attachment attch = new Attachment(); 
        String packageXml = ConfigurationLogHelper.getPackageXmlString(components);
        String filename = 'Package - (';
        List<String> componentList = new List<String>(components.keySet()); 
        
        for(Integer i = 0; i < componentList.size(); i++) {
            filename += componentList.get(i);
            
            if((i + 1) != componentList.size())
                filename += ', ';
        }
        
        Blob file = Blob.valueOf(packageXml);
        attch.Body = file;
        attch.Name = filename + ') -' + DateTime.now() + '.xml';
        attch.IsPrivate = false;
        
        return attch;  
    }
    
    public static String getPackageXmlString(Map<String, Set<String>> components) {
        if(components == null || components.keySet().size() == 0)
            return '';
        
        String packageXml = '<?xml version="1.0" encoding="UTF-8"?>\n<Package xmlns="http://soap.sforce.com/2006/04/metadata">\n';
        
        for(String name : components.keySet()) {
            String memberList = '';
            
            for(String members : components.get(name)) {
                List<Object> stringFormatMember = new List<Object> { members };
                    memberList += String.format('\t\t<members>{0}</members>\n', stringFormatMember);
            }
            
            List<Object> componentTypeList = new List<Object> { memberList, name };
                packageXml += String.format('\t<types>\n{0}\t\t<name>{1}</name>\n\t</types>\n', componentTypeList);
        }
        
        // Perform a query to get the Salesforce verision being used to access the Metadata API
        List<Configuration_Log_Configuration__mdt> logsMDT = [SELECT Salesforce_Version__c FROM Configuration_Log_Configuration__mdt where DeveloperName='Component_List'];
        Decimal salesforceVersion = [SELECT ApiVersion FROM ApexClass WHERE Name = 'ConfigurationLogHelper' LIMIT 1].ApiVersion;
        
        if(logsMDT.size() > 0)
            salesforceVersion = logsMDT.get(0).Salesforce_Version__c;
        
        packageXml += '\t<version>' +  String.valueOf(salesforceVersion.doubleValue()) + '</version>\n</Package>';
        
        return packageXml;
    }
    
}