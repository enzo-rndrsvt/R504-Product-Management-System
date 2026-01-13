import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { logout } from '../services/api';
import PropTypes from 'prop-types';

const Navigation = ({ onLogout }) => {
  const navigate = useNavigate();

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
    <nav className="navbar sticky top-0 z-50 border-b border-primary-500/20">
      <div className="container-base flex items-center justify-between">
        <div className="flex gap-8">
          <Link to="/users" className="nav-link font-medium">
            Users
          </Link>
          <Link to="/products" className="nav-link font-medium">
            Products
          </Link>
        </div>
        <div className="flex items-center gap-6">
          <span className="hidden font-medium text-white sm:inline">{greeting}</span>
          <button onClick={handleLogout} className="btn-danger px-4 py-1.5 text-sm font-medium">
            Logout
          </button>
        </div>
      </div>
    </nav>
  );
};

Navigation.propTypes = {
  onLogout: PropTypes.func.isRequired
};

export default Navigation;
