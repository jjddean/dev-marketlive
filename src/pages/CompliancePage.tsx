import React from 'react';
import MediaCardHeader from '@/components/ui/media-card-header';
import { Button } from '@/components/ui/button';
import Footer from '@/components/layout/Footer';
import { FileText, FileBadge, FileWarning, CheckCircle, Clock } from 'lucide-react';
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Link } from 'react-router-dom';

const CompliancePage = () => {
  // Live documents for compliance monitoring
  const liveDocuments = useQuery(api.documents.listMyDocuments, {}) || [];

  const pendingDocs = liveDocuments.filter(d => d.status === 'draft' || d.status === 'pending');
  const signedDocs = liveDocuments.filter(d => d.docusign?.status === 'completed' || d.status === 'approved');

  return (
    <div className="min-h-screen bg-gray-50">
      <MediaCardHeader
        title="Compliance"
        subtitle="Regulatory Center"
        description="Manage KYC, document uploads, and trade compliance tasks."
        backgroundImage="https://images.unsplash.com/photo-1507208773393-40d9fc9f9777?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80"
        overlayOpacity={0.6}
        className="mb-6"
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Status Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center text-blue-600 mb-2">
              <Clock className="h-5 w-5 mr-2" />
              <h3 className="font-semibold text-gray-900">Pending Reviews</h3>
            </div>
            <p className="text-3xl font-bold">{pendingDocs.length}</p>
            <p className="text-sm text-gray-500 mt-1">Actions required to proceed</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center text-green-600 mb-2">
              <CheckCircle className="h-5 w-5 mr-2" />
              <h3 className="font-semibold text-gray-900">Verified Docs</h3>
            </div>
            <p className="text-3xl font-bold">{signedDocs.length}</p>
            <p className="text-sm text-gray-500 mt-1">Cleared and validated</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center text-indigo-600 mb-2">
              <FileBadge className="h-5 w-5 mr-2" />
              <h3 className="font-semibold text-gray-900">KYC Status</h3>
            </div>
            <p className="text-xl font-bold text-indigo-600">IN PROGRESS</p>
            <p className="text-sm text-gray-500 mt-1">Expires in 184 days</p>
          </div>
        </div>

        {/* Primary Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left: Document Templates (Sacred UI preserved) */}
          <div className="lg:col-span-2 space-y-8">
            <div className="bg-white rounded-lg border bg-card text-card-foreground p-6 shadow-sm">
              <div className="mb-6">
                <h2 className="text-xl font-semibold">Document Templates</h2>
                <p className="text-muted-foreground mt-1">Download templates for commonly required shipping documents:</p>
              </div>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                {[
                  { name: 'Commercial Invoice', icon: FileText, color: 'text-blue-600' },
                  { name: 'Bill of Lading', icon: FileBadge, color: 'text-indigo-600' },
                  { name: 'Certificate of Origin', icon: FileBadge, color: 'text-green-600' },
                  { name: 'Dangerous Goods', icon: FileWarning, color: 'text-amber-600' }
                ].map((item, idx) => (
                  <div key={idx} className="rounded-md border p-4 hover:bg-gray-50 flex items-center gap-3 cursor-pointer transition-colors">
                    <item.icon className={`h-5 w-5 ${item.color}`} />
                    <span className="font-medium text-gray-700">{item.name}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Recent Compliance Alerts */}
            <div className="bg-white rounded-lg border p-6 shadow-sm">
              <h2 className="text-xl font-semibold mb-4">Urgent Compliance Tasks</h2>
              <div className="space-y-4">
                {pendingDocs.length > 0 ? pendingDocs.map((doc: any) => (
                  <div key={doc._id} className="flex items-center justify-between p-4 bg-orange-50 border border-orange-100 rounded-lg">
                    <div className="flex items-center">
                      <FileWarning className="h-5 w-5 text-orange-500 mr-3" />
                      <div>
                        <p className="font-medium text-orange-900 text-sm">{doc.type.replace(/_/g, ' ').toUpperCase()}</p>
                        <p className="text-xs text-orange-700">Needs signature or review: {doc.documentData?.documentNumber}</p>
                      </div>
                    </div>
                    <Button size="sm" variant="outline" asChild className="border-orange-200 text-orange-800 hover:bg-orange-100">
                      <Link to="/documents">Resolve</Link>
                    </Button>
                  </div>
                )) : (
                  <p className="text-sm text-gray-500 italic py-4 text-center">No urgent tasks at this time.</p>
                )}
              </div>
            </div>
          </div>

          {/* Right: Hub Sidebar */}
          <div className="space-y-6">
            <div className="bg-blue-600 text-white rounded-lg p-6 shadow-md">
              <h3 className="font-bold text-lg mb-2">Compliance Hub</h3>
              <p className="text-blue-100 text-sm mb-4">
                Keep your documentation up to date to avoid delays at customs.
              </p>
              <Button className="w-full bg-white text-blue-600 hover:bg-blue-50 font-semibold shadow-sm">
                Start KYC Process
              </Button>
            </div>

            <div className="bg-white border rounded-lg p-6 shadow-sm">
              <h3 className="font-semibold text-gray-900 mb-4">Quick Links</h3>
              <ul className="space-y-3 text-sm">
                <li className="flex items-center text-gray-600 hover:text-blue-600 cursor-pointer">
                  <div className="w-1.5 h-1.5 bg-blue-600 rounded-full mr-2"></div>
                  UK Government Export Guide
                </li>
                <li className="flex items-center text-gray-600 hover:text-blue-600 cursor-pointer">
                  <div className="w-1.5 h-1.5 bg-blue-600 rounded-full mr-2"></div>
                  Trade Tariff Codes (HS Codes)
                </li>
                <li className="flex items-center text-gray-600 hover:text-blue-600 cursor-pointer">
                  <div className="w-1.5 h-1.5 bg-blue-600 rounded-full mr-2"></div>
                  Sanctions Search Engine
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default CompliancePage;
