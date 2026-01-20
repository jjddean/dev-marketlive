import React, { useState, useMemo } from 'react';
import MediaCardHeader from '@/components/ui/media-card-header';
import DataTable from '@/components/ui/data-table';
import { Button } from '@/components/ui/button';
import { createCSVUrl } from '@/lib/export';
import { toast } from 'sonner';
import Footer from '@/components/layout/Footer';
import AnalyticsDashboard from '@/components/charts/AnalyticsDashboard';
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";

const ReportsPage = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const downloadRef = React.useRef<HTMLAnchorElement>(null);

  // Live data from Convex for analytics
  const shipments = useQuery(api.shipments.listShipments, {}) || [];
  const quotes = useQuery(api.quotes.listMyQuotes) || [];
  const bookings = useQuery(api.bookings.listMyBookings, {}) || [];

  // Compute live stats
  const liveStats = useMemo(() => ({
    totalShipments: shipments.length,
    totalQuotes: quotes.length,
    totalBookings: bookings.length,
  }), [shipments, quotes, bookings]);

  const recentReports = [
    {
      id: 'RPT-2024-042',
      name: 'Monthly Shipping Summary',
      date: '2024-07-31',
      type: 'Automated',
      status: 'Generated',
      size: '2.4 MB'
    },
    {
      id: 'RPT-2024-041',
      name: 'Route Cost Analysis',
      date: '2024-07-25',
      type: 'Custom',
      status: 'Generated',
      size: '1.8 MB'
    },
    {
      id: 'RPT-2024-040',
      name: 'Carrier Performance',
      date: '2024-07-20',
      type: 'Automated',
      status: 'Generated',
      size: '3.2 MB'
    },
    {
      id: 'RPT-2024-039',
      name: 'Documentation Compliance',
      date: '2024-07-15',
      type: 'Custom',
      status: 'Generated',
      size: '1.1 MB'
    },
  ];

  // Mock data for analytics
  const monthlyShipments = [
    { month: 'Mar', count: 12, value: 45000 },
    { month: 'Apr', count: 19, value: 67000 },
    { month: 'May', count: 15, value: 52000 },
    { month: 'Jun', count: 22, value: 78000 },
    { month: 'Jul', count: 28, value: 95000 },
    { month: 'Aug', count: 10, value: 38000 },
  ];

  const carrierDistribution = [
    { carrier: 'Maersk Line', percentage: 35, shipments: 42 },
    { carrier: 'COSCO Shipping', percentage: 25, shipments: 30 },
    { carrier: 'MSC', percentage: 20, shipments: 24 },
    { carrier: 'Hapag-Lloyd', percentage: 15, shipments: 18 },
    { carrier: 'Others', percentage: 5, shipments: 6 },
  ];

  const reportColumns = [
    { key: 'id' as keyof typeof recentReports[0], header: 'Report ID', sortable: true },
    { key: 'name' as keyof typeof recentReports[0], header: 'Report Name', sortable: true },
    { key: 'date' as keyof typeof recentReports[0], header: 'Generated', sortable: true },
    {
      key: 'type' as keyof typeof recentReports[0],
      header: 'Type',
      sortable: true,
      render: (value: string) => (
        <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${value === 'Automated' ? 'bg-blue-100 text-blue-800' : 'bg-purple-100 text-purple-800'
          }`}>
          {value}
        </span>
      )
    },
    { key: 'size' as keyof typeof recentReports[0], header: 'Size', sortable: true },
    {
      key: 'id' as keyof typeof recentReports[0],
      header: 'Actions',
      render: (value: string, row: any) => (
        <div className="flex space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              // Mock export data for this specific report
              const mockData = [
                { id: row.id, name: row.name, date: row.date, status: row.status, metric: 'Value', value: 12345 },
                { id: row.id, name: row.name, date: row.date, status: row.status, metric: 'Volume', value: 67890 }
              ];
              const url = createCSVUrl(mockData);
              if (url && downloadRef.current) {
                downloadRef.current.href = url;
                downloadRef.current.download = `${row.name.replace(/\s+/g, '_')}_${row.date}.csv`;
                downloadRef.current.click();
                URL.revokeObjectURL(url); // Clean up the object URL
                toast.success(`Downloading ${row.name}...`);
              }
            }}
          >
            Download
          </Button>
          <Button variant="outline" size="sm">View</Button>
        </div>
      )
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Hidden download anchor */}
      <a ref={downloadRef} style={{ display: 'none' }} />
      {/* Reports Header */}
      <MediaCardHeader
        title="Analytics & Reports"
        subtitle="Business Intelligence"
        description="Comprehensive analytics, performance metrics, and detailed reporting for your freight operations."
        backgroundImage="https://images.unsplash.com/photo-1551288049-bebda4e38f71?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80"
        overlayOpacity={0.6}
        className="mb-6"
      />

      <div className="px-4 sm:px-6 lg:px-8 py-8">
        {/* Tab Navigation */}
        <div className="mb-6">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              <button
                onClick={() => setActiveTab('dashboard')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${activeTab === 'dashboard'
                  ? 'border-primary text-primary'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
              >
                Analytics Dashboard
              </button>
              <button
                onClick={() => setActiveTab('reports')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${activeTab === 'reports'
                  ? 'border-primary text-primary'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
              >
                Reports Library
              </button>
              <button
                onClick={() => setActiveTab('custom')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${activeTab === 'custom'
                  ? 'border-primary text-primary'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
              >
                Custom Reports
              </button>
            </nav>
          </div>
        </div>

        {/* Content Sections */}
        {activeTab === 'dashboard' && (
          <AnalyticsDashboard
            data={{
              metrics: [
                { title: 'Total Shipments', value: liveStats.totalShipments.toString(), change: 12, trend: 'up', icon: '📦' },
                { title: 'Active Quotes', value: liveStats.totalQuotes.toString(), change: 5, trend: 'up', icon: '💬' },
                { title: 'Bookings', value: liveStats.totalBookings.toString(), change: -2, trend: 'down', icon: '📅' },
                { title: 'Ontime Performance', value: '94%', change: 1.2, trend: 'up', icon: '⚡' }
              ],
              shipmentData: monthlyShipments.map(d => ({ label: d.month, value: d.count })),
              revenueData: carrierDistribution.map((d, i) => ({
                label: d.carrier,
                value: d.percentage,
                color: ['#0ea5e9', '#22c55e', '#eab308', '#f97316', '#64748b'][i]
              })),
              routeData: [
                { label: 'UK-EU', value: 45, color: '#3b82f6' },
                { label: 'UK-US', value: 30, color: '#22c55e' },
                { label: 'UK-Asia', value: 25, color: '#f59e0b' }
              ]
            }}
          />
        )}
        {activeTab === 'reports' && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold text-gray-900">Reports Library</h2>
              <Button>Generate New Report</Button>
            </div>

            <DataTable
              data={recentReports}
              columns={reportColumns}
              searchPlaceholder="Search reports by name or type..."
              rowsPerPage={10}
            />
          </div>
        )}

        {activeTab === 'custom' && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold text-gray-900">Custom Report Builder</h2>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Create Custom Report</h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Report Name</label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                    placeholder="Enter report name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Date Range</label>
                  <select className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent">
                    <option>Last 30 days</option>
                    <option>Last 90 days</option>
                    <option>Last 6 months</option>
                    <option>Last year</option>
                    <option>Custom range</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Report Type</label>
                  <select className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent">
                    <option>Shipment Summary</option>
                    <option>Financial Analysis</option>
                    <option>Carrier Performance</option>
                    <option>Route Analysis</option>
                    <option>Compliance Report</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Format</label>
                  <select className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent">
                    <option>PDF</option>
                    <option>Excel</option>
                    <option>CSV</option>
                  </select>
                </div>
              </div>

              <div className="mt-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">Filters</label>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Carrier</label>
                    <select className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md">
                      <option>All Carriers</option>
                      <option>Maersk Line</option>
                      <option>COSCO Shipping</option>
                      <option>MSC</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Route</label>
                    <select className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md">
                      <option>All Routes</option>
                      <option>UK-EU</option>
                      <option>UK-US</option>
                      <option>UK-Asia</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Status</label>
                    <select className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md">
                      <option>All Statuses</option>
                      <option>In Transit</option>
                      <option>Delivered</option>
                      <option>Pending</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="mt-6 flex justify-end space-x-3">
                <Button variant="outline">Preview</Button>
                <Button>Generate Report</Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ReportsPage;
