import React, { useState } from 'react';
import { useQuery, useAction, useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import DataTable from '@/components/ui/data-table';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { FileText, Download, CheckCircle, Send, RefreshCw, Eye } from 'lucide-react';
import { toast } from 'sonner';

const AdminDocumentsPage = () => {
    const documents = useQuery(api.documents.listDocuments, {}) || [];
    const sendEnvelope = useAction(api.docusign.sendEnvelope);
    const setDocusignEnvelope = useMutation(api.documents.setDocusignEnvelope);

    // Send for Signature Dialog State
    const [sendDialogOpen, setSendDialogOpen] = useState(false);
    const [selectedDoc, setSelectedDoc] = useState<any>(null);
    const [recipientName, setRecipientName] = useState('');
    const [recipientEmail, setRecipientEmail] = useState('');
    const [sending, setSending] = useState(false);

    const handleOpenSendDialog = (doc: any) => {
        setSelectedDoc(doc);
        // Pre-fill with consignee info if available
        setRecipientName(doc.documentData?.parties?.consignee?.name || '');
        setRecipientEmail(doc.documentData?.parties?.consignee?.contact || '');
        setSendDialogOpen(true);
    };

    const handleSendForSignature = async () => {
        if (!selectedDoc || !recipientName || !recipientEmail) {
            toast.error("Please fill in recipient details");
            return;
        }

        setSending(true);
        try {
            const result: any = await sendEnvelope({
                documentId: selectedDoc._id,
                signerName: recipientName,
                signerEmail: recipientEmail,
            });

            const envelopeId = typeof result === 'string' ? result : (result.envelopeId || result.id);

            await setDocusignEnvelope({
                documentId: selectedDoc._id,
                envelopeId: envelopeId as string,
                status: 'sent',
                recipients: [{
                    name: recipientName,
                    email: recipientEmail,
                    role: 'Signer',
                    status: 'sent'
                }]
            });

            toast.success(`Document sent to ${recipientEmail} for signature!`);
            setSendDialogOpen(false);
            setSelectedDoc(null);
            setRecipientName('');
            setRecipientEmail('');
        } catch (error: any) {
            console.error("DocuSign Error:", error);
            toast.error(`Failed to send: ${error.message}`);
        } finally {
            setSending(false);
        }
    };

    const handleApprove = (id: string) => {
        toast.success("Document marked as Approved");
    };

    const columns: any[] = [
        {
            key: 'documentData',
            header: 'Reference',
            render: (data: any) => <span className="font-mono text-xs">{data?.documentNumber || 'N/A'}</span>
        },
        {
            key: 'type',
            header: 'Type',
            render: (val: string) => <span className="capitalize">{val?.replace(/_/g, ' ')}</span>
        },
        {
            key: 'uploadedBy',
            header: 'Source',
            render: (val: string) => (
                <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs ${val === 'system' ? 'bg-purple-100 text-purple-700' :
                        val === 'client' ? 'bg-blue-100 text-blue-700' :
                            'bg-gray-100 text-gray-600'
                    }`}>
                    {val === 'system' ? 'Platform' : val === 'client' ? 'Client' : 'Legacy'}
                </span>
            )
        },
        {
            key: 'status',
            header: 'Status',
            render: (value: string) => (
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize
          ${value === 'approved' ? 'bg-green-100 text-green-800' :
                        value === 'draft' ? 'bg-gray-100 text-gray-800' :
                            'bg-blue-100 text-blue-800'}`}>
                    {value}
                </span>
            )
        },
        {
            key: 'docusign',
            header: 'DocuSign',
            render: (ds: any) => (
                ds?.status ? (
                    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs
             ${ds.status === 'completed' ? 'text-green-600 bg-green-50 border border-green-200' :
                            ds.status === 'sent' ? 'text-blue-600 bg-blue-50 border border-blue-200' :
                                'text-gray-500 bg-gray-50'}`}>
                        {ds.status}
                    </span>
                ) : <span className="text-gray-400 text-xs">Not sent</span>
            )
        },
        {
            key: '_id',
            header: 'Actions',
            render: (id: string, row: any) => (
                <div className="flex space-x-1">
                    <Button size="sm" variant="ghost" className="h-8 w-8 p-0" title="Download">
                        <Download className="h-4 w-4" />
                    </Button>
                    {!row.docusign?.envelopeId && (
                        <Button
                            size="sm"
                            variant="ghost"
                            className="h-8 w-8 p-0 text-blue-600"
                            onClick={() => handleOpenSendDialog(row)}
                            title="Send for Signature"
                        >
                            <Send className="h-4 w-4" />
                        </Button>
                    )}
                    {row.status !== 'approved' && (
                        <Button size="sm" variant="ghost" className="h-8 w-8 p-0 text-green-600" onClick={() => handleApprove(id)} title="Approve">
                            <CheckCircle className="h-4 w-4" />
                        </Button>
                    )}
                </div>
            )
        }
    ];

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Document Registry</h1>
                    <p className="text-gray-500">Admin overview - Send documents for client signature.</p>
                </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <DataTable
                    data={documents}
                    columns={columns}
                    searchPlaceholder="Search by ref or type..."
                    rowsPerPage={10}
                />
            </div>

            {/* Send for Signature Dialog */}
            <Dialog open={sendDialogOpen} onOpenChange={setSendDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Send for Signature</DialogTitle>
                        <DialogDescription>
                            Send this document to a client for electronic signature via DocuSign.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="bg-gray-50 p-3 rounded-lg">
                            <p className="text-sm text-gray-600">Document: <strong>{selectedDoc?.documentData?.documentNumber}</strong></p>
                            <p className="text-sm text-gray-600">Type: <strong className="capitalize">{selectedDoc?.type?.replace(/_/g, ' ')}</strong></p>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="recipientName">Recipient Name</Label>
                            <Input
                                id="recipientName"
                                value={recipientName}
                                onChange={(e) => setRecipientName(e.target.value)}
                                placeholder="e.g., John Smith"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="recipientEmail">Recipient Email</Label>
                            <Input
                                id="recipientEmail"
                                type="email"
                                value={recipientEmail}
                                onChange={(e) => setRecipientEmail(e.target.value)}
                                placeholder="e.g., john@company.com"
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setSendDialogOpen(false)}>Cancel</Button>
                        <Button onClick={handleSendForSignature} disabled={sending}>
                            {sending ? 'Sending...' : 'Send via DocuSign'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default AdminDocumentsPage;

