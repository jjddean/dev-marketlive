import { action } from "./_generated/server";
import { v } from "convex/values";

// The endpoint provided by the user
const FREIGHTOS_API_URL = "https://sandbox.freightos.com/api/v1/freightEstimates";

export const testFreightosConnection = action({
    args: {},
    handler: async (ctx) => {
        const apiKey = process.env.FREIGHTOS_API_KEY;
        const appId = process.env.VITE_FREIGHTOS_APP_ID;
        const secretKey = process.env.FREIGHTOS_SECRET_KEY;

        console.log(`🔌 Connecting to: ${FREIGHTOS_API_URL}`);
        console.log(`🔑 Keys available - API_KEY: ${!!apiKey}, SECRET_KEY: ${!!secretKey}, APP_ID: ${!!appId}`);

        // Define auth strategies to try
        const strategies: { name: string; headers: Record<string, string> }[] = [
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
                    "X-App-ID": appId || "",
                    "X-App-Key": secretKey || "",
                    "Content-Type": "application/json"
                }
            },
            {
                name: "X-App-ID + X-API-Key (API Key)",
                headers: {
                    "X-App-ID": appId || "",
                    "x-api-key": apiKey || "",
                    "Content-Type": "application/json"
                }
            }
        ];

        // Trying a standard payload structure for a generic shipping calculator
        const payload = {
            origin: "Shanghai",
            destination: "Los Angeles",
            weight: 500,
            unit: "kg",
            type: "LCL",
            readyDate: new Date().toISOString().split('T')[0]
        };

        const results = [];

        for (const strategy of strategies) {
            console.log(`🔄 Trying Strategy: ${strategy.name}`);
            try {
                const response = await fetch(FREIGHTOS_API_URL, {
                    method: "POST",
                    headers: strategy.headers,
                    body: JSON.stringify(payload)
                });

                const responseText = await response.text();
                console.log(`   Status: ${response.status}`);
                // console.log(`   Response: ${responseText.substring(0, 100)}...`);

                let data;
                try {
                    data = JSON.parse(responseText);
                } catch (e) {
                    data = responseText;
                }

                results.push({
                    strategy: strategy.name,
                    status: response.status,
                    success: response.ok,
                    data_preview: typeof data === 'string' ? data.substring(0, 200) : JSON.stringify(data).substring(0, 200)
                });

                if (response.ok) {
                    console.log("✅ SUCCESS with strategy:", strategy.name);
                    return {
                        success: true,
                        strategy: strategy.name,
                        status: response.status,
                        data: data
                    };
                }

            } catch (error: any) {
                console.error(`   Failed: ${error.message}`);
                results.push({ strategy: strategy.name, error: error.message });
            }
        }

        return {
            success: false,
            message: "All auth strategies failed",
            results: results
        };
    },
});
