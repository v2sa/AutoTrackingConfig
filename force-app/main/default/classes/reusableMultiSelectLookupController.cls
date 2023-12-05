/**
 * You can get the code of this class in the following website:
 * https://sfdcmonkey.com/2018/02/20/multi-select-lookup-salesforce-lightning/
 * This is for the Lookup functionality in Lightning.
 * Modified to accomplish functionality needed.
 */
public with sharing class reusableMultiSelectLookupController {
    @AuraEnabled
    public static List < sObject > fetchLookUpValues(String searchKeyWord, String ObjectName, List<sObject> ExcludeitemsList) {
        String searchKey = '%' + searchKeyWord + '%';
        List < sObject > returnList = new List < sObject > ();
    
        List<string> lstExcludeitems = new List<string>();
        for(sObject item : ExcludeitemsList ){
            lstExcludeitems.add(item.id);
        }
        
        // Create a Dynamic SOQL Query For Fetch Record List with LIMIT 5 and exclude already selected records  
        //String sQuery =  'select id, Name from ' +ObjectName + ' where Name LIKE: searchKey AND Id NOT IN : lstExcludeitems order by createdDate DESC limit 5';
        //String sQuery =  'select id, Name from ' +ObjectName + ' where Name LIKE: searchKey AND Id NOT IN : lstExcludeitems order by Name ASC limit 5';
        String sQuery =  'select id, Name from ' + String.escapeSingleQuotes(ObjectName) + ' where Name LIKE :searchKey AND Id NOT IN :lstExcludeitems order by Name ASC limit 5';

        List < sObject > lstOfRecords = Database.query(sQuery);
        
        for (sObject obj: lstOfRecords) {
            returnList.add(obj);
        }
        return returnList;
    }
}