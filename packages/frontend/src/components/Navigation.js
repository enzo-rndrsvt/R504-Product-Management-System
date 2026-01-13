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
    <nav className="mb-5 flex items-center justify-between bg-gray-800 p-2 px-5 text-white">
      <div>
        <Link to="/users" className="mr-5 text-white no-underline transition hover:text-gray-300">
          Users
        </Link>
        <Link to="/products" className="text-white no-underline transition hover:text-gray-300">
          Products
        </Link>
      </div>
      <div className="flex items-center">
        <span className="mr-5 text-white">{greeting}</span>
        <button
          onClick={handleLogout}
          className="rounded border-0 bg-red-500 p-2 px-4 text-white transition hover:bg-red-600"
        >
          Logout
        </button>
      </div>
    </nav>
  );
};

Navigation.propTypes = {
  onLogout: PropTypes.func.isRequired
};

export default Navigation;
