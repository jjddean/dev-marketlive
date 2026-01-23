import React, { useState } from 'react';
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import {
    Check,
    X,
    AlertTriangle,
    FileText,
    Users,
    Truck,
    Clock,
    ChevronRight,
    ArrowUpRight,
    CreditCard
} from 'lucide-react';
import { Link } from 'react-router-dom';
import AdminPageHeader from '@/components/layout/admin/AdminPageHeader';

const AdminApprovalsPage = () => {
    const pendingActions = useQuery(api.admin.getPendingActions) || [];

    // Mutations for different types
    const approveBooking = useMutation(api.bookings.approveBooking);
    const rejectBooking = useMutation(api.bookings.rejectBooking);
    const approveKyc = useMutation(api.compliance.approveKyc);
    const rejectKyc = useMutation(api.compliance.rejectKyc);

    const [processingId, setProcessingId] = useState<string | null>(null);

    const handleAction = async (item: any, action: 'approve' | 'reject') => {
        setProcessingId(item.id);
        try {
            if (item.type === 'booking') {
                if (action === 'approve') await approveBooking({ bookingId: item.id });
                else await rejectBooking({ bookingId: item.id, reason: "Admin rejected from inbox" });
            } else if (item.type === 'kyc') {
                if (action === 'approve') await approveKyc({ id: item.id });
                else await rejectKyc({ id: item.id, reason: "Admin rejected from inbox" });
            } else {
                toast.info("Document actions must be done in the Details view for now.");
                return;
            }
            toast.success(`${action === 'approve' ? 'Approved' : 'Rejected'} ${item.type}`);
        } catch (error) {
            console.error(error);
            toast.error("Action failed");
        } finally {
            setProcessingId(null);
        }
    };

    const getIcon = (type: string) => {
        switch (type) {
            case 'booking': return <Truck className="h-5 w-5 text-primary-500" />;
            case 'kyc': return <Users className="h-5 w-5 text-purple-500" />;
            case 'document': return <FileText className="h-5 w-5 text-orange-500" />;
            case 'payment': return <CreditCard className="h-5 w-5 text-red-500" />;
            default: return <AlertTriangle className="h-5 w-5 text-gray-500" />;
        }
    };

    return (
        <div className="space-y-6 max-w-5xl mx-auto">
            <AdminPageHeader
                title="Inbox"
                subtitle="Unified queue for all pending approvals and high-risk items."
                icon={FileText}
            >
                <div className="flex space-x-2">
                    <Badge variant="outline" className="px-3 py-1 text-sm bg-white">
                        {pendingActions.length} Pending
                    </Badge>
                </div>
            </AdminPageHeader>

            {pendingActions.length === 0 ? (
                <div className="text-center py-20 bg-white rounded-xl shadow-sm border border-gray-100">
                    <div className="bg-green-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Check className="h-8 w-8 text-green-500" />
                    </div>
                    <h3 className="text-lg font-medium text-gray-900">All caught up!</h3>
                    <p className="text-gray-500">No pending actions requiring your attention.</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {pendingActions.map((item: any) => (
                        <Card key={item.id} className="p-4 hover:shadow-md transition-shadow">
                            <div className="flex items-start justify-between">
                                <div className="flex gap-4">
                                    <div className="mt-1 p-2 bg-gray-50 rounded-lg">
                                        {getIcon(item.type)}
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-2 mb-1">
                                            <Badge variant={item.priority === 'critical' ? 'destructive' : 'secondary'} className="uppercase text-[10px]">
                                                {item.priority}
                                            </Badge>
                                            <span className="text-xs text-gray-500 flex items-center">
                                                <Clock className="h-3 w-3 mr-1" />
                                                {new Date(item.createdAt).toLocaleDateString()}
                                            </span>
                                        </div>
                                        <h3 className="font-semibold text-gray-900">{item.title}</h3>
                                        <p className="text-sm text-gray-600">{item.subtitle}</p>
                                    </div>
                                </div>

                                <div className="flex items-start gap-2">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                        onClick={() => handleAction(item, 'reject')}
                                        disabled={!!processingId}
                                    >
                                        Reject
                                    </Button>
                                    <Button
                                        size="sm"
                                        className="bg-primary hover:bg-primary-700"
                                        onClick={() => handleAction(item, 'approve')}
                                        disabled={!!processingId}
                                    >
                                        {processingId === item.id ? '...' : 'Approve'}
                                    </Button>
                                    <Button variant="ghost" size="icon" className="h-9 w-9">
                                        <ChevronRight className="h-4 w-4 text-gray-400" />
                                    </Button>
                                </div>
                            </div>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
};

export default AdminApprovalsPage;
