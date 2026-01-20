import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import Footer from '@/components/layout/Footer';

const ApiDocsPage: React.FC = () => {
  const [activeEndpoint, setActiveEndpoint] = useState('shipments');

  const endpoints = {
    shipments: {
      title: 'Shipments API',
      description: 'Manage and track your freight shipments',
      methods: [
        {
          method: 'GET',
          path: '/api/v1/shipments',
          description: 'Retrieve all shipments',
          parameters: [
            { name: 'status', type: 'string', description: 'Filter by shipment status' },
            { name: 'carrier', type: 'string', description: 'Filter by carrier' },
            { name: 'limit', type: 'number', description: 'Number of results to return' }
          ],
          response: `{
  "data": [
    {
      "id": "SH-2024-001",
      "origin": "London, UK",
      "destination": "Hamburg, DE",
      "status": "in-transit",
      "eta": "2024-08-05T14:30:00Z",
      "carrier": "Maersk Line",
      "container": "MSKU-123456-7"
    }
  ],
  "success": true,
  "total": 1
}`
        },
        {
          method: 'POST',
          path: '/api/v1/shipments',
          description: 'Create a new shipment',
          body: `{
  "origin": "London, UK",
  "destination": "Hamburg, DE",
  "serviceType": "ocean",
  "cargoDetails": {
    "weight": 1000,
    "dimensions": {
      "length": 120,
      "width": 80,
      "height": 90
    }
  }
}`,
          response: `{
  "data": {
    "id": "SH-2024-002",
    "status": "booking-confirmed"
  },
  "success": true
}`
        }
      ]
    },
    tracking: {
      title: 'Tracking API',
      description: 'Real-time shipment tracking and location updates',
      methods: [
        {
          method: 'GET',
          path: '/api/v1/shipments/{id}/tracking',
          description: 'Get tracking events for a shipment',
          response: `{
  "data": [
    {
      "timestamp": "2024-08-01T09:15:00Z",
      "location": "London, UK",
      "status": "departed",
      "description": "Container loaded and departed",
      "coordinates": {
        "lat": 51.5074,
        "lng": -0.1278
      }
    }
  ],
  "success": true
}`
        }
      ]
    },
    quotes: {
      title: 'Quotes API',
      description: 'Request and manage freight quotes',
      methods: [
        {
          method: 'POST',
          path: '/api/v1/quotes',
          description: 'Request a freight quote',
          body: `{
  "origin": "London, UK",
  "destination": "Hamburg, DE",
  "serviceType": "ocean",
  "cargoType": "general",
  "weight": 1000,
  "urgency": "standard"
}`,
          response: `{
  "data": {
    "quoteId": "QT-2024-001",
    "totalCost": 2450.00,
    "currency": "GBP",
    "transitTime": "7-10 business days",
    "validUntil": "2024-08-08T23:59:59Z"
  },
  "success": true
}`
        }
      ]
    }
  };

  const renderMethod = (method: any, index: number) => (
    <div key={index} className="border border-gray-200 rounded-lg p-6 mb-6">
      <div className="flex items-center space-x-3 mb-4">
        <span className={`px-3 py-1 text-xs font-medium rounded-full ${method.method === 'GET' ? 'bg-green-100 text-green-800' :
          method.method === 'POST' ? 'bg-blue-100 text-blue-800' :
            method.method === 'PUT' ? 'bg-yellow-100 text-yellow-800' :
              'bg-red-100 text-red-800'
          }`}>
          {method.method}
        </span>
        <code className="text-sm font-mono bg-gray-100 px-2 py-1 rounded">
          {method.path}
        </code>
      </div>

      <p className="text-gray-700 mb-4">{method.description}</p>

      {method.parameters && (
        <div className="mb-4">
          <h4 className="text-sm font-medium text-gray-900 mb-2">Parameters</h4>
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-2">Name</th>
                  <th className="text-left py-2">Type</th>
                  <th className="text-left py-2">Description</th>
                </tr>
              </thead>
              <tbody>
                {method.parameters.map((param: any, i: number) => (
                  <tr key={i} className="border-b border-gray-100">
                    <td className="py-2 font-mono text-xs">{param.name}</td>
                    <td className="py-2 text-gray-600">{param.type}</td>
                    <td className="py-2 text-gray-700">{param.description}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {method.body && (
        <div className="mb-4">
          <h4 className="text-sm font-medium text-gray-900 mb-2">Request Body</h4>
          <pre className="bg-gray-900 text-green-400 p-4 rounded-lg text-xs overflow-x-auto">
            <code>{method.body}</code>
          </pre>
        </div>
      )}

      <div>
        <h4 className="text-sm font-medium text-gray-900 mb-2">Response</h4>
        <pre className="bg-gray-900 text-green-400 p-4 rounded-lg text-xs overflow-x-auto">
          <code>{method.response}</code>
        </pre>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <h1 className="text-3xl font-bold text-gray-900">API Documentation</h1>
          <p className="mt-2 text-lg text-gray-600">
            Integrate MarketLive freight services into your applications
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar Navigation */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg border border-gray-200 p-6 sticky top-8">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Endpoints</h3>
              <nav className="space-y-2">
                {Object.entries(endpoints).map(([key, endpoint]) => (
                  <button
                    key={key}
                    onClick={() => setActiveEndpoint(key)}
                    className={`w-full text-left px-3 py-2 rounded-md text-sm transition-colors ${activeEndpoint === key
                      ? 'bg-primary text-white'
                      : 'text-gray-700 hover:bg-gray-100'
                      }`}
                  >
                    {endpoint.title}
                  </button>
                ))}
              </nav>

              <div className="mt-8 pt-6 border-t border-gray-200">
                <h4 className="text-sm font-medium text-gray-900 mb-3">Quick Start</h4>
                <div className="space-y-3">
                  <div>
                    <p className="text-xs text-gray-600 mb-1">Base URL</p>
                    <code className="text-xs bg-gray-100 px-2 py-1 rounded block">
                      https://api.marketlive.freight
                    </code>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600 mb-1">Authentication</p>
                    <code className="text-xs bg-gray-100 px-2 py-1 rounded block">
                      Bearer YOUR_API_KEY
                    </code>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-lg border border-gray-200 p-8">
              <div className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  {endpoints[activeEndpoint as keyof typeof endpoints].title}
                </h2>
                <p className="text-gray-600">
                  {endpoints[activeEndpoint as keyof typeof endpoints].description}
                </p>
              </div>

              {endpoints[activeEndpoint as keyof typeof endpoints].methods.map(renderMethod)}

              {/* Code Examples */}
              <div className="mt-8 pt-8 border-t border-gray-200">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Code Examples</h3>

                <div className="space-y-6">
                  <div>
                    <h4 className="text-sm font-medium text-gray-900 mb-2">JavaScript (Fetch)</h4>
                    <pre className="bg-gray-900 text-green-400 p-4 rounded-lg text-xs overflow-x-auto">
                      <code>{`fetch('https://api.marketlive.freight/api/v1/shipments', {
  method: 'GET',
  headers: {
    'Authorization': 'Bearer YOUR_API_KEY',
    'Content-Type': 'application/json'
  }
})
.then(response => response.json())
.then(data => console.log(data));`}</code>
                    </pre>
                  </div>

                  <div>
                    <h4 className="text-sm font-medium text-gray-900 mb-2">cURL</h4>
                    <pre className="bg-gray-900 text-green-400 p-4 rounded-lg text-xs overflow-x-auto">
                      <code>{`curl -X GET "https://api.marketlive.freight/api/v1/shipments" \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json"`}</code>
                    </pre>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ApiDocsPage;
