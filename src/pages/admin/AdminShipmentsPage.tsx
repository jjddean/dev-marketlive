import React from 'react';
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import type { Id } from "../../../convex/_generated/dataModel";
import DataTable from '@/components/ui/data-table';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";
import { MapPin, Navigation, Package, Truck, MoreHorizontal, AlertTriangle, CheckCircle } from 'lucide-react';
import AdminPageHeader from '@/components/layout/admin/AdminPageHeader';
import { Badge } from '@/components/ui/badge';

const AdminShipmentsPage = () => {
    // const { toast } = useToast(); // Removed
    const shipments = useQuery(api.admin.listAllShipments, {}) || [];
    const flagShipment = useMutation(api.shipments.flagShipment);
    const clearFlag = useMutation(api.shipments.clearShipmentFlag);

    const handleFlag = async (shipmentId: Id<"shipments">) => {
        try {
            await flagShipment({ shipmentId: shipmentId, shipmentIdString: shipmentId, riskLevel: 'high', reason: 'Manual Admin Flag' });
            toast.success("Shipment Flagged: Marked as High Risk.");
        } catch (error) {
            toast.error("Failed to flag shipment.");
        }
    };

    const handleClear = async (shipmentId: Id<"shipments">) => {
        try {
            await clearFlag({ shipmentIdString: shipmentId });
            toast.success("Risk Cleared: Shipment marked as safe.");
        } catch (error) {
            toast.error("Failed to clear flag.");
        }
    };

    const columns = [
        {
            key: 'trackingNumber',
            header: 'Tracking #',
            render: (value: string) => <span className="font-mono font-medium text-primary-600">{value}</span>
        },
        {
            key: 'riskLevel',
            header: 'Risk',
            render: (val: string) => (
                val === 'high' ? <Badge variant="destructive" className="flex w-fit items-center gap-1"><AlertTriangle className="h-3 w-3" /> High</Badge> :
                    val === 'medium' ? <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 hover:bg-yellow-200">Medium</Badge> :
                        <Badge variant="outline" className="text-gray-500 border-gray-200">Safe</Badge>
            )
        },
        {
            key: 'carrier',
            header: 'Carrier',
            render: (value: string) => (
                <div className="flex items-center space-x-2">
                    <span className="text-lg">{
                        value?.toLowerCase().includes('fedex') ? '🟣' :
                            value?.toLowerCase().includes('dhl') ? '🟡' : '📦'
                    }</span>
                    <span>{value}</span>
                </div>
            )
        },
        {
            key: 'currentLocation',
            header: 'Current Location',
            render: (location: any) => (
                <div className="flex items-center text-sm text-gray-600">
                    <MapPin className="h-4 w-4 mr-1 text-gray-400" />
                    {location?.city || 'In Transit'}, {location?.country || ''}
                </div>
            )
        },
        {
            key: 'status',
            header: 'Status',
            render: (value: string) => (
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize
          ${value === 'delivered' ? 'bg-green-100 text-green-800' :
                        value === 'transit' ? 'bg-primary-100 text-primary-800' :
                            'bg-gray-100 text-gray-800'}`}>
                    {value}
                </span>
            )
        },
        {
            key: 'shipmentId',
            header: 'Actions',
            render: (id: string, row: any) => (
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-400 hover:text-blue-600">
                            <MoreHorizontal className="h-4 w-4" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuItem onClick={() => { }}>View Details</DropdownMenuItem>
                        <DropdownMenuSeparator />
                        {row.riskLevel === 'high' ? (
                            <DropdownMenuItem onClick={() => handleClear(row.shipmentId)} className="text-green-600">
                                <CheckCircle className="mr-2 h-4 w-4" /> Clear Risk Flag
                            </DropdownMenuItem>
                        ) : (
                            <DropdownMenuItem onClick={() => handleFlag(row.shipmentId)} className="text-red-600">
                                <AlertTriangle className="mr-2 h-4 w-4" /> Flag as High Risk
                            </DropdownMenuItem>
                        )}
                    </DropdownMenuContent>
                </DropdownMenu>
            )
        }
    ];

    return (
        <div className="space-y-6">
            <AdminPageHeader
                title="Fleet Oversight"
                subtitle="Real-time tracking of active shipments."
                actionLabel="Add Shipment"
                onAction={() => { }}
                icon={Truck}
            >
                <Button variant="outline">
                    <Navigation className="h-4 w-4 mr-2" /> Live Map
                </Button>
            </AdminPageHeader>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <DataTable
                    data={shipments}
                    columns={columns as any}
                    searchPlaceholder="Search tracking number or carrier..."
                    rowsPerPage={10}
                />
            </div>
        </div>
    );
};

export default AdminShipmentsPage;
