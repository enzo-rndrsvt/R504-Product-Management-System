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
    <nav className="bg-gray-800 text-white p-2 px-5 mb-5 flex justify-between items-center">
      <div>
        <Link to="/users" className="text-white no-underline mr-5 hover:text-gray-300 transition">
          Users
        </Link>
        <Link to="/products" className="text-white no-underline hover:text-gray-300 transition">
          Products
        </Link>
      </div>
      <div className="flex items-center">
        <span className="text-white mr-5">{greeting}</span>
        <button
          onClick={handleLogout}
          className="bg-red-500 text-white border-0 p-2 px-4 rounded hover:bg-red-600 transition"
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
