import { action } from "./_generated/server";
import { v } from "convex/values";

// Freightos API Base URL (Sandbox/Production switch)
const FREIGHTOS_API_URL = "https://api.freightos.com/api/v1/search/estimates";

export const testFreightosConnection = action({
    args: {},
    handler: async (ctx) => {
        const apiKey = process.env.FREIGHTOS_API_KEY;

        if (!apiKey) {
            return { success: false, error: "Missing FREIGHTOS_API_KEY in environment variables." };
        }

        try {
            // Basic payload for a rate estimate
            const response = await fetch(FREIGHTOS_API_URL, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${apiKey}`
                },
                body: JSON.stringify({
                    origin: "CNSHA", // Shanghai
                    destination: "USLAX", // Los Angeles
                    containers: [
                        {
                            quantity: 1,
                            type: "40ST"
                        }
                    ],
                    readyBy: new Date().toISOString()
                })
            });

            const data = await response.json();

            return {
                success: response.ok,
                status: response.status,
                data: data
            };

        } catch (error: any) {
            return {
                success: false,
                error: error.message
            };
        }
    },
});
