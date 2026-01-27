import React, { useState, useEffect } from 'react';
import { SUPPORTED_PORTS } from '@/lib/ports';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import LiveRateComparison from '@/components/shipping/LiveRateComparison';
import { type RateRequest, type CarrierRate } from '@/services/carriers';
import { CO2Badge } from '@/components/ui/co2-badge';
import { LandedCostTool } from '@/components/ui/landed-cost-tool';
import {
  quoteStep1Schema,
  quoteStep2Schema,
  quoteStep3Schema,
  quoteStep4Schema
} from '@/lib/validation/quoteSchema';
import { z } from 'zod';

interface QuoteFormData {
  origin: string;
  destination: string;
  serviceType: string;
  cargoType: string;
  weight: string;
  dimensions: {
    length: string;
    width: string;
    height: string;
  };
  value: string;
  incoterms: string;
  urgency: string;
  additionalServices: string[];
  contactInfo: {
    name: string;
    email: string;
    phone: string;
    company: string;
  };
  selectedRate?: CarrierRate;
  rates?: CarrierRate[];
}

interface QuoteRequestFormProps {
  onSubmit: (data: QuoteFormData) => void;
  onCancel: () => void;
  initialStep?: number;
  onStepChange?: (step: number) => void;
}

const QuoteRequestForm: React.FC<QuoteRequestFormProps> = ({ onSubmit, onCancel, initialStep = 1, onStepChange }) => {
  const [formData, setFormData] = useState<QuoteFormData>(() => {
    const saved = localStorage.getItem('quoteFormDraft');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { console.error(e); }
    }
    return {
      origin: 'Shanghai',
      destination: 'London',
      serviceType: 'ocean',
      cargoType: 'general',
      weight: '1000',
      dimensions: { length: '120', width: '100', height: '100' },
      value: '5000',
      incoterms: 'FOB',
      urgency: 'standard',
      additionalServices: [],
      contactInfo: { name: 'Test Demo', email: 'demo@marketlive.com', phone: '555-0123', company: 'Demo Corp' }
    };
  });

  useEffect(() => {
    localStorage.setItem('quoteFormDraft', JSON.stringify(formData));
  }, [formData]);

  const [errors, setErrors] = useState<Record<string, string>>({});

  const [currentStep, setCurrentStep] = useState(initialStep);
  const [selectedRate, setSelectedRate] = useState<CarrierRate | null>(null);
  const totalSteps = 5; // Added rate comparison step

  const rateRequest = React.useMemo<RateRequest>(() => ({
    origin: {
      street1: '123 Business St',
      city: formData.origin.split(', ')[0] || 'London',
      state: '',
      zip: 'SW1A 1AA',
      country: 'GB',
    },
    destination: {
      street1: '456 Commerce Ave',
      city: formData.destination.split(', ')[0] || 'Hamburg',
      state: '',
      zip: '20095',
      country: formData.destination.includes('DE') ? 'DE' :
        formData.destination.includes('US') ? 'US' :
          formData.destination.includes('CN') ? 'CN' : 'DE',
    },
    parcel: {
      length: parseFloat(formData.dimensions.length) || 40,
      width: parseFloat(formData.dimensions.width) || 30,
      height: parseFloat(formData.dimensions.height) || 20,
      distance_unit: 'cm',
      weight: parseFloat(formData.weight) || 100,
      mass_unit: 'kg',
    },
  }), [formData.origin, formData.destination, formData.dimensions, formData.weight]);

  const handleRateSelect = (rate: CarrierRate) => {
    setSelectedRate(rate);
  };

  const handleBookRate = React.useCallback((rate: CarrierRate, allRates?: CarrierRate[]) => {
    setSelectedRate(rate);
    onSubmit({
      ...formData,
      selectedRate: rate,
      rates: allRates || formData.rates || []
    });
  }, [formData, onSubmit]);

  const handleInputChange = (field: string, value: string) => {
    if (field.includes('.')) {
      const [parent, child] = field.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...(prev[parent as keyof QuoteFormData] as any),
          [child]: value
        }
      }));
    } else {
      setFormData(prev => ({ ...prev, [field]: value }));
    }
    // Clear error for this field
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const handleServiceToggle = (service: string) => {
    setFormData(prev => ({
      ...prev,
      additionalServices: prev.additionalServices.includes(service)
        ? prev.additionalServices.filter(s => s !== service)
        : [...prev.additionalServices, service]
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (currentStep < totalSteps) {
      nextStep();
      return;
    }
    onSubmit({
      ...formData,
      selectedRate: selectedRate || undefined
    });
  };

  const validateStep = (step: number) => {
    try {
      if (step === 1) {
        quoteStep1Schema.parse(formData);
      } else if (step === 2) {
        quoteStep2Schema.parse(formData);
      } else if (step === 4) {
        quoteStep4Schema.parse(formData);
      }
      setErrors({});
      return true;
    } catch (error: any) {
      // Safe error handling to prevent crash
      const newErrors: Record<string, string> = {};
      if (error && typeof error === 'object' && Array.isArray(error.errors)) {
        error.errors.forEach((err: any) => {
          if (err.path && err.message) {
            const path = err.path.join('.');
            newErrors[path] = err.message;
          }
        });
        setErrors(newErrors);
      }
      return false;
    }
  };

  const nextStep = () => {
    if (validateStep(currentStep)) {
      const next = Math.min(currentStep + 1, totalSteps);
      setCurrentStep(next);
      onStepChange?.(next);
    } else {
      toast.error("Please fill in all required fields correctly.");
    }
  };
  const prevStep = () => {
    const prev = Math.max(currentStep - 1, 1);
    setCurrentStep(prev);
    onStepChange?.(prev);
    setErrors({}); // Clear errors when going back
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Shipment Details</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Origin</label>
                <select
                  value={formData.origin}
                  onChange={(e) => handleInputChange('origin', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                >
                  <option value="">Select origin</option>
                  {SUPPORTED_PORTS.map(port => (
                    <option key={port} value={port}>{port}</option>
                  ))}
                </select>
                {errors.origin && <p className="text-red-500 text-xs mt-1">{errors.origin}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Destination</label>
                <select
                  value={formData.destination}
                  onChange={(e) => handleInputChange('destination', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                >
                  <option value="">Select destination</option>
                  {SUPPORTED_PORTS.map(port => (
                    <option key={port} value={port}>{port}</option>
                  ))}
                </select>
                {errors.destination && <p className="text-red-500 text-xs mt-1">{errors.destination}</p>}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Service Type</label>
                <select
                  value={formData.serviceType}
                  onChange={(e) => handleInputChange('serviceType', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                >
                  <option value="ocean">Ocean Freight</option>
                  <option value="air">Air Freight</option>
                  <option value="road">Road Transport</option>
                  <option value="rail">Rail Transport</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Cargo Type</label>
                <select
                  value={formData.cargoType}
                  onChange={(e) => handleInputChange('cargoType', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                >
                  <option value="general">General Cargo</option>
                  <option value="dangerous">Dangerous Goods</option>
                  <option value="perishable">Perishable</option>
                  <option value="oversized">Oversized</option>
                  <option value="fragile">Fragile</option>
                </select>
              </div>

            </div>
          </div >
        );

      case 2:
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Cargo Specifications</h3>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Total Weight (kg)</label>
              <input
                type="number"
                value={formData.weight}
                onChange={(e) => handleInputChange('weight', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                placeholder="Enter weight in kg"
              />
              {errors.weight && <p className="text-red-500 text-xs mt-1">{errors.weight}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Dimensions (cm)</label>
              <div className="grid grid-cols-3 gap-4">
                <input
                  type="number"
                  value={formData.dimensions.length}
                  onChange={(e) => handleInputChange('dimensions.length', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  placeholder="Length"
                />
                <input
                  type="number"
                  value={formData.dimensions.width}
                  onChange={(e) => handleInputChange('dimensions.width', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  placeholder="Width"
                />
                <input
                  type="number"
                  value={formData.dimensions.height}
                  onChange={(e) => handleInputChange('dimensions.height', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  placeholder="Height"
                />
              </div>
              {(errors['dimensions.length'] || errors['dimensions.width'] || errors['dimensions.height']) && (
                <p className="text-red-500 text-xs mt-1">All dimensions are required and must be valid numbers</p>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Cargo Value (£)</label>
                <input
                  type="number"
                  value={formData.value}
                  onChange={(e) => handleInputChange('value', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  placeholder="Enter cargo value"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Incoterms</label>
                <select
                  value={formData.incoterms}
                  onChange={(e) => handleInputChange('incoterms', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                >
                  <option value="EXW">EXW - Ex Works</option>
                  <option value="FOB">FOB - Free on Board</option>
                  <option value="CIF">CIF - Cost, Insurance & Freight</option>
                  <option value="DDP">DDP - Delivered Duty Paid</option>
                </select>
              </div>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Service Options</h3>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Urgency</label>
              <div className="space-y-2">
                {[
                  { value: 'standard', label: 'Standard (7-14 days)', price: 'Standard pricing' },
                  { value: 'express', label: 'Express (3-7 days)', price: '+25% premium' },
                  { value: 'urgent', label: 'Urgent (1-3 days)', price: '+50% premium' }
                ].map((option) => (
                  <label key={option.value} className="flex items-center space-x-3 p-3 border border-gray-200 rounded-md hover:bg-gray-50 cursor-pointer">
                    <input
                      type="radio"
                      name="urgency"
                      value={option.value}
                      checked={formData.urgency === option.value}
                      onChange={(e) => handleInputChange('urgency', e.target.value)}
                      className="text-primary focus:ring-primary"
                    />
                    <div className="flex-1">
                      <div className="font-medium text-gray-900">{option.label}</div>
                      <div className="text-sm text-gray-500">{option.price}</div>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Additional Services</label>
              <div className="space-y-2">
                {[
                  { value: 'insurance', label: 'Cargo Insurance', desc: 'Full coverage for cargo value' },
                  { value: 'customs', label: 'Customs Clearance', desc: 'Complete customs handling' },
                  { value: 'packaging', label: 'Professional Packaging', desc: 'Export-grade packaging' },
                  { value: 'tracking', label: 'Premium Tracking', desc: 'Real-time GPS tracking' }
                ].map((service) => (
                  <label key={service.value} className="flex items-center space-x-3 p-3 border border-gray-200 rounded-md hover:bg-gray-50 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.additionalServices.includes(service.value)}
                      onChange={() => handleServiceToggle(service.value)}
                      className="text-primary focus:ring-primary"
                    />
                    <div className="flex-1">
                      <div className="font-medium text-gray-900">{service.label}</div>
                      <div className="text-sm text-gray-500">{service.desc}</div>
                    </div>
                  </label>
                ))}
              </div>
            </div>
          </div>
        );



      case 4:
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Contact Information</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Full Name *</label>
                <input
                  type="text"
                  value={formData.contactInfo.name}
                  onChange={(e) => handleInputChange('contactInfo.name', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  placeholder="Enter your full name"
                  required
                />
                {errors['contactInfo.name'] && <p className="text-red-500 text-xs mt-1">{errors['contactInfo.name']}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Company</label>
                <input
                  type="text"
                  value={formData.contactInfo.company}
                  onChange={(e) => handleInputChange('contactInfo.company', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  placeholder="Enter company name"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Email Address *</label>
                <input
                  type="email"
                  value={formData.contactInfo.email}
                  onChange={(e) => handleInputChange('contactInfo.email', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  placeholder="Enter email address"
                  required
                />
                {errors['contactInfo.email'] && <p className="text-red-500 text-xs mt-1">{errors['contactInfo.email']}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
                <input
                  type="tel"
                  value={formData.contactInfo.phone}
                  onChange={(e) => handleInputChange('contactInfo.phone', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  placeholder="Enter phone number"
                />
              </div>
            </div>
          </div>
        );

      case 5:
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Live Shipping Rates</h3>
            <p className="text-sm text-gray-600 mb-6">
              Compare live rates from multiple carriers for your shipment.
            </p>

            <LiveRateComparison
              rateRequest={rateRequest}
              onRateSelect={handleRateSelect}
              onBook={handleBookRate}
              onRatesFetched={(rates) => {
                setFormData(prev => ({ ...prev, rates }));
              }}
            />
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 pb-24">
      {/* Progress Bar */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-700">Step {currentStep} of {totalSteps}</span>
          <span className="text-sm text-gray-500">{Math.round((currentStep / totalSteps) * 100)}% Complete</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-primary h-2 rounded-full transition-all duration-300"
            style={{ width: `${(currentStep / totalSteps) * 100}%` }}
          />
        </div>
      </div>

      {/* Form Content */}
      <div className="mb-8">
        {renderStep()}
      </div>

      {/* Navigation Buttons */}
      <div className="flex justify-between pt-6 border-t border-gray-200 mt-8 bg-white">
        <div>
          {currentStep > 1 && (
            <Button type="button" variant="outline" onClick={prevStep}>
              Previous
            </Button>
          )}
        </div>

        <div className="flex space-x-3">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>

          {currentStep < totalSteps ? (
            <Button type="button" onClick={nextStep}>
              Next
            </Button>
          ) : currentStep === totalSteps ? null : (
            <Button type="submit">
              Submit Quote Request
            </Button>
          )}
        </div>
      </div>
    </form>
  );
};

export default QuoteRequestForm;
