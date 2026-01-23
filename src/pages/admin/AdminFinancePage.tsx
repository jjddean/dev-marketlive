import React, { useState } from 'react';
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CreditCard, FileText, Download, Filter, TrendingUp } from 'lucide-react';
import AdminPageHeader from '@/components/layout/admin/AdminPageHeader';
import DataTable from '@/components/ui/data-table';

const AdminFinancePage = () => {
    const invoices = useQuery(api.payments.listAllInvoices) || [];
    const payments = useQuery(api.payments.listAllPayments) || [];

    const formatCurrency = (amount: number, currency: string) => {
        try {
            return new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(amount);
        } catch (e) {
            return `${currency} ${amount}`;
        }
    };

    const invoiceColumns: any[] = [
        { key: 'invoiceNumber', header: 'Invoice #', render: (val: string) => <span className="font-mono text-xs">{val}</span> },
        {
            key: 'status',
            header: 'Status',
            render: (val: string) => (
                <Badge variant={val === 'paid' ? 'outline' : 'secondary'} className={val === 'paid' ? 'border-green-500 text-green-600' : ''}>
                    {val}
                </Badge>
            )
        },
        {
            key: 'amount',
            header: 'Amount',
            render: (val: number, row: any) => <span className="font-medium">{formatCurrency(val, row.currency)}</span>
        },
        { key: 'dueDate', header: 'Due Date', render: (val: string) => val ? new Date(val).toLocaleDateString() : '-' },
        {
            key: 'invoiceNumber',
            header: 'Actions',
            render: () => <Button variant="ghost" size="sm" className="h-6 w-6 p-0"><Download className="h-4 w-4" /></Button>
        }
    ];

    const paymentColumns: any[] = [
        { key: 'payment_id', header: 'Transaction ID', render: (val: string) => <span className="font-mono text-xs">{val}</span> },
        { key: 'status', header: 'Status', render: (val: string) => <Badge variant={val === 'succeeded' ? 'default' : 'secondary'}>{val}</Badge> },
        {
            key: 'totals',
            header: 'Amount',
            render: (val: any) => <span className="font-medium">{val?.grand_total?.amount_formatted}</span>
        },
        { key: 'payer', header: 'Customer', render: (val: any) => <div className="text-sm">{val?.email}</div> },
        { key: 'created_at', header: 'Date', render: (val: number) => new Date(val).toLocaleDateString() }
    ];

    return (
        <div className="space-y-6">
            <AdminPageHeader
                title="Finance & Billing"
                subtitle="Manage invoices, payment reconciliation, and refunds."
                icon={CreditCard}
                actionLabel="Generate Invoice"
                onAction={() => { }}
            >
                <Button variant="outline"><Filter className="mr-2 h-4 w-4" /> Filter</Button>
            </AdminPageHeader>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="p-6 bg-white shadow-sm border border-gray-100">
                    <div className="flex items-center justify-between mb-4">
                        <div className="p-3 rounded-lg bg-emerald-50 text-emerald-600">
                            <TrendingUp className="h-6 w-6" />
                        </div>
                        <span className="text-sm font-medium text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                            +12% vs last month
                        </span>
                    </div>
                    <h3 className="text-gray-500 text-sm font-medium">Revenue (MTD)</h3>
                    <div className="text-2xl font-bold text-gray-900 mt-1">$124,500</div>
                </Card>

                <Card className="p-6 bg-white shadow-sm border border-gray-100">
                    <div className="flex items-center justify-between mb-4">
                        <div className="p-3 rounded-lg bg-primary-50 text-primary-600">
                            <FileText className="h-6 w-6" />
                        </div>
                        <span className="text-sm font-medium text-gray-500">
                            Across 8 accounts
                        </span>
                    </div>
                    <h3 className="text-gray-500 text-sm font-medium">Pending Invoices</h3>
                    <div className="text-2xl font-bold text-gray-900 mt-1">$12,250</div>
                </Card>
            </div>

            <Tabs defaultValue="invoices" className="w-full">
                <TabsList>
                    <TabsTrigger value="invoices">Invoices</TabsTrigger>
                    <TabsTrigger value="payments">Transactions</TabsTrigger>
                </TabsList>

                <TabsContent value="invoices" className="mt-4">
                    <Card className="p-0 overflow-hidden border-gray-200 shadow-sm">
                        <div className="p-4 border-b border-gray-100 bg-gray-50/50 flex justify-between items-center">
                            <h3 className="font-semibold text-gray-900 flex items-center">
                                <FileText className="h-4 w-4 mr-2" /> Recent Invoices
                            </h3>
                        </div>
                        <DataTable
                            data={invoices}
                            columns={invoiceColumns}
                            searchPlaceholder="Search invoices..."
                        />
                    </Card>
                </TabsContent>

                <TabsContent value="payments" className="mt-4">
                    <Card className="p-0 overflow-hidden border-gray-200 shadow-sm">
                        <div className="p-4 border-b border-gray-100 bg-gray-50/50 flex justify-between items-center">
                            <h3 className="font-semibold text-gray-900 flex items-center">
                                <CreditCard className="h-4 w-4 mr-2" /> Payment History
                            </h3>
                        </div>
                        <DataTable
                            data={payments}
                            columns={paymentColumns}
                            searchPlaceholder="Search transactions..."
                        />
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
};

export default AdminFinancePage;
