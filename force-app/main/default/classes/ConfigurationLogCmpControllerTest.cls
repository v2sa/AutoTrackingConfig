@isTest
private class ConfigurationLogCmpControllerTest {
    
    @isTest static void TestSearchForComponentsResults() {  
        // This causes a fake response to be generated
        Test.setMock(WebServiceMock.class, new MetadataServiceListMock());
        
        List<String> componentList = new List<String>();
        String searchCriteria = '';
        String sessionId = 'MockId';
        
        componentList.add('Test Component');
        
        // Perform test
        Test.startTest();
        List<ConfigurationLogCmpController.FilePropertyWrapper> result = ConfigurationLogCmpController.searchForComponents(componentList, searchCriteria, sessionId);
        Test.stopTest();
        
        // Verify 
        System.assertNotEquals(0, result.size(), 'Expected List object to not be empty');
    }
    
        
    @isTest static void TestGetAllComponents_Results() {
        // This causes a fake response to be generated
        Test.setMock(WebServiceMock.class, new GetAllComponentsMock());
        
        // Perform test
        Test.startTest();
        List<Map<String,String>> componentList = ConfigurationLogCmpController.getAllComponents();
        System.debug(ConfigurationLogCmpController.getAllComponents());
        Test.stopTest();
        
        // Verify 
        System.assertNotEquals(0, componentList.size(), 'Expected List to have values');
        //System.assertNotEquals(0, 0, 'Expected List to have values');
    }

    
    @isTest static void TestSearchForComponentsException() {                      
        List<String> componentList = new List<String>();
        String searchCriteria = '';
        String sessionId = 'MockId';
        
        componentList.add('Test Component');
        
        // Perform test
        Test.startTest();
        List<ConfigurationLogCmpController.FilePropertyWrapper> result = ConfigurationLogCmpController.searchForComponents(componentList, searchCriteria, sessionId);
        Test.stopTest();
        
        // Verify 
        System.assertEquals(0, result.size(), 'Expected List object to be empty');
    }
    
    @isTest static void TestSearchForComponentsNullParams() {              
        Test.setMock(WebServiceMock.class, new MetadataServiceListMock());
        
        List<String> componentList = null;
        String searchCriteria = null;
        String sessionId = 'MockId';
        
        // Perform test
        Test.startTest();
        List<ConfigurationLogCmpController.FilePropertyWrapper> result = ConfigurationLogCmpController.searchForComponents(componentList, searchCriteria, sessionId);
        Test.stopTest();
        
        // Verify 
        System.assertEquals(0, result.size(), 'Expected List object to not be empty');
    }
    
    @isTest static void TestSearchForComponentsNullSession() {              
        Test.setMock(WebServiceMock.class, new MetadataServiceListMock());
        
        List<String> componentList = null;
        String searchCriteria = null;
        String sessionId = null;
        
        // Perform test
        Test.startTest();
        List<ConfigurationLogCmpController.FilePropertyWrapper> result = ConfigurationLogCmpController.searchForComponents(componentList, searchCriteria, sessionId);
        Test.stopTest();
        
        // Verify 
        System.assertEquals(0, result.size(), 'Expected List object to be empty');
    }
    
    @isTest static void TestGetOrCreateConfigLogObject_EmptyString() {
        String jsonConfigLog = '';
        
        // Perform test
        Test.startTest();
        Configuration_Log__c configLog = ConfigurationLogCmpController.getOrCreateConfigLogObject(jsonConfigLog);
        Test.stopTest();
        
        // Verify 
        System.assertEquals(null, configLog, 'Expected ConfigLog object value to be null');
    }
    
    @isTest static void TestGetOrCreateConfigLogObject_NullString() {
        String jsonConfigLog = null;
        
        // Perform test
        Test.startTest();
        Configuration_Log__c configLog = ConfigurationLogCmpController.getOrCreateConfigLogObject(jsonConfigLog);
        Test.stopTest();
        
        // Verify 
        System.assertEquals(null, configLog, 'Expected ConfigLog object value to be null');
    }

    @isTest static void TestGetOrCreateConfigLogObject_ExistingObject() {
        Configuration_Log__c newConfigLog = new Configuration_Log__c();
        newConfigLog.Name = 'New ConfigLog';
        newConfigLog.Description__c = 'Description';

        insert newConfigLog;        
        String jsonConfigLog = '{"Id": "' + newConfigLog.Id + '"}';
        
        // Perform test
        Test.startTest();
        Configuration_Log__c configLog = ConfigurationLogCmpController.getOrCreateConfigLogObject(jsonConfigLog);
        Test.stopTest();
        
        // Verify 
        System.assertNotEquals(null, configLog, 'Expected ConfigLog object value to not be null');
    }
    
    @isTest static void TestGetOrCreateConfigLogObject_CreatingObject() {
        String jsonConfigLog = '{"Name": "New ConfigLog", "Description__c": "Description"}';
        
        // Perform test
        Test.startTest();
        Configuration_Log__c configLog = ConfigurationLogCmpController.getOrCreateConfigLogObject(jsonConfigLog);
        Test.stopTest();
        
        // Verify 
        System.assertEquals('New ConfigLog', configLog.Name, 'Expected ConfigLog object to be inserted and returned');
    }
    
    @isTest static void TestGetOrCreateConfigLogObject_NotFoundObject() {
        String jsonConfigLog = '{"Id": "Not An Id"}';
        
        // Perform test
        Test.startTest();
        Configuration_Log__c configLog = ConfigurationLogCmpController.getOrCreateConfigLogObject(jsonConfigLog);
        Test.stopTest();
        
        // Verify 
        System.assertEquals(null, configLog, 'Expected ConfigLog object value to be null');
    }
    
    @isTest static void TestGetOrCreateConfigLogObject_NotFoundCreatingObject() {
        String jsonConfigLog = '{"Id": "Not An Id", "Name": "New ConfigLog", "Description__c": "Description"}';
        
        // Perform test
        Test.startTest();
        Configuration_Log__c configLog = ConfigurationLogCmpController.getOrCreateConfigLogObject(jsonConfigLog);
        Test.stopTest();
        
        // Verify 
        System.assertEquals('New ConfigLog', configLog.Name, 'Expected ConfigLog object to be inserted and returned');
    }
    
    @isTest static void TestGetOrCreateConfigLogObject_MalformedJSON() {
        String jsonConfigLog = 'E{2"SASD: ASD"}2E2';
        
        // Perform test
        Test.startTest();
        Configuration_Log__c configLog = ConfigurationLogCmpController.getOrCreateConfigLogObject(jsonConfigLog);
        Test.stopTest();
        
        // Verify 
        System.assertEquals(null, configLog, 'Expected ConfigLog object to be null');
    }
    
    @isTest static void TestSaveConfigLogObject_NullList() {
        Map<String, Object> configLogMap = null;
        
        // Perform test
        Test.startTest();
        Configuration_Log__c configLog = ConfigurationLogCmpController.saveConfigLogObject(configLogMap);
        Test.stopTest();
        
        // Verify 
        System.assertEquals(null, configLog, 'Expected ConfigLog object value to be null');
    }
    
    @isTest static void TestSaveAttachment_NullParams(){
        List<ConfigurationLogCmpController.FilePropertyWrapper> configLog = null;
        Configuration_Log__c configLogObject = null;

        // Perform test
        Test.startTest();
        Attachment attch = ConfigurationLogCmpController.saveAttachment(configLog, configLogObject);
        Test.stopTest();
        
        // Verify 
        System.assertEquals(null, attch, 'Expected Attachment object value to be null');
    }
    
    @isTest static void TestSaveAttachment_EmptyList(){
        List<ConfigurationLogCmpController.FilePropertyWrapper> configLog = new List<ConfigurationLogCmpController.FilePropertyWrapper>();
        Configuration_Log__c configLogObject = null;

        // Perform test
        Test.startTest();
        Attachment attch = ConfigurationLogCmpController.saveAttachment(configLog, configLogObject);
        Test.stopTest();
        
        // Verify 
        System.assertEquals(null, attch, 'Expected Attachment object value to be null');
    }
        
    @isTest static void TestSaveAttachment_FilledListNullObject(){
        List<ConfigurationLogCmpController.FilePropertyWrapper> configLog = new List<ConfigurationLogCmpController.FilePropertyWrapper>();
        Configuration_Log__c configLogObject = null;
        
        configLog.add(new ConfigurationLogCmpController.FilePropertyWrapper());

        // Perform test
        Test.startTest();
        Attachment attch = ConfigurationLogCmpController.saveAttachment(configLog, configLogObject);
        Test.stopTest();
        
        // Verify 
        System.assertEquals(null, attch, 'Expected Attachment object value to be null');
    }
        
    @isTest static void TestSaveAttachment_FilledObjectEmptyList(){
        List<ConfigurationLogCmpController.FilePropertyWrapper> configLog = new List<ConfigurationLogCmpController.FilePropertyWrapper>();
        Configuration_Log__c configLogObject = new Configuration_Log__c();
        configLogObject.Name = 'New ConfigLog';
        configLogObject.Description__c = 'Description';
       
        // Perform test
        Test.startTest();
        Attachment attch = ConfigurationLogCmpController.saveAttachment(configLog, configLogObject);
        Test.stopTest();
        
        // Verify 
        System.assertEquals(null, attch, 'Expected Attachment object value to be null');
    }
    
    @isTest static void TestSaveAttachment_Saved(){
        List<ConfigurationLogCmpController.FilePropertyWrapper> configLog = new List<ConfigurationLogCmpController.FilePropertyWrapper>();
        Configuration_Log__c configLogObject = new Configuration_Log__c();
        configLogObject.Name = 'New ConfigLog';
        configLogObject.Description__c = 'Description';
        
        insert configLogObject;
        
		ConfigurationLogCmpController.FilePropertyWrapper fileProperty 
            = new ConfigurationLogCmpController.FilePropertyWrapper('ASDADSASD', 'Test Name', DateTime.now(), 'File Test', 'Full Name', 'ASDFASFSAF', 
                                                                    'ASDLALASD', 'Test Mod Name', DateTime.now(), 'Test', 'Test2', 'Test Component');      
       configLog.add(fileProperty);
        
		ConfigurationLogCmpController.FilePropertyWrapper fileProperty2 
            = new ConfigurationLogCmpController.FilePropertyWrapper('ASDADSASD2', 'Test Name', DateTime.now(), 'File Test', 'Full Name', 'ASDFASFSAF', 
                                                                    'ASDLALASD2', 'Test Mod Name', DateTime.now(), 'Test', 'Test2', 'Test Component2');      
       configLog.add(fileProperty2);
        
        // Perform test
        Test.startTest();
        Attachment attch = ConfigurationLogCmpController.saveAttachment(configLog, configLogObject);
        Test.stopTest();
        
        // Verify 
        System.assertNotEquals(null, attch, 'Expected Attachment object value to be null');
    }
    
    @isTest static void TestSaveAttachment_FailedInsertion(){
        List<ConfigurationLogCmpController.FilePropertyWrapper> configLog = new List<ConfigurationLogCmpController.FilePropertyWrapper>();
        Configuration_Log__c configLogObject = new Configuration_Log__c();
        configLogObject.Name = 'New ConfigLog';
        configLogObject.Description__c = 'Description';
        
		ConfigurationLogCmpController.FilePropertyWrapper fileProperty 
            = new ConfigurationLogCmpController.FilePropertyWrapper('ASDADSASD', 'Test Name', DateTime.now(), 'File Test', 'Full Name', 'ASDFASFSAF', 
                                                                    'ASDLALASD', 'Test Mod Name', DateTime.now(), 'Test', 'Test2', 'Test Component');      
       configLog.add(fileProperty);
        
        // Perform test
        Test.startTest();
        Attachment attch = ConfigurationLogCmpController.saveAttachment(configLog, configLogObject);
        Test.stopTest();
        
        // Verify 
        System.assertEquals(null, attch, 'Expected Attachment object value to be null');
    }
    
    @isTest static void TestSaveAttachmentPackage_NullParams(){
        List<ConfigurationLogCmpController.FilePropertyWrapper> configLog = null;
        Configuration_Log__c configLogObject = null;

        // Perform test
        Test.startTest();
        Attachment attch = ConfigurationLogCmpController.saveAttachmentPackage(configLog, configLogObject);
        Test.stopTest();
        
        // Verify 
        System.assertEquals(null, attch, 'Expected Attachment object value to be null');
    }
    
    @isTest static void TestSaveAttachmentPackage_EmptyList(){
        List<ConfigurationLogCmpController.FilePropertyWrapper> configLog = new List<ConfigurationLogCmpController.FilePropertyWrapper>();
        Configuration_Log__c configLogObject = null;

        // Perform test
        Test.startTest();
        Attachment attch = ConfigurationLogCmpController.saveAttachmentPackage(configLog, configLogObject);
        Test.stopTest();
        
        // Verify 
        System.assertEquals(null, attch, 'Expected Attachment object value to be null');
    }
        
    @isTest static void TestSaveAttachmentPackage_FilledListNullObject(){
        List<ConfigurationLogCmpController.FilePropertyWrapper> configLog = new List<ConfigurationLogCmpController.FilePropertyWrapper>();
        Configuration_Log__c configLogObject = null;
        
        configLog.add(new ConfigurationLogCmpController.FilePropertyWrapper());

        // Perform test
        Test.startTest();
        Attachment attch = ConfigurationLogCmpController.saveAttachmentPackage(configLog, configLogObject);
        Test.stopTest();
        
        // Verify 
        System.assertEquals(null, attch, 'Expected Attachment object value to be null');
    }
        
    @isTest static void TestSaveAttachmentPackage_FilledObjectEmptyList(){
        List<ConfigurationLogCmpController.FilePropertyWrapper> configLog = new List<ConfigurationLogCmpController.FilePropertyWrapper>();
        Configuration_Log__c configLogObject = new Configuration_Log__c();
        configLogObject.Name = 'New ConfigLog';
        configLogObject.Description__c = 'Description';
       
        // Perform test
        Test.startTest();
        Attachment attch = ConfigurationLogCmpController.saveAttachmentPackage(configLog, configLogObject);
        Test.stopTest();
        
        // Verify 
        System.assertEquals(null, attch, 'Expected Attachment object value to be null');
    }
    
    @isTest static void TestSaveAttachmentPackage_Saved(){
        List<ConfigurationLogCmpController.FilePropertyWrapper> configLog = new List<ConfigurationLogCmpController.FilePropertyWrapper>();
        Configuration_Log__c configLogObject = new Configuration_Log__c();
        configLogObject.Name = 'New ConfigLog';
        configLogObject.Description__c = 'Description';
        
        insert configLogObject;
        
		ConfigurationLogCmpController.FilePropertyWrapper fileProperty 
            = new ConfigurationLogCmpController.FilePropertyWrapper('ASDADSASD', 'Test Name', DateTime.now(), 'File Test', 'Full Name', 'ASDFASFSAF', 
                                                                    'ASDLALASD', 'Test Mod Name', DateTime.now(), 'Test', 'Test2', 'Test Component');      
       configLog.add(fileProperty);
        
		ConfigurationLogCmpController.FilePropertyWrapper fileProperty2 
            = new ConfigurationLogCmpController.FilePropertyWrapper('ASDADSASD2', 'Test Name', DateTime.now(), 'File Test', 'Full Name', 'ASDFASFSAF', 
                                                                    'ASDLALASD2', 'Test Mod Name', DateTime.now(), 'Test', 'Test2', 'Test Component2');      
       configLog.add(fileProperty2);
        
        // Perform test
        Test.startTest();
        Attachment attch = ConfigurationLogCmpController.saveAttachmentPackage(configLog, configLogObject);
        Test.stopTest();
        
        // Verify 
        System.assertNotEquals(null, attch, 'Expected Attachment object value to be null');
    }
    
    @isTest static void TestSaveAttachmentPackage_FailedInsertion(){
        List<ConfigurationLogCmpController.FilePropertyWrapper> configLog = new List<ConfigurationLogCmpController.FilePropertyWrapper>();
        Configuration_Log__c configLogObject = new Configuration_Log__c();
        configLogObject.Name = 'New ConfigLog';
        configLogObject.Description__c = 'Description';
        
		ConfigurationLogCmpController.FilePropertyWrapper fileProperty 
            = new ConfigurationLogCmpController.FilePropertyWrapper('ASDADSASD', 'Test Name', DateTime.now(), 'File Test', 'Full Name', 'ASDFASFSAF', 
                                                                    'ASDLALASD', 'Test Mod Name', DateTime.now(), 'Test', 'Test2', 'Test Component');      
       configLog.add(fileProperty);
        
        // Perform test
        Test.startTest();
        Attachment attch = ConfigurationLogCmpController.saveAttachmentPackage(configLog, configLogObject);
        Test.stopTest();
        
        // Verify 
        System.assertEquals(null, attch, 'Expected Attachment object value to be null');
    }
    
    @isTest static void TestSaveConfigLogAttchment_NullParams() {
        String jsonConfigLog = null;
        String jsonTable = null;

        // Perform test
        Test.startTest();
        Configuration_Log__c configLog = ConfigurationLogCmpController.saveConfigLogAttchment(jsonConfigLog, jsonTable);
        Test.stopTest();
        
        // Verify 
        System.assertEquals(null, configLog, 'Expected Configuration Log object value to be null');
    }
    
    @isTest static void TestSaveConfigLogAttchment_EmptyParams() {
        String jsonConfigLog = '';
        String jsonTable = '';

        // Perform test
        Test.startTest();
        Configuration_Log__c configLog = ConfigurationLogCmpController.saveConfigLogAttchment(jsonConfigLog, jsonTable);
        Test.stopTest();
        
        // Verify 
        System.assertEquals(null, configLog, 'Expected Configuration Log object value to be null');
    }
    
    @isTest static void TestSaveConfigLogAttchment_MalformedConfigLog() {
        String jsonConfigLog = '21{"[asd"ds: 2ds4}442';
        String jsonTable = '[{"componentType":"ApexClass","createdById":"0054x000001vJFUAA2","createdByName":"V2 Analyst","createdDate":"2020-12-15T18:21:32.000Z","fileName":"classes/MetadataDeployController.cls","fullName":"MetadataDeployController","id":"01p4x0000091mPeAAI","lastModifiedById":"0054x000001vJFUAA2","lastModifiedByName":"V2 Analyst","lastModifiedDate":"2020-12-15T18:21:32.000Z","manageableState":"unmanaged","namespacePrefix":"V2SACL1"},{"componentType":"ApexClass","createdById":"0054x000001vJFUAA2","createdByName":"V2 Analyst","createdDate":"2020-12-15T18:21:32.000Z","fileName":"classes/MetadataDataController.cls","fullName":"MetadataDataController","id":"01p4x0000091mPdAAI","lastModifiedById":"0054x000001vJFUAA2","lastModifiedByName":"V2 Analyst","lastModifiedDate":"2020-12-15T18:21:32.000Z","manageableState":"unmanaged","namespacePrefix":"V2SACL1"},{"componentType":"ApexClass","createdById":"0054x000001vJFUAA2","createdByName":"V2 Analyst","createdDate":"2020-12-15T18:21:32.000Z","fileName":"classes/RemoteSiteHelperController.cls","fullName":"RemoteSiteHelperController","id":"01p4x0000091mPkAAI","lastModifiedById":"0054x000001vJFUAA2","lastModifiedByName":"V2 Analyst","lastModifiedDate":"2020-12-15T18:21:32.000Z","manageableState":"unmanaged","namespacePrefix":"V2SACL1"}]';

        // Perform test
        Test.startTest();
        Configuration_Log__c configLog = ConfigurationLogCmpController.saveConfigLogAttchment(jsonConfigLog, jsonTable);
        Test.stopTest();
        
        // Verify 
        System.assertEquals(null, configLog, 'Expected Configuration Log object value to be null');
    }
    
    @isTest static void TestSaveConfigLogAttchment_MalformedTable() {
        String jsonConfigLog = '{"Name": "New ConfigLog", "Description__c": "Description"}';
        String jsonTable = '21{"[asd"ds: 2ds4}442';
        
        // Perform test
        Test.startTest();
        Configuration_Log__c configLog = ConfigurationLogCmpController.saveConfigLogAttchment(jsonConfigLog, jsonTable);
        Test.stopTest();
        
        // Verify 
        System.assertEquals('New ConfigLog', configLog.Name, 'Expected ConfigLog object to be inserted and returned');
    }
    
    @isTest static void TestSaveConfigLogAttchment_ExistingObject() {
        Configuration_Log__c newConfigLog = new Configuration_Log__c();
        newConfigLog.Name = 'New ConfigLog';
        newConfigLog.Description__c = 'Description';

        insert newConfigLog;        
        String jsonConfigLog = '{"Id": "' + newConfigLog.Id + '", "Name": "New ConfigLog", "Description__c": "Description"}';
        String jsonTable = '[{"componentType":"ApexClass","createdById":"0054x000001vJFUAA2","createdByName":"V2 Analyst","createdDate":"2020-12-15T18:21:32.000Z","fileName":"classes/MetadataDeployController.cls","fullName":"MetadataDeployController","id":"01p4x0000091mPeAAI","lastModifiedById":"0054x000001vJFUAA2","lastModifiedByName":"V2 Analyst","lastModifiedDate":"2020-12-15T18:21:32.000Z","manageableState":"unmanaged","namespacePrefix":"V2SACL1"},{"componentType":"ApexClass","createdById":"0054x000001vJFUAA2","createdByName":"V2 Analyst","createdDate":"2020-12-15T18:21:32.000Z","fileName":"classes/MetadataDataController.cls","fullName":"MetadataDataController","id":"01p4x0000091mPdAAI","lastModifiedById":"0054x000001vJFUAA2","lastModifiedByName":"V2 Analyst","lastModifiedDate":"2020-12-15T18:21:32.000Z","manageableState":"unmanaged","namespacePrefix":"V2SACL1"},{"componentType":"ApexClass","createdById":"0054x000001vJFUAA2","createdByName":"V2 Analyst","createdDate":"2020-12-15T18:21:32.000Z","fileName":"classes/RemoteSiteHelperController.cls","fullName":"RemoteSiteHelperController","id":"01p4x0000091mPkAAI","lastModifiedById":"0054x000001vJFUAA2","lastModifiedByName":"V2 Analyst","lastModifiedDate":"2020-12-15T18:21:32.000Z","manageableState":"unmanaged","namespacePrefix":"V2SACL1"}]';

        // Perform test
        Test.startTest();
        Configuration_Log__c configLog = ConfigurationLogCmpController.saveConfigLogAttchment(jsonConfigLog, jsonTable);
        Test.stopTest();
        
        // Verify 
        System.assertEquals(newConfigLog.Id, configLog.Id, 'Expected ConfigLog object to be inserted and returned');
    }
    
    @isTest static void TestSaveConfigLogPackage_NullParams() {
        String jsonConfigLog = null;
        String jsonTable = null;

        // Perform test
        Test.startTest();
        Configuration_Log__c configLog = ConfigurationLogCmpController.saveConfigLogPackage(jsonConfigLog, jsonTable);
        Test.stopTest();
        
        // Verify 
        System.assertEquals(null, configLog, 'Expected Configuration Log object value to be null');
    }
    
    @isTest static void TestSaveConfigLogPackage_EmptyParams() {
        String jsonConfigLog = '';
        String jsonTable = '';

        // Perform test
        Test.startTest();
        Configuration_Log__c configLog = ConfigurationLogCmpController.saveConfigLogPackage(jsonConfigLog, jsonTable);
        Test.stopTest();
        
        // Verify 
        System.assertEquals(null, configLog, 'Expected Configuration Log object value to be null');
    }
    
    @isTest static void TestSaveConfigLogPackage_MalformedConfigLog() {
        String jsonConfigLog = '21{"[asd"ds: 2ds4}442';
        String jsonTable = '[{"componentType":"ApexClass","createdById":"0054x000001vJFUAA2","createdByName":"V2 Analyst","createdDate":"2020-12-15T18:21:32.000Z","fileName":"classes/MetadataDeployController.cls","fullName":"MetadataDeployController","id":"01p4x0000091mPeAAI","lastModifiedById":"0054x000001vJFUAA2","lastModifiedByName":"V2 Analyst","lastModifiedDate":"2020-12-15T18:21:32.000Z","manageableState":"unmanaged","namespacePrefix":"V2SACL1"},{"componentType":"ApexClass","createdById":"0054x000001vJFUAA2","createdByName":"V2 Analyst","createdDate":"2020-12-15T18:21:32.000Z","fileName":"classes/MetadataDataController.cls","fullName":"MetadataDataController","id":"01p4x0000091mPdAAI","lastModifiedById":"0054x000001vJFUAA2","lastModifiedByName":"V2 Analyst","lastModifiedDate":"2020-12-15T18:21:32.000Z","manageableState":"unmanaged","namespacePrefix":"V2SACL1"},{"componentType":"ApexClass","createdById":"0054x000001vJFUAA2","createdByName":"V2 Analyst","createdDate":"2020-12-15T18:21:32.000Z","fileName":"classes/RemoteSiteHelperController.cls","fullName":"RemoteSiteHelperController","id":"01p4x0000091mPkAAI","lastModifiedById":"0054x000001vJFUAA2","lastModifiedByName":"V2 Analyst","lastModifiedDate":"2020-12-15T18:21:32.000Z","manageableState":"unmanaged","namespacePrefix":"V2SACL1"}]';

        // Perform test
        Test.startTest();
        Configuration_Log__c configLog = ConfigurationLogCmpController.saveConfigLogPackage(jsonConfigLog, jsonTable);
        Test.stopTest();
        
        // Verify 
        System.assertEquals(null, configLog, 'Expected Configuration Log object value to be null');
    }
    
    @isTest static void TestSaveConfigLogPackage_MalformedTable() {
        String jsonConfigLog = '{"Name": "New ConfigLog", "Description__c": "Description"}';
        String jsonTable = '21{"[asd"ds: 2ds4}442';
        
        // Perform test
        Test.startTest();
        Configuration_Log__c configLog = ConfigurationLogCmpController.saveConfigLogPackage(jsonConfigLog, jsonTable);
        Test.stopTest();
        
        // Verify 
        System.assertEquals('New ConfigLog', configLog.Name, 'Expected ConfigLog object to be inserted and returned');
    }
    
    @isTest static void TestSaveConfigLogPackage_ExistingObject() {
        Configuration_Log__c newConfigLog = new Configuration_Log__c();
        newConfigLog.Name = 'New ConfigLog';
        newConfigLog.Description__c = 'Description';

        insert newConfigLog;        
        String jsonConfigLog = '{"Id": "' + newConfigLog.Id + '", "Name": "New ConfigLog", "Description__c": "Description"}';
        String jsonTable = '[{"componentType":"ApexClass","createdById":"0054x000001vJFUAA2","createdByName":"V2 Analyst","createdDate":"2020-12-15T18:21:32.000Z","fileName":"classes/MetadataDeployController.cls","fullName":"MetadataDeployController","id":"01p4x0000091mPeAAI","lastModifiedById":"0054x000001vJFUAA2","lastModifiedByName":"V2 Analyst","lastModifiedDate":"2020-12-15T18:21:32.000Z","manageableState":"unmanaged","namespacePrefix":"V2SACL1"},{"componentType":"ApexClass","createdById":"0054x000001vJFUAA2","createdByName":"V2 Analyst","createdDate":"2020-12-15T18:21:32.000Z","fileName":"classes/MetadataDataController.cls","fullName":"MetadataDataController","id":"01p4x0000091mPdAAI","lastModifiedById":"0054x000001vJFUAA2","lastModifiedByName":"V2 Analyst","lastModifiedDate":"2020-12-15T18:21:32.000Z","manageableState":"unmanaged","namespacePrefix":"V2SACL1"},{"componentType":"ApexClass","createdById":"0054x000001vJFUAA2","createdByName":"V2 Analyst","createdDate":"2020-12-15T18:21:32.000Z","fileName":"classes/RemoteSiteHelperController.cls","fullName":"RemoteSiteHelperController","id":"01p4x0000091mPkAAI","lastModifiedById":"0054x000001vJFUAA2","lastModifiedByName":"V2 Analyst","lastModifiedDate":"2020-12-15T18:21:32.000Z","manageableState":"unmanaged","namespacePrefix":"V2SACL1"}]';

        // Perform test
        Test.startTest();
        Configuration_Log__c configLog = ConfigurationLogCmpController.saveConfigLogPackage(jsonConfigLog, jsonTable);
        Test.stopTest();
        
        // Verify 
        System.assertEquals(newConfigLog.Id, configLog.Id, 'Expected ConfigLog object to be inserted and returned');
    }
    
    @isTest static void TestApplyFilter_NullParams() {
        String jsonTable = '';
        String jsonFilter = null;
        List<ConfigurationLogCmpController.FilePropertyWrapper> listToFilter = null;
        
        // Perform test
        Test.startTest();
        List<ConfigurationLogCmpController.FilePropertyWrapper> filteredList = ConfigurationLogCmpController.applyFilter(jsonFilter, listToFilter);
        Test.stopTest();
        
        // Verify 
        System.assertEquals(null, filteredList, 'Expected List to be Empty');
    }
    
    @isTest static void TestApplyFilter_EmptyFilter() {
        String jsonTable = '[{"componentType":"ApexClass","createdById":"0054x000001vJFUAA2","createdByName":"V2 Analyst","createdDate":"2020-12-15T18:21:32.000Z","fileName":"classes/MetadataDeployController.cls","fullName":"MetadataDeployController","id":"01p4x0000091mPeAAI","lastModifiedById":"0054x000001vJFUAA2","lastModifiedByName":"V2 Analyst","lastModifiedDate":"2020-12-15T18:21:32.000Z","manageableState":"unmanaged","namespacePrefix":"V2SACL1"},{"componentType":"ApexClass","createdById":"0054x000001vJFUAA2","createdByName":"V2 Analyst","createdDate":"2020-12-15T18:21:32.000Z","fileName":"classes/MetadataDataController.cls","fullName":"MetadataDataController","id":"01p4x0000091mPdAAI","lastModifiedById":"0054x000001vJFUAA2","lastModifiedByName":"V2 Analyst","lastModifiedDate":"2020-12-15T18:21:32.000Z","manageableState":"unmanaged","namespacePrefix":"V2SACL1"},{"componentType":"ApexClass","createdById":"0054x000001vJFUAA2","createdByName":"V2 Analyst","createdDate":"2020-12-15T18:21:32.000Z","fileName":"classes/RemoteSiteHelperController.cls","fullName":"RemoteSiteHelperController","id":"01p4x0000091mPkAAI","lastModifiedById":"0054x000001vJFUAA2","lastModifiedByName":"V2 Analyst","lastModifiedDate":"2020-12-15T18:21:32.000Z","manageableState":"unmanaged","namespacePrefix":"V2SACL1"}]';
        String jsonFilter = '';
        
        List<ConfigurationLogCmpController.FilePropertyWrapper> listToFilter = ConfigurationLogVFPageController.parseJsonData(jsonTable);
        
        // Perform test
        Test.startTest();
        List<ConfigurationLogCmpController.FilePropertyWrapper> filteredList = ConfigurationLogCmpController.applyFilter(jsonFilter, listToFilter);
        Test.stopTest();
        
        // Verify 
        System.assertEquals(filteredList.size(), listToFilter.size(), 'Expected List to be Empty');
    }
    
    @isTest static void TestApplyFilter_MalformedJsonFilter() {
        String jsonTable = '[{"componentType":"ApexClass","createdById":"0054y000001vJFUAA2","createdByName":"V2 Analyst","createdDate":"2020-12-15T18:21:32.000Z","fileName":"classes/MetadataDeployController.cls","fullName":"MetadataDeployController","id":"01p4x0000091mPeAAI","lastModifiedById":"0054y000001vJFUAA2","lastModifiedByName":"V2 Analyst","lastModifiedDate":"2020-12-15T18:21:32.000Z","manageableState":"unmanaged","namespacePrefix":"V2SACL1"},{"componentType":"ApexClass","createdById":"0054x000001vJFUAA2","createdByName":"V2 Analyst","createdDate":"2020-12-15T18:21:32.000Z","fileName":"classes/MetadataDataController.cls","fullName":"MetadataDataController","id":"01p4x0000091mPdAAI","lastModifiedById":"0054x000001vJFUAA2","lastModifiedByName":"V2 Analyst","lastModifiedDate":"2020-12-15T18:21:32.000Z","manageableState":"unmanaged","namespacePrefix":"V2SACL1"},{"componentType":"ApexClass","createdById":"0054x000001vJFUAA2","createdByName":"V2 Analyst","createdDate":"2020-12-15T18:21:32.000Z","fileName":"classes/RemoteSiteHelperController.cls","fullName":"RemoteSiteHelperController","id":"01p4x0000091mPkAAI","lastModifiedById":"0054x000001vJFUAA2","lastModifiedByName":"V2 Analyst","lastModifiedDate":"2020-12-15T18:21:32.000Z","manageableState":"unmanaged","namespacePrefix":"V2SACL1"}]';
        String jsonFilter = '232P{}ASDM02mA3"]';
        
        List<ConfigurationLogCmpController.FilePropertyWrapper> listToFilter = ConfigurationLogVFPageController.parseJsonData(jsonTable);
        
        // Perform test
        Test.startTest();
        List<ConfigurationLogCmpController.FilePropertyWrapper> filteredList = ConfigurationLogCmpController.applyFilter(jsonFilter, listToFilter);
        Test.stopTest();
        
        // Verify 
        System.assertEquals(filteredList.size(), listToFilter.size(), 'Expected List to be different');
    }
        
    @isTest static void TestApplyFilter_FilterByIdFound() {
        String jsonTable = '[{"componentType":"ApexClass","createdById":"0054y000001vJFUAA2","createdByName":"V2 Analyst","createdDate":"2020-12-15T18:21:32.000Z","fileName":"classes/MetadataDeployController.cls","fullName":"MetadataDeployController","id":"01p4x0000091mPeAAI","lastModifiedById":"0054y000001vJFUAA2","lastModifiedByName":"V2 Analyst","lastModifiedDate":"2020-12-15T18:21:32.000Z","manageableState":"unmanaged","namespacePrefix":"V2SACL1"},{"componentType":"ApexClass","createdById":"0054x000001vJFUAA2","createdByName":"V2 Analyst","createdDate":"2020-12-15T18:21:32.000Z","fileName":"classes/MetadataDataController.cls","fullName":"MetadataDataController","id":"01p4x0000091mPdAAI","lastModifiedById":"0054x000001vJFUAA2","lastModifiedByName":"V2 Analyst","lastModifiedDate":"2020-12-15T18:21:32.000Z","manageableState":"unmanaged","namespacePrefix":"V2SACL1"},{"componentType":"ApexClass","createdById":"0054x000001vJFUAA2","createdByName":"V2 Analyst","createdDate":"2020-12-15T18:21:32.000Z","fileName":"classes/RemoteSiteHelperController.cls","fullName":"RemoteSiteHelperController","id":"01p4x0000091mPkAAI","lastModifiedById":"0054x000001vJFUAA2","lastModifiedByName":"V2 Analyst","lastModifiedDate":"2020-12-15T18:21:32.000Z","manageableState":"unmanaged","namespacePrefix":"V2SACL1"}]';
        String jsonFilter = '{"Ids": ["0054x000001vJFUAA2"]}';
        
        List<ConfigurationLogCmpController.FilePropertyWrapper> listToFilter = ConfigurationLogVFPageController.parseJsonData(jsonTable);
        
        // Perform test
        Test.startTest();
        List<ConfigurationLogCmpController.FilePropertyWrapper> filteredList = ConfigurationLogCmpController.applyFilter(jsonFilter, listToFilter);
        Test.stopTest();
        
        // Verify 
        System.assertNotEquals(filteredList.size(), listToFilter.size(), 'Expected List to be different');
    }
    
    @isTest static void TestApplyFilter_FilterByIdNotFound() {
        String jsonTable = '[{"componentType":"ApexClass","createdById":"0054y000001vJFUAA2","createdByName":"V2 Analyst","createdDate":"2020-12-15T18:21:32.000Z","fileName":"classes/MetadataDeployController.cls","fullName":"MetadataDeployController","id":"01p4x0000091mPeAAI","lastModifiedById":"0054y000001vJFUAA2","lastModifiedByName":"V2 Analyst","lastModifiedDate":"2020-12-15T18:21:32.000Z","manageableState":"unmanaged","namespacePrefix":"V2SACL1"},{"componentType":"ApexClass","createdById":"0054x000001vJFUAA2","createdByName":"V2 Analyst","createdDate":"2020-12-15T18:21:32.000Z","fileName":"classes/MetadataDataController.cls","fullName":"MetadataDataController","id":"01p4x0000091mPdAAI","lastModifiedById":"0054x000001vJFUAA2","lastModifiedByName":"V2 Analyst","lastModifiedDate":"2020-12-15T18:21:32.000Z","manageableState":"unmanaged","namespacePrefix":"V2SACL1"},{"componentType":"ApexClass","createdById":"0054x000001vJFUAA2","createdByName":"V2 Analyst","createdDate":"2020-12-15T18:21:32.000Z","fileName":"classes/RemoteSiteHelperController.cls","fullName":"RemoteSiteHelperController","id":"01p4x0000091mPkAAI","lastModifiedById":"0054x000001vJFUAA2","lastModifiedByName":"V2 Analyst","lastModifiedDate":"2020-12-15T18:21:32.000Z","manageableState":"unmanaged","namespacePrefix":"V2SACL1"}]';
        String jsonFilter = '{"Ids": ["0054z000001vJFUAA2"]}';
        
        List<ConfigurationLogCmpController.FilePropertyWrapper> listToFilter = ConfigurationLogVFPageController.parseJsonData(jsonTable);
        
        // Perform test
        Test.startTest();
        List<ConfigurationLogCmpController.FilePropertyWrapper> filteredList = ConfigurationLogCmpController.applyFilter(jsonFilter, listToFilter);
        Test.stopTest();
        
        // Verify 
        System.assertEquals(0, filteredList.size(), 'Expected List to be Empty');
    }
    
    @isTest static void TestApplyFilter_FilterByComponentFound() {
        String jsonTable = '[{"componentType":"ApexClass2","createdById":"0054y000001vJFUAA2","createdByName":"V2 Analyst","createdDate":"2021-12-15T18:21:32.000Z","fileName":"classes/MetadataDeployController.cls","fullName":"MetadataDeployController","id":"01p4x0000091mPeAAI","lastModifiedById":"0054y000001vJFUAA2","lastModifiedByName":"V2 Analyst","lastModifiedDate":"2020-12-15T18:21:32.000Z","manageableState":"unmanaged","namespacePrefix":"V2SACL1"},{"componentType":"ApexClass","createdById":"0054x000001vJFUAA2","createdByName":"V2 Analyst","createdDate":"2021-12-15T18:21:32.000Z","fileName":"classes/MetadataDataController.cls","fullName":"MetadataDataController","id":"01p4x0000091mPdAAI","lastModifiedById":"0054x000001vJFUAA2","lastModifiedByName":"V2 Analyst","lastModifiedDate":"2020-12-15T18:21:32.000Z","manageableState":"unmanaged","namespacePrefix":"V2SACL1"},{"componentType":"ApexClass","createdById":"0054x000001vJFUAA2","createdByName":"V2 Analyst","createdDate":"2020-12-15T18:21:32.000Z","fileName":"classes/RemoteSiteHelperController.cls","fullName":"RemoteSiteHelperController","id":"01p4x0000091mPkAAI","lastModifiedById":"0054x000001vJFUAA2","lastModifiedByName":"V2 Analyst","lastModifiedDate":"2020-12-15T18:21:32.000Z","manageableState":"unmanaged","namespacePrefix":"V2SACL1"}]';
        String jsonFilter = '{"componentTypes": ["ApexClass"]}';
        
        List<ConfigurationLogCmpController.FilePropertyWrapper> listToFilter = ConfigurationLogVFPageController.parseJsonData(jsonTable);
        
        // Perform test
        Test.startTest();
        List<ConfigurationLogCmpController.FilePropertyWrapper> filteredList = ConfigurationLogCmpController.applyFilter(jsonFilter, listToFilter);
        Test.stopTest();
        
        // Verify 
        System.assertNotEquals(filteredList.size(), listToFilter.size(), 'Expected List to be different');
    }
    
    @isTest static void TestApplyFilter_FilterByComponentNotFound() {
        String jsonTable = '[{"componentType":"ApexClass2","createdById":"0054y000001vJFUAA2","createdByName":"V2 Analyst","createdDate":"2020-12-15T18:21:32.000Z","fileName":"classes/MetadataDeployController.cls","fullName":"MetadataDeployController","id":"01p4x0000091mPeAAI","lastModifiedById":"0054y000001vJFUAA2","lastModifiedByName":"V2 Analyst","lastModifiedDate":"2020-12-15T18:21:32.000Z","manageableState":"unmanaged","namespacePrefix":"V2SACL1"},{"componentType":"ApexClass","createdById":"0054x000001vJFUAA2","createdByName":"V2 Analyst","createdDate":"2020-12-15T18:21:32.000Z","fileName":"classes/MetadataDataController.cls","fullName":"MetadataDataController","id":"01p4x0000091mPdAAI","lastModifiedById":"0054x000001vJFUAA2","lastModifiedByName":"V2 Analyst","lastModifiedDate":"2020-12-15T18:21:32.000Z","manageableState":"unmanaged","namespacePrefix":"V2SACL1"},{"componentType":"ApexClass","createdById":"0054x000001vJFUAA2","createdByName":"V2 Analyst","createdDate":"2020-12-15T18:21:32.000Z","fileName":"classes/RemoteSiteHelperController.cls","fullName":"RemoteSiteHelperController","id":"01p4x0000091mPkAAI","lastModifiedById":"0054x000001vJFUAA2","lastModifiedByName":"V2 Analyst","lastModifiedDate":"2020-12-15T18:21:32.000Z","manageableState":"unmanaged","namespacePrefix":"V2SACL1"}]';
        String jsonFilter = '{"componentTypes": ["ApexClass3"]}';
        
        List<ConfigurationLogCmpController.FilePropertyWrapper> listToFilter = ConfigurationLogVFPageController.parseJsonData(jsonTable);
        
        // Perform test
        Test.startTest();
        List<ConfigurationLogCmpController.FilePropertyWrapper> filteredList = ConfigurationLogCmpController.applyFilter(jsonFilter, listToFilter);
        Test.stopTest();
        
        // Verify 
        System.assertEquals(0, filteredList.size(), 'Expected List to be Empty');
    }
    
    @isTest static void TestApplyFilter_FilterByCreatedDateFound() {
        String jsonTable = '[{"componentType":"ApexClass2","createdById":"0054y000001vJFUAA2","createdByName":"V2 Analyst","createdDate":"2020-12-13T18:21:32.000Z","fileName":"classes/MetadataDeployController.cls","fullName":"MetadataDeployController","id":"01p4x0000091mPeAAI","lastModifiedById":"0054y000001vJFUAA2","lastModifiedByName":"V2 Analyst","lastModifiedDate":"2020-12-15T18:21:32.000Z","manageableState":"unmanaged","namespacePrefix":"V2SACL1"},{"componentType":"ApexClass","createdById":"0054x000001vJFUAA2","createdByName":"V2 Analyst","createdDate":"2020-12-15T18:21:32.000Z","fileName":"classes/MetadataDataController.cls","fullName":"MetadataDataController","id":"01p4x0000091mPdAAI","lastModifiedById":"0054x000001vJFUAA2","lastModifiedByName":"V2 Analyst","lastModifiedDate":"2020-12-15T18:21:32.000Z","manageableState":"unmanaged","namespacePrefix":"V2SACL1"},{"componentType":"ApexClass","createdById":"0054x000001vJFUAA2","createdByName":"V2 Analyst","createdDate":"2020-12-05T18:21:32.000Z","fileName":"classes/RemoteSiteHelperController.cls","fullName":"RemoteSiteHelperController","id":"01p4x0000091mPkAAI","lastModifiedById":"0054x000001vJFUAA2","lastModifiedByName":"V2 Analyst","lastModifiedDate":"2020-12-15T18:21:32.000Z","manageableState":"unmanaged","namespacePrefix":"V2SACL1"}]';
        String jsonFilter = '{"createdDate": {"startDate": "2020-12-13", "endDate": "2020-12-18"}}';
        
        List<ConfigurationLogCmpController.FilePropertyWrapper> listToFilter = ConfigurationLogVFPageController.parseJsonData(jsonTable);
        
        // Perform test
        Test.startTest();
        List<ConfigurationLogCmpController.FilePropertyWrapper> filteredList = ConfigurationLogCmpController.applyFilter(jsonFilter, listToFilter);
        Test.stopTest();
        
        // Verify 
        System.assertNotEquals(filteredList.size(), listToFilter.size(), 'Expected List to be different');
    }
    
    @isTest static void TestApplyFilter_FilterByCreatedDateNotFound() {
        String jsonTable = '[{"componentType":"ApexClass2","createdById":"0054y000001vJFUAA2","createdByName":"V2 Analyst","createdDate":"2021-12-15T18:21:32.000Z","fileName":"classes/MetadataDeployController.cls","fullName":"MetadataDeployController","id":"01p4x0000091mPeAAI","lastModifiedById":"0054y000001vJFUAA2","lastModifiedByName":"V2 Analyst","lastModifiedDate":"2020-12-15T18:21:32.000Z","manageableState":"unmanaged","namespacePrefix":"V2SACL1"},{"componentType":"ApexClass","createdById":"0054x000001vJFUAA2","createdByName":"V2 Analyst","createdDate":"2020-12-15T18:21:32.000Z","fileName":"classes/MetadataDataController.cls","fullName":"MetadataDataController","id":"01p4x0000091mPdAAI","lastModifiedById":"0054x000001vJFUAA2","lastModifiedByName":"V2 Analyst","lastModifiedDate":"2020-12-15T18:21:32.000Z","manageableState":"unmanaged","namespacePrefix":"V2SACL1"},{"componentType":"ApexClass","createdById":"0054x000001vJFUAA2","createdByName":"V2 Analyst","createdDate":"2020-12-15T18:21:32.000Z","fileName":"classes/RemoteSiteHelperController.cls","fullName":"RemoteSiteHelperController","id":"01p4x0000091mPkAAI","lastModifiedById":"0054x000001vJFUAA2","lastModifiedByName":"V2 Analyst","lastModifiedDate":"2020-12-15T18:21:32.000Z","manageableState":"unmanaged","namespacePrefix":"V2SACL1"}]';
        String jsonFilter = '{"createdDate": {"startDate": "2022-12-14", "endDate": "2022-12-17"}}';
        
        List<ConfigurationLogCmpController.FilePropertyWrapper> listToFilter = ConfigurationLogVFPageController.parseJsonData(jsonTable);
        
        // Perform test
        Test.startTest();
        List<ConfigurationLogCmpController.FilePropertyWrapper> filteredList = ConfigurationLogCmpController.applyFilter(jsonFilter, listToFilter);
        Test.stopTest();
        
        // Verify 
        System.assertEquals(0, filteredList.size(), 'Expected List to be Empty');
    }
    
    @isTest static void TestApplyFilter_FilterByCreatedDateMalformedDate() {
        String jsonTable = '[{"componentType":"ApexClass2","createdById":"0054y000001vJFUAA2","createdByName":"V2 Analyst","createdDate":"2020-12-15T18:21:32.000Z","fileName":"classes/MetadataDeployController.cls","fullName":"MetadataDeployController","id":"01p4x0000091mPeAAI","lastModifiedById":"0054y000001vJFUAA2","lastModifiedByName":"V2 Analyst","lastModifiedDate":"2020-12-15T18:21:32.000Z","manageableState":"unmanaged","namespacePrefix":"V2SACL1"},{"componentType":"ApexClass","createdById":"0054x000001vJFUAA2","createdByName":"V2 Analyst","createdDate":"2020-12-15T18:21:32.000Z","fileName":"classes/MetadataDataController.cls","fullName":"MetadataDataController","id":"01p4x0000091mPdAAI","lastModifiedById":"0054x000001vJFUAA2","lastModifiedByName":"V2 Analyst","lastModifiedDate":"2020-12-15T18:21:32.000Z","manageableState":"unmanaged","namespacePrefix":"V2SACL1"},{"componentType":"ApexClass","createdById":"0054x000001vJFUAA2","createdByName":"V2 Analyst","createdDate":"2020-12-15T18:21:32.000Z","fileName":"classes/RemoteSiteHelperController.cls","fullName":"RemoteSiteHelperController","id":"01p4x0000091mPkAAI","lastModifiedById":"0054x000001vJFUAA2","lastModifiedByName":"V2 Analyst","lastModifiedDate":"2020-12-15T18:21:32.000Z","manageableState":"unmanaged","namespacePrefix":"V2SACL1"}]';
        String jsonFilter = '{"createdDate": {"startDate": "2022/12/14", "endDate": ""}}';
        
        List<ConfigurationLogCmpController.FilePropertyWrapper> listToFilter = ConfigurationLogVFPageController.parseJsonData(jsonTable);
        
        // Perform test
        Test.startTest();
        List<ConfigurationLogCmpController.FilePropertyWrapper> filteredList = ConfigurationLogCmpController.applyFilter(jsonFilter, listToFilter);
        Test.stopTest();
        
        // Verify 
        System.assertEquals(listToFilter.size(), filteredList.size(), 'Expected List to be the same');
    }
    
    @isTest static void TestApplyFilter_FilterByCreatedDateMalformedJSONDate() {
        String jsonTable = '[{"componentType":"ApexClass2","createdById":"0054y000001vJFUAA2","createdByName":"V2 Analyst","createdDate":"2020-12-15T18:21:32.000Z","fileName":"classes/MetadataDeployController.cls","fullName":"MetadataDeployController","id":"01p4x0000091mPeAAI","lastModifiedById":"0054y000001vJFUAA2","lastModifiedByName":"V2 Analyst","lastModifiedDate":"2020-12-15T18:21:32.000Z","manageableState":"unmanaged","namespacePrefix":"V2SACL1"},{"componentType":"ApexClass","createdById":"0054x000001vJFUAA2","createdByName":"V2 Analyst","createdDate":"2020-12-15T18:21:32.000Z","fileName":"classes/MetadataDataController.cls","fullName":"MetadataDataController","id":"01p4x0000091mPdAAI","lastModifiedById":"0054x000001vJFUAA2","lastModifiedByName":"V2 Analyst","lastModifiedDate":"2020-12-15T18:21:32.000Z","manageableState":"unmanaged","namespacePrefix":"V2SACL1"},{"componentType":"ApexClass","createdById":"0054x000001vJFUAA2","createdByName":"V2 Analyst","createdDate":"2020-12-15T18:21:32.000Z","fileName":"classes/RemoteSiteHelperController.cls","fullName":"RemoteSiteHelperController","id":"01p4x0000091mPkAAI","lastModifiedById":"0054x000001vJFUAA2","lastModifiedByName":"V2 Analyst","lastModifiedDate":"2020-12-15T18:21:32.000Z","manageableState":"unmanaged","namespacePrefix":"V2SACL1"}]';
        String jsonFilter = '{"createdDate": {2"startDate": 5"2022/12/14", 4"endDate": ""3}}';
        
        List<ConfigurationLogCmpController.FilePropertyWrapper> listToFilter = ConfigurationLogVFPageController.parseJsonData(jsonTable);
        
        // Perform test
        Test.startTest();
        List<ConfigurationLogCmpController.FilePropertyWrapper> filteredList = ConfigurationLogCmpController.applyFilter(jsonFilter, listToFilter);
        Test.stopTest();
        
        // Verify 
        System.assertEquals(listToFilter.size(), filteredList.size(), 'Expected List to be the same');
    }
    
    @isTest static void TestApplyFilter_FilterByModifiedDateFound() {
        String jsonTable = '[{"componentType":"ApexClass2","createdById":"0054y000001vJFUAA2","createdByName":"V2 Analyst","createdDate":"2021-12-15T18:21:32.000Z","fileName":"classes/MetadataDeployController.cls","fullName":"MetadataDeployController","id":"01p4x0000091mPeAAI","lastModifiedById":"0054y000001vJFUAA2","lastModifiedByName":"V2 Analyst","lastModifiedDate":"2010-12-15T18:21:32.000Z","manageableState":"unmanaged","namespacePrefix":"V2SACL1"},{"componentType":"ApexClass","createdById":"0054x000001vJFUAA2","createdByName":"V2 Analyst","createdDate":"2020-12-15T18:21:32.000Z","fileName":"classes/MetadataDataController.cls","fullName":"MetadataDataController","id":"01p4x0000091mPdAAI","lastModifiedById":"0054x000001vJFUAA2","lastModifiedByName":"V2 Analyst","lastModifiedDate":"2020-12-15T18:21:32.000Z","manageableState":"unmanaged","namespacePrefix":"V2SACL1"},{"componentType":"ApexClass","createdById":"0054x000001vJFUAA2","createdByName":"V2 Analyst","createdDate":"2020-12-15T18:21:32.000Z","fileName":"classes/RemoteSiteHelperController.cls","fullName":"RemoteSiteHelperController","id":"01p4x0000091mPkAAI","lastModifiedById":"0054x000001vJFUAA2","lastModifiedByName":"V2 Analyst","lastModifiedDate":"2020-12-16T18:21:32.000Z","manageableState":"unmanaged","namespacePrefix":"V2SACL1"}]';
        String jsonFilter = '{"lastModifiedDate": {"startDate": "2020-12-14", "endDate": "2020-12-17"}}';
        
        List<ConfigurationLogCmpController.FilePropertyWrapper> listToFilter = ConfigurationLogVFPageController.parseJsonData(jsonTable);
        
        // Perform test
        Test.startTest();
        List<ConfigurationLogCmpController.FilePropertyWrapper> filteredList = ConfigurationLogCmpController.applyFilter(jsonFilter, listToFilter);
        Test.stopTest();
        
        // Verify 
        System.assertNotEquals(filteredList.size(), listToFilter.size(), 'Expected List to be different');
    }
    
    @isTest static void TestApplyFilter_FilterByModifiedDateNotFound() {
        String jsonTable = '[{"componentType":"ApexClass2","createdById":"0054y000001vJFUAA2","createdByName":"V2 Analyst","createdDate":"2020-12-15T18:21:32.000Z","fileName":"classes/MetadataDeployController.cls","fullName":"MetadataDeployController","id":"01p4x0000091mPeAAI","lastModifiedById":"0054y000001vJFUAA2","lastModifiedByName":"V2 Analyst","lastModifiedDate":"2020-12-15T18:21:32.000Z","manageableState":"unmanaged","namespacePrefix":"V2SACL1"},{"componentType":"ApexClass","createdById":"0054x000001vJFUAA2","createdByName":"V2 Analyst","createdDate":"2020-12-15T18:21:32.000Z","fileName":"classes/MetadataDataController.cls","fullName":"MetadataDataController","id":"01p4x0000091mPdAAI","lastModifiedById":"0054x000001vJFUAA2","lastModifiedByName":"V2 Analyst","lastModifiedDate":"2020-12-15T18:21:32.000Z","manageableState":"unmanaged","namespacePrefix":"V2SACL1"},{"componentType":"ApexClass","createdById":"0054x000001vJFUAA2","createdByName":"V2 Analyst","createdDate":"2020-12-15T18:21:32.000Z","fileName":"classes/RemoteSiteHelperController.cls","fullName":"RemoteSiteHelperController","id":"01p4x0000091mPkAAI","lastModifiedById":"0054x000001vJFUAA2","lastModifiedByName":"V2 Analyst","lastModifiedDate":"2020-12-15T18:21:32.000Z","manageableState":"unmanaged","namespacePrefix":"V2SACL1"}]';
        String jsonFilter = '{"lastModifiedDate": {"startDate": "2022-12-14", "endDate": "2022-12-17"}}';
        
        List<ConfigurationLogCmpController.FilePropertyWrapper> listToFilter = ConfigurationLogVFPageController.parseJsonData(jsonTable);
        
        // Perform test
        Test.startTest();
        List<ConfigurationLogCmpController.FilePropertyWrapper> filteredList = ConfigurationLogCmpController.applyFilter(jsonFilter, listToFilter);
        Test.stopTest();
        
        // Verify 
        System.assertEquals(0, filteredList.size(), 'Expected List to be Empty');
    }
    
    @isTest static void TestApplyFilter_FilterByModifiedDateMalformedDate() {
        String jsonTable = '[{"componentType":"ApexClass2","createdById":"0054y000001vJFUAA2","createdByName":"V2 Analyst","createdDate":"2020-12-15T18:21:32.000Z","fileName":"classes/MetadataDeployController.cls","fullName":"MetadataDeployController","id":"01p4x0000091mPeAAI","lastModifiedById":"0054y000001vJFUAA2","lastModifiedByName":"V2 Analyst","lastModifiedDate":"2021-12-12T18:21:32.000Z","manageableState":"unmanaged","namespacePrefix":"V2SACL1"},{"componentType":"ApexClass","createdById":"0054x000001vJFUAA2","createdByName":"V2 Analyst","createdDate":"2020-12-15T18:21:32.000Z","fileName":"classes/MetadataDataController.cls","fullName":"MetadataDataController","id":"01p4x0000091mPdAAI","lastModifiedById":"0054x000001vJFUAA2","lastModifiedByName":"V2 Analyst","lastModifiedDate":"2020-12-15T18:21:32.000Z","manageableState":"unmanaged","namespacePrefix":"V2SACL1"},{"componentType":"ApexClass","createdById":"0054x000001vJFUAA2","createdByName":"V2 Analyst","createdDate":"2020-12-15T18:21:32.000Z","fileName":"classes/RemoteSiteHelperController.cls","fullName":"RemoteSiteHelperController","id":"01p4x0000091mPkAAI","lastModifiedById":"0054x000001vJFUAA2","lastModifiedByName":"V2 Analyst","lastModifiedDate":"2020-12-15T18:21:32.000Z","manageableState":"unmanaged","namespacePrefix":"V2SACL1"}]';
        String jsonFilter = '{"lastModifiedDate": {"startDate": "2022/12/14", "endDate": ""}}';
        
        List<ConfigurationLogCmpController.FilePropertyWrapper> listToFilter = ConfigurationLogVFPageController.parseJsonData(jsonTable);
        
        // Perform test
        Test.startTest();
        List<ConfigurationLogCmpController.FilePropertyWrapper> filteredList = ConfigurationLogCmpController.applyFilter(jsonFilter, listToFilter);
        Test.stopTest();
        
        // Verify 
        System.assertEquals(listToFilter.size(), filteredList.size(), 'Expected List to be the same');
    }
    
    @isTest static void TestApplyFilter_FilterByModifiedDateMalformedJSONDate() {
        String jsonTable = '[{"componentType":"ApexClass2","createdById":"0054y000001vJFUAA2","createdByName":"V2 Analyst","createdDate":"2020-12-15T18:21:32.000Z","fileName":"classes/MetadataDeployController.cls","fullName":"MetadataDeployController","id":"01p4x0000091mPeAAI","lastModifiedById":"0054y000001vJFUAA2","lastModifiedByName":"V2 Analyst","lastModifiedDate":"2020-12-15T18:21:32.000Z","manageableState":"unmanaged","namespacePrefix":"V2SACL1"},{"componentType":"ApexClass","createdById":"0054x000001vJFUAA2","createdByName":"V2 Analyst","createdDate":"2020-12-15T18:21:32.000Z","fileName":"classes/MetadataDataController.cls","fullName":"MetadataDataController","id":"01p4x0000091mPdAAI","lastModifiedById":"0054x000001vJFUAA2","lastModifiedByName":"V2 Analyst","lastModifiedDate":"2020-12-15T18:21:32.000Z","manageableState":"unmanaged","namespacePrefix":"V2SACL1"},{"componentType":"ApexClass","createdById":"0054x000001vJFUAA2","createdByName":"V2 Analyst","createdDate":"2020-12-15T18:21:32.000Z","fileName":"classes/RemoteSiteHelperController.cls","fullName":"RemoteSiteHelperController","id":"01p4x0000091mPkAAI","lastModifiedById":"0054x000001vJFUAA2","lastModifiedByName":"V2 Analyst","lastModifiedDate":"2020-12-15T18:21:32.000Z","manageableState":"unmanaged","namespacePrefix":"V2SACL1"}]';
        String jsonFilter = '{"lastModifiedDate": {2"startDate": 5"2022/12/14", 4"endDate": ""3}}';
        
        List<ConfigurationLogCmpController.FilePropertyWrapper> listToFilter = ConfigurationLogVFPageController.parseJsonData(jsonTable);
        
        // Perform test
        Test.startTest();
        List<ConfigurationLogCmpController.FilePropertyWrapper> filteredList = ConfigurationLogCmpController.applyFilter(jsonFilter, listToFilter);
        Test.stopTest();
        
        // Verify 
        System.assertEquals(listToFilter.size(), filteredList.size(), 'Expected List to be same');
    }

    @isTest static void TestCreateService_Results() {
        String sessionId = 'NotRealId';
        
        // Perform test
        Test.startTest();
        MetadataService.MetadataPort service = ConfigurationLogCmpController.createService(sessionId);
        Test.stopTest();
        
        // Verify 
        System.assertNotEquals(null, service, 'Expected service to have a value');
    }
}