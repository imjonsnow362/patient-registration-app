import React, { useEffect } from 'react';
import { NavLink, Link } from 'react-router-dom'; // Import Link for the brand in mobile nav
import { XCircle, LayoutDashboard, UserPlus, Search, List, Database, Stethoscope } from 'lucide-react'; // Changed User to UserPlus for clarity

interface NavPanelProps {
  isOpen: boolean; // For mobile
  onHide: () => void; // For mobile
  isCollapsed: boolean; // For desktop
}

const NavPanel: React.FC<NavPanelProps> = ({ isOpen, onHide, isCollapsed }) => {
  // Close mobile nav on resize to desktop size
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768 && isOpen) {
        onHide();
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [isOpen, onHide]);

  const menuItems = [
    { path: '/', text: 'Dashboard', icon: <LayoutDashboard size={20} /> }, // Larger icon size
    { path: '/register', text: 'Add Patient', icon: <UserPlus size={20} /> },
    { path: '/patients', text: 'Patient Records', icon: <List size={20} /> },
    { path: '/query', text: 'SQL Query', icon: <Search size={20} /> },
  ];

  // Styles for NavLink
  const baseNavLinkStyle = `flex items-center rounded-lg font-medium transition-all duration-200 ease-in-out whitespace-nowrap`;
  const activeNavLinkStyle = `bg-purple-100 text-purple-700 shadow-sm py-3 px-4 transform translate-x-1`; // Subtle hover on active
  const inactiveNavLinkStyle = `text-gray-600 hover:bg-gray-100 hover:text-gray-900 py-3 px-4`;

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-gray-800 bg-opacity-70 md:hidden"
          onClick={onHide}
          aria-hidden="true"
        ></div>
      )}

      {/* Mobile navigation (fixed, slides in/out) */}
      <div
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-xl transform transition-transform duration-300 ease-in-out md:hidden ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        } flex flex-col font-inter`}
      >
        <div className="flex items-center justify-between h-16 px-4 border-b border-gray-100 bg-purple-50">
          <Link to="/" className="flex items-center">
            <Stethoscope className="h-7 w-7 text-purple-600" />
            <span className="ml-2 text-xl font-bold text-gray-900">HealthHub</span>
          </Link>
          <button
            type="button"
            className="p-2 rounded-full text-gray-500 hover:text-gray-700 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-colors duration-200"
            onClick={onHide}
            aria-label="Hide navigation"
          >
            <XCircle className="h-6 w-6" aria-hidden="true" />
          </button>
        </div>
        <nav className="flex-1 mt-6 px-4 space-y-2 overflow-y-auto">
          {menuItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={onHide}
              className={({ isActive }) =>
                `${baseNavLinkStyle} ${isActive ? activeNavLinkStyle : inactiveNavLinkStyle}`
              }
            >
              <span className="mr-3 text-gray-500 group-hover:text-gray-700 group-[.active]:text-purple-600 transition-colors duration-200">
                {item.icon}
              </span>
              {item.text}
            </NavLink>
          ))}
        </nav>
        <div className="p-4 border-t border-gray-100 bg-gray-50">
          <div className="flex items-center text-sm font-medium text-gray-600">
            <Database className="h-5 w-5 text-purple-500 mr-2" />
            <span>Powered by Pglite</span>
          </div>
        </div>
      </div>

      {/* Desktop navigation (always visible, collapses) */}
      <div
        className={`hidden md:flex md:flex-shrink-0 flex-col bg-white border-r border-gray-100 shadow-md transform transition-all duration-300 ease-in-out ${
          isCollapsed ? 'w-20' : 'w-64' // Adjust width based on collapse state
        }`}
      >
        {/* Header section of the desktop sidebar */}
        <div className={`flex items-center h-16 px-4 border-b border-gray-100 ${isCollapsed ? 'justify-center' : 'justify-start'}`}>
          {!isCollapsed && (
            <Link to="/" className="flex items-center">
              <Stethoscope className="h-7 w-7 text-purple-600" />
              <span className="ml-2 text-xl font-bold text-gray-900">HealthHub</span>
            </Link>
          )}
          {isCollapsed && (
             <Stethoscope className="h-7 w-7 text-purple-600" aria-label="HealthHub" />
          )}
        </div>

        {/* Navigation links */}
        <nav className="flex-1 mt-6 px-4 space-y-2 overflow-y-auto">
          {menuItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `${baseNavLinkStyle} ${isActive ? activeNavLinkStyle : inactiveNavLinkStyle} ${
                  isCollapsed ? 'justify-center px-0 py-3' : '' // Center content when collapsed
                }`
              }
              title={isCollapsed ? item.text : ''} // Tooltip on collapsed icons
            >
              <span className={`text-gray-500 group-hover:text-gray-700 group-[.active]:text-purple-600 transition-colors duration-200 ${isCollapsed ? '' : 'mr-3'}`}>
                {item.icon}
              </span>
              {!isCollapsed && item.text}
            </NavLink>
          ))}
        </nav>

        {/* Footer section of the desktop sidebar */}
        <div className={`p-4 border-t border-gray-100 bg-gray-50 ${isCollapsed ? 'flex justify-center' : ''}`}>
          <div className={`flex items-center text-sm font-medium text-gray-600 ${isCollapsed ? 'flex-col text-center' : ''}`}>
            <Database className="h-5 w-5 text-purple-500" />
            {!isCollapsed && <span className="ml-2">Powered by Pglite</span>}
            {isCollapsed && <span className="mt-1 text-xs whitespace-nowrap">Pglite</span>}
          </div>
        </div>
      </div>
    </>
  );
};

export default NavPanel;