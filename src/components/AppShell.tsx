import React from 'react';
import { Outlet } from 'react-router-dom';
import Header from './Header';

const AppShell: React.FC = () => {
  return (
    <div className="flex flex-col min-h-screen bg-gray-50 font-inter antialiased">
      {/* The single Header now handles all navigation */}
      <Header />

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto page-transition">
        {/* The full-page gradient background is still within the Outlet content itself */}
        <div className="min-h-full py-8 px-4 sm:px-6 lg:px-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default AppShell;