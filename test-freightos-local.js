const fs = require('fs');

const ENDPOINTS = [
    { name: "SANDBOX", url: "https://sandbox.freightos.com/api/v1/freightEstimates" },
    { name: "PRODUCTION", url: "https://api.freightos.com/api/v1/freightEstimates" }
];

// Keys from .env
const apiKey = "wAsPHm7NzotkSffYG2OGECi22zdp5bGL";
const appId = "816110b1-6930-4132-ad9c-cde31825d92b";
const secretKey = "iFxehCo9h2EpD6UZ";

// Standard payload
const payload = JSON.stringify({
    origin: "Shanghai",
    destination: "Los Angeles",
    weight: 500,
    unit: "kg",
    type: "LCL",
    readyDate: new Date().toISOString().split('T')[0]
});

const strategies = [
    {
        name: "Bearer API_KEY",
        headers: {
            "Authorization": `Bearer ${apiKey}`,
            "Content-Type": "application/json"
        }
    },
    {
        name: "Bearer SECRET_KEY",
        headers: {
            "Authorization": `Bearer ${secretKey}`,
            "Content-Type": "application/json"
        }
    },
    {
        name: "X-App-ID + X-App-Key (Secret)",
        headers: {
            "X-App-ID": appId,
            "X-App-Key": secretKey,
            "Content-Type": "application/json"
        }
    },
    {
        name: "X-App-ID + X-API-Key (API Key)",
        headers: {
            "X-App-ID": appId,
            "x-api-key": apiKey,
            "Content-Type": "application/json"
        }
    }
];

async function runTests() {
    let logOutput = "";
    const log = (msg) => {
        console.log(msg);
        logOutput += msg + "\n";
    };

    for (const endpoint of ENDPOINTS) {
        log(`\n\n🌍 Testing Environment: ${endpoint.name}`);
        log(`   URL: ${endpoint.url}`);

        for (const strategy of strategies) {
            log(`   🔄 Strategy: ${strategy.name}`);
            try {
                const response = await fetch(endpoint.url, {
                    method: 'POST',
                    headers: strategy.headers,
                    body: payload
                });

                log(`      Status: ${response.status}`);
                const text = await response.text();

                let preview = text.substring(0, 100);
                preview = preview.replace(/\n/g, ' ');
                log(`      Response: ${preview}...`);

                if (response.ok) {
                    log("      ✅ SUCCESS! Valid key found for " + endpoint.name);
                }
            } catch (e) {
                log(`      Failed: ${e.message}`);
            }
        }
    }
    fs.writeFileSync('test-results.txt', logOutput);
}

runTests();
