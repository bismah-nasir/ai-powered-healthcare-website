import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';

function Layout() {
  return (
    <div className="min-h-screen bg-bg-base flex flex-col transition-colors duration-300">
      {/* Dynamic Global Sticky Navigation Bar */}
      <Navbar />

      {/* Main Page Content Area */}
      <main className="grow">
        <Outlet />
      </main>

      {/* Basic Footer Panel (Will be expanded in Footer phase) */}
      <footer className="border-t border-border-color bg-bg-secondary py-6 text-center text-xs text-text-mute font-body">
        <div className="max-w-300 mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p>© {new Date().getFullYear()} PulseCare AI. All Rights Reserved.</p>
          <div className="flex gap-4">
            <a href="/terms" className="hover:text-primary transition-colors">Terms of Service</a>
            <a href="/privacy" className="hover:text-primary transition-colors">Privacy Policy</a>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default Layout;
