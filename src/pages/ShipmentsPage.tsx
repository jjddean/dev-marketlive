import React, { useState, useEffect } from 'react';
import MediaCardHeader from '@/components/ui/media-card-header';
import DataTable from '@/components/ui/data-table';
import { Button } from '@/components/ui/button';
import AdvancedSearch from '@/components/ui/advanced-search';
import { LiveVesselMap } from '@/components/ui/live-vessel-map';
import { ShipmentMap } from '@/components/ui/ShipmentMap';
import { useQuery, useAction } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Sparkles, Mail } from "lucide-react";
import { toast } from 'sonner';
import { useUser } from "@clerk/clerk-react";
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription
} from '@/components/ui/sheet';

const ShipmentsPage = () => {
  const { user } = useUser();
  const [activeTab, setActiveTab] = useState('active');
  const [selectedShipment, setSelectedShipment] = useState<any>(null);
  const [sheetMode, setSheetMode] = useState<'details' | 'tracking'>('details');
  const [emailing, setEmailing] = useState(false);

  // Recipient email state (defaults to user logged in email)
  const [recipientEmail, setRecipientEmail] = useState("");

  useEffect(() => {
    if (user?.primaryEmailAddress?.emailAddress) {
      setRecipientEmail(user.primaryEmailAddress.emailAddress);
    }
  }, [user]);

  // Action to send email
  const sendReport = useAction((api as any).reporting.sendShipmentReport);

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

  const liveData = useQuery(api.shipments.listShipments, {});

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
      container: s.trackingNumber,
      progress: (() => {
        try {
          // Calculate progress based on Time Elasped
          const start = s.createdAt || Date.now();
          const end = new Date(s.estimatedDelivery).getTime();
          const now = Date.now();

          if (!end || isNaN(end)) return 25; // Default if no valid ETA
          if (now >= end) return 100;
          if (now <= start) return 5;

          const totalDuration = end - start;
          const elapsed = now - start;
          // Clamp between 5% and 95% while in transit
          const p = Math.round((elapsed / totalDuration) * 100);
          return Math.max(5, Math.min(95, p));
        } catch (e) {
          return 25;
        }
      })()
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
          <Button variant="outline" size="sm" onClick={() => {
            setSheetMode('details');
            setSelectedShipment(row);
          }}>View</Button>
          {activeTab === 'active' && (
            <Button variant="outline" size="sm" onClick={() => {
              setSheetMode('tracking');
              setSelectedShipment(row);
            }}>Track</Button>
          )}
        </div>
      )
    },
  ];

  // --- REPORTING HANDLER ---
  const handleEmailReport = async () => {
    if (!selectedShipment) return;

    // Check local state recipient email, which defaults to user login
    if (!recipientEmail) {
      toast.error("Please enter a recipient email address");
      return;
    }

    const toastId = toast.loading(`Sending report to ${recipientEmail}...`);
    setEmailing(true);

    const seed = selectedShipment.id.split('').reduce((a: any, c: any) => a + c.charCodeAt(0), 0);
    const riskScore = (seed % 100);

    try {
      await sendReport({
        shipmentId: selectedShipment.id,
        email: recipientEmail,
        riskScore
      });
      toast.dismiss(toastId);
      toast.success(`Report sent to ${recipientEmail}`);
    } catch (e: any) {
      toast.dismiss(toastId);
      toast.error("Failed to send report");
      console.error(e);
    } finally {
      setEmailing(false);
    }
  };


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

      <div className="px-4 sm:px-6 lg:px-8 py-8">
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
          <div className="mt-8 space-y-8">
            {/* Visual Progress Trackers */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 flex items-center mb-4">
                <span className="relative flex h-3 w-3 mr-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
                </span>
                Live Fleet Tracking
              </h3>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {(liveData && liveData.filter((s: any) => s.status !== 'Delivered').length > 0) ? (
                  liveData.filter((s: any) => s.status !== 'Delivered').slice(0, 2).map((s: any) => (
                    <LiveVesselMap
                      key={s.shipmentId}
                      shipmentId={s.shipmentId}
                      origin={s.shipmentDetails?.origin || 'Unknown'}
                      destination={s.shipmentDetails?.destination || 'Unknown'}
                      progress={s.progress || Math.floor(Math.random() * 60) + 20}
                    />
                  ))
                ) : (
                  <>
                    <LiveVesselMap shipmentId="SH-2024-001" origin="London, UK" destination="Hamburg, DE" progress={72} />
                    <LiveVesselMap shipmentId="SH-2024-002" origin="Shanghai, CN" destination="Felixstowe, UK" progress={35} />
                  </>
                )}
              </div>
            </div>

            {/* Global Map View */}
            <div className="bg-white p-1 rounded-xl shadow-sm border border-gray-200 h-[500px]">
              <div className="p-4 border-b border-gray-100 flex justify-between items-center">
                <h3 className="font-semibold text-gray-900">Global Fleet Map</h3>
                <span className="text-xs text-gray-500">Real-time GPS Visualization</span>
              </div>
              <div className="h-[440px] w-full rounded-b-lg overflow-hidden relative z-0">
                <ShipmentMap />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Shipment Details & Risk Analysis Sheet */}
      <Sheet open={!!selectedShipment} onOpenChange={(open) => !open && setSelectedShipment(null)}>
        <SheetContent side="right" className="w-[400px] sm:w-[540px] overflow-y-auto p-6">
          <SheetHeader>
            <SheetTitle>
              {sheetMode === 'details' ? 'Shipment Details' : 'Live Tracking & Analysis'}
            </SheetTitle>
            <SheetDescription>
              {sheetMode === 'details'
                ? `Comprehensive manifesto for ${selectedShipment?.id}`
                : `Real-time geospatial insights for ${selectedShipment?.id}`
              }
            </SheetDescription>
          </SheetHeader>

          {selectedShipment && (
            <div className="py-6 space-y-8">

              {/* SHARED: Basic Route Header */}
              <div className="bg-gray-50 p-4 rounded-lg flex justify-between items-center border border-gray-100">
                <div>
                  <div className="text-xs text-gray-500 uppercase tracking-wider">Origin</div>
                  <div className="font-semibold text-gray-900">{selectedShipment.origin}</div>
                </div>
                <div className="text-gray-300">→</div>
                <div className="text-right">
                  <div className="text-xs text-gray-500 uppercase tracking-wider">Destination</div>
                  <div className="font-semibold text-gray-900">{selectedShipment.destination}</div>
                </div>
              </div>

              {/* MODE: DETAILS */}
              {sheetMode === 'details' && (
                <div className="space-y-6">
                  <div className="grid grid-cols-2 gap-y-4 gap-x-8 text-sm">
                    <div>
                      <span className="text-gray-500 block mb-1">Status</span>
                      <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${selectedShipment.status === 'Delivered' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'
                        }`}>{selectedShipment.status}</span>
                    </div>
                    <div>
                      <span className="text-gray-500 block mb-1">Carrier</span>
                      <span className="font-medium text-gray-900">{selectedShipment.carrier}</span>
                    </div>
                    <div>
                      <span className="text-gray-500 block mb-1">Container ID</span>
                      <span className="font-mono text-gray-900">{selectedShipment.container || 'N/A'}</span>
                    </div>
                    <div>
                      <span className="text-gray-500 block mb-1">Value</span>
                      <span className="font-medium text-gray-900">{selectedShipment.value || 'N/A'}</span>
                    </div>
                    <div>
                      <span className="text-gray-500 block mb-1">ETA</span>
                      <span className="font-medium text-gray-900">{selectedShipment.eta || 'Pending'}</span>
                    </div>
                    <div>
                      <span className="text-gray-500 block mb-1">Service Type</span>
                      <span className="font-medium text-gray-900">FCL (Full Container Load)</span>
                    </div>
                  </div>

                  <div className="border-t pt-6">
                    <h4 className="font-semibold mb-4 text-sm">Associated Documents</h4>
                    <div className="space-y-2">
                      {['Bill of Lading', 'Commercial Invoice', 'Packing List'].map(doc => (
                        <div key={doc} className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 cursor-pointer">
                          <div className="flex items-center">
                            <span className="text-lg mr-3">📄</span>
                            <span className="text-sm font-medium text-gray-700">{doc}</span>
                          </div>
                          <span className="text-xs text-blue-600 font-medium">Download</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* MODE: TRACKING */}
              {sheetMode === 'tracking' && (
                <div className="space-y-6">
                  {/* Map Section */}
                  <div className="h-64 w-full rounded-lg overflow-hidden border border-gray-200 relative">
                    <div className="absolute top-2 right-2 bg-white/90 px-2 py-1 rounded text-xs font-bold z-10 shadow-sm">
                      Live Satellite Feed
                    </div>
                    <LiveVesselMap
                      shipmentId={selectedShipment.id}
                      origin={selectedShipment.origin}
                      destination={selectedShipment.destination}
                      progress={selectedShipment.progress || 45}
                    />
                  </div>

                  {/* AI Risk Analysis Widget */}
                  <div className="bg-slate-50 p-6 rounded-xl border border-slate-200">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-sm font-semibold text-slate-900 flex items-center">
                        <Sparkles className="w-4 h-4 text-purple-600 mr-2" />
                        Predictive Risk Analysis
                      </h3>
                      <span className="text-xs text-slate-500">Confidence: 94%</span>
                    </div>

                    <RiskMeter shipmentId={selectedShipment.id} />

                    <div className="mt-4 space-y-3">
                      <h4 className="text-xs font-medium text-gray-500 uppercase tracking-wide">Risk Factors Detected</h4>
                      <div className="flex items-start space-x-3 text-sm bg-white p-3 rounded-lg border border-slate-100 shadow-sm">
                        <div className="mt-0.5">⚠️</div>
                        <div>
                          <p className="font-medium text-slate-800">Port Congestion at {selectedShipment.destination.split(',')[0]}</p>
                          <p className="text-slate-500 text-xs mt-0.5">Average dwell time increased by 48h in last 2 days.</p>
                        </div>
                      </div>
                      <div className="flex items-start space-x-3 text-sm bg-white p-3 rounded-lg border border-slate-100 shadow-sm">
                        <div className="mt-0.5">🌦️</div>
                        <div>
                          <p className="font-medium text-slate-800">Weather Alert: Atlantic Route</p>
                          <p className="text-slate-500 text-xs mt-0.5">Minor deviation expected due to storm front.</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Share Analysis Section */}
                  <div className="space-y-3 pt-4 border-t border-gray-100">
                    <Label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                      Share Analysis Report
                    </Label>
                    <div className="flex w-full items-center space-x-2">
                      <Input
                        type="email"
                        placeholder="recipient@example.com"
                        value={recipientEmail}
                        onChange={(e) => setRecipientEmail(e.target.value)}
                        className="h-10"
                      />
                      <Button
                        className="h-10 px-4 shrink-0"
                        onClick={handleEmailReport}
                        disabled={emailing}
                      >
                        {emailing ? (
                          <span className="w-4 h-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                        ) : (
                          <Mail className="w-4 h-4" />
                        )}
                        <span className="ml-2 hidden sm:inline">Send</span>
                      </Button>
                    </div>
                    <p className="text-[10px] text-gray-400">
                      Export this live risk assessment to clients or stakeholders.
                    </p>
                  </div>
                </div>
              )}

            </div>
          )}
        </SheetContent>
      </Sheet>

    </div>
  );
};

// Simple Risk Meter Component
function RiskMeter({ shipmentId }: { shipmentId: string }) {
  // Deterministic random based on ID char codes
  const seed = shipmentId.split('').reduce((a, c) => a + c.charCodeAt(0), 0);
  const riskScore = (seed % 100);

  let level = 'Low';
  let color = 'bg-green-500';
  let text = 'text-green-700';
  let bg = 'bg-green-50';

  if (riskScore > 40) {
    level = 'Medium';
    color = 'bg-yellow-500';
    text = 'text-yellow-700';
    bg = 'bg-yellow-50';
  }
  if (riskScore > 75) {
    level = 'High';
    color = 'bg-red-500';
    text = 'text-red-700';
    bg = 'bg-red-50';
  }

  return (
    <div className="space-y-2">
      <div className="flex justify-between items-end">
        <span className={`text-2xl font-bold ${text}`}>{riskScore}%</span>
        <span className={`px-2 py-1 rounded text-xs font-medium ${bg} ${text}`}>{level} Risk</span>
      </div>
      <div className="h-2 w-full bg-gray-200 rounded-full overflow-hidden">
        <div
          className={`h-full ${color} transition-all duration-1000 ease-out`}
          style={{ width: `${riskScore}%` }}
        />
      </div>
    </div>
  )
}

export default ShipmentsPage;
