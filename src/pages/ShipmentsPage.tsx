import React, { useState, useEffect } from 'react';
import MediaCardHeader from '@/components/ui/media-card-header';
import DataTable from '@/components/ui/data-table';
import { Button } from '@/components/ui/button';
import Footer from '@/components/layout/Footer';
import AdvancedSearch from '@/components/ui/advanced-search';
import RealTimeTracker from '@/components/ui/real-time-tracker';
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";

const ShipmentsPage = () => {
  const [activeTab, setActiveTab] = useState('active');

  // Hardcoded fallback data
  const HARDCODED_SHIPMENTS = {
    active: [
      {
        id: 'SH-2024-001',
        origin: 'London, UK',
        destination: 'Hamburg, DE',
        status: 'In Transit',
        eta: '2024-08-05',
        carrier: 'Maersk Line',
        value: '$12,450',
        container: 'MSKU-123456-7'
      },
      {
        id: 'SH-2024-002',
        origin: 'Shanghai, CN',
        destination: 'Felixstowe, UK',
        status: 'Customs Clearance',
        eta: '2024-08-03',
        carrier: 'COSCO Shipping',
        value: '$8,750',
        container: 'COSU-789012-3'
      },
      {
        id: 'SH-2024-004',
        origin: 'Rotterdam, NL',
        destination: 'Singapore, SG',
        status: 'Loading',
        eta: '2024-08-12',
        carrier: 'MSC',
        value: '$18,900',
        container: 'MSCU-345678-9'
      },
      {
        id: 'SH-2024-005',
        origin: 'Miami, US',
        destination: 'Southampton, UK',
        status: 'Booking Confirmed',
        eta: '2024-08-15',
        carrier: 'Hapag-Lloyd',
        value: '$22,100',
        container: 'HLCU-901234-5'
      },
    ],
    completed: [
      {
        id: 'SH-2024-003',
        origin: 'Hamburg, DE',
        destination: 'Dubai, AE',
        status: 'Delivered',
        eta: '2024-07-28',
        carrier: 'Emirates Shipping',
        value: '$15,200',
        container: 'EMSU-567890-1'
      },
      {
        id: 'SH-2024-006',
        origin: 'Tokyo, JP',
        destination: 'Long Beach, US',
        status: 'Delivered',
        eta: '2024-07-20',
        carrier: 'ONE',
        value: '$19,800',
        container: 'ONEU-234567-8'
      },
    ]
  };

  const liveData = useQuery(api.shipments.listShipments, { onlyMine: true });

  // State for filtering - initialized with fallback, updated via effect
  const [filteredShipments, setFilteredShipments] = useState(HARDCODED_SHIPMENTS);

  // Sync live data to state when it arrives
  useEffect(() => {
    if (liveData && liveData.length > 0) {
      const formatted = {
        active: liveData.filter((s: any) => s.status !== 'Delivered').map((s: any) => ({
          id: s.shipmentId,
          origin: s.shipmentDetails?.origin || '',
          destination: s.shipmentDetails?.destination || '',
          status: s.status,
          eta: s.estimatedDelivery,
          carrier: s.carrier,
          value: s.shipmentDetails?.value || '',
          container: s.trackingNumber
        })),
        completed: liveData.filter((s: any) => s.status === 'Delivered').map((s: any) => ({
          id: s.shipmentId,
          origin: s.shipmentDetails?.origin || '',
          destination: s.shipmentDetails?.destination || '',
          status: s.status,
          eta: s.estimatedDelivery,
          carrier: s.carrier,
          value: s.shipmentDetails?.value || '',
          container: s.trackingNumber
        }))
      };
      setFilteredShipments(formatted);
    }
  }, [liveData]);

  // Helper to get current source of truth for filtering logic
  const currentShipments = (liveData && liveData.length > 0) ? {
    active: liveData.filter((s: any) => s.status !== 'Delivered').map((s: any) => ({
      id: s.shipmentId,
      origin: s.shipmentDetails?.origin || '',
      destination: s.shipmentDetails?.destination || '',
      status: s.status,
      eta: s.estimatedDelivery,
      carrier: s.carrier,
      value: s.shipmentDetails?.value || '',
      container: s.trackingNumber
    })),
    completed: liveData.filter((s: any) => s.status === 'Delivered').map((s: any) => ({
      id: s.shipmentId,
      origin: s.shipmentDetails?.origin || '',
      destination: s.shipmentDetails?.destination || '',
      status: s.status,
      eta: s.estimatedDelivery,
      carrier: s.carrier,
      value: s.shipmentDetails?.value || '',
      container: s.trackingNumber
    }))
  } : HARDCODED_SHIPMENTS;


  // Search filters configuration
  const searchFilters = [
    {
      key: 'carrier',
      label: 'Carrier',
      type: 'select' as const,
      options: [
        { value: 'Maersk Line', label: 'Maersk Line', count: 1 },
        { value: 'COSCO Shipping', label: 'COSCO Shipping', count: 1 },
        { value: 'MSC', label: 'MSC', count: 1 },
        { value: 'Hapag-Lloyd', label: 'Hapag-Lloyd', count: 1 },
        { value: 'ONE', label: 'ONE', count: 1 },
        { value: 'Emirates Shipping', label: 'Emirates Shipping', count: 1 }
      ]
    },
    {
      key: 'status',
      label: 'Status',
      type: 'multiselect' as const,
      options: [
        { value: 'In Transit', label: 'In Transit', count: 1 },
        { value: 'Customs Clearance', label: 'Customs Clearance', count: 1 },
        { value: 'Loading', label: 'Loading', count: 1 },
        { value: 'Booking Confirmed', label: 'Booking Confirmed', count: 1 },
        { value: 'Delivered', label: 'Delivered', count: 2 }
      ]
    },
    {
      key: 'value',
      label: 'Shipment Value (£)',
      type: 'range' as const
    },
    {
      key: 'eta',
      label: 'ETA',
      type: 'date' as const
    }
  ];

  const handleSearch = (searchTerm: string, filters: Record<string, any>) => {
    let filtered = { ...currentShipments };

    // Apply search term
    if (searchTerm) {
      Object.keys(filtered).forEach(tab => {
        filtered[tab as keyof typeof filtered] = filtered[tab as keyof typeof filtered].filter(shipment =>
          Object.values(shipment).some(value =>
            String(value).toLowerCase().includes(searchTerm.toLowerCase())
          )
        );
      });
    }

    // Apply filters
    Object.keys(filtered).forEach(tab => {
      filtered[tab as keyof typeof filtered] = filtered[tab as keyof typeof filtered].filter(shipment => {
        return Object.entries(filters).every(([key, value]) => {
          if (!value) return true;

          switch (key) {
            case 'carrier':
              return shipment.carrier === value;
            case 'status':
              return Array.isArray(value) ? value.includes(shipment.status) : shipment.status === value;
            case 'value':
              const shipmentValue = parseFloat(shipment.value.replace(/[£$,]/g, ''));
              const min = value.min ? parseFloat(value.min) : 0;
              const max = value.max ? parseFloat(value.max) : Infinity;
              return shipmentValue >= min && shipmentValue <= max;
            case 'eta':
              return shipment.eta === value;
            default:
              return true;
          }
        });
      });
    });

    setFilteredShipments(filtered);
  };

  const handleClearSearch = () => {
    setFilteredShipments(currentShipments);
  };

  const shipmentColumns = [
    { key: 'id' as keyof typeof filteredShipments.active[0], header: 'Shipment ID', sortable: true },
    {
      key: 'origin' as keyof typeof filteredShipments.active[0],
      header: 'Route',
      sortable: true,
      render: (value: string, row: typeof filteredShipments.active[0]) => (
        <span className="text-sm">
          <div className="font-medium">{row.origin}</div>
          <div className="text-gray-500">→ {row.destination}</div>
        </span>
      )
    },
    { key: 'carrier' as keyof typeof filteredShipments.active[0], header: 'Carrier', sortable: true },
    {
      key: 'status' as keyof typeof filteredShipments.active[0],
      header: 'Status',
      sortable: true,
      render: (value: string) => (
        <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${value === 'Delivered' ? 'bg-green-100 text-green-800' :
          value === 'In Transit' ? 'bg-blue-100 text-blue-800' :
            value === 'Customs Clearance' ? 'bg-yellow-100 text-yellow-800' :
              value === 'Loading' ? 'bg-purple-100 text-purple-800' :
                value === 'Booking Confirmed' ? 'bg-gray-100 text-gray-800' :
                  'bg-gray-100 text-gray-800'
          }`}>
          {value}
        </span>
      )
    },
    { key: 'eta' as keyof typeof filteredShipments.active[0], header: 'ETA', sortable: true },
    { key: 'value' as keyof typeof filteredShipments.active[0], header: 'Value', sortable: true },
    {
      key: 'container' as keyof typeof filteredShipments.active[0],
      header: 'Actions',
      render: (value: string, row: typeof filteredShipments.active[0]) => (
        <div className="flex space-x-2">
          <Button variant="outline" size="sm">View</Button>
          {activeTab === 'active' && (
            <Button variant="outline" size="sm">Track</Button>
          )}
        </div>
      )
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Shipments Header */}
      <MediaCardHeader
        title="Active Shipments"
        subtitle="Logistics Management"
        description="Monitor your global shipments with real-time tracking and comprehensive logistics oversight."
        backgroundImage="https://images.unsplash.com/photo-1578662996442-48f60103fc96?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80"
        overlayOpacity={0.6}
        className="h-20"
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Tab Navigation */}
        <div className="mb-6">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              <button
                onClick={() => setActiveTab('active')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${activeTab === 'active'
                  ? 'border-primary text-primary'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
              >
                Active Shipments ({filteredShipments.active.length})
              </button>
              <button
                onClick={() => setActiveTab('completed')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${activeTab === 'completed'
                  ? 'border-primary text-primary'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
              >
                Completed Shipments ({filteredShipments.completed.length})
              </button>
            </nav>
          </div>
        </div>

        {/* Advanced Search */}
        <div className="mb-6">
          <AdvancedSearch
            filters={searchFilters}
            onSearch={handleSearch}
            onClear={handleClearSearch}
            placeholder="Search shipments by ID, route, carrier, or container..."
          />
        </div>

        {/* Actions Bar */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-gray-900">
            {activeTab === 'active' ? 'Active' : 'Completed'} Shipments
            <span className="text-sm text-gray-500 ml-2">
              ({filteredShipments[activeTab as keyof typeof filteredShipments].length} results)
            </span>
          </h2>
          <div className="flex space-x-3">
            <Button variant="outline">Export</Button>
            <Button>New Shipment</Button>
          </div>
        </div>

        {/* Shipments Table */}
        <DataTable
          data={filteredShipments[activeTab as keyof typeof filteredShipments]}
          columns={shipmentColumns}
          searchPlaceholder="Search within results..."
          rowsPerPage={10}
        />

        {/* Real-Time Tracking for Active Shipments */}
        {activeTab === 'active' && (
          <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-6">
            {(liveData && liveData.filter((s: any) => s.status !== 'Delivered').length > 0) ? (
              liveData.filter((s: any) => s.status !== 'Delivered').slice(0, 2).map((s: any) => (
                <RealTimeTracker key={s.shipmentId} shipmentId={s.shipmentId} />
              ))
            ) : (
              <>
                <RealTimeTracker shipmentId="SH-2024-001" />
                <RealTimeTracker shipmentId="SH-2024-002" />
              </>
            )}
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
};

export default ShipmentsPage;