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
    <div className="mx-auto max-w-sm rounded-lg p-5 shadow-md">
      <h2 className="mb-5 text-center text-2xl font-bold">Register</h2>
      {error && <div className="mb-2 rounded bg-red-100 p-2 text-red-600">{error}</div>}
      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        <input
          type="text"
          name="firstname"
          placeholder="First Name"
          value={formData.firstname}
          onChange={handleChange}
          className="rounded border border-gray-300 p-2 focus:border-green-500 focus:outline-none"
        />
        <input
          type="text"
          name="lastname"
          placeholder="Last Name"
          value={formData.lastname}
          onChange={handleChange}
          className="rounded border border-gray-300 p-2 focus:border-green-500 focus:outline-none"
        />
        <input
          type="text"
          name="username"
          placeholder="Username"
          value={formData.username}
          onChange={handleChange}
          className="rounded border border-gray-300 p-2 focus:border-green-500 focus:outline-none"
        />
        <input
          type="password"
          name="password"
          placeholder="Password"
          value={formData.password}
          onChange={handleChange}
          className="rounded border border-gray-300 p-2 focus:border-green-500 focus:outline-none"
        />
        <button type="submit" className="rounded bg-green-500 p-2 text-white transition hover:bg-green-600">
          Register
        </button>
      </form>
      <p className="mt-5 text-center">
        Already have an account?{' '}
        <Link to="/login" className="text-green-500 hover:underline">
          Login
        </Link>
      </p>
    </div>
  );
};

export default Register;
