import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Settings } from 'lucide-react';
import AdminPageHeader from '@/components/layout/admin/AdminPageHeader';

const AdminSettingsPage = () => {
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

            <div className="flex justify-end">
                <Button>Save Changes</Button>
            </div>
        </div>
    );
};

export default AdminSettingsPage;
