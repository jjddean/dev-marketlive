import docusign from 'docusign-esign';
import fs from 'fs';

const SCOPES = ["signature", "impersonation"];

const config = {
    clientId: "efd62251-5066-4b8c-b046-20092325db37",
    userId: "8ff4a1c2-fcf9-4feb-9477-9280da18716a",
    basePath: "https://demo.docusign.net/restapi",
    privateKey: `-----BEGIN RSA PRIVATE KEY-----
MIIEowIBAAKCAQEAjEF4eeXcyjULaM8jaSY8NEirJ8GLGTC4WZBcjcVRn1neUSOA
UmUOjlM7KDNzb+cGjS65S41k4A7jpiCf41hHbvZAPx4MWIfXVDBqtUqksKicwlhz
tnEnEPlJNCYe/Kgtzd1fUX1PYe+iFNIi0r3H3cTTQaTiLa7CKknjqktDkovEk/xY
DiwpR6hb38FuCaxMhuYswsW0WqgvjCRbt4PDKIHpFCf8oFlp3qjYJNUnXxRZ55Wh
90DWsY5xMkuvoGFVJ7V5ngrNYbDrYOJYtorVZ7OWjKR+cy2SEfFtesIl3lYIQ/YV
FAd0sQTbfn97KbaUSpbPSZPFHoToy+dKhVpFOwIDAQABAoIBAB6zaBU6uRk0AkLX
cJdgLLZ/H6PsrC9/6CKGxJOt2P+KEu1s2XZvs394/Y5/sKmShu8ZhqrgkO+woqkn
JAiGNuC1m3uVbrtkRMCjdoAnjiQzTFkINo/9dcEz6A+3tnm0sI4LAoXaaal05GQt
WT0LGLhVEK8iUfYQ9mR+VwzcO7bUeU+g+mMQzx2NTjHHzD25iWi7v2dgg5+BXmpS
GQ6/yhvhkHJqS1ou1vgU3ZrZkxf/xGd1kByjmZ61Zb4xE0Xwcrp3aYUMgycuxGu3
6oDTMp154KQhXVtUxFagi4JOyb5eqh8VpCN7NmUiPFjyNfEXHEFCGLNmM0dFt6QV
xk3ow3kCgYEAxpi0qMsIAUPJp66ulI4zsyY/q+sz0UL6kqFE7gSznKjIbhjTqsHb
ySKY3SpDY/uI2u9GNzgRX7QfC73Nmo0MuZ5+bHILg1npapJXX6ye4vmvqnBmaH0J
V728dVmWysOA0soEH3Ced3P3C1vK62ve+aC41j4b6a4DiJLO7HFvVKkCgYEAtMvM
Id021k3Lqt2xB7E+NPUFwldRKYA3WDNgyE+Rr3VsuMoUtt12EVJ3OJzXszXz3bTr
AAc5IeFRzPuqRJjqpeNHIV1SNC8qVCPmYalbaO/5VoNMk4/wbcUbfh1mEOj7zK8n
u37/2MiDRXBCkU58itG6LQT017XVolNbJ9MjVUMCgYEAkDulsZVLKgf+c98FAfVJ
DQpxYb2/c3Kuo0Gm2yrk+5kFgBhd2f1TT3/l/3JLYVj0avUuTLpWu+gISDHAGkfo
fwLiFIa7X9k0EedYt66Z8oSelS1u4uI0n9m3/o5jWr2kWPLJDcBwBpddS42OEW7V
kPyuYULYaN2tyUm+KLC1x4kCgYAVjbo/S0UPVWTzcMx7E0lMPO271ncJkIyIik9+
ceX3WfNlMEo55rr9o6ws5p3ccpEpHDlr3nCUNm1vF42b8fL/ZdIEC0ESkZDlSQZd
HDiWkQ1ToAGQEffizj3R0iVp3KywIS2Gb8SGjpj/vTtiYU39qrUcStv5n2bhnDhg
zg4HSwKBgA8sc6XisDO89V/0i+F3n7zQydXX/+69uwDWVKVxFxz/6k+kLi2J94Ru
1JvF4ATWqg6JnyUG27FSDzEQ3UTE2xmYj7sc7zU5a/+yLSykE45Mz9gZ4mfz+bJ+
0TOEnwADXzUqe0zkJ7PZWVqV8x+elZ/YGdFi6jbkDbo8wTKtI6Y3
-----END RSA PRIVATE KEY-----`
};

async function run() {
    console.log("----------------------------------------");
    console.log("Testing DocuSign Connection...");
    console.log(`Client ID (IK): ${config.clientId}`);
    console.log(`User ID:        ${config.userId}`);
    console.log("----------------------------------------");

    const dsApi = new docusign.ApiClient();
    dsApi.setOAuthBasePath("account-d.docusign.com");
    // IMPORTANT: This is the fix for the 401 error
    dsApi.setBasePath(config.basePath);

    try {
        console.log("1. Requesting JWT User Token...");
        const results = await dsApi.requestJWTUserToken(
            config.clientId,
            config.userId,
            SCOPES,
            Buffer.from(config.privateKey, "utf8"),
            3600
        );

        console.log("✅ SUCCESS! Token received.");
        const accessToken = results.body.access_token;
        dsApi.addDefaultHeader("Authorization", "Bearer " + accessToken);

        console.log("2. Fetching User Info to get correct Base URI...");
        const userInfo = await dsApi.getUserInfo(accessToken);
        const account = userInfo.accounts.find(a => a.accountId === config.accountId) || userInfo.accounts[0];

        const baseUri = account.baseUri + "/restapi";
        console.log(`   Found Account: ${account.accountName} (${account.accountId})`);
        console.log(`   Correct Base URI: ${baseUri}`);

        dsApi.setBasePath(baseUri);

        console.log("3. Attempting to Create Envelope (Test)...");
        const envelopesApi = new docusign.EnvelopesApi(dsApi);

        // Simple Envelope Definition
        const envDef = new docusign.EnvelopeDefinition();
        envDef.emailSubject = "Test Envelope from Script";
        envDef.status = "sent";

        const doc = new docusign.Document();
        // Valid Minimal PDF (Hello World) to avoid PDF_VALIDATION_FAILED
        doc.documentBase64 = "JVBERi0xLjcKCjEgMCBvYmogICUgZW50cnkgcG9pbnQKPDwKICAvVHlwZSAvQ2F0YWxvZwogIC9QYWdlcyAyIDAgUgo+PgplbmRvYmoKCjIgMCBvYmoKPDwKICAvVHlwZSAvUGFnZXMKICAvTWVkaWFCb3ggWyAwIDAgMjAwIDIwMCBdCiAgL0NvdW50IDEKICAvS2lkcyBbIDMgMCBSIF0KPj4KZW5kb2JqCgozIDAgb2JqCjw8CiAgL1R5cGUgL1BhZ2UKICAvUGFyZW50IDIgMCBSCiAgL1Jlc291cmNlcyA8PAogICAgL0ZvbnQgPDwKICAgICAgL0YxIDQgMCBSCiAgICA+PgogID4+CiAgL0NvbnRlbnRzIDUgMCBSCj4+CmVuZG9iagokNCAwIG9iago8PAogIC9UeXBlIC9Gb250CiAgL1N1YnR5cGUgL1R5cGUxCiAgL0Jhc2VGb250IC9UaW1lcy1Sb21hbgo+PgplbmRvYmoKCjUgMCBvYmoKPDwgL0xlbmd0aCA0NCA+PgpzdHJlYW0KQlQKNzAgNTAgVEQKL0YxIDEyIFRmCihIZWxsbywgRG9jdVNpZ24hKSBUagpFVAplbmRzdHJlYW0KZW5kb2JqCgp4cmVmCjAgNgowMDAwMDAwMDAwIDY1NTM1IGYgCjAwMDAwMDAwMTAgMDAwMDAgbiAKMDAwMDAwMDA2MCAwMDAwMCBuIAowMDAwMDAwMTE0IDAwMDAwIG4gCjAwMDAwMDAyMjUgMDAwMDAgbiAKMDAwMDAwMDMxMiAwMDAwMCBuIAp0cmFpbGVyCjw8CiAgL1NpemUgNgogIC9Sb290IDEgMCBSCj4+CnN0YXJ0eHJlZgo0MDYKJSVFT0YK";
        doc.name = "Test.pdf";
        doc.fileExtension = "pdf";
        doc.documentId = "1";
        envDef.documents = [doc];

        const signer = new docusign.Signer();
        signer.email = "jkdproductivity@gmail.com"; // Self-sign for test
        signer.name = "Test Script User";
        signer.recipientId = "1";

        const signHere = new docusign.SignHere();
        signHere.documentId = "1";
        signHere.pageNumber = "1";
        signHere.recipientId = "1";
        signHere.xPosition = "100";
        signHere.yPosition = "100";

        signer.tabs = new docusign.Tabs();
        signer.tabs.signHereTabs = [signHere];

        const recipients = new docusign.Recipients();
        recipients.signers = [signer];
        envDef.recipients = recipients;

        const envelopeSummary = await envelopesApi.createEnvelope(account.accountId, { envelopeDefinition: envDef });
        console.log("✅ ENVELOPE SENT! ID:", envelopeSummary.envelopeId);

    } catch (error) {
        console.error("\n❌ ERROR: Authentication Failed!");
        console.error("----------------------------------------");

        if (error.response) {
            console.error("Status:", error.response.status);
            console.error("Body:", JSON.stringify(error.response.body, null, 2));
        } else {
            console.error("Error Message:", error.message);
            console.error("Full Object:", error);
        }

        console.error("----------------------------------------");
        console.error("Possible Fixes based on error body:");
        console.error("- 'consent_required': You need to click the consent link again.");
        console.error("- 'invalid_grant': Private Key is wrong OR User ID does not match the integration.");
    }
}

run();
