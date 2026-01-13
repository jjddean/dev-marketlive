import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import MediaCardHeader from '@/components/ui/media-card-header';

const ServicesPage = () => {
  const services = [
    {
      title: "Global Freight Coordination",
      description: "Seamless movement of goods across borders with our integrated carrier network covering air, sea, and rail.",
      icon: "🌍",
      path: "/quotes"
    },
    {
      title: "Customs Brokerage",
      description: "Expert handling of documentation, tariffs, and compliance to ensure your shipments clear customs without delay.",
      icon: "🛃",
      path: "/compliance"
    },
    {
      title: "Risk Advisory",
      description: "Data-driven insights to navigate volatile routes, avoiding disruptions and optimizing supply chain resilience.",
      icon: "🛡️",
      path: "/reports"
    },
    {
      title: "Real-Time Tracking",
      description: "End-to-end visibility of your cargo with satellite tracking and automated milestone updates.",
      icon: "📡",
      path: "/shipments"
    },
    {
      title: "Warehousing Solutions",
      description: "Strategic storage facilities in key global hubs to manage inventory flow and distribution effectively.",
      icon: "🏭",
      path: "/contact"
    },
    {
      title: "Express Logistics",
      description: "Prioritized handling for time-critical shipments that simply cannot wait for standard transit times.",
      icon: "⚡",
      path: "/quotes"
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <MediaCardHeader
        title="World-Class Logistics Services"
        description="Comprehensive freight solutions designed to accelerate your business growth globally."
        backgroundImage="https://images.unsplash.com/photo-1578575437130-527eed3abbec?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80"
        overlayOpacity={0.5}
        className="h-[400px] lg:h-[500px]"
      >
        <div className="flex gap-4">
          <Button asChild size="lg" className="bg-white text-primary-900 hover:bg-white/90">
            <Link to="/contact">Consult an Expert</Link>
          </Button>
        </div>
      </MediaCardHeader>

      {/* Services Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-primary-900 mb-4">Our Expertise</h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            We combine decades of experience with cutting-edge technology to deliver superior shipping outcomes.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {services.map((service, index) => (
            <div
              key={index}
              className="bg-white rounded-lg p-6 shadow-sm hover:shadow-lg transition-all duration-300 border border-gray-100 group"
            >
              <div className="w-12 h-12 bg-primary-50 rounded-lg flex items-center justify-center text-2xl mb-4 group-hover:scale-110 transition-transform duration-300">
                {service.icon}
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2 group-hover:text-primary-700 transition-colors">
                {service.title}
              </h3>
              <p className="text-sm text-gray-600 mb-4 leading-relaxed">
                {service.description}
              </p>
              <Link
                to={service.path}
                className="inline-flex items-center text-sm text-primary-600 font-semibold hover:text-primary-800 transition-colors"
              >
                Learn more <span className="ml-1">→</span>
              </Link>
            </div>
          ))}
        </div>
      </div>

      {/* Process Section */}
      <div className="bg-white py-20 border-t border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-2xl font-bold text-primary-900 mb-6">Streamlined Operations</h2>
              <div className="space-y-8">
                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-primary-50 text-primary-700 flex items-center justify-center text-xl">📋</div>
                  <div>
                    <h3 className="text-lg font-bold text-gray-900 mb-2">Quote</h3>
                    <p className="text-sm text-gray-600">Get instant pricing across multiple carriers and modes tailored to your specific load requirements.</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-primary-50 text-primary-700 flex items-center justify-center text-xl">📦</div>
                  <div>
                    <h3 className="text-lg font-bold text-gray-900 mb-2">Book</h3>
                    <p className="text-sm text-gray-600">Secure capacity instantly with guaranteed space allocation on your preferred sailings.</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-primary-50 text-primary-700 flex items-center justify-center text-xl">📍</div>
                  <div>
                    <h3 className="text-lg font-bold text-gray-900 mb-2">Track</h3>
                    <p className="text-sm text-gray-600">Monitor your cargo in real-time with automated alerts and predictive ETA updates.</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="relative">
              <div className="absolute -inset-4 bg-secondary/10 rounded-2xl transform rotate-3"></div>
              <img
                src="https://images.unsplash.com/photo-1494412574643-35d324698420?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80"
                alt="Logistics Operations"
                className="relative rounded-xl shadow-2xl"
              />
            </div>
          </div>
        </div>
      </div>

      {/* CTA Banner */}
      <div className="bg-primary-900 py-16">
        <div className="max-w-5xl mx-auto px-4 text-center">
          <h2 className="text-2xl font-bold text-white mb-6">Ready to Optimize Your Logistics?</h2>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg" className="bg-secondary hover:bg-secondary/90 text-white px-8">
              <Link to="/quotes">Start a Quote</Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="border-white text-white hover:bg-white/10 px-8">
              <Link to="/contact">Contact Sales</Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ServicesPage;