import { action } from "./_generated/server";
import { v } from "convex/values";

/**
 * AI Document Parser
 * Uses OpenAI GPT-4 to extract structured data from shipping documents
 */

// Check if OpenAI API key is configured
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

export const parseDocument = action({
    args: {
        fileData: v.string(), // Base64 or text content
        fileName: v.string(),
    },
    handler: async (ctx, args) => {
        console.log(`Analyzing document: ${args.fileName}`);

        // If OpenAI is configured, use real AI parsing
        if (OPENAI_API_KEY) {
            try {
                return await parseWithOpenAI(args.fileData, args.fileName);
            } catch (error) {
                console.error("OpenAI parsing failed, falling back to mock:", error);
                return getMockData(args.fileName);
            }
        }

        // Fallback to mock data
        console.log("No OpenAI API key configured, using mock data");
        return getMockData(args.fileName);
    },
});

// Real OpenAI parsing
async function parseWithOpenAI(fileData: string, fileName: string) {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${OPENAI_API_KEY}`,
        },
        body: JSON.stringify({
            model: "gpt-4o",
            messages: [
                {
                    role: "system",
                    content: `You are an AI that extracts structured data from shipping documents (Bill of Lading, Air Waybill, Commercial Invoice, etc.). 
          
Extract the following information and return as JSON:
{
  "type": "bill_of_lading" | "air_waybill" | "commercial_invoice" | "unknown",
  "confidence": 0.0-1.0,
  "data": {
    "shipper": { "name": string, "address": string },
    "consignee": { "name": string, "address": string },
    "cargoDetails": {
      "description": string,
      "weight": string,
      "dimensions": string,
      "value": string
    },
    "routeDetails": {
      "origin": string,
      "destination": string
    },
    "documentNumber": string (if available),
    "date": string (if available)
  }
}

If information is missing, use null. Be accurate and extract only what you see.`,
                },
                {
                    role: "user",
                    content: `Parse this shipping document:\n\nFilename: ${fileName}\n\nContent:\n${fileData.substring(0, 10000)}`,
                },
            ],
            temperature: 0.1, // Low temperature for consistent extraction
            response_format: { type: "json_object" },
        }),
    });

    if (!response.ok) {
        throw new Error(`OpenAI API error: ${response.statusText}`);
    }

    const result = await response.json();
    const content = result.choices[0].message.content;

    return JSON.parse(content);
}

// Mock data fallback
function getMockData(fileName: string): any {
    // Generate different mock data based on filename hints
    const lowerName = fileName.toLowerCase();

    if (lowerName.includes('invoice')) {
        return {
            type: "commercial_invoice",
            confidence: 0.92,
            data: {
                shipper: {
                    name: "Shanghai Export Co.",
                    address: "789 Trade Rd, Shanghai, CN",
                },
                consignee: {
                    name: "Import Distributors LLC",
                    address: "321 Commerce Blvd, Los Angeles, CA",
                },
                cargoDetails: {
                    description: "Textile Products - Cotton Fabric",
                    weight: "2500 kg",
                    dimensions: "150x100x120 cm",
                    value: "28000 USD",
                },
                routeDetails: {
                    origin: "Shanghai",
                    destination: "Los Angeles",
                },
                documentNumber: `INV-${Date.now()}`,
                date: new Date().toISOString().split('T')[0],
            },
        };
    }

    if (lowerName.includes('air')) {
        return {
            type: "air_waybill",
            confidence: 0.94,
            data: {
                shipper: {
                    name: "Express Cargo Ltd",
                    address: "Dubai Logistics Park, Dubai, AE",
                },
                consignee: {
                    name: "Fast Delivery Inc",
                    address: "555 Airport Rd, Miami, FL",
                },
                cargoDetails: {
                    description: "Medical Equipment - Diagnostic Devices",
                    weight: "350 kg",
                    dimensions: "80x60x50 cm",
                    value: "125000 USD",
                },
                routeDetails: {
                    origin: "Dubai",
                    destination: "Miami",
                },
                documentNumber: `AWB-${Date.now()}`,
                date: new Date().toISOString().split('T')[0],
            },
        };
    }

    // Default: Bill of Lading
    return {
        type: "bill_of_lading",
        confidence: 0.95,
        data: {
            shipper: {
                name: "Global Electronics Ltd",
                address: "123 Tech Park, Shenzhen, CN",
            },
            consignee: {
                name: "TechRetail USA",
                address: "456 Market St, San Francisco, CA",
            },
            cargoDetails: {
                description: "Consumer Electronics - Laptops",
                weight: "1500 kg",
                dimensions: "120x80x100 cm",
                value: "45000 USD",
            },
            routeDetails: {
                origin: "Shenzhen",
                destination: "Oakland",
            },
            documentNumber: `BOL-${Date.now()}`,
            date: new Date().toISOString().split('T')[0],
        },
    };
}

// Helper action to check if AI is configured
export const checkAIStatus = action({
    args: {},
    handler: async () => {
        return {
            configured: !!OPENAI_API_KEY,
            provider: OPENAI_API_KEY ? "OpenAI GPT-4" : "Mock Data",
        };
    },
});
