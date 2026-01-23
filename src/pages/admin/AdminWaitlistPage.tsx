import React, { useState } from 'react';
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { Mail, Clock, CheckCircle2, History } from 'lucide-react';
import DataTable from '@/components/ui/data-table';
import AdminPageHeader from '@/components/layout/admin/AdminPageHeader';

const AdminWaitlistPage = () => {
    const waitlist = useQuery(api.admin.listWaitlist) || [];
    const approveUser = useMutation(api.admin.approveWaitlistUser);
    const [processingId, setProcessingId] = useState<string | null>(null);

    const handleInvite = async (id: string, email: string) => {
        setProcessingId(id);
        try {
            await approveUser({ id } as any);
            toast.success(`Invite sent to ${email}`);
        } catch (e) {
            toast.error("Failed to send invite");
        } finally {
            setProcessingId(null);
        }
    };

    const columns: any[] = [
        {
            key: 'email',
            header: 'Email Address',
            render: (val: string) => <span className="font-medium text-gray-900">{val}</span>
        },
        {
            key: 'company',
            header: 'Company',
            render: (val: string) => val || <span className="text-gray-400 italic">Individual</span>
        },
        {
            key: 'status',
            header: 'Status',
            render: (val: string) => (
                <Badge variant="outline" className={`
                    ${val === 'invited' ? 'bg-green-50 text-green-700 border-green-200' :
                        val === 'pending' ? 'bg-primary-50 text-primary-700 border-primary-200' :
                            'bg-gray-100 text-gray-700'}
                `}>
                    {val === 'invited' ? <CheckCircle2 className="w-3 h-3 mr-1" /> : <Clock className="w-3 h-3 mr-1" />}
                    {val}
                </Badge>
            )
        },
        {
            key: 'createdAt',
            header: 'Signed Up',
            render: (val: number) => <span className="text-sm text-gray-500">{new Date(val).toLocaleDateString()}</span>
        },
        {
            key: '_id',
            header: 'Actions',
            render: (id: string, row: any) => (
                <div className="flex gap-2">
                    {row.status !== 'invited' && (
                        <Button
                            size="sm"
                            className="bg-primary hover:bg-primary-700 text-white h-8 text-xs shadow-sm"
                            onClick={() => handleInvite(id, row.email)}
                            disabled={processingId === id}
                        >
                            <Mail className="w-3 h-3 mr-1.5" />
                            {processingId === id ? 'Sending...' : 'Invite'}
                        </Button>
                    )}
                </div>
            )
        }
    ];

    return (
        <div className="space-y-6">
            <AdminPageHeader
                title="Waitlist Management"
                subtitle="Manage early access requests and user onboarding."
                icon={History}
            >
                <div className="flex items-center gap-2 text-sm text-gray-500 bg-gray-50 px-3 py-1.5 rounded-full border border-gray-100">
                    <span className="font-medium text-gray-900">{waitlist.length}</span> Total Requests
                    <span className="text-gray-300">•</span>
                    <span className="font-medium text-green-600">{waitlist.filter((w: any) => w.status === 'invited').length}</span> Invited
                </div>
            </AdminPageHeader>

            <Card className="overflow-hidden border-gray-200 shadow-sm bg-white">
                <DataTable
                    data={waitlist}
                    columns={columns}
                    searchPlaceholder="Search email or company..."
                />
            </Card>
        </div>
    );
};

export default AdminWaitlistPage;
