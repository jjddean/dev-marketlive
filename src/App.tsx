import React, { useEffect } from 'react';
import {
  SignedIn,
  SignedOut,
  SignInButton,
  SignUpButton,
  UserButton,
  ClerkProvider,
  useAuth,
  useUser
} from '@clerk/clerk-react';
import { Button } from '@/components/ui/button';
import { Routes, Route, Navigate, useLocation, BrowserRouter } from 'react-router-dom';
import { ConvexProviderWithClerk } from "convex/react-clerk";
import { ConvexReactClient } from "convex/react";
import { Toaster } from 'sonner';

// Components
import Navbar from './components/Navbar';
import MobileNavigation from './components/mobile/MobileNavigation';
import { AIAssistant } from './components/ai/AIAssistant';
import AdminLayout from './components/layout/admin/AdminLayout';

// Pages
import {
  HomePage, ServicesPage, SolutionsPage, PlatformPage,
  ResourcesPage, AboutPage, ContactPage, DashboardPage,
  ShipmentsPage, PaymentsPage, CompliancePage, DocumentsPage,
  ReportsPage, AccountPage, ClientQuotesPage, WaitlistPage,
} from './pages';
import ClientBookingsPage from './pages/client/ClientBookingsPage';
import ApiDocsPage from './pages/ApiDocsPage';
import SharedDocumentPage from './pages/SharedDocumentPage';
import DocusignCallbackPage from './pages/DocusignCallbackPage';
import AdminDashboardPage from './pages/admin/AdminDashboardPage';
import AdminBookingsPage from './pages/admin/AdminBookingsPage';
import AdminShipmentsPage from './pages/admin/AdminShipmentsPage';
import AdminCarriersPage from './pages/admin/AdminCarriersPage';
import AdminDocumentsPage from './pages/admin/AdminDocumentsPage';
import AdminCompliancePage from './pages/admin/AdminCompliancePage';
import AdminCustomersPage from './pages/admin/AdminCustomersPage';
import AdminSettingsPage from './pages/admin/AdminSettingsPage';
import DocumentPrintPage from './pages/DocumentPrintPage';
import ClientSidebar from './components/layout/ClientSidebar';
import { useRole } from './hooks/useRole';

// Initialization
const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;
const convex = new ConvexReactClient(import.meta.env.VITE_CONVEX_URL as string);

if (!PUBLISHABLE_KEY) {
  throw new Error('Missing Clerk Publishable Key');
}

// --- Helper Components ---

interface LayoutProps {
  children: React.ReactNode;
}

function Layout({ children }: LayoutProps) {
  const location = useLocation();
  const isAdmin = location.pathname.startsWith('/admin');

  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js').catch(err => console.log('SW failed', err));
    }
    console.log("MARKET LIVE: Version 8080");
  }, []);
  const isClientApp = [
    '/dashboard', '/shipments', '/bookings', '/quotes',
    '/payments', '/documents', '/compliance', '/reports', '/account'
  ].some(path => location.pathname.startsWith(path));

  return (
    <>
      {!isAdmin && !isClientApp && <Navbar />}
      {!isAdmin && !isClientApp && <MobileNavigation />}
      <AIAssistant />
      <Toaster richColors position="bottom-right" style={{ zIndex: 99999 }} />
      <main className="min-h-screen">{children}</main>
    </>
  );
}

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  return (
    <>
      <SignedIn>{children}</SignedIn>
      <SignedOut>
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Sign In Required</h2>
            <div className="space-x-4">
              <SignInButton mode="modal">
                <button className="px-4 py-2 bg-blue-600 text-white rounded">Sign In</button>
              </SignInButton>
              <SignUpButton mode="modal">
                <button className="px-4 py-2 border border-gray-300 rounded">Sign Up</button>
              </SignUpButton>
            </div>
          </div>
        </div>
      </SignedOut>
    </>
  );
}

// Admin Route Wrapper - Role-based permissions
function AdminRoute({ children }: { children: React.ReactNode }) {
  const { user, isLoaded } = useUser();
  const { isAdmin, isPlatformAdmin, isLoading: isRoleLoading } = useRole();

  if (!isLoaded || isRoleLoading) return <div className="p-20 text-center">Loading...</div>;

  // Allow access if user is admin or platform superadmin
  // Also fallback to email whitelist for backward compatibility during migration
  const adminEmails = (import.meta.env.VITE_ADMIN_EMAILS || '').split(',').filter(Boolean);
  const userEmail = user?.primaryEmailAddress?.emailAddress;
  const isEmailWhitelisted = userEmail && adminEmails.includes(userEmail);

  if (!user || (!isAdmin && !isEmailWhitelisted)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 flex-col">
        <h1 className="text-3xl font-bold text-red-600 mb-2">Access Denied</h1>
        <p className="text-gray-600 mb-6">You do not have permission to view the Admin Portal.</p>
        <p className="text-sm text-gray-400 mb-4">
          Role required: <code className="bg-gray-100 px-2 py-1 rounded">admin</code> or <code className="bg-gray-100 px-2 py-1 rounded">platform:superadmin</code>
        </p>
        <Button onClick={() => window.location.href = '/dashboard'}>Return to Dashboard</Button>
      </div>
    );
  }

  return <>{children}</>;
}

// --- Main App Component ---

export default function App() {
  // Setup view if key is placeholder
  if (PUBLISHABLE_KEY === 'pk_test_placeholder_key') {
    return <div className="p-20"><h1>Please update your .env with a real Clerk Key</h1></div>;
  }

  return (
    <BrowserRouter>
      <ClerkProvider publishableKey={PUBLISHABLE_KEY}>
        <ConvexProviderWithClerk client={convex} useAuth={useAuth}>
          <Layout>
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<HomePage />} />
              <Route path="/services" element={<ServicesPage />} />
              <Route path="/solutions" element={<SolutionsPage />} />
              <Route path="/about" element={<AboutPage />} />
              <Route path="/contact" element={<ContactPage />} />
              <Route path="/api" element={<ApiDocsPage />} />
              <Route path="/api" element={<ApiDocsPage />} />
              <Route path="/access" element={<WaitlistPage />} />
              <Route path="/shared/:token" element={<SharedDocumentPage />} />
              <Route path="/api/docusign/callback" element={<DocusignCallbackPage />} />

              {/* Admin Routes (Wrapped in ProtectedRoute & AdminRoute & AdminLayout) */}
              <Route path="/admin/*" element={
                <ProtectedRoute>
                  <AdminRoute>
                    <AdminLayout>
                      <Routes>
                        <Route index element={<AdminDashboardPage />} />
                        <Route path="bookings" element={<AdminBookingsPage />} />
                        <Route path="shipments" element={<AdminShipmentsPage />} />
                        <Route path="carriers" element={<AdminCarriersPage />} />
                        <Route path="documents" element={<AdminDocumentsPage />} />
                        <Route path="settings" element={<AdminSettingsPage />} />
                      </Routes>
                    </AdminLayout>
                  </AdminRoute>
                </ProtectedRoute>
              } />

              {/* Protected User Routes with Client Sidebar */}
              <Route path="/dashboard" element={<ClientSidebar><DashboardPage /></ClientSidebar>} />
              <Route path="/shipments" element={<ClientSidebar><ShipmentsPage /></ClientSidebar>} />
              <Route path="/account" element={<ClientSidebar><AccountPage /></ClientSidebar>} />
              <Route path="/quotes" element={<ClientSidebar><ClientQuotesPage /></ClientSidebar>} />
              <Route path="/bookings" element={<ClientSidebar><ClientBookingsPage /></ClientSidebar>} />
              <Route path="/payments" element={<ClientSidebar><PaymentsPage /></ClientSidebar>} />
              <Route path="/documents" element={<ClientSidebar><DocumentsPage /></ClientSidebar>} />
              <Route path="/documents/print/:documentId" element={<DocumentPrintPage />} />
              <Route path="/compliance" element={<ClientSidebar><CompliancePage /></ClientSidebar>} />
              <Route path="/reports" element={<ClientSidebar><ReportsPage /></ClientSidebar>} />

              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </Layout>
        </ConvexProviderWithClerk>
      </ClerkProvider>
    </BrowserRouter>
  );
}  