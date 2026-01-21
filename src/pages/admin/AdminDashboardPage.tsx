import React from 'react';
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import {
    Users,
    ShoppingBag,
    TrendingUp,
    AlertTriangle
} from 'lucide-react';

const StatCard = ({ title, value, change, icon: Icon, trend }: any) => (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="flex items-center justify-between mb-4">
            <div className={`p-3 rounded-lg ${trend === 'up' ? 'bg-emerald-50 text-emerald-600' :
                trend === 'down' ? 'bg-red-50 text-red-600' : 'bg-blue-50 text-blue-600'}`}>
                <Icon className="h-6 w-6" />
            </div>
            <span className={`text-sm font-medium ${trend === 'up' ? 'text-emerald-600' :
                trend === 'down' ? 'text-red-600' : 'text-gray-600'}`}>
                {change}
            </span>
        </div>
        <h3 className="text-gray-500 text-sm font-medium">{title}</h3>
        <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
    </div>
);

const AdminDashboardPage = () => {
    const stats = useQuery(api.admin.getDashboardStats);

    if (!stats) {
        return <div className="p-8 text-center text-gray-500">Loading dashboard stats...</div>;
    }

    return (
        <div className="space-y-8">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold text-gray-900">Dashboard Overview</h1>
                <p className="text-gray-500">Welcome back, Administrator. Here is your platform summary.</p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard
                    title="Total Bookings"
                    value={stats.totalBookings.toLocaleString()}
                    change={stats.trends.bookings}
                    icon={ShoppingBag}
                    trend="up"
                />
                <StatCard
                    title="Active Shipments"
                    value={stats.activeShipments.toString()}
                    change={stats.trends.shipments}
                    icon={TrendingUp}
                    trend="up"
                />
                <StatCard
                    title="Total Customers"
                    value={stats.totalCustomers.toLocaleString()}
                    change={stats.trends.customers}
                    icon={Users}
                    trend="up"
                />
                <StatCard
                    title="Pending Approvals"
                    value={stats.pendingApprovals.toString()}
                    change={stats.trends.approvals}
                    icon={AlertTriangle}
                    trend={stats.pendingApprovals > 5 ? 'down' : 'up'}
                />
            </div>


            {/* Recent Activity Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 min-h-[300px]">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-lg font-bold text-gray-900">Recent Activity</h2>
                        <span className="text-xs text-gray-500 bg-gray-50 px-2 py-1 rounded-full border border-gray-200">Live Feed</span>
                    </div>

                    <RecentActivityFeed />
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 min-h-[300px]">
                    <h2 className="text-lg font-bold text-gray-900 mb-4">Revenue Overview</h2>
                    <div className="flex items-center justify-center h-full text-gray-400 bg-gray-50 rounded-lg border-2 border-dashed border-gray-200">
                        Financial analytics module coming soon
                    </div>
                </div>
            </div>
        </div>
    );
};

const RecentActivityFeed = () => {
    const activity = useQuery(api.admin.getRecentActivity);

    if (activity === undefined) {
        return <div className="text-sm text-gray-500 text-center py-8">Loading activity...</div>;
    }

    if (!activity || activity.length === 0) {
        return <div className="text-sm text-gray-500 text-center py-8">No recent activity found.</div>;
    }

    return (
        <div className="space-y-4">
            {activity.map((log: any) => {
                const isEmail = log.action === 'email.sent';
                const isBooking = log.action.startsWith('booking.');
                const isUser = log.action.startsWith('user.');

                return (
                    <div key={log._id} className="flex items-start space-x-3 pb-3 border-b border-gray-50 last:border-0">
                        <div className={`mt-0.5 p-1.5 rounded-full flex-shrink-0 
                            ${isEmail ? 'bg-blue-50 text-blue-600' :
                                isBooking ? 'bg-emerald-50 text-emerald-600' :
                                    'bg-gray-100 text-gray-600'}`}>
                            {isEmail ? <div className="w-4 h-4">✉️</div> :
                                isBooking ? <div className="w-4 h-4">📦</div> :
                                    <div className="w-4 h-4">👤</div>}
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 truncate">
                                {formatActionLabel(log.action)}
                            </p>
                            <p className="text-xs text-gray-500 truncate mt-0.5">
                                {formatActionDetails(log)}
                            </p>
                        </div>
                        <span className="text-xs text-gray-400 whitespace-nowrap">
                            {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                    </div>
                );
            })}
        </div>
    );
};

function formatActionLabel(action: string) {
    switch (action) {
        case 'email.sent': return 'Email Notification Sent';
        case 'booking.created': return 'New Booking Received';
        case 'booking.approved': return 'Booking Approved';
        case 'booking.rejected': return 'Booking Rejected';
        default: return action;
    }
}

function formatActionDetails(log: any) {
    if (log.action === 'email.sent') return `To: ${log.details?.recipient || 'Unknown'}`;
    if (log.action.startsWith('booking.')) return `Ref: ${log.entityId} • ${log.details?.customer || ''}`;
    return log.details ? JSON.stringify(log.details) : '';
}


export default AdminDashboardPage;
