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
    <div className="mx-auto max-w-sm rounded-lg p-5 shadow-md">
      <h2 className="mb-5 text-center text-2xl font-bold">Login</h2>
      {error && <div className="mb-2 rounded bg-red-100 p-2 text-red-600">{error}</div>}
      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          className="rounded border border-gray-300 p-2 focus:border-green-500 focus:outline-none"
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="rounded border border-gray-300 p-2 focus:border-green-500 focus:outline-none"
        />
        <button type="submit" className="rounded bg-green-500 p-2 text-white transition hover:bg-green-600">
          Login
        </button>
      </form>
      <p className="mt-5 text-center">
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
