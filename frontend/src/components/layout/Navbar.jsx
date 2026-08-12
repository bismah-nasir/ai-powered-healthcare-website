import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { HeartPulse, ShoppingCart, Sun, Moon, Menu, X, LogOut, User, Calendar } from 'lucide-react';

const getInitials = (name) => {
  if (!name) return '';
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) {
    return `${parts[0].charAt(0)}${parts[parts.length - 1].charAt(0)}`.toUpperCase();
  }
  return parts[0].charAt(0).toUpperCase();
};

function Navbar() {
  const { user, logout } = useAuth();
  const { cartCount } = useCart();
  const navigate = useNavigate();
  const location = useLocation();
  
  // Navigation states
  const [isOpen, setIsOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  // Sync Dark Mode state on load matching browser media query or body class
  useEffect(() => {
    const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const hasDarkClass = document.documentElement.classList.contains('dark-theme');
    setIsDarkMode(hasDarkClass || systemPrefersDark);
  }, []);

  // Theme Toggler
  const toggleTheme = () => {
    const nextMode = !isDarkMode;
    setIsDarkMode(nextMode);
    if (nextMode) {
      document.documentElement.classList.add('dark-theme');
    } else {
      document.documentElement.classList.remove('dark-theme');
    }
  };

  // Close mobile drawer on route click
  const handleNavClick = () => {
    setIsOpen(false);
    setProfileOpen(false);
  };

  const handleLogout = () => {
    logout();
    setProfileOpen(false);
    navigate('/');
  };

  // Check if route is active to apply highlight styling
  const isActive = (path) => location.pathname === path;

  // Nav link rendering helper
  const renderNavLink = (to, label) => (
    <Link
      to={to}
      onClick={handleNavClick}
      className={`text-sm font-semibold tracking-wide transition-colors duration-300 font-body whitespace-nowrap ${
        isActive(to) 
          ? 'text-primary' 
          : 'text-text-sub hover:text-primary'
      }`}
    >
      {label}
    </Link>
  );

  return (
    <header className="sticky top-0 w-full bg-bg-base/80 backdrop-blur-md border-b border-border-color z-50 transition-colors duration-300">
      <div className="max-w-300 mx-auto px-6 h-17.5 flex items-center justify-between">
        
        {/* Brand Logo */}
        <Link to="/" onClick={handleNavClick} className="flex items-center gap-2">
          <div className="w-9 h-9 bg-primary flex items-center justify-center rounded-xl shadow-md shadow-primary/10">
            <HeartPulse className="w-5 h-5 text-white" />
          </div>
          <span className="text-xl font-bold tracking-tight text-text-main font-headings whitespace-nowrap">
            PulseCare <span className="text-primary">AI</span>
          </span>
        </Link>

        {/* Desktop Navigation Links */}
        <nav className="hidden lg:flex items-center gap-5 xl:gap-8">
          {renderNavLink('/home', 'Home')}
          {renderNavLink('/doctors', 'Doctors')}
          {renderNavLink('/medicines', 'Pharmacy')}
          {renderNavLink('/labs', 'Lab Tests')}
          {renderNavLink('/emergency', 'Emergency')}
          {renderNavLink('/blog', 'Blog')}
          {renderNavLink('/contact', 'Contact')}
        </nav>

        {/* Right Side Icons & Profile Actions */}
        <div className="hidden lg:flex items-center gap-3 xl:gap-5">
          {/* Theme Switcher Button */}
          <button 
            type="button" 
            onClick={toggleTheme}
            className="text-text-sub hover:text-primary p-2 rounded-xl transition-colors bg-transparent border-0"
            aria-label="Toggle Theme"
          >
            {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </button>

          {/* Cart Icon Link */}
          <Link 
            to="/cart" 
            className="relative text-text-sub hover:text-primary p-2 rounded-xl transition-colors"
            aria-label="Shopping Cart"
          >
            <ShoppingCart className="w-5 h-5" />
            {cartCount > 0 && (
              <span className="absolute top-0 right-0 w-5 h-5 bg-accent text-white text-[10px] font-bold rounded-full flex items-center justify-center animate-pulse">
                {cartCount}
              </span>
            )}
          </Link>

          {/* Conditional User Profile rendering */}
          {user ? (
            <div className="relative">
              <button
                type="button"
                onClick={() => setProfileOpen(!profileOpen)}
                className="w-10 h-10 bg-primary/10 hover:bg-primary/20 text-primary font-bold rounded-full flex items-center justify-center border-0 transition-colors"
              >
                {getInitials(user.name)}
              </button>
              
              {/* Profile Dropdown Panel */}
              {profileOpen && (
                <div className="absolute right-0 mt-3 w-48 glass-panel rounded-2xl p-3 shadow-lg z-50 animate-fade-in">
                  <div className="px-3 py-2 border-b border-border-color mb-2">
                    <p className="text-xs font-bold text-text-main truncate">{user.name}</p>
                    <p className="text-[10px] text-text-mute truncate mt-0.5">{user.email}</p>
                  </div>
                  {user.role === 'admin' && (
                    <Link
                      to="/admin"
                      onClick={handleNavClick}
                      className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-text-sub hover:text-primary hover:bg-primary/5 rounded-xl transition-colors mb-1.5"
                    >
                      <User className="w-4 h-4 text-primary" />
                      Admin Dashboard
                    </Link>
                  )}
                  <Link
                    to="/my-appointments"
                    onClick={handleNavClick}
                    className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-text-sub hover:text-primary hover:bg-primary/5 rounded-xl transition-colors mb-1.5"
                  >
                    <Calendar className="w-4 h-4 text-primary" />
                    My Appointments
                  </Link>
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-danger hover:bg-danger/10 rounded-xl transition-colors border-0 justify-start"
                  >
                    <LogOut className="w-4 h-4" />
                    Sign Out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <Link to="/login" className="btn btn-primary btn-wide py-2.5 rounded-xl text-sm">
              Sign In
            </Link>
          )}
        </div>

        {/* Mobile Header Actions Layout (Hamburger + Icons) */}
        <div className="flex lg:hidden items-center gap-3">
          {/* Mobile Theme Toggle */}
          <button 
            type="button" 
            onClick={toggleTheme}
            className="text-text-sub hover:text-primary p-2 rounded-xl transition-colors bg-transparent border-0"
          >
            {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </button>

          {/* Mobile Cart Icon */}
          <Link 
            to="/cart" 
            className="relative text-text-sub hover:text-primary p-2 rounded-xl transition-colors"
          >
            <ShoppingCart className="w-5 h-5" />
            {cartCount > 0 && (
              <span className="absolute top-0 right-0 w-4 h-4 bg-accent text-white text-[8px] font-bold rounded-full flex items-center justify-center">
                {cartCount}
              </span>
            )}
          </Link>

          {/* Mobile Hamburger Drawer Trigger */}
          <button
            type="button"
            onClick={() => setIsOpen(!isOpen)}
            className="text-text-sub hover:text-primary p-2 rounded-xl transition-colors bg-transparent border-0"
            aria-label="Toggle Menu"
          >
            {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer menu Panel (Collapses down) */}
      {isOpen && (
        <div className="lg:hidden border-t border-border-color bg-bg-base/95 backdrop-blur-md py-4 px-6 flex flex-col gap-4 animate-fade-in shadow-lg">
          <nav className="flex flex-col gap-4">
            {renderNavLink('/home', 'Home')}
            {renderNavLink('/doctors', 'Doctors')}
            {renderNavLink('/medicines', 'Pharmacy')}
            {renderNavLink('/labs', 'Lab Tests')}
            {renderNavLink('/emergency', 'Emergency')}
            {renderNavLink('/blog', 'Blog')}
            {renderNavLink('/contact', 'Contact')}
          </nav>
          
          <hr className="border-border-color my-1" />

          {/* Mobile User Panel */}
          {user ? (
            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-3 px-1 py-1">
                <div className="w-8 h-8 bg-primary/10 text-primary font-bold rounded-full flex items-center justify-center">
                  {getInitials(user.name)}
                </div>
                <div>
                  <p className="text-xs font-bold text-text-main truncate">{user.name}</p>
                  <p className="text-[10px] text-text-mute truncate">{user.email}</p>
                </div>
              </div>
              {user.role === 'admin' && (
                <Link
                  to="/admin"
                  onClick={handleNavClick}
                  className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-bold text-text-sub hover:text-primary bg-bg-secondary/40 rounded-xl justify-center transition-colors border border-border-color mb-2"
                >
                  <User className="w-4 h-4 text-primary" />
                  Admin Dashboard
                </Link>
              )}
              <Link
                to="/my-appointments"
                onClick={handleNavClick}
                className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-bold text-text-sub hover:text-primary bg-bg-secondary/40 rounded-xl justify-center transition-colors border border-border-color"
              >
                <Calendar className="w-4 h-4 text-primary" />
                My Appointments
              </Link>
              <button
                type="button"
                onClick={handleLogout}
                className="w-full flex items-center gap-2 px-3 py-3 text-xs font-bold text-white bg-danger hover:bg-danger/90 rounded-xl justify-center transition-colors border-0"
              >
                <LogOut className="w-4 h-4" />
                Sign Out
              </button>
            </div>
          ) : (
            <Link to="/login" onClick={handleNavClick} className="btn btn-primary w-full py-3.5 rounded-xl text-center">
              Sign In
            </Link>
          )}
        </div>
      )}
    </header>
  );
}

export default Navbar;
