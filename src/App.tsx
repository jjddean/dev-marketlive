import React, { useEffect } from 'react';
import { ClerkProvider, SignedIn, SignedOut, UserButton } from '@clerk/clerk-react';
import { BrowserRouter, Route, Routes, useNavigate, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import MobileNavigation from './components/mobile/MobileNavigation';
import { CommandMenu } from './components/CommandMenu';
import { AIAssistant } from './components/ai/AIAssistant';
import { Toaster } from 'sonner';

// ... (other imports)
// Note: I cannot replace imports easily if they are scattered. 
// I will target the imports block at the top if possible, or just add them.
// Actually, looking at the file, imports are at lines 4-5.
// I will use a larger block replacement to be safe.

// Import all pages
import {
  HomePage,
  ServicesPage,
  SolutionsPage,
  PlatformPage,
  ResourcesPage,
  AboutPage,
  ContactPage,
  DashboardPage,
  ShipmentsPage,
  PaymentsPage,
  CompliancePage,
  DocumentsPage,
  ReportsPage,
  AccountPage,

  ClientQuotesPage,
  ClientBookingsPage
} from './pages';
import ApiDocsPage from './pages/ApiDocsPage';
import SharedDocumentPage from './pages/SharedDocumentPage';

// Import your publishable key
const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

if (!PUBLISHABLE_KEY) {
  throw new Error('Missing Publishable Key');
}

// Layout component that includes the Navbar
interface LayoutProps {
  children: React.ReactNode;
}

function Layout({ children }: LayoutProps) {
  useEffect(() => {
    // Register service worker for PWA functionality
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js')
        .then((registration) => {
          console.log('SW registered: ', registration);
        })
        .catch((registrationError) => {
          console.log('SW registration failed: ', registrationError);
        });
    }

    // Add PWA install prompt handling
    let deferredPrompt: any;
    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      deferredPrompt = e;
      // Show install button or banner
      console.log('PWA install prompt available');
    });

    // Handle app installed
    window.addEventListener('appinstalled', () => {
      console.log('PWA was installed');
      deferredPrompt = null;
    });
    console.log("MARKET LIVE: Version 8080 - No Banner");
  }, []);

  return (
    <>
      <Navbar />
      <MobileNavigation />
      {/* <CommandMenu /> - temporarily disabled due to Convex connection issue */}
      <AIAssistant />
      <AIAssistant />
      <Toaster richColors position="bottom-right" />
      <main className="min-h-screen">{children}</main>
    </>
  );
}

// User profile page - protected
function UserProfilePage() {
  return (
    <div className="protected-page">
      <h1>User Profile</h1>
      <p>This is your personal profile page. You can only see this if you're signed in.</p>
      <div className="user-profile-content">
        <UserButton />
      </div>
    </div>
  );
}

// User settings page - protected
function UserSettingsPage() {
  return (
    <div className="protected-page">
      <h1>User Settings</h1>
      <p>Manage your account settings here. This page is protected.</p>
    </div>
  );
}

// User dashboard page - protected
function UserDashboardPage() {
  return (
    <div className="protected-page">
      <h1>User Dashboard</h1>
      <p>View your personalized dashboard. This page is protected.</p>
    </div>
  );
}

// Protected route component - simplified
interface ProtectedRouteProps {
  children: React.ReactNode;
}

function ProtectedRoute({ children }: ProtectedRouteProps) {
  return (
    <>
      <SignedIn>{children}</SignedIn>
      <SignedOut>
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Sign In Required</h2>
            <p className="text-gray-600 mb-6">Please sign in to access this page.</p>
            <div className="space-x-4">
              <button className="px-4 py-2 bg-primary text-white rounded hover:bg-primary-700">
                Sign In
              </button>
              <button className="px-4 py-2 border border-gray-300 text-gray-700 rounded hover:bg-gray-50">
                Sign Up
              </button>
            </div>
          </div>
        </div>
      </SignedOut>
    </>
  );
}

import { ConvexProviderWithClerk } from "convex/react-clerk";
import { ConvexReactClient } from "convex/react";
import { useAuth } from "@clerk/clerk-react";

const convex = new ConvexReactClient(import.meta.env.VITE_CONVEX_URL as string);

function App() {
  // For development purposes, show a placeholder UI when no valid key is available
  if (PUBLISHABLE_KEY === 'pk_test_placeholder_key') {
    return (
      <div className="setup-needed">
        <h1>Clerk Authentication Setup</h1>
        <p>To use this application, you need to set up your Clerk account:</p>
        <ol>
          <li>Sign up at <a href="https://clerk.com" target="_blank" rel="noopener noreferrer">clerk.com</a></li>
          <li>Create a new application in the Clerk dashboard</li>
          <li>Get your publishable key from the API Keys section</li>
          <li>Add it to your <code>.env</code> file as <code>VITE_CLERK_PUBLISHABLE_KEY</code></li>
          <li>Restart the development server</li>
        </ol>
        <div className="demo-box">
          <h2>Demo Preview</h2>
          <p>This is what the app will look like once configured:</p>
          <div className="demo-ui">
            <div className="demo-public">
              <h3>Public Page</h3>
              <p>Accessible to all users</p>
              <div className="demo-buttons">
                <button>Sign In</button>
                <button>Sign Up</button>
              </div>
            </div>
            <div className="demo-protected">
              <h3>Protected Page</h3>
              <p>Only for authenticated users</p>
              <div className="demo-user">User Profile</div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Normal app with valid Clerk key
  return (
    <BrowserRouter>
      <ClerkProvider publishableKey={PUBLISHABLE_KEY}>
        <ConvexProviderWithClerk client={convex} useAuth={useAuth}>
          <Layout>
            <Routes>
              {/* Authentication handled via modals */}

              {/* Public Pages */}
              <Route path="/" element={<HomePage />} />
              <Route path="/services" element={<ServicesPage />} />
              <Route path="/solutions" element={<SolutionsPage />} />
              <Route path="/platform" element={<PlatformPage />} />
              <Route path="/resources" element={<ResourcesPage />} />
              <Route path="/about" element={<AboutPage />} />
              <Route path="/contact" element={<ContactPage />} />
              <Route path="/api" element={<ApiDocsPage />} />
              <Route path="/shared/:token" element={<SharedDocumentPage />} />

              {/* Protected User Pages */}
              <Route path="/dashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
              <Route path="/shipments" element={<ProtectedRoute><ShipmentsPage /></ProtectedRoute>} />
              <Route path="/payments" element={<ProtectedRoute><PaymentsPage /></ProtectedRoute>} />
              <Route path="/documents" element={<ProtectedRoute><DocumentsPage /></ProtectedRoute>} />
              <Route path="/compliance" element={<ProtectedRoute><CompliancePage /></ProtectedRoute>} />
              <Route path="/reports" element={<ProtectedRoute><ReportsPage /></ProtectedRoute>} />
              <Route path="/account" element={<ProtectedRoute><AccountPage /></ProtectedRoute>} />
              <Route path="/quotes" element={<ProtectedRoute><ClientQuotesPage /></ProtectedRoute>} />
              <Route path="/bookings" element={<ProtectedRoute><ClientBookingsPage /></ProtectedRoute>} />

              {/* Fallback route */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </Layout>
        </ConvexProviderWithClerk>
      </ClerkProvider>
    </BrowserRouter>
  );
}

export default App;