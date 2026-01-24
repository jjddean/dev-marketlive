import React from 'react';
// import { useMutation } from "convex/react";
// import { api } from "../../../convex/_generated/api";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Settings, Database } from 'lucide-react';
import AdminPageHeader from '@/components/layout/admin/AdminPageHeader';
import { toast } from "sonner";

const AdminSettingsPage = () => {
    const handleSeedData = async () => {
        toast.info("Seed functionality is currently disabled");
    };

    return (
        <div className="space-y-6 max-w-4xl">
            <AdminPageHeader
                title="Platform Settings"
                subtitle="Configure global application parameters."
                icon={Settings}
            />

            <Card>
                <CardHeader>
                    <CardTitle>General Configuration</CardTitle>
                    <CardDescription>Basic system settings and branding.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>Platform Name</Label>
                            <Input defaultValue="FreightFlow Logistics" />
                        </div>
                        <div className="space-y-2">
                            <Label>Support Email</Label>
                            <Input defaultValue="support@freightflow.com" />
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Feature Flags</CardTitle>
                    <CardDescription>Toggle system capabilities.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                            <Label className="text-base">New Booking Engine</Label>
                            <p className="text-sm text-gray-500">Enable v2 quote request flow</p>
                        </div>
                        <Switch checked={true} />
                    </div>
                    <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                            <Label className="text-base">Maintenance Mode</Label>
                            <p className="text-sm text-gray-500">Disable client access temporarily</p>
                        </div>
                        <Switch checked={false} />
                    </div>
                </CardContent>
            </Card>

            <Card className="border-orange-200 bg-orange-50">
                <CardHeader>
                    <CardTitle className="text-orange-900">Development Tools</CardTitle>
                    <CardDescription className="text-orange-700">Utilities for testing and seeding data.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Button
                        variant="outline"
                        className="bg-white hover:bg-orange-100 border-orange-200 text-orange-900"
                        onClick={handleSeedData}
                    >
                        <Database className="mr-2 h-4 w-4" />
                        Seed Test Data (Admin)
                    </Button>
                </CardContent>
            </Card>

            <div className="flex justify-end">
                <Button>Save Changes</Button>
            </div>
        </div>
    );
};

export default AdminSettingsPage;
