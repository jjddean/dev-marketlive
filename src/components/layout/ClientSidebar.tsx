import React, { useState, useEffect } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
    LayoutDashboard,
    Truck,
    FileText,
    CreditCard,
    ClipboardList,
    FileCheck,
    BarChart3,
    ChevronLeft,
    ChevronRight,
    Package,
    Bell
} from 'lucide-react';
import { UserButton, OrganizationSwitcher } from '@clerk/clerk-react';
import NotificationCenter from '@/components/ui/notification-center';

interface ClientSidebarProps {
    children: React.ReactNode;
}

const ClientSidebar = ({ children }: ClientSidebarProps) => {
    const location = useLocation();
    const [isCollapsed, setIsCollapsed] = useState(false);
    const [isMobileOpen, setIsMobileOpen] = useState(false);

    // Close mobile sidebar on route change
    useEffect(() => {
        setIsMobileOpen(false);
    }, [location.pathname]);

    const navigation = [
        { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
        { name: 'Shipments', href: '/shipments', icon: Truck },
        { name: 'Bookings', href: '/bookings', icon: Package },
        { name: 'Quotes', href: '/quotes', icon: ClipboardList },
        { name: 'Payments', href: '/payments', icon: CreditCard },
        { name: 'Documents', href: '/documents', icon: FileText },
        { name: 'Compliance', href: '/compliance', icon: FileCheck },
        { name: 'Reports', href: '/reports', icon: BarChart3 },
    ];

    return (
        <div className="flex min-h-screen bg-gray-50">
            {/* Mobile overlay */}
            {isMobileOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-40 md:hidden"
                    onClick={() => setIsMobileOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside className={`
                fixed top-0 left-0 z-50 h-full bg-white border-r border-gray-200 
                transition-all duration-300 ease-in-out
                ${isCollapsed ? 'w-16' : 'w-64'}
                ${isMobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
            `}>
                {/* Logo / Brand */}
                <div className={`h-16 flex items-center border-b border-gray-200 ${isCollapsed ? 'justify-center px-2' : 'px-4'}`}>
                    {!isCollapsed && (
                        <span className="text-xl font-bold text-blue-600">MarketLive</span>
                    )}
                    {isCollapsed && (
                        <span className="text-xl font-bold text-blue-600">M</span>
                    )}
                </div>

                {/* Navigation */}
                <nav className="flex-1 overflow-y-auto py-4 px-2">
                    {navigation.map((item) => {
                        const isActive = location.pathname === item.href;
                        return (
                            <NavLink
                                key={item.name}
                                to={item.href}
                                className={`
                                    flex items-center px-3 py-2.5 mb-1 rounded-lg transition-colors
                                    ${isActive
                                        ? 'bg-blue-50 text-blue-600'
                                        : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'}
                                    ${isCollapsed ? 'justify-center' : ''}
                                `}
                                title={isCollapsed ? item.name : undefined}
                            >
                                <item.icon className={`h-5 w-5 ${isCollapsed ? '' : 'mr-3'}`} />
                                {!isCollapsed && (
                                    <span className="font-medium">{item.name}</span>
                                )}
                            </NavLink>
                        );
                    })}
                </nav>

                {/* Collapse Toggle */}
                <button
                    onClick={() => setIsCollapsed(!isCollapsed)}
                    className="absolute -right-3 top-20 bg-white border border-gray-200 rounded-full p-1 shadow-sm hover:bg-gray-50 hidden md:flex"
                >
                    {isCollapsed ? (
                        <ChevronRight className="h-4 w-4 text-gray-600" />
                    ) : (
                        <ChevronLeft className="h-4 w-4 text-gray-600" />
                    )}
                </button>

                {/* User Section at Bottom */}
                <div className={`border-t border-gray-200 p-3 ${isCollapsed ? 'flex justify-center' : ''}`}>
                    {!isCollapsed && (
                        <div className="mb-3">
                            <OrganizationSwitcher
                                hidePersonal={false}
                                afterSelectOrganizationUrl="/dashboard"
                                appearance={{
                                    elements: {
                                        rootBox: "w-full",
                                        organizationSwitcherTrigger: "w-full justify-between text-sm"
                                    }
                                }}
                            />
                        </div>
                    )}
                    <div className={`flex items-center ${isCollapsed ? '' : 'space-x-3'}`}>
                        <UserButton afterSignOutUrl="/" />
                    </div>
                </div>
            </aside>

            {/* Main Content Area */}
            <div className={`flex-1 transition-all duration-300 ${isCollapsed ? 'md:ml-16' : 'md:ml-64'}`}>
                {/* Top Bar */}
                <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-4 sticky top-0 z-30">
                    {/* Mobile menu button */}
                    <button
                        onClick={() => setIsMobileOpen(true)}
                        className="md:hidden p-2 rounded-lg hover:bg-gray-100"
                    >
                        <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                        </svg>
                    </button>

                    {/* Page breadcrumb / title could go here */}
                    <div className="hidden md:block" />

                    {/* Right side - notifications */}
                    <div className="flex items-center space-x-4">
                        <NotificationCenter />
                        {/* Mobile: show org switcher and user button in top bar */}
                        <div className="md:hidden flex items-center space-x-2">
                            <OrganizationSwitcher
                                hidePersonal={false}
                                appearance={{
                                    elements: {
                                        organizationSwitcherTrigger: "text-sm"
                                    }
                                }}
                            />
                            <UserButton afterSignOutUrl="/" />
                        </div>
                    </div>
                </header>

                {/* Page Content */}
                <main className="p-6">
                    {children}
                </main>
            </div>
        </div>
    );
};

export default ClientSidebar;
