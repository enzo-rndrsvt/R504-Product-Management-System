import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { logout } from '../services/api';
import { useTheme } from '../context/ThemeContext';
import PropTypes from 'prop-types';

const Navigation = ({ onLogout }) => {
  const navigate = useNavigate();
  const { isDark, toggleTheme } = useTheme();
  const [isOpen, setIsOpen] = React.useState(false);

  const user = JSON.parse(localStorage.getItem('user') || '{}');

  const handleLogout = () => {
    logout();
    onLogout();
    navigate('/login');
  };

  const greeting = (() => {
    const hour = new Date().getHours();
    const timeOfDay = hour < 12 ? 'morning' : hour < 18 ? 'afternoon' : 'evening';
    const randomEmoji = ['👋', '😊', '🌟', '✨'][Math.floor(Math.random() * 4)];
    return `Good ${timeOfDay}, ${user.firstname || 'User'} ${randomEmoji}`;
  })();

  return (
    <nav className="navbar sticky top-0 z-50 border-b border-primary-500/20 dark:border-primary-950/50">
      <div className="container-base">
        {/* Top bar */}
        <div className="flex items-center justify-between">
          {/* Desktop links */}
          <div className="hidden gap-8 sm:flex">
            <Link to="/users" className="nav-link font-medium">
              Users
            </Link>
            <Link to="/products" className="nav-link font-medium">
              Products
            </Link>
            <Link to="/categories" className="nav-link font-medium">
              Categories
            </Link>
          </div>

          {/* Right controls */}
          <div className="flex items-center gap-2 sm:gap-4">
            <span className="hidden font-medium text-white dark:text-neutral-200 sm:inline">{greeting}</span>
            <button
              onClick={toggleTheme}
              className="rounded-lg p-2 transition-colors duration-200 hover:bg-primary-600 dark:hover:bg-primary-800"
              title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
              aria-label="Toggle dark mode"
            >
              {isDark ? '💡' : '🌙'}
            </button>

            {/* Mobile menu toggle */}
            <button
              className="rounded-lg p-2 text-white transition-colors duration-200 hover:bg-primary-600 sm:hidden"
              onClick={() => setIsOpen((prev) => !prev)}
              aria-label="Toggle navigation"
              aria-expanded={isOpen}
            >
              <svg className="size-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>

            <button onClick={handleLogout} className="btn-danger hidden px-4 py-1.5 text-sm font-medium sm:inline-flex">
              Logout
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {isOpen && (
          <div className="mt-3 flex flex-col gap-3 sm:hidden">
            <div className="flex flex-col gap-3">
              <Link to="/users" className="nav-link font-medium" onClick={() => setIsOpen(false)}>
                Users
              </Link>
              <Link to="/products" className="nav-link font-medium" onClick={() => setIsOpen(false)}>
                Products
              </Link>
              <Link to="/categories" className="nav-link font-medium" onClick={() => setIsOpen(false)}>
                Categories
              </Link>
            </div>
            <button onClick={handleLogout} className="btn-danger w-full py-2 text-sm font-semibold">
              Logout
            </button>
          </div>
        )}
      </div>
    </nav>
  );
};

Navigation.propTypes = {
  onLogout: PropTypes.func.isRequired
};

export default Navigation;
