public with sharing class MergePackage {      
    /* 
     * @description This method is used to merge multiple package.xml files saved
     * as attachments into one single package.xml file.
     * @param packages List of Attachments that will be merged into a single Attachment
	 */
    public static void mergeAttachments(List<Attachment> packages) {       
        // Create a Map representing a Package.xml structure
        // Key (String) represent the name tag inside the types tag  
        // Value (Set<String>) represents a non-repeating list of member tags inside the types tag
        Map<String, Set<String>> mergeStructure = new Map<String, Set<String>>();
        
        if(packages != null && packages.size() > 1) {
            for(Integer i = 0; i < packages.size(); i++) {
                // Separate the Body of the Attachment into the individual types tags
                String[] body = packages[i].Body.toString().split('<types>');

                for(String b : body) {
                    // Separate the type tag to every members tag contained in it
                    String[] memberValues = b.split('<members>');
                    Set<String> members = new Set<String>();
                    
                    for(String par : memberValues){
                        if(par.contains('</members>')) {
                            // Add every member tag into the non repeating Set declared 
                            members.add(par.substring(0, par.indexOf('<')));
                        }
                        
                        // if the name is found then add the name to the merged package representation
                        if(par.contains('<name>') && par.contains('</name>')) {
                            String auxString = par.split('<name>')[1];
                            String componentType = auxString.substring(0, auxString.indexOf('<'));
                            
                            // Check if that particular type already exists in the package.xml
                            // If not create it
                            if(mergeStructure.get(componentType) == null)
                                mergeStructure.put(componentType, new Set<String>());
                            
                            // Add all the members that have been loading so far to that set
                            // Then clear the members so they aren't added again unnecesarily
                            mergeStructure.get(componentType).addAll(members);
                            members.clear();
                        }
                    }
                }
            }

            // Create a Savepoint in case of a DmlException
            Savepoint sp = Database.setSavepoint();
            
            try {
                // Create the file from a package.xml String and add it the Configuration Log record Attachment list
                if(Schema.sObjectType.Attachment.fields.Name.isCreateable() &&
                Schema.sObjectType.Attachment.fields.Body.isCreateable() &&
                Schema.sObjectType.Attachment.fields.ParentId.isCreateable() &&
                Schema.sObjectType.Attachment.fields.IsPrivate.isCreateable() ){
                    Attachment att = new Attachment();
                    att.Name = 'Merge Package - ' + DateTime.now() + '.xml';
                    att.Body = Blob.valueOf(ConfigurationLogHelper.getPackageXmlString(mergeStructure));
                    att.ParentId = packages[0].ParentId;
                    att.IsPrivate = false;
                    
                    insert att;
                }
            } catch (DmlException e) {
                Database.rollback(sp);
            }
        }
    }
}