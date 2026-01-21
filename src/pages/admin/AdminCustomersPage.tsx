import React, { useState } from 'react';
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import DataTable from '@/components/ui/data-table';
import { Button } from '@/components/ui/button';
import { Mail, Shield, Trash2, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";

const AdminCustomersPage = () => {
    const users = useQuery(api.users.listUsers) || [];
    const deleteUser = useMutation(api.users.deleteUser);

    // Delete Dialog State
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [userToDelete, setUserToDelete] = useState<string | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    const confirmDelete = (userId: string) => {
        setUserToDelete(userId);
        setDeleteDialogOpen(true);
    };

    const handleDelete = async () => {
        if (!userToDelete) return;

        setIsDeleting(true);
        try {
            await deleteUser({ userId: userToDelete as any });
            toast.success("User deleted successfully");
            setDeleteDialogOpen(false);
        } catch (error: any) {
            toast.error(error.message || "Failed to delete user");
        } finally {
            setIsDeleting(false);
            setUserToDelete(null);
        }
    };

    const columns: any[] = [
        {
            key: 'name',
            header: 'Customer',
            render: (val: string, row: any) => (
                <div className="flex items-center">
                    <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold mr-3">
                        {val?.charAt(0).toUpperCase()}
                    </div>
                    <div>
                        <div className="font-medium text-gray-900">{val || 'Unknown'}</div>
                        <div className="text-xs text-gray-500">{row.externalId}</div>
                    </div>
                </div>
            )
        },
        {
            key: 'email',
            header: 'Contact',
            render: (val: string) => (
                <div className="flex flex-col space-y-1">
                    <div className="flex items-center text-sm text-gray-600">
                        <Mail className="h-3 w-3 mr-2" /> {val}
                    </div>
                </div>
            )
        },
        {
            key: 'role',
            header: 'Role',
            render: (val: string, row: any) => {
                const isAdmin = row.role === 'admin' || row.role === 'platform:superadmin';
                return (
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium 
                        ${isAdmin ? 'bg-purple-100 text-purple-800' : 'bg-gray-100 text-gray-800'}`}>
                        {isAdmin && <Shield className="w-3 h-3 mr-1" />}
                        {row.role === 'platform:superadmin' ? 'Super Admin' :
                            row.role === 'admin' ? 'Admin' : 'Client'}
                    </span>
                );
            }
        },
        {
            key: '_creationTime',
            header: 'Joined',
            render: (val: number) => new Date(val).toLocaleDateString()
        },
        {
            key: '_id',
            header: 'Actions',
            render: (id: string, row: any) => {
                const isSuperAdmin = row.role === 'platform:superadmin';
                // Prevent deleting superadmins
                if (isSuperAdmin) return <span className="text-xs text-gray-400">Protected</span>;

                return (
                    <div className="flex gap-2">
                        <Button
                            size="sm"
                            variant="ghost"
                            className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                            onClick={() => confirmDelete(id)}
                            title="Delete User"
                        >
                            <Trash2 className="h-4 w-4" />
                        </Button>
                    </div>
                );
            }
        }
    ];

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Customers</h1>
                    <p className="text-gray-500">Directory of all registered clients.</p>
                </div>
                <Button>Export List</Button>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <DataTable
                    data={users}
                    columns={columns}
                    searchPlaceholder="Search customers..."
                    rowsPerPage={10}
                />
            </div>

            <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Delete User</DialogTitle>
                        <DialogDescription>
                            Are you sure you want to delete this user? This action cannot be undone and will remove all their data.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="bg-red-50 p-4 rounded-md flex items-center gap-3">
                        <AlertCircle className="h-5 w-5 text-red-600" />
                        <p className="text-sm text-red-700 font-medium">Warning: This is a destructive action.</p>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
                        <Button
                            variant="destructive"
                            onClick={handleDelete}
                            disabled={isDeleting}
                        >
                            {isDeleting ? 'Deleting...' : 'Delete User'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default AdminCustomersPage;
