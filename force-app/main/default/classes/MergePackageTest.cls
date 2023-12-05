@isTest
public class MergePackageTest {
    @isTest static void TestMergeAttachmentEmptyList() {           
        List<Attachment> packages = new List<Attachment>();

        // Perform test
        Test.startTest();
        MergePackage.mergeAttachments(packages);
        Test.stopTest();
        
        // Verify 
        System.assert(true, 'Expected code to not throw an exception');
    }

    @isTest static void TestMergeAttachmentNullParam() {           
        List<Attachment> packages = null;

        // Perform test
        Test.startTest();
        MergePackage.mergeAttachments(packages);
        Test.stopTest();
        
        // Verify 
        System.assert(true, 'Expected code to not throw an exception');
    }

    @isTest static void TestMergeAttachmentFilledList() {           
        List<Attachment> packages = new List<Attachment>();

        String packageXmlString = '<?xml version="1.0" encoding="UTF-8"?><Package xmlns="http://soap.sforce.com/2006/04/metadata"><types><members>MergePackageTest</members><name>ApexClass</name></types><version>49.0</version></Package>';

        Configuration_Log__c configLogObject = new Configuration_Log__c();
        configLogObject.Name = 'New ConfigLog';
        configLogObject.Description__c = 'Description';
        
        insert configLogObject;
        
        Attachment attch1 = new Attachment();
        attch1.IsPrivate = false;
        attch1.ParentId = configLogObject.Id;
        attch1.Name = 'Attch1.xml';
        attch1.Body = Blob.valueOf(packageXmlString);
        
        Attachment attch2 = new Attachment();
        attch2.IsPrivate = false;
        attch2.ParentId = configLogObject.Id;
        attch2.Name = 'Attch2.xml';
        attch2.Body = Blob.valueOf(packageXmlString);
        
        Attachment attch3 = new Attachment();
        attch3.IsPrivate = false;
        attch3.ParentId = configLogObject.Id;
        attch3.Name = 'Attch3.xml';
        attch3.Body = Blob.valueOf(packageXmlString);

        packages.add(attch1);
        packages.add(attch2);
        packages.add(attch3);

        // Perform test
        Test.startTest();
        MergePackage.mergeAttachments(packages);
        Test.stopTest();
        
        // Verify 
        System.assert(true, 'Expected code to not throw an exception');
    }

    @isTest static void TestMergeAttachmentNoParentList() {           
        List<Attachment> packages = new List<Attachment>();

        String packageXmlString = '<?xml version="1.0" encoding="UTF-8"?><Package xmlns="http://soap.sforce.com/2006/04/metadata"><types><members>MergePackageTest</members><name>ApexClass</name></types><version>49.0</version></Package>';
        
        Attachment attch1 = new Attachment();
        attch1.IsPrivate = false;
        attch1.Name = 'Attch1.xml';
        attch1.Body = Blob.valueOf(packageXmlString);
        
        Attachment attch2 = new Attachment();
        attch2.IsPrivate = false;
        attch2.Name = 'Attch2.xml';
        attch2.Body = Blob.valueOf(packageXmlString);
        
        Attachment attch3 = new Attachment();
        attch3.IsPrivate = false;
        attch3.Name = 'Attch3.xml';
        attch3.Body = Blob.valueOf(packageXmlString);

        packages.add(attch1);
        packages.add(attch2);
        packages.add(attch3);

        // Perform test
        Test.startTest();
        MergePackage.mergeAttachments(packages);
        Test.stopTest();
        
        // Verify 
        System.assert(true, 'Expected code to not throw an exception');
    }
}