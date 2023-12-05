@isTest
global class MetadataServiceListMock implements WebServiceMock {
    
    global void doInvoke(
        Object stub,
        Object request,
        Map<String, Object> response,
        String endpoint,
        String soapAction,
        String requestName,
        String responseNS,
        String responseName,
        String responseType) {
            MetadataService.listMetadataResponse_element response_x = new MetadataService.listMetadataResponse_element();
            MetadataService.FileProperties filePropRecord = new MetadataService.FileProperties();
            filePropRecord.createdById = '123';
            filePropRecord.createdDate   = DateTime.now();
            filePropRecord.createdByName = 'Test Name';
            filePropRecord.fileName  = 'Test File Name';
            filePropRecord.fullName  = 'Test Full Name' ;
            filePropRecord.Id  = '123456' ;
            filePropRecord.lastModifiedById  = '123456789';
            filePropRecord.lastModifiedByName = 'Test Mod Name' ;
            filePropRecord.lastModifiedDate = DateTime.now() ;
            filePropRecord.manageableState  ='State' ;
            filePropRecord.namespacePrefix  = 'Prefix';
            filePropRecord.type_x = 'Test Component';
            
            response_x.result = new MetadataService.FileProperties[] {filePropRecord};
            
            response.put('response_x', response_x); 
        }
} 

/* 
public class listMetadataResponse_element {
public MetadataService.FileProperties[] result;
private String[] result_type_info = new String[]{'result',SOAP_M_URI,null,'0','-1','false'};
private String[] apex_schema_type_info = new String[]{SOAP_M_URI,'true','false'};
private String[] field_order_type_info = new String[]{'result'};
}
*/