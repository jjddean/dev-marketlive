import React from 'react';
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { ShieldAlert, CheckCircle, FileWarning } from 'lucide-react';
import { toast } from 'sonner';
import AdminPageHeader from '@/components/layout/admin/AdminPageHeader';

const AdminCompliancePage = () => {
    // Real pending KYC list
    const kyQueue = useQuery(api.compliance.listPendingKyc) || [];

    // Mutations
    const approveKyc = useMutation(api.compliance.approveKyc);
    const rejectKyc = useMutation(api.compliance.rejectKyc);

    const handleApproveKYC = async (id: string, userId: string) => {
        try {
            await approveKyc({ id: id as any });
            toast.success(`KYC Request Approved`);
            // Optional: Send email notification here via api.emails.sendKycApproved
        } catch (error) {
            toast.error("Failed to approve");
            console.error(error);
        }
    };

    const handleRejectKYC = async (id: string) => {
        const reason = prompt("Enter rejection reason:");
        if (!reason) return;

        try {
            await rejectKyc({ id: id as any, reason });
            toast.success("KYC Request Rejected");
        } catch (error) {
            toast.error("Failed to reject");
        }
    };

    return (
        <div className="space-y-6">
            <AdminPageHeader
                title="Compliance & KYC"
                subtitle="Review pending identity verifications and trade compliance alerts."
                icon={ShieldAlert}
            />

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="p-6 bg-white shadow-sm border border-gray-100">
                    <div className="flex items-center justify-between mb-4">
                        <div className="p-3 rounded-lg bg-orange-50 text-orange-600">
                            <ShieldAlert className="h-6 w-6" />
                        </div>
                        <span className="text-sm font-medium text-orange-600">
                            Action Required
                        </span>
                    </div>
                    <h3 className="text-gray-500 text-sm font-medium">Pending Reviews</h3>
                    <div className="text-2xl font-bold text-gray-900 mt-1">{kyQueue.length}</div>
                </Card>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <h3 className="font-semibold text-gray-900 mb-4">KYC Approval Queue</h3>

                {kyQueue.length === 0 ? (
                    <div className="text-center py-12 text-gray-500 bg-gray-50 rounded-lg dashed border-2 border-gray-200">
                        <CheckCircle className="h-8 w-8 mx-auto mb-2 text-green-400" />
                        <p>All clean. No pending compliance reviews.</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {kyQueue.map((item: any) => (
                            <div key={item._id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                                <div className="flex items-center space-x-4">
                                    <div className="p-2 bg-orange-100 rounded-full">
                                        <FileWarning className="h-5 w-5 text-orange-600" />
                                    </div>
                                    <div>
                                        <p className="font-medium text-gray-900">Verifying: {item.companyName}</p>
                                        <div className="text-sm text-gray-500 flex gap-2">
                                            <span>Reg: {item.registrationNumber}</span>
                                            <span>•</span>
                                            <span>Country: {item.country}</span>
                                        </div>
                                        <div className="text-xs text-primary-600 mt-1">
                                            Docs: {item.documents?.length || 0} attached
                                        </div>
                                    </div>
                                </div>
                                <div className="flex space-x-2">
                                    <Button size="sm" variant="outline" onClick={() => handleRejectKYC(item._id)}>Reject</Button>
                                    <Button size="sm" onClick={() => handleApproveKYC(item._id, item.userId)}>Approve</Button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default AdminCompliancePage;
