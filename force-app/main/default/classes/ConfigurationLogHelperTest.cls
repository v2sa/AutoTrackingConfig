@isTest
public class ConfigurationLogHelperTest {
    @isTest static void TestPackageXmlFileEmptyList() {       
        List<ConfigurationLogCmpController.FilePropertyWrapper> configLog = new List<ConfigurationLogCmpController.FilePropertyWrapper>();

        // Perform test
        Test.startTest();
        Attachment attch = ConfigurationLogHelper.getPackageXmlFile(configLog);
        Test.stopTest();
        
        // Verify 
        System.assertEquals(null, attch, 'Expected attachment to be empty');
    }

    @isTest static void TestPackageXmlFileNullParam() {       
        List<ConfigurationLogCmpController.FilePropertyWrapper> configLog = null;

        // Perform test
        Test.startTest();
        Attachment attch = ConfigurationLogHelper.getPackageXmlFile(configLog);
        Test.stopTest();
        
        // Verify 
        System.assertEquals(null, attch, 'Expected attachment to be empty');
    }

    @isTest static void TestPackageXmlFileResult() 
    {
        String jsonTable = '[{"componentType":"ApexClass2","createdById":"0054x000001vJFUAA2","createdByName":"V2 Analyst","createdDate":"2020-12-15T18:21:32.000Z","fileName":"classes/MetadataDeployController.cls","fullName":"MetadataDeployController","id":"01p4x0000091mPeAAI","lastModifiedById":"0054x000001vJFUAA2","lastModifiedByName":"V2 Analyst","lastModifiedDate":"2020-12-15T18:21:32.000Z","manageableState":"unmanaged","namespacePrefix":"V2SACL1"},{"componentType":"ApexClass","createdById":"0054x000001vJFUAA2","createdByName":"V2 Analyst","createdDate":"2020-12-15T18:21:32.000Z","fileName":"classes/MetadataDataController.cls","fullName":"MetadataDataController","id":"01p4x0000091mPdAAI","lastModifiedById":"0054x000001vJFUAA2","lastModifiedByName":"V2 Analyst","lastModifiedDate":"2020-12-15T18:21:32.000Z","manageableState":"unmanaged","namespacePrefix":"V2SACL1"},{"componentType":"ApexClass","createdById":"0054x000001vJFUAA2","createdByName":"V2 Analyst","createdDate":"2020-12-15T18:21:32.000Z","fileName":"classes/RemoteSiteHelperController.cls","fullName":"RemoteSiteHelperController","id":"01p4x0000091mPkAAI","lastModifiedById":"0054x000001vJFUAA2","lastModifiedByName":"V2 Analyst","lastModifiedDate":"2020-12-15T18:21:32.000Z","manageableState":"unmanaged","namespacePrefix":"V2SACL1"}]';
        String jsonFilter = '';
        
        List<ConfigurationLogCmpController.FilePropertyWrapper> configLog = ConfigurationLogVFPageController.parseJsonData(jsonTable);
        
        // Perform test
        Test.startTest();
        Attachment attch = ConfigurationLogHelper.getPackageXmlFile(configLog);
        Test.stopTest();
        
        // Verify 
        System.assertNotEquals(null, attch, 'Expected attachment to not be empty');
    }

    @isTest static void TestPackageXmlStringEmptyList() {       
        Map<String, Set<String>> components = new Map<String, Set<String>>();

        // Perform test
        Test.startTest();
        String attch = ConfigurationLogHelper.getPackageXmlString(components);
        Test.stopTest();
        
        // Verify 
        System.assertEquals('', attch, 'Expected attachment to be empty');
    }

    @isTest static void TestPackageXmlStringNullParam() {      
        Map<String, Set<String>> components = null;

        // Perform test
        Test.startTest();
        String attch = ConfigurationLogHelper.getPackageXmlString(components);
        Test.stopTest();
        
        // Verify 
        System.assertEquals('', attch, 'Expected attachment to be empty');
    }

}