import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { SignedIn, SignedOut, UserButton, OrganizationSwitcher } from '@clerk/clerk-react';
import AuthButtons from './AuthButtons';
import NotificationCenter from './ui/notification-center';

interface SubMenuItem {
  label: string;
  path: string;
  protected: boolean;
}

interface MenuItem {
  label: string;
  path?: string;
  submenu?: SubMenuItem[];
  protected: boolean;
  hideOnAuth?: boolean;
}

const Navbar: React.FC = () => {
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const location = useLocation();

  // Close dropdown when route changes
  useEffect(() => {
    setActiveMenu(null);
  }, [location.pathname]);

  const menuItems: MenuItem[] = [
    { label: 'Home', path: '/', protected: false },
    // Marketing pages - only show when signed out
    { label: 'Services', path: '/services', protected: false, hideOnAuth: true },
    { label: 'Solutions', path: '/solutions', protected: false, hideOnAuth: true },
    { label: 'Platform', path: '/platform', protected: false, hideOnAuth: true },
    { label: 'Resources', path: '/resources', protected: false, hideOnAuth: true },
    { label: 'About', path: '/about', protected: false, hideOnAuth: true },
    { label: 'Contact', path: '/contact', protected: false },

    // App pages - always show (protected handles visibility)
    { label: 'Dashboard', path: '/dashboard', protected: true },
    { label: 'Shipments', path: '/shipments', protected: true },
    { label: 'Bookings', path: '/bookings', protected: true },
    { label: 'Quotes', path: '/quotes', protected: true },
    { label: 'Payments', path: '/payments', protected: true },
    { label: 'Documents', path: '/documents', protected: true },
    { label: 'Compliance', path: '/compliance', protected: true },
    { label: 'Reports', path: '/reports', protected: true },
  ];
  const toggleSubmenu = (label: string) => {
    if (activeMenu === label) {
      setActiveMenu(null);
    } else {
      setActiveMenu(label);
    }
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/" className="navbar-logo">
          MarketLive
        </Link>

        <ul className="nav-menu">
          {menuItems.map((item: any) => {
            // For protected items, only show when signed in
            if (item.protected) {
              return (
                <SignedIn key={item.label}>
                  <li className="nav-item">
                    {item.submenu ? (
                      <>
                        <div
                          className={`nav-link ${activeMenu === item.label ? 'active' : ''}`}
                          onClick={() => toggleSubmenu(item.label)}
                        >
                          {item.label} <span className="dropdown-arrow">▼</span>
                        </div>
                        {activeMenu === item.label && (
                          <ul className="submenu">
                            {item.submenu.map((subItem: any) => (
                              <li key={subItem.label} className="submenu-item">
                                <Link to={subItem.path} className="submenu-link">
                                  {subItem.label}
                                </Link>
                              </li>
                            ))}
                          </ul>
                        )}
                      </>
                    ) : (
                      <Link to={item.path || '#'} className="nav-link">
                        {item.label}
                      </Link>
                    )}
                  </li>
                </SignedIn>
              );
            } else if (item.hideOnAuth) {
              // Marketing items hidden when auth
              return (
                <SignedOut key={item.label}>
                  <li className="nav-item">
                    <Link to={item.path || '#'} className="nav-link">
                      {item.label}
                    </Link>
                  </li>
                </SignedOut>
              );
            } else {
              // Non-protected, always visible (Home, Contact)
              return (
                <li key={item.label} className="nav-item">
                  <Link to={item.path || '#'} className="nav-link">
                    {item.label}
                  </Link>
                </li>
              );
            }
          })}
        </ul>

        <div className="auth-section">
          <SignedIn>
            <div className="flex items-center space-x-4">
              <OrganizationSwitcher
                hidePersonal={false}
                afterCreateOrganizationUrl="/dashboard"
                afterSelectOrganizationUrl="/dashboard"
                appearance={{
                  elements: {
                    rootBox: "flex items-center",
                    organizationSwitcherTrigger: "text-sm"
                  }
                }}
              />
              <NotificationCenter />
              <UserButton />
            </div>
          </SignedIn>
          <SignedOut>
            <AuthButtons />
          </SignedOut>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;