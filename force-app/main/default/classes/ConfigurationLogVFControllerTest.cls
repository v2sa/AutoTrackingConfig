@isTest
public class ConfigurationLogVFControllerTest {
    @isTest static void TestGetConfigLogObject_EmptyString() {
        String recordId = '';
        
        // Perform test
        Test.startTest();
        Configuration_Log__c configLog = ConfigurationLogVFPageController.getConfigLogObject(recordId);
        Test.stopTest();
        
        // Verify 
        System.assertEquals(null, configLog, 'Expected ConfigLog object value to be null');
    }
    
    @isTest static void TestGetConfigLogObject_NullString() {
        String recordId = null;
        
        // Perform test
        Test.startTest();
        Configuration_Log__c configLog = ConfigurationLogVFPageController.getConfigLogObject(recordId);
        Test.stopTest();
        
        // Verify 
        System.assertEquals(null, configLog, 'Expected ConfigLog object value to be null');
    }
    
    @isTest static void TestGetConfigLogObject_NotFound() {
        Configuration_Log__c newConfigLog = new Configuration_Log__c();
        newConfigLog.Name = 'New ConfigLog';
        newConfigLog.Description__c = 'Description';

        insert newConfigLog;        
        String recordId = 'Not An Id';
        
        // Perform test
        Test.startTest();
        Configuration_Log__c configLog = ConfigurationLogVFPageController.getConfigLogObject(recordId);
        Test.stopTest();
        
        // Verify 
        System.assertEquals(null, configLog, 'Expected ConfigLog object value to be null');
    }
    
    @isTest static void TestGetConfigLogObject_Found() {
        Configuration_Log__c newConfigLog = new Configuration_Log__c();
        newConfigLog.Name = 'New ConfigLog';
        newConfigLog.Description__c = 'Description';

        insert newConfigLog;        
        String recordId = newConfigLog.Id;
        
        // Perform test
        Test.startTest();
        Configuration_Log__c configLog = ConfigurationLogVFPageController.getConfigLogObject(recordId);
        Test.stopTest();
        
        // Verify 
        System.assertEquals(newConfigLog.Id, configLog.Id, 'Expected ConfigLog object value to be the same as queried result');
    }
    
    @isTest static void TestParseJsonData_EmptyString() {
        String jsonTable = '';
        
        // Perform test
        Test.startTest();
        List<ConfigurationLogCmpController.FilePropertyWrapper> fileProperties = ConfigurationLogVFPageController.parseJsonData(jsonTable);
        Test.stopTest();
        
        // Verify 
        System.assertEquals(0, fileProperties.size(), 'Expected File Properties list to be empty');
    }
    
    @isTest static void TestParseJsonData_NullString() {
        String jsonTable = null;
        
        // Perform test
        Test.startTest();
        List<ConfigurationLogCmpController.FilePropertyWrapper> fileProperties = ConfigurationLogVFPageController.parseJsonData(jsonTable);
        Test.stopTest();
        
        // Verify 
        System.assertEquals(0, fileProperties.size(), 'Expected File Properties list to be empty');
    }
    
    @isTest static void TestParseJsonData_CompleteList() {
        String jsonTable = '[{"componentType":"ApexClass","createdById":"0054y000001vJFUAA2","createdByName":"V2 Analyst","createdDate":"2020-12-15T18:21:32.000Z","fileName":"classes/MetadataDeployController.cls","fullName":"MetadataDeployController","id":"01p4x0000091mPeAAI","lastModifiedById":"0054y000001vJFUAA2","lastModifiedByName":"V2 Analyst","lastModifiedDate":"2020-12-15T18:21:32.000Z","manageableState":"unmanaged","namespacePrefix":"V2SACL1"},{"componentType":"ApexClass","createdById":"0054x000001vJFUAA2","createdByName":"V2 Analyst","createdDate":"2020-12-15T18:21:32.000Z","fileName":"classes/MetadataDataController.cls","fullName":"MetadataDataController","id":"01p4x0000091mPdAAI","lastModifiedById":"0054x000001vJFUAA2","lastModifiedByName":"V2 Analyst","lastModifiedDate":"2020-12-15T18:21:32.000Z","manageableState":"unmanaged","namespacePrefix":"V2SACL1"},{"componentType":"ApexClass","createdById":"0054x000001vJFUAA2","createdByName":"V2 Analyst","createdDate":"2020-12-15T18:21:32.000Z","fileName":"classes/RemoteSiteHelperController.cls","fullName":"RemoteSiteHelperController","id":"01p4x0000091mPkAAI","lastModifiedById":"0054x000001vJFUAA2","lastModifiedByName":"V2 Analyst","lastModifiedDate":"2020-12-15T18:21:32.000Z","manageableState":"unmanaged","namespacePrefix":"V2SACL1"}]';
        
        // Perform test
        Test.startTest();
        List<ConfigurationLogCmpController.FilePropertyWrapper> fileProperties = ConfigurationLogVFPageController.parseJsonData(jsonTable);
        Test.stopTest();
        
        // Verify 
        System.assertNotEquals(0, fileProperties.size(), 'Expected File Properties list to not be empty');
    }
    
    @isTest static void TestParseJsonData_MalformedJSON() {
        String jsonTable = '123[4343{"componentType":"ApexClass","createdById":"0054y000001vJFUAA2","createdByName":"V2 Analyst","createdDate":"2020-12-15T18:21:32.000Z","fileName":"classes/MetadataDeployController.cls","fullName":"MetadataDeployController","id":"01p4x0000091mPeAAI","lastModifiedById":"0054y000001vJFUAA2","lastModifiedByName":"V2 Analyst","lastModifiedDate":"2020-12-15T18:21:32.000Z","manageableState":"unmanaged","namespacePrefix":"V2SACL1"},{"componentType":"ApexClass","createdById":"0054x000001vJFUAA2","createdByName":"V2 Analyst","createdDate":"2020-12-15T18:21:32.000Z","fileName":"classes/MetadataDataController.cls","fullName":"MetadataDataController","id":"01p4x0000091mPdAAI","lastModifiedById":"0054x000001vJFUAA2","lastModifiedByName":"V2 Analyst","lastModifiedDate":"2020-12-15T18:21:32.000Z","manageableState":"unmanaged","namespacePrefix":"V2SACL1"},{"componentType":"ApexClass","createdById":"0054x000001vJFUAA2","createdByName":"V2 Analyst","createdDate":"2020-12-15T18:21:32.000Z","fileName":"classes/RemoteSiteHelperController.cls","fullName":"RemoteSiteHelperController","id":"01p4x0000091mPkAAI","lastModifiedById":"0054x000001vJFUAA2","lastModifiedByName":"V2 Analyst","lastModifiedDate":"2020-12-15T18:21:32.000Z","manageableState":"unmanaged","namespacePrefix":"V2SACL1"}]';
        
        // Perform test
        Test.startTest();
        List<ConfigurationLogCmpController.FilePropertyWrapper> fileProperties = ConfigurationLogVFPageController.parseJsonData(jsonTable);
        Test.stopTest();
        
        // Verify 
        System.assertEquals(0, fileProperties.size(), 'Expected File Properties list to be empty');
    }
    
    @isTest static void TestParseJsonData_MalformedDateFormat() {
        String jsonTable = '[{"componentType":"ApexClass","createdById":"0054y000001vJFUAA2","createdByName":"V2 Analyst","createdDate":"2020=12-15;","fileName":"classes/MetadataDeployController.cls","fullName":"MetadataDeployController","id":"01p4x0000091mPeAAI","lastModifiedById":"0054y000001vJFUAA2","lastModifiedByName":"V2 Analyst","lastModifiedDate":"WLKNFiZ","manageableState":"unmanaged","namespacePrefix":"V2SACL1"},{"componentType":"ApexClass","createdById":"0054x000001vJFUAA2","createdByName":"V2 Analyst","createdDate":"2020-12-15T18:21:32.000Z","fileName":"classes/MetadataDataController.cls","fullName":"MetadataDataController","id":"01p4x0000091mPdAAI","lastModifiedById":"0054x000001vJFUAA2","lastModifiedByName":"V2 Analyst","lastModifiedDate":"2020-12-15T18:21:32.000Z","manageableState":"unmanaged","namespacePrefix":"V2SACL1"},{"componentType":"ApexClass","createdById":"0054x000001vJFUAA2","createdByName":"V2 Analyst","createdDate":"2020-12-15T18:21:32.000Z","fileName":"classes/RemoteSiteHelperController.cls","fullName":"RemoteSiteHelperController","id":"01p4x0000091mPkAAI","lastModifiedById":"0054x000001vJFUAA2","lastModifiedByName":"V2 Analyst","lastModifiedDate":"2020-12-15T18:21:32.000Z","manageableState":"unmanaged","namespacePrefix":"V2SACL1"}]';
        
        // Perform test
        Test.startTest();
        List<ConfigurationLogCmpController.FilePropertyWrapper> fileProperties = ConfigurationLogVFPageController.parseJsonData(jsonTable);
        Test.stopTest();
        
        // Verify 
        System.assertNotEquals(0, fileProperties.size(), 'Expected File Properties list to not be empty');
    }
    
    @isTest static void TestDownloadPDF_EmptyFields() {
        ConfigurationLogVFPageController controller = new ConfigurationLogVFPageController();
        controller.jsonData = '';
        controller.configLogId = '';
        
        // Perform test
        Test.startTest();
        PageReference currentPage = new System.PageReference('/apex/ConfigurationLogVFAppPage');
        Test.setCurrentPage(currentPage);
        
        System.PageReference pageRef = controller.downloadPDF4();
        Test.stopTest();
        
        // Verify 
        System.assertEquals(null, pageRef, 'Expected Page Reference to be null');
    }
    
    @isTest static void TestDownloadPDF_NullFields() {
        ConfigurationLogVFPageController controller = new ConfigurationLogVFPageController();
        controller.jsonData = null;
        controller.configLogId = null;
        
        // Perform test
        Test.startTest();
        PageReference currentPage = new System.PageReference('/apex/ConfigurationLogVFAppPage');
        Test.setCurrentPage(currentPage);
        
        System.PageReference pageRef = controller.downloadPDF4();
        Test.stopTest();
        
        // Verify 
        System.assertEquals(null, pageRef, 'Expected Page Reference to be null');
    }
    
    @isTest static void TestDownloadPDF_NullTable() {
        Configuration_Log__c newConfigLog = new Configuration_Log__c();
        newConfigLog.Name = 'New ConfigLog';
        newConfigLog.Description__c = 'Description';

        insert newConfigLog;        
        
        ConfigurationLogVFPageController controller = new ConfigurationLogVFPageController();
        controller.jsonData = null;
        controller.configLogId = newConfigLog.Id;
        
        // Perform test
        Test.startTest();
        PageReference currentPage = new System.PageReference('/apex/ConfigurationLogVFAppPage');
        Test.setCurrentPage(currentPage);
        
        System.PageReference pageRef = controller.downloadPDF4();
        Test.stopTest();
        
        // Verify 
        System.assertEquals(null, pageRef, 'Expected Page Reference to be null');
    }
    
    @isTest static void TestDownloadPDF_NullObject() {
        ConfigurationLogVFPageController controller = new ConfigurationLogVFPageController();
        controller.jsonData = '[{"componentType":"ApexClass","createdById":"0054y000001vJFUAA2","createdByName":"V2 Analyst","createdDate":"2020=12-15;","fileName":"classes/MetadataDeployController.cls","fullName":"MetadataDeployController","id":"01p4x0000091mPeAAI","lastModifiedById":"0054y000001vJFUAA2","lastModifiedByName":"V2 Analyst","lastModifiedDate":"WLKNFiZ","manageableState":"unmanaged","namespacePrefix":"V2SACL1"},{"componentType":"ApexClass","createdById":"0054x000001vJFUAA2","createdByName":"V2 Analyst","createdDate":"2020-12-15T18:21:32.000Z","fileName":"classes/MetadataDataController.cls","fullName":"MetadataDataController","id":"01p4x0000091mPdAAI","lastModifiedById":"0054x000001vJFUAA2","lastModifiedByName":"V2 Analyst","lastModifiedDate":"2020-12-15T18:21:32.000Z","manageableState":"unmanaged","namespacePrefix":"V2SACL1"},{"componentType":"ApexClass","createdById":"0054x000001vJFUAA2","createdByName":"V2 Analyst","createdDate":"2020-12-15T18:21:32.000Z","fileName":"classes/RemoteSiteHelperController.cls","fullName":"RemoteSiteHelperController","id":"01p4x0000091mPkAAI","lastModifiedById":"0054x000001vJFUAA2","lastModifiedByName":"V2 Analyst","lastModifiedDate":"2020-12-15T18:21:32.000Z","manageableState":"unmanaged","namespacePrefix":"V2SACL1"}]';
        controller.configLogId = null;
        
        // Perform test
        Test.startTest();
        PageReference currentPage = new System.PageReference('/apex/ConfigurationLogVFAppPage');
        Test.setCurrentPage(currentPage);
        
        System.PageReference pageRef = controller.downloadPDF4();
        Test.stopTest();
        
        // Verify 
        System.assertEquals(null, pageRef, 'Expected Page Reference to be null');
    }
    
    @isTest static void TestDownloadPDF_Results() {
        Configuration_Log__c newConfigLog = new Configuration_Log__c();
        newConfigLog.Name = 'New ConfigLog';
        newConfigLog.Description__c = 'Description';

        insert newConfigLog;        
        
        ConfigurationLogVFPageController controller = new ConfigurationLogVFPageController();
        controller.jsonData = '[{"componentType":"ApexClass","createdById":"0054y000001vJFUAA2","createdByName":"V2 Analyst","createdDate":"2020=12-15;","fileName":"classes/MetadataDeployController.cls","fullName":"MetadataDeployController","id":"01p4x0000091mPeAAI","lastModifiedById":"0054y000001vJFUAA2","lastModifiedByName":"V2 Analyst","lastModifiedDate":"WLKNFiZ","manageableState":"unmanaged","namespacePrefix":"V2SACL1"},{"componentType":"ApexClass","createdById":"0054x000001vJFUAA2","createdByName":"V2 Analyst","createdDate":"2020-12-15T18:21:32.000Z","fileName":"classes/MetadataDataController.cls","fullName":"MetadataDataController","id":"01p4x0000091mPdAAI","lastModifiedById":"0054x000001vJFUAA2","lastModifiedByName":"V2 Analyst","lastModifiedDate":"2020-12-15T18:21:32.000Z","manageableState":"unmanaged","namespacePrefix":"V2SACL1"},{"componentType":"ApexClass","createdById":"0054x000001vJFUAA2","createdByName":"V2 Analyst","createdDate":"2020-12-15T18:21:32.000Z","fileName":"classes/RemoteSiteHelperController.cls","fullName":"RemoteSiteHelperController","id":"01p4x0000091mPkAAI","lastModifiedById":"0054x000001vJFUAA2","lastModifiedByName":"V2 Analyst","lastModifiedDate":"2020-12-15T18:21:32.000Z","manageableState":"unmanaged","namespacePrefix":"V2SACL1"}]';
        controller.configLogId = newConfigLog.Id;
        
        // Perform test
        Test.startTest();
        PageReference currentPage = new System.PageReference('/apex/ConfigurationLogVFAppPage');
        Test.setCurrentPage(currentPage);
        
        System.PageReference pageRef = controller.downloadPDF4();
        Test.stopTest();
        
        // Verify 
        System.assertNotEquals(null, pageRef, 'Expected Page Reference to not be null');
    }
}