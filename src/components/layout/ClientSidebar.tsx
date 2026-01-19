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
    Menu,
    Settings
} from 'lucide-react';
import { UserButton, OrganizationSwitcher } from '@clerk/clerk-react';
import NotificationCenter from '@/components/ui/notification-center';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';

interface ClientSidebarProps {
    children: React.ReactNode;
}

const ClientSidebar = ({ children }: ClientSidebarProps) => {
    const location = useLocation();
    const [isCollapsed, setIsCollapsed] = useState(false);

    // Auto-collapse on smaller desktop screens
    useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth >= 768 && window.innerWidth < 1024) {
                setIsCollapsed(true);
            }
        };
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

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

    const NavItem = ({ item, collapsed }: { item: typeof navigation[0], collapsed: boolean }) => {
        const isActive = location.pathname.startsWith(item.href);

        const link = (
            <NavLink
                to={item.href}
                className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all hover:text-primary",
                    isActive
                        ? "bg-muted text-primary"
                        : "text-muted-foreground hover:bg-muted/50"
                )}
            >
                <item.icon className="h-5 w-5" />
                {!collapsed && <span>{item.name}</span>}
            </NavLink>
        );

        if (collapsed) {
            return (
                <Tooltip delayDuration={0}>
                    <TooltipTrigger asChild>
                        <NavLink
                            to={item.href}
                            className={cn(
                                "flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:text-foreground md:h-8 md:w-8",
                                isActive && "bg-accent text-accent-foreground"
                            )}
                        >
                            <item.icon className="h-5 w-5" />
                            <span className="sr-only">{item.name}</span>
                        </NavLink>
                    </TooltipTrigger>
                    <TooltipContent side="right" className="text-black bg-white border shadow-md">
                        {item.name}
                    </TooltipContent>
                </Tooltip>
            );
        }

        return link;
    };

    return (
        <TooltipProvider>
            <div className="flex min-h-screen w-full flex-col bg-muted/40 md:flex-row">

                {/* Desktop Sidebar */}
                <aside className={cn(
                    "hidden border-r bg-background transition-all duration-300 md:flex md:flex-col md:fixed md:inset-y-0 z-50",
                    isCollapsed ? "md:w-14" : "md:w-64"
                )}>
                    {/* Header / Logo */}
                    <div className={cn(
                        "flex h-16 items-center border-b px-4",
                        isCollapsed ? "justify-center px-0" : "justify-between"
                    )}>
                        {!isCollapsed && (
                            <div className="flex items-center gap-2 font-semibold">
                                <Package className="h-6 w-6" />
                                <span className="">MarketLive</span>
                            </div>
                        )}
                        {isCollapsed && <Package className="h-6 w-6" />}

                        {/* Collapse Toggle */}
                        {!isCollapsed && (
                            <Button variant="ghost" size="icon" className="h-8 w-8 ml-auto" onClick={() => setIsCollapsed(true)}>
                                <ChevronLeft className="h-4 w-4" />
                            </Button>
                        )}
                    </div>
                    {isCollapsed && (
                        <div className="flex justify-center py-2">
                            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setIsCollapsed(false)}>
                                <ChevronRight className="h-4 w-4" />
                            </Button>
                        </div>
                    )}

                    {/* Nav Links */}
                    <div className="flex-1 overflow-auto py-2">
                        <nav className={cn(
                            "grid gap-1 px-2 group-[[data-collapsed=true]]:justify-center group-[[data-collapsed=true]]:px-2",
                            isCollapsed ? "justify-center" : ""
                        )}>
                            {navigation.map((item) => (
                                <NavItem key={item.name} item={item} collapsed={isCollapsed} />
                            ))}
                        </nav>
                    </div>

                    {/* Footer / Org Switcher */}
                    <div className="mt-auto p-4 border-t">
                        {!isCollapsed ? (
                            <OrganizationSwitcher appearance={{
                                elements: { rootBox: "w-full" }
                            }} />
                        ) : (
                            // Fallback icon or user button if collapsed
                            <div className="flex justify-center">
                                <UserButton />
                            </div>
                        )}
                    </div>
                </aside>

                {/* Content Wrapper */}
                <div className={cn(
                    "flex flex-col flex-1 transition-all duration-300",
                    !isCollapsed && "md:ml-64",
                    isCollapsed && "md:ml-14"
                )}>
                    {/* Header - Aligned with Sidebar Header (h-16 / 64px) */}
                    <header className="flex h-16 items-center gap-4 border-b bg-background px-4 lg:px-6 sticky top-0 z-40">
                        {/* Mobile Menu */}
                        <Sheet>
                            <SheetTrigger asChild>
                                <Button
                                    variant="outline"
                                    size="icon"
                                    className="shrink-0 md:hidden"
                                >
                                    <Menu className="h-5 w-5" />
                                    <span className="sr-only">Toggle navigation</span>
                                </Button>
                            </SheetTrigger>
                            <SheetContent side="left" className="flex flex-col bg-white">
                                <div className="flex items-center gap-2 text-lg font-semibold mb-6">
                                    <Package className="h-6 w-6" />
                                    <span>MarketLive</span>
                                </div>
                                <nav className="grid gap-2 text-lg font-medium">
                                    {navigation.map((item) => (
                                        <NavLink
                                            key={item.name}
                                            to={item.href}
                                            className={({ isActive }) => cn(
                                                "mx-[-0.65rem] flex items-center gap-4 rounded-xl px-3 py-2 hover:text-foreground",
                                                isActive ? "bg-muted text-foreground" : "text-muted-foreground"
                                            )}
                                        >
                                            <item.icon className="h-5 w-5" />
                                            {item.name}
                                        </NavLink>
                                    ))}
                                </nav>
                                <div className="mt-auto">
                                    <OrganizationSwitcher />
                                </div>
                            </SheetContent>
                        </Sheet>

                        {/* Page Title */}
                        <div className="w-full flex-1">
                            <span className="text-lg font-semibold text-gray-800">
                                {navigation.find(n => n.href === location.pathname)?.name || 'Dashboard'}
                            </span>
                        </div>

                        {/* Header Actions */}
                        <div className="flex items-center gap-2">
                            <NotificationCenter />
                            <UserButton afterSignOutUrl="/" />
                        </div>
                    </header>

                    {/* Main Content */}
                    <main className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6">
                        {children}
                    </main>
                </div>
            </div>
        </TooltipProvider>
    );
};

export default ClientSidebar;
