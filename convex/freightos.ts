

export interface EstimateRequest {
    origin: string; // UN/LOCODE (e.g. USLAX)
    destination: string; // UN/LOCODE (e.g. CNSHA)
    load: {
        quantity: number;
        unitType: "boxes" | "pallets" | "container20" | "container40";
        unitWeightKg: number;
        unitVolumeCBM: number;
    }[];
}

interface PriceEstimate {
    min: number;
    max: number;
}

interface TransitTime {
    min: number;
    max: number;
}

interface ModeResponse {
    priceEstimates?: PriceEstimate;
    transitTime?: TransitTime;
}

export interface EstimateResponse {
    OCEAN?: ModeResponse;
    AIR?: ModeResponse;
}

export const getFreightEstimates = async (req: EstimateRequest): Promise<EstimateResponse | null> => {
    const apiKey = process.env.FREIGHTOS_API_KEY;

    if (!apiKey) {
        console.warn("Missing FREIGHTOS_API_KEY. Using Mock Data.");
        return {
            OCEAN: {
                priceEstimates: { min: 2500, max: 3200 },
                transitTime: { min: 25, max: 35 }
            },
            AIR: {
                priceEstimates: { min: 4800, max: 5500 },
                transitTime: { min: 3, max: 5 }
            }
        };
    }

    const url = "https://sandbox.freightos.com/api/v1/freightEstimates";

    const payload = {
        load: req.load,
        legs: [{
            origin: { unLocationCode: req.origin.toUpperCase() },
            destination: { unLocationCode: req.destination.toUpperCase() }
        }]
    };

    try {
        const response = await fetch(url, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "x-apikey": apiKey
            },
            body: JSON.stringify(payload)
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error(`Freightos API Error (${response.status}):`, errorText);
            throw new Error(`Freightos API Error: ${response.status} - ${errorText}`);
        }

        const data = await response.json();
        return data as EstimateResponse;
    } catch (error) {
        console.error("Freightos Request Failed:", error);
        throw error;
    }
};
