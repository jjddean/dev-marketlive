import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
    LayoutDashboard,
    Package,
    Truck,
    FileText,
    Users,
    Settings,
    LogOut,
    ShieldCheck,
    Ship
} from 'lucide-react';
import { UserButton, OrganizationSwitcher } from '@clerk/clerk-react';

const AdminSidebar = () => {
    const location = useLocation();

    const navigation = [
        { name: 'Dashboard', href: '/admin', icon: LayoutDashboard },
        { name: 'Bookings', href: '/admin/bookings', icon: FileText },
        { name: 'Shipments', href: '/admin/shipments', icon: Truck },
        { name: 'Documents', href: '/admin/documents', icon: FileText },
        { name: 'Compliance', href: '/admin/compliance', icon: ShieldCheck },
        { name: 'Customers', href: '/admin/customers', icon: Users },
        { name: 'Carrier API', href: '/admin/carriers', icon: Ship },
        { name: 'Settings', href: '/admin/settings', icon: Settings },
    ];

    return (
        <div className="hidden md:flex flex-col w-64 bg-slate-900 border-r border-slate-800 min-h-screen fixed left-0 top-0 text-white z-50">
            {/* Logo Area */}
            <div className="h-16 flex items-center px-6 border-b border-slate-800">
                <ShieldCheck className="h-6 w-6 text-emerald-400 mr-2" />
                <span className="text-lg font-bold tracking-tight text-white">Admin Portal</span>
            </div>

            {/* Navigation */}
            <div className="flex-1 overflow-y-auto py-6 space-y-1 px-3">
                {navigation.map((item) => {
                    const isActive = location.pathname === item.href;
                    return (
                        <NavLink
                            key={item.name}
                            to={item.href}
                            className={({ isActive }) => `
                flex items-center px-3 py-2.5 text-sm font-medium rounded-lg transition-colors
                ${isActive
                                    ? 'bg-emerald-500/10 text-emerald-400'
                                    : 'text-slate-400 hover:text-white hover:bg-slate-800'}
              `}
                        >
                            <item.icon className={`h-5 w-5 mr-3 ${isActive ? 'text-emerald-400' : 'text-slate-500 group-hover:text-white'}`} />
                            {item.name}
                        </NavLink>
                    );
                })}
            </div>

            {/* User Footer */}
            <div className="p-4 border-t border-slate-800 space-y-3">
                {/* Organization Switcher for Admins */}
                <OrganizationSwitcher
                    hidePersonal={true}
                    afterCreateOrganizationUrl="/admin"
                    afterSelectOrganizationUrl="/admin"
                    appearance={{
                        elements: {
                            rootBox: "w-full",
                            organizationSwitcherTrigger: "w-full justify-between bg-slate-800 text-white border-slate-700 hover:bg-slate-700"
                        }
                    }}
                />
                <div className="flex items-center space-x-3 bg-slate-800/50 p-2 rounded-lg">
                    <div className="bg-white rounded-full p-0.5">
                        <UserButton afterSignOutUrl="/" />
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-white truncate">Administrator</p>
                        <p className="text-xs text-slate-500 truncate">Platform Admin</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminSidebar;
