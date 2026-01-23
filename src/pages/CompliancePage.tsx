import React from 'react';
import MediaCardHeader from '@/components/ui/media-card-header';
import { Button } from '@/components/ui/button';
import Footer from '@/components/layout/Footer';
import { FileText, FileBadge, FileWarning, CheckCircle, Clock } from 'lucide-react';
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Link } from 'react-router-dom';
import { ComplianceKycModal } from "@/components/compliance/ComplianceKycModal";

const CompliancePage = () => {
  // Live documents for compliance monitoring
  const liveDocuments = useQuery(api.documents.listMyDocuments, {}) || [];
  const kycStatus = useQuery(api.compliance.getKycStatus);

  const pendingDocs = liveDocuments.filter(d => d.status === 'draft' || d.status === 'pending');
  const signedDocs = liveDocuments.filter(d => d.docusign?.status === 'completed' || d.status === 'approved');

  const [isKycOpen, setIsKycOpen] = React.useState(false);

  // Derive status UI from real data
  const currentStatus = kycStatus?.status || 'pending';
  const isVerified = currentStatus === 'verified';

  const handleDownloadTemplate = (templateName: string) => {
    // Real download logic using public assets
    const fileName = templateName.replace(/ /g, '_') + '.txt'; // Mapping "Commercial Invoice" -> "Commercial_Invoice.txt"
    const link = document.createElement('a');
    link.href = `/templates/${fileName}`;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    import('sonner').then(({ toast }) => {
      toast.success("Download Started", {
        description: `Downloading ${templateName}...`
      });
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <MediaCardHeader
        title="Compliance"
        subtitle="Regulatory Center"
        description="Manage KYC, document uploads, and trade compliance tasks."
        backgroundImage="https://images.unsplash.com/photo-1542744173-8e7e53415bb0?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80"
        overlayOpacity={0.6}
        className="mb-6"
      />

      <ComplianceKycModal open={isKycOpen} onOpenChange={setIsKycOpen} />

      <div className="px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Status Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-blue-50 rounded-full flex items-center justify-center text-xl">
                ⏳
              </div>
              <h3 className="font-semibold text-gray-900">Pending Reviews</h3>
            </div>
            <p className="text-3xl font-bold pl-1">{pendingDocs.length}</p>
            <p className="text-sm text-gray-500 mt-1 pl-1">Actions required to proceed</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-green-50 rounded-full flex items-center justify-center text-xl">
                ✅
              </div>
              <h3 className="font-semibold text-gray-900">Verified Docs</h3>
            </div>
            <p className="text-3xl font-bold pl-1">{signedDocs.length}</p>
            <p className="text-sm text-gray-500 mt-1 pl-1">Cleared and validated</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
            <div className="flex items-center gap-3 mb-3">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center text-xl ${isVerified ? 'bg-green-50' : 'bg-indigo-50'}`}>
                {isVerified ? '✅' : '🛡️'}
              </div>
              <h3 className="font-semibold text-gray-900">KYC Status</h3>
            </div>
            <p className={`text-xl font-bold pl-1 ${isVerified ? 'text-green-600' : 'text-indigo-600'}`}>
              {isVerified ? 'VERIFIED' : currentStatus === 'submitted' ? 'UNDER REVIEW' : 'ACTION REQUIRED'}
            </p>
            <p className="text-sm text-gray-500 mt-1 pl-1">
              {isVerified ? 'Valid for 365 days' : 'Identity verification needed'}
            </p>
          </div>
        </div>

        {/* 1. Urgent Tasks (Top Priority) */}
        <div className="bg-white rounded-lg border p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <h2 className="text-xl font-semibold text-gray-900">Urgent Compliance Tasks</h2>
            {pendingDocs.length > 0 && (
              <span className="bg-orange-100 text-orange-800 text-xs px-2 py-0.5 rounded-full font-medium">
                {pendingDocs.length} Pending
              </span>
            )}
          </div>
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
              <div className="flex flex-col items-center justify-center py-6 text-gray-500 bg-gray-50 rounded-lg border border-dashed border-gray-200">
                <CheckCircle className="h-8 w-8 text-green-500 mb-2 opacity-50" />
                <p className="font-medium">All clear</p>
                <p className="text-sm">No urgent compliance actions required.</p>
              </div>
            )}
          </div>
        </div>

        {/* 2. Middle Section: Compliance Hub & Quick Links */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2 bg-blue-600 text-white rounded-lg p-6 shadow-md flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div>
              <h3 className="font-bold text-lg mb-2 flex items-center gap-2">
                <span>🛡️</span> Compliance Hub
              </h3>
              <p className="text-blue-100 text-sm max-w-xl">
                Keep your KYC documentation up to date to ensure seamless customs clearance.
                Active verification reduces shipment delays by up to 40%.
              </p>
            </div>
            <Button
              className="whitespace-nowrap bg-white text-blue-600 hover:bg-blue-50 font-semibold shadow-sm w-full md:w-auto"
              onClick={() => setIsKycOpen(true)}
              disabled={isVerified}
            >
              {isVerified ? 'Verification Active' : 'Start KYC Process'}
            </Button>
          </div>

          <div className="bg-white border rounded-lg p-6 shadow-sm">
            <h3 className="font-semibold text-gray-900 mb-4 text-sm uppercase tracking-wide">Quick Links</h3>
            <ul className="space-y-3 text-sm">
              <li>
                <a
                  href="https://www.gov.uk/export-goods"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center text-gray-600 hover:text-blue-600 cursor-pointer group"
                >
                  <div className="w-1.5 h-1.5 bg-gray-300 group-hover:bg-blue-600 rounded-full mr-2 transition-colors"></div>
                  UK Government Export Guide
                </a>
              </li>
              <li>
                <a
                  href="https://www.gov.uk/trade-tariff"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center text-gray-600 hover:text-blue-600 cursor-pointer group"
                >
                  <div className="w-1.5 h-1.5 bg-gray-300 group-hover:bg-blue-600 rounded-full mr-2 transition-colors"></div>
                  Trade Tariff Codes (HS Codes)
                </a>
              </li>
              <li>
                <a
                  href="https://www.gov.uk/government/publications/the-uk-sanctions-list"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center text-gray-600 hover:text-blue-600 cursor-pointer group"
                >
                  <div className="w-1.5 h-1.5 bg-gray-300 group-hover:bg-blue-600 rounded-full mr-2 transition-colors"></div>
                  Sanctions Search Engine
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* 3. Document Templates (Bottom Row) */}
        <div className="bg-white rounded-lg border bg-card text-card-foreground p-6 shadow-sm">
          <div className="mb-6">
            <h2 className="text-xl font-semibold">Document Templates</h2>
            <p className="text-muted-foreground mt-1 text-sm">Download templates for commonly required shipping documents.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { name: 'Commercial Invoice Template', icon: '📄', description: 'Value declaration' },
              { name: 'Bill of Lading Template', icon: '🚢', description: 'Freight receipt' },
              { name: 'Certificate of Origin Template', icon: '🌍', description: 'Source validation' },
              { name: 'Dangerous Goods Declaration', icon: '⚠️', description: 'Hazmat declaration' }
            ].map((item, idx) => (
              <div
                key={idx}
                onClick={() => handleDownloadTemplate(item.name)}
                className="rounded-lg border p-4 hover:bg-gray-50 flex items-center gap-3 cursor-pointer transition-all hover:border-blue-200 hover:shadow-sm group h-full"
              >
                <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-lg flex-shrink-0 flex items-center justify-center text-xl group-hover:scale-105 transition-transform">
                  {item.icon}
                </div>
                <div>
                  <span className="font-semibold text-gray-900 block text-sm">{item.name.replace(' Template', '')}</span>
                  <span className="text-xs text-gray-500">{item.description}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CompliancePage;
