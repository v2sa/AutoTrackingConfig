public class ConfigurationLogAttachmentsCmp {
	@AuraEnabled
    /**
    * @description this method searches for all Attachments related to a Configuration_Log__c.
    * @param configurationLogId is the Configuration_Log__c id used to get all related Attachments.
	* @return a list of Attachments related to the Configuration_Log__c Id.
	*/
    public static List<Attachment> getConfigLogAttachments(Id configurationLogId){
        return [SELECT Name, LastModifiedDate, ParentId from Attachment WHERE ParentId =: configurationLogId and Name LIKE '%.xml' ORDER BY LastModifiedDate DESC];
    }
    
    @AuraEnabled
    /**
     * @description this method merge all Attachments in one.
     * @param attachments is a list of Attachments ready to be merge.
     * @return nothing.
	*/
    public static void mergeSelectedAttachments(List<Attachment> attachments){
        List<Attachment> packages = null;
        if(attachments != null && attachments.size() >= 2){
            // Convert the list of Attachments into a Set of Id in order to query it
            Set<Id> attachmentId = (new Map<Id, SObject>(attachments)).keySet();
            
            // Querying the Attachments based on the Attachments that were Selected
            // Query is necesary to include the Body field which is the actual file 
            // portion of an Attachment object
            packages = [SELECT Id, Body, ParentId FROM Attachment WHERE Id IN :attachmentId];
        }
        
        MergePackage.mergeAttachments(packages);
    } 
}