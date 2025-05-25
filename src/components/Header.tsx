import React, { useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { Menu, Stethoscope, X, LayoutDashboard, UserPlus, Search, List, Database } from 'lucide-react';

const Header: React.FC = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const menuItems = [
    { path: '/', text: 'Dashboard', icon: <LayoutDashboard size={20} /> },
    { path: '/register', text: 'Register Patient', icon: <UserPlus size={20} /> },
    { path: '/patients', text: 'Patient List', icon: <List size={20} /> },
    { path: '/query', text: 'Custom Query', icon: <Search size={20} /> },
  ];

  // Common NavLink styles
  const baseNavLinkStyle = `flex items-center rounded-lg font-medium transition-colors duration-200 ease-in-out px-4 py-2`;
  const activeNavLinkStyle = `bg-purple-100 text-purple-700`;
  const inactiveNavLinkStyle = `text-gray-600 hover:bg-gray-100 hover:text-gray-900`;

  return (
    <header className="bg-white sticky top-0 z-30 shadow-sm border-b border-gray-100 font-inter">
      <div className="px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Left section: Logo */}
        <div className="flex items-center">
          <Link to="/" className="flex items-center">
            <Stethoscope className="h-8 w-8 text-purple-600" />
            <span className="ml-2 text-xl font-bold text-gray-900">HealthHub</span>
          </Link>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex space-x-6">
          {menuItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `${baseNavLinkStyle} ${isActive ? activeNavLinkStyle : inactiveNavLinkStyle}`
              }
            >
              {item.text}
            </NavLink>
          ))}
        </nav>

        {/* Right section: User profile and Mobile Menu Toggle */}
        <div className="flex items-center space-x-4">
          <div className="h-10 w-10 rounded-full bg-indigo-500 flex items-center justify-center text-white text-base font-semibold shadow-md">
            MD
          </div>
          <span className="text-base font-medium text-gray-700 hidden sm:inline">
            Dr. Emily Chen
          </span>

          {/* Mobile menu toggle */}
          <button
            type="button"
            className="md:hidden p-2 rounded-full text-gray-500 hover:text-gray-700 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-colors duration-200"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label="Toggle mobile menu"
          >
            {isMobileMenuOpen ? (
              <X className="h-6 w-6" aria-hidden="true" />
            ) : (
              <Menu className="h-6 w-6" aria-hidden="true" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Menu (collapsible) */}
      <div
        className={`md:hidden overflow-hidden transition-all duration-300 ease-in-out ${
          isMobileMenuOpen ? 'max-h-screen opacity-100 py-4' : 'max-h-0 opacity-0'
        }`}
      >
        <nav className="px-4 space-y-2">
          {menuItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={() => setIsMobileMenuOpen(false)} // Close menu on click
              className={({ isActive }) =>
                `${baseNavLinkStyle} ${isActive ? activeNavLinkStyle : inactiveNavLinkStyle} flex items-center`
              }
            >
              <span className="mr-3 text-gray-500 group-hover:text-gray-700 group-[.active]:text-purple-600 transition-colors duration-200">
                {item.icon}
              </span>
              {item.text}
            </NavLink>
          ))}
        </nav>
        <div className="p-4 border-t border-gray-100 mt-4 bg-gray-50">
          <div className="flex items-center text-sm font-medium text-gray-600">
            <Database className="h-5 w-5 text-purple-500 mr-2" />
            <span>Powered by Pglite</span>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;