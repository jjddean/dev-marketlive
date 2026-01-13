import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import MediaCardHeader from '@/components/ui/media-card-header';

const ResourcesPage = () => {
  const resources = [
    {
      title: "Incoterms® 2024 Guide",
      description: "Essential reference for international trade terms, responsibilities, and risk transfer.",
      icon: "📜",
      type: "Guide",
      path: "/contact"
    },
    {
      title: "Customs Compliance",
      description: "Latest updates on UK-EU border protocols and documentation requirements.",
      icon: "⚖️",
      type: "Regulation",
      path: "/compliance"
    },
    {
      title: "Market Updates",
      description: "Weekly analysis of freight rates, capacity trends, and global supply chain disruptions.",
      icon: "📊",
      type: "Report",
      path: "/reports"
    },
    {
      title: "Shipping Glossary",
      description: "A-Z definition of common logistics terms, abbreviations, and acronyms.",
      icon: "📖",
      type: "Reference",
      path: "/about"
    },
    {
      title: "Container Specs",
      description: "Detailed dimensions and load capacities for all standard container types (20', 40', HC, Reefer).",
      icon: "📏",
      type: "Technical",
      path: "/platform"
    },
    {
      title: "Sustainability",
      description: "Tools for calculating and reducing the carbon footprint of your logistics operations.",
      icon: "🌱",
      type: "Tool",
      path: "/solutions"
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <MediaCardHeader
        title="Logistics Knowledge Hub"
        description="Stay ahead with expert insights, regulatory guides, and market intelligence."
        backgroundImage="https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80"
        overlayOpacity={0.6}
        className="h-[350px] lg:h-[450px]"
      >
        <div className="flex gap-4">
          <Button asChild size="lg" className="bg-white text-primary-900 hover:bg-white/90">
            <Link to="/contact">Subscribe to Updates</Link>
          </Button>
        </div>
      </MediaCardHeader>

      {/* Resources Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-primary-900 mb-4">Latest Resources</h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Tools and information to help you optimize your shipping operations.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {resources.map((resource, index) => (
            <div
              key={index}
              className="bg-white rounded-lg p-6 shadow-sm hover:shadow-lg transition-all duration-300 border border-gray-100 group flex flex-col"
            >
              <div className="flex justify-between items-start mb-4">
                <div className="w-12 h-12 bg-primary-50 rounded-lg flex items-center justify-center text-2xl group-hover:scale-110 transition-transform duration-300">
                  {resource.icon}
                </div>
                <span className="text-xs font-semibold px-2 py-1 bg-gray-100 text-gray-600 rounded-full uppercase tracking-wider">
                  {resource.type}
                </span>
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2 group-hover:text-primary-700 transition-colors">
                {resource.title}
              </h3>
              <p className="text-sm text-gray-600 mb-6 flex-grow leading-relaxed">
                {resource.description}
              </p>
              <Button asChild variant="outline" size="sm" className="w-full mt-auto">
                <Link to={resource.path}>View Resource</Link>
              </Button>
            </div>
          ))}
        </div>
      </div>

      {/* Newsletter Section */}
      <div className="bg-white py-20 border-t border-gray-100">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <span className="text-5xl mb-6 block">📩</span>
          <h2 className="text-2xl font-bold text-primary-900 mb-4">Get Market Insights Directly to Your Inbox</h2>
          <p className="text-gray-600 mb-8 max-w-2xl mx-auto">
            Join 5,000+ logistics professionals receiving our weekly digest of rate trends, port updates, and regulatory changes.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center max-w-md mx-auto">
            {/* Simulated Input */}
            <div className="flex-grow">
              <input
                type="email"
                placeholder="Enter your work email"
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-500"
                disabled
              />
            </div>
            <Button size="lg" className="bg-primary hover:bg-primary/90">
              Subscribe
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResourcesPage;