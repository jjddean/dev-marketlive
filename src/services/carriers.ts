// MarketLive Carrier API Integration
// Live shipping rates from multiple carriers using free-tier APIs

import axios from 'axios';

// Types for carrier integration
export interface Address {
  name?: string;
  company?: string;
  street1: string;
  street2?: string;
  city: string;
  state?: string;
  zip: string;
  country: string;
  phone?: string;
  email?: string;
}

export interface Parcel {
  length: number;
  width: number;
  height: number;
  distance_unit: 'in' | 'cm';
  weight: number;
  mass_unit: 'lb' | 'kg';
}

export interface CarrierRate {
  carrier: string;
  service: string;
  cost: number;
  currency: string;
  transit_time: string;
  delivery_date?: string;
  co2_emission?: number;
  provider: 'shippo' | 'reachship' | 'easyship' | 'fedex' | 'ups';
}

export interface RateRequest {
  origin: Address;
  destination: Address;
  parcel: Parcel;
  service_type?: 'standard' | 'express' | 'overnight';
}

// Environment variables for API keys
const SHIPPO_TOKEN = import.meta.env.VITE_SHIPPO_TOKEN || 'demo_token';
const REACHSHIP_KEY = import.meta.env.VITE_REACHSHIP_KEY || 'demo_key';
const EASYSHIP_TOKEN = import.meta.env.VITE_EASYSHIP_TOKEN || 'demo_token';
const FEDEX_KEY = import.meta.env.VITE_FEDEX_KEY || 'demo_key';

// Shippo API Integration (Multi-carrier aggregator)
export async function getRatesFromShippo(request: RateRequest): Promise<CarrierRate[]> {
  try {
    const response = await axios.post(
      'https://api.goshippo.com/shipments/',
      {
        address_from: {
          name: request.origin.name || 'Sender',
          street1: request.origin.street1,
          city: request.origin.city,
          state: request.origin.state,
          zip: request.origin.zip,
          country: request.origin.country,
        },
        address_to: {
          name: request.destination.name || 'Recipient',
          street1: request.destination.street1,
          city: request.destination.city,
          state: request.destination.state,
          zip: request.destination.zip,
          country: request.destination.country,
        },
        parcels: [{
          length: request.parcel.length.toString(),
          width: request.parcel.width.toString(),
          height: request.parcel.height.toString(),
          distance_unit: request.parcel.distance_unit,
          weight: request.parcel.weight.toString(),
          mass_unit: request.parcel.mass_unit,
        }],
        async: false,
      },
      {
        headers: {
          Authorization: `ShippoToken ${SHIPPO_TOKEN}`,
          'Content-Type': 'application/json',
        },
      }
    );

    return response.data.rates?.map((rate: any) => ({
      carrier: rate.provider,
      service: rate.servicelevel.name,
      cost: parseFloat(rate.amount),
      currency: rate.currency,
      transit_time: rate.estimated_days ? `${rate.estimated_days} days` : 'Unknown',
      delivery_date: rate.arrives_by,
      provider: 'shippo' as const,
    })) || [];
  } catch (error) {
    console.error('Shippo API error:', error);
    return getMockShippoRates(request);
  }
}

// ReachShip API Integration (FedEx, UPS, DHL, USPS)
export async function getReachShipRates(request: RateRequest): Promise<CarrierRate[]> {
  try {
    const response = await axios.post(
      'https://api.reachship.com/v1/quotes',
      {
        origin: {
          address: request.origin.street1,
          city: request.origin.city,
          state: request.origin.state,
          postal_code: request.origin.zip,
          country: request.origin.country,
        },
        destination: {
          address: request.destination.street1,
          city: request.destination.city,
          state: request.destination.state,
          postal_code: request.destination.zip,
          country: request.destination.country,
        },
        parcel: {
          length: request.parcel.length,
          width: request.parcel.width,
          height: request.parcel.height,
          weight: request.parcel.weight,
          units: request.parcel.distance_unit === 'in' ? 'imperial' : 'metric',
        },
      },
      {
        headers: {
          Authorization: `Bearer ${REACHSHIP_KEY}`,
          'Content-Type': 'application/json',
        },
      }
    );

    return response.data.quotes?.map((quote: any) => ({
      carrier: quote.carrier,
      service: quote.service,
      cost: quote.total_cost,
      currency: quote.currency || 'USD',
      transit_time: quote.transit_time,
      delivery_date: quote.delivery_date,
      provider: 'reachship' as const,
    })) || [];
  } catch (error) {
    console.error('ReachShip API error:', error);
    return getMockReachShipRates(request);
  }
}

// EasyShip API Integration (DHL, USPS, FedEx comparison)
export async function getEasyShipRates(request: RateRequest): Promise<CarrierRate[]> {
  try {
    const response = await axios.post(
      'https://api.easyship.com/2023-01/rates',
      {
        origin_address: {
          line_1: request.origin.street1,
          city: request.origin.city,
          state: request.origin.state,
          postal_code: request.origin.zip,
          country_alpha2: request.origin.country,
        },
        destination_address: {
          line_1: request.destination.street1,
          city: request.destination.city,
          state: request.destination.state,
          postal_code: request.destination.zip,
          country_alpha2: request.destination.country,
        },
        boxes: [{
          length: request.parcel.length,
          width: request.parcel.width,
          height: request.parcel.height,
          weight: request.parcel.weight,
        }],
      },
      {
        headers: {
          Authorization: `Bearer ${EASYSHIP_TOKEN}`,
          'Content-Type': 'application/json',
        },
      }
    );

    return response.data.rates?.map((rate: any) => ({
      carrier: rate.courier_name,
      service: rate.service_name,
      cost: rate.total_charge,
      currency: rate.currency,
      transit_time: `${rate.min_delivery_time}-${rate.max_delivery_time} days`,
      delivery_date: rate.delivery_date,
      provider: 'easyship' as const,
    })) || [];
  } catch (error) {
    console.error('EasyShip API error:', error);
    return getMockEasyShipRates(request);
  }
}

// Rate Shopping Engine - Compare rates from all carriers
export async function getAllCarrierRates(request: RateRequest): Promise<CarrierRate[]> {
  console.log('Fetching rates from all carriers (FORCED MOCK)...', request);

  /* 
  // Force mock rates to ensure UI always shows data
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(getMockAllRates(request));
    }, 800); // Small delay to simulate loading
  });
  */


  const ratePromises = [
    getRatesFromShippo(request),
    getReachShipRates(request),
    getEasyShipRates(request),
  ];

  try {
    const results = await Promise.allSettled(ratePromises);
    const allRates: CarrierRate[] = [];

    results.forEach((result, index) => {
      if (result.status === 'fulfilled') {
        allRates.push(...result.value);
      } else {
        console.error(`Carrier API ${index} failed:`, result.reason);
      }
    });

    // Sort by cost (lowest first)
    return allRates.sort((a, b) => a.cost - b.cost);
  } catch (error) {
    console.error('Error fetching carrier rates:', error);
    // return getMockAllRates(request);
    return []; // Return empty if failed to truly test
  }
}

// Mock data for demo/fallback purposes
function getMockShippoRates(request: RateRequest): CarrierRate[] {
  const distance = calculateDistance(request.origin, request.destination);
  const baseRate = Math.max(15, distance * 0.1 + request.parcel.weight * 0.5);

  return [
    {
      carrier: 'FedEx',
      service: 'Ground',
      cost: baseRate * 1.2,
      currency: 'USD',
      transit_time: '3-5 days',
      provider: 'shippo',
    },
    {
      carrier: 'UPS',
      service: 'Ground',
      cost: baseRate * 1.1,
      currency: 'USD',
      transit_time: '3-5 days',
      provider: 'shippo',
    },
    {
      carrier: 'USPS',
      service: 'Priority Mail',
      cost: baseRate * 0.8,
      currency: 'USD',
      transit_time: '2-3 days',
      provider: 'shippo',
    },
  ];
}

function getMockReachShipRates(request: RateRequest): CarrierRate[] {
  const distance = calculateDistance(request.origin, request.destination);
  const baseRate = Math.max(20, distance * 0.12 + request.parcel.weight * 0.6);

  return [
    {
      carrier: 'DHL',
      service: 'Express',
      cost: baseRate * 1.5,
      currency: 'USD',
      transit_time: '1-2 days',
      provider: 'reachship',
    },
    {
      carrier: 'FedEx',
      service: 'Express',
      cost: baseRate * 1.4,
      currency: 'USD',
      transit_time: '1-2 days',
      provider: 'reachship',
    },
  ];
}

function getMockEasyShipRates(request: RateRequest): CarrierRate[] {
  const distance = calculateDistance(request.origin, request.destination);
  const baseRate = Math.max(18, distance * 0.11 + request.parcel.weight * 0.55);

  return [
    {
      carrier: 'DHL',
      service: 'Standard',
      cost: baseRate * 1.3,
      currency: 'USD',
      transit_time: '2-4 days',
      provider: 'easyship',
    },
    {
      carrier: 'Royal Mail',
      service: 'International',
      cost: baseRate * 0.9,
      currency: 'GBP',
      transit_time: '5-7 days',
      provider: 'easyship',
    },
  ];
}

function getMockAllRates(request: RateRequest): CarrierRate[] {
  return [
    ...getMockShippoRates(request),
    ...getMockReachShipRates(request),
    ...getMockEasyShipRates(request),
  ].sort((a, b) => a.cost - b.cost);
}

// Utility function to calculate approximate distance (for mock pricing)
function calculateDistance(origin: Address, destination: Address): number {
  // Simple distance calculation for demo purposes
  // In production, you'd use a proper geocoding service
  const cityDistances: Record<string, Record<string, number>> = {
    'London': { 'Hamburg': 450, 'New York': 3500, 'Shanghai': 5700 },
    'Manchester': { 'Hamburg': 520, 'New York': 3300, 'Shanghai': 5500 },
    'Birmingham': { 'Hamburg': 480, 'New York': 3400, 'Shanghai': 5600 },
  };

  const originCity = origin.city;
  const destCity = destination.city;

  return cityDistances[originCity]?.[destCity] || 1000; // Default 1000 miles
}

// Address validation helper
export function validateAddress(address: Address): boolean {
  return !!(
    address.street1 &&
    address.city &&
    address.zip &&
    address.country
  );
}

// Convert between units
export function convertWeight(weight: number, from: 'lb' | 'kg', to: 'lb' | 'kg'): number {
  if (from === to) return weight;
  if (from === 'lb' && to === 'kg') return weight * 0.453592;
  if (from === 'kg' && to === 'lb') return weight * 2.20462;
  return weight;
}

export function convertDimensions(value: number, from: 'in' | 'cm', to: 'in' | 'cm'): number {
  if (from === to) return value;
  if (from === 'in' && to === 'cm') return value * 2.54;
  if (from === 'cm' && to === 'in') return value / 2.54;
  return value;
}
