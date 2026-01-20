import React, { useState, useMemo, useEffect } from 'react';
import MediaCardHeader from '@/components/ui/media-card-header';
import DataTable from '@/components/ui/data-table';
import { Button } from '@/components/ui/button';
import { UserProfile } from '@clerk/clerk-react';
import Footer from '@/components/layout/Footer';
import { useQuery, useAction, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

const PaymentsPage = () => {
  const [activeTab, setActiveTab] = useState('invoices');
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [selectedInvoice, setSelectedInvoice] = useState<any>(null);

  // Live payment data from Convex
  const livePayments = useQuery(api.paymentAttempts.listMyPayments) || [];

  // Checkout Action
  const createCheckout = useAction(api.billing.createCheckoutSession);
  const completeSubscription = useMutation(api.payments.completeSubscription);

  useEffect(() => {
    // Check for success query param
    const query = new URLSearchParams(window.location.search);
    if (query.get('success')) {
      completeSubscription({})
        .then(() => {
          alert("Payment Successful! Subscription Active.");
          window.history.replaceState({}, document.title, window.location.pathname);
        })
        .catch((e) => console.error("Failed to complete:", e));
    }
    if (query.get('canceled')) {
      alert("Payment canceled.");
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, []);

  const handlePayInvoice = async (invoiceId: string) => {
    setProcessingId(invoiceId);
    try {
      const { url } = await createCheckout({ type: 'invoice', invoiceId });
      if (url) {
        window.open(url, '_blank');
      } else {
        alert("Error: No Checkout URL returned.");
      }
    } catch (e: any) {
      console.error(e);
      alert("Failed to pay invoice: " + (e.message || "Unknown error"));
    } finally {
      setProcessingId(null);
    }
  };

  // Hardcoded fallback invoices
  const HARDCODED_INVOICES = [
    {
      id: 'INV-2024-105',
      date: '2024-07-25',
      amount: 2450.00,
      status: 'Pending',
      shipment: 'SH-2024-001',
      dueDate: '2024-08-25',
      description: 'Ocean Freight - London to Hamburg'
    },
    {
      id: 'INV-2024-098',
      date: '2024-07-18',
      amount: 1875.50,
      status: 'Overdue',
      shipment: 'SH-2024-002',
      dueDate: '2024-08-18',
      description: 'Air Freight - Shanghai to Felixstowe'
    },
    {
      id: 'INV-2024-087',
      date: '2024-07-05',
      amount: 3200.75,
      status: 'Paid',
      shipment: 'SH-2024-003',
      dueDate: '2024-08-05',
      description: 'Container Shipping - Rotterdam to New York'
    },
    {
      id: 'INV-2024-076',
      date: '2024-06-20',
      amount: 1950.25,
      status: 'Paid',
      shipment: 'SH-2024-006',
      dueDate: '2024-07-20',
      description: 'Express Delivery - Tokyo to Long Beach'
    },
  ];

  const paymentMethods = [
    { id: 1, type: 'Credit Card', last4: '4242', expiry: '05/25', default: true, brand: 'Visa' },
    { id: 2, type: 'Bank Account', last4: '9876', name: 'Business Checking', default: false, bank: 'HSBC' },
  ];

  // Merge live payments with hardcoded fallback
  const invoices = useMemo(() => {
    if (livePayments.length > 0) {
      // Format live payments to match invoice structure
      return livePayments.map((p: any) => ({
        id: p.payment_id || p.invoice_id || `PAY-${p._id}`,
        date: p.created_at ? new Date(p.created_at).toLocaleDateString() : '-',
        amount: p.totals?.grand_total?.amount || 0,
        status: p.status === 'completed' ? 'Paid' : p.status === 'pending' ? 'Pending' : p.status || 'Unknown',
        shipment: p.invoice_id || '-',
        dueDate: '-',
        description: `Payment ${p.payment_id || ''}`
      }));
    }
    return HARDCODED_INVOICES;
  }, [livePayments]);

  const invoiceColumns = [
    { key: 'id' as keyof typeof invoices[0], header: 'Invoice ID', sortable: true },
    { key: 'date' as keyof typeof invoices[0], header: 'Date', sortable: true },
    { key: 'description' as keyof typeof invoices[0], header: 'Description', sortable: false },
    {
      key: 'amount' as keyof typeof invoices[0],
      header: 'Amount',
      sortable: true,
      render: (value: number) => `£${value.toLocaleString()}`
    },
    {
      key: 'status' as keyof typeof invoices[0],
      header: 'Status',
      sortable: true,
      render: (value: string) => (
        <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${value === 'Paid' ? 'bg-green-100 text-green-800' :
          value === 'Pending' ? 'bg-yellow-100 text-yellow-800' :
            value === 'Overdue' ? 'bg-red-100 text-red-800' :
              'bg-gray-100 text-gray-800'
          }`}>
          {value}
        </span>
      )
    },
    { key: 'dueDate' as keyof typeof invoices[0], header: 'Due Date', sortable: true },
    {
      key: 'actions' as keyof typeof invoices[0],
      header: 'Actions',
      render: (value: string, row: typeof invoices[0]) => (
        <div className="flex space-x-2">
          <Button variant="outline" size="sm" onClick={() => setSelectedInvoice(row)}>View</Button>
          {row.status === 'Pending' && (
            <Button size="sm" onClick={() => handlePayInvoice(row.id)} disabled={processingId === row.id}>
              {processingId === row.id ? 'Processing...' : 'Pay Now'}
            </Button>
          )}
        </div>
      )
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Payments Header */}
      <MediaCardHeader
        title="Payment Management"
        subtitle="Financial Operations"
        description="Manage invoices, process payments, and maintain financial records for your freight operations."
        backgroundImage="https://images.unsplash.com/photo-1554224155-6726b3ff858f?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80"
        overlayOpacity={0.6}
        className="h-20"
      />

      <div className="px-4 sm:px-6 lg:px-8 py-8">

        {/* Tab Navigation */}
        <div className="mb-6">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              <button
                onClick={() => setActiveTab('invoices')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${activeTab === 'invoices'
                  ? 'border-primary text-primary'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
              >
                Invoices & Payments
              </button>
              <button
                onClick={() => setActiveTab('subscription')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${activeTab === 'subscription'
                  ? 'border-primary text-primary'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
              >
                My Subscription
              </button>

            </nav>
          </div>
        </div>

        {activeTab === 'invoices' && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold text-gray-900">Invoices & Payments</h2>
              <Button variant="outline" onClick={() => {
                const csvContent = "data:text/csv;charset=utf-8,"
                  + ["ID,Date,Description,Amount,Status"].join(",") + "\n"
                  + invoices.map(row => `${row.id},${row.date},"${row.description}",${row.amount},${row.status}`).join("\n");
                const encodedUri = encodeURI(csvContent);
                const link = document.createElement("a");
                link.setAttribute("href", encodedUri);
                link.setAttribute("download", "invoices.csv");
                document.body.appendChild(link);
                link.click();
              }}>Export Invoices</Button>
            </div>

            <DataTable
              data={invoices}
              columns={invoiceColumns}
              searchPlaceholder="Search invoices by ID, shipment, or description..."
              rowsPerPage={10}
            />
          </div>
        )}

        {activeTab === 'subscription' && (
          <div className="flex justify-center py-8">
            <UserProfile />
          </div>
        )}


      </div>

      {/* Invoice Detail Dialog */}
      <Dialog open={!!selectedInvoice} onOpenChange={(open) => !open && setSelectedInvoice(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Invoice Details</DialogTitle>
            <DialogDescription>
              {selectedInvoice?.id}
            </DialogDescription>
          </DialogHeader>
          {selectedInvoice && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-500">Amount</p>
                  <p className="text-xl font-bold text-primary">£{selectedInvoice.amount?.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-gray-500">Status</p>
                  <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${selectedInvoice.status === 'Paid' ? 'bg-green-100 text-green-800' :
                    selectedInvoice.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' :
                      selectedInvoice.status === 'Overdue' ? 'bg-red-100 text-red-800' :
                        'bg-gray-100 text-gray-800'
                    }`}>
                    {selectedInvoice.status}
                  </span>
                </div>
              </div>
              <div>
                <p className="text-gray-500 text-sm">Description</p>
                <p className="font-medium">{selectedInvoice.description}</p>
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-500">Issue Date</p>
                  <p>{selectedInvoice.date}</p>
                </div>
                <div>
                  <p className="text-gray-500">Due Date</p>
                  <p>{selectedInvoice.dueDate}</p>
                </div>
              </div>
              <div>
                <p className="text-gray-500 text-sm">Shipment Reference</p>
                <p className="font-mono">{selectedInvoice.shipment}</p>
              </div>
              {selectedInvoice.status === 'Pending' && (
                <Button className="w-full" onClick={() => {
                  handlePayInvoice(selectedInvoice.id);
                  setSelectedInvoice(null);
                }}>
                  Pay Now
                </Button>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

    </div>
  );
};

export default PaymentsPage;
