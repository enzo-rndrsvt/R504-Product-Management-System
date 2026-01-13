import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { loginUser } from '../services/api';
import PropTypes from 'prop-types';

const Login = ({ onLogin }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await loginUser(username, password);
      onLogin();
      navigate('/products');
    } catch (err) {
      setError(err.error || 'An error occurred');
    }
  };

  return (
    <div className="max-w-sm mx-auto p-5 shadow-md rounded-lg">
      <h2 className="text-center mb-5 text-2xl font-bold">Login</h2>
      {error && <div className="text-red-600 mb-2 p-2 bg-red-100 rounded">{error}</div>}
      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          className="p-2 rounded border border-gray-300 focus:outline-none focus:border-green-500"
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="p-2 rounded border border-gray-300 focus:outline-none focus:border-green-500"
        />
        <button type="submit" className="p-2 bg-green-500 text-white rounded hover:bg-green-600 transition">
          Login
        </button>
      </form>
      <p className="text-center mt-5">
        Don&apos;t have an account?{' '}
        <Link to="/register" className="text-green-500 hover:underline">
          Register
        </Link>
      </p>
    </div>
  );
};

Login.propTypes = {
  onLogin: PropTypes.func.isRequired
};

export default Login;
