import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { registerUser } from '../services/api';

const Register = () => {
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    firstname: '',
    lastname: ''
  });
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await registerUser(formData);
      navigate('/products');
    } catch (err) {
      setError(err.response?.data?.error || 'Registration failed');
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <div className="max-w-sm mx-auto p-5 shadow-md rounded-lg">
      <h2 className="text-center mb-5 text-2xl font-bold">Register</h2>
      {error && <div className="text-red-600 mb-2 p-2 bg-red-100 rounded">{error}</div>}
      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        <input
          type="text"
          name="firstname"
          placeholder="First Name"
          value={formData.firstname}
          onChange={handleChange}
          className="p-2 rounded border border-gray-300 focus:outline-none focus:border-green-500"
        />
        <input
          type="text"
          name="lastname"
          placeholder="Last Name"
          value={formData.lastname}
          onChange={handleChange}
          className="p-2 rounded border border-gray-300 focus:outline-none focus:border-green-500"
        />
        <input
          type="text"
          name="username"
          placeholder="Username"
          value={formData.username}
          onChange={handleChange}
          className="p-2 rounded border border-gray-300 focus:outline-none focus:border-green-500"
        />
        <input
          type="password"
          name="password"
          placeholder="Password"
          value={formData.password}
          onChange={handleChange}
          className="p-2 rounded border border-gray-300 focus:outline-none focus:border-green-500"
        />
        <button type="submit" className="p-2 bg-green-500 text-white rounded hover:bg-green-600 transition">
          Register
        </button>
      </form>
      <p className="text-center mt-5">
        Already have an account?{' '}
        <Link to="/login" className="text-green-500 hover:underline">
          Login
        </Link>
      </p>
    </div>
  );
};

export default Register;
