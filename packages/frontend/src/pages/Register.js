import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { registerUser } from '../services/api';
import { validateUser, validatePassword } from '../utils/validation';
import ThemeToggle from '../components/ThemeToggle';

const Register = () => {
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    confirmPassword: '',
    firstname: '',
    lastname: ''
  });
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [error, setError] = useState('');
  const [showPasswordRequirements, setShowPasswordRequirements] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Validate all fields
    const validation = validateUser(formData);

    // Check password confirmation
    if (formData.password !== formData.confirmPassword) {
      setErrors({ ...validation.errors, confirmPassword: 'Passwords do not match' });
      return;
    }

    if (!validation.isValid) {
      setErrors(validation.errors);
      return;
    }

    try {
      const { confirmPassword, ...dataToSend } = formData;
      await registerUser(dataToSend);
      navigate('/products');
    } catch (err) {
      setError(err.response?.data?.error || 'Registration failed');
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    // Clear error for this field
    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const handleBlur = (field) => {
    setTouched((prev) => ({ ...prev, [field]: true }));

    // Validate on blur
    if (field === 'password') {
      const validation = validatePassword(formData.password);
      if (!validation.isValid) {
        setErrors((prev) => ({ ...prev, password: validation.errors }));
      }
    } else if (field === 'confirmPassword') {
      if (formData.password !== formData.confirmPassword) {
        setErrors((prev) => ({ ...prev, confirmPassword: 'Passwords do not match' }));
      }
    } else if (field === 'username') {
      if (formData.username && formData.username.length < 3) {
        setErrors((prev) => ({ ...prev, username: 'Username must be at least 3 characters' }));
      }
    }
  };

  const getPasswordStrength = () => {
    const validation = validatePassword(formData.password);
    if (!formData.password) return null;
    if (validation.isValid) return 'strong';
    if (formData.password.length >= 8) return 'medium';
    return 'weak';
  };

  const passwordStrength = getPasswordStrength();

  return (
    <div className="flex min-h-screen items-center justify-center bg-neutral-50 p-4 dark:bg-neutral-950">
      <ThemeToggle />
      <div className="card w-full max-w-sm shadow-lg">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-neutral-900">Create Account</h1>
          <p className="mt-2 text-neutral-600">Join us today</p>
        </div>

        {error && <div className="alert alert-error mb-4">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="form-group">
              <label htmlFor="firstname" className="form-label">
                First Name <span className="text-red-500">*</span>
              </label>
              <input
                id="firstname"
                type="text"
                name="firstname"
                placeholder="John"
                value={formData.firstname}
                onChange={handleChange}
                onBlur={() => handleBlur('firstname')}
                className={`input-field ${touched.firstname && errors.firstname ? 'border-red-500' : ''}`}
                required
              />
              {touched.firstname && errors.firstname && <p className="mt-1 text-sm text-red-500">{errors.firstname}</p>}
            </div>

            <div className="form-group">
              <label htmlFor="lastname" className="form-label">
                Last Name <span className="text-red-500">*</span>
              </label>
              <input
                id="lastname"
                type="text"
                name="lastname"
                placeholder="Doe"
                value={formData.lastname}
                onChange={handleChange}
                onBlur={() => handleBlur('lastname')}
                className={`input-field ${touched.lastname && errors.lastname ? 'border-red-500' : ''}`}
                required
              />
              {touched.lastname && errors.lastname && <p className="mt-1 text-sm text-red-500">{errors.lastname}</p>}
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="username" className="form-label">
              Username <span className="text-red-500">*</span>
            </label>
            <input
              id="username"
              type="text"
              name="username"
              placeholder="johndoe (min. 3 characters)"
              value={formData.username}
              onChange={handleChange}
              onBlur={() => handleBlur('username')}
              className={`input-field ${touched.username && errors.username ? 'border-red-500' : ''}`}
              required
              minLength={3}
            />
            {touched.username && errors.username && <p className="mt-1 text-sm text-red-500">{errors.username}</p>}
          </div>

          <div className="form-group">
            <label htmlFor="password" className="form-label">
              Password <span className="text-red-500">*</span>
            </label>
            <input
              id="password"
              type="password"
              name="password"
              placeholder="••••••••"
              value={formData.password}
              onChange={handleChange}
              onFocus={() => setShowPasswordRequirements(true)}
              onBlur={() => {
                handleBlur('password');
                setShowPasswordRequirements(false);
              }}
              className={`input-field ${touched.password && errors.password ? 'border-red-500' : ''}`}
              required
              minLength={8}
            />

            {/* Password strength indicator */}
            {formData.password && (
              <div className="mt-2">
                <div className="flex gap-1">
                  <div
                    className={`h-1 flex-1 rounded ${
                      passwordStrength === 'weak'
                        ? 'bg-red-500'
                        : passwordStrength === 'medium'
                          ? 'bg-yellow-500'
                          : passwordStrength === 'strong'
                            ? 'bg-green-500'
                            : 'bg-neutral-200'
                    }`}
                  />
                  <div
                    className={`h-1 flex-1 rounded ${
                      passwordStrength === 'medium' || passwordStrength === 'strong'
                        ? passwordStrength === 'medium'
                          ? 'bg-yellow-500'
                          : 'bg-green-500'
                        : 'bg-neutral-200'
                    }`}
                  />
                  <div
                    className={`h-1 flex-1 rounded ${
                      passwordStrength === 'strong' ? 'bg-green-500' : 'bg-neutral-200'
                    }`}
                  />
                </div>
                <p className="mt-1 text-xs text-neutral-600">
                  {passwordStrength === 'weak' && 'Weak password'}
                  {passwordStrength === 'medium' && 'Medium password'}
                  {passwordStrength === 'strong' && 'Strong password'}
                </p>
              </div>
            )}

            {/* Password requirements */}
            {(showPasswordRequirements || (touched.password && errors.password)) && (
              <div className="mt-2 rounded bg-neutral-100 p-3 text-sm dark:bg-neutral-800">
                <p className="mb-1 font-semibold text-neutral-700 dark:text-neutral-300">Password must contain:</p>
                <ul className="space-y-1">
                  <li className={`${formData.password.length >= 8 ? 'text-green-600' : 'text-neutral-600'}`}>
                    {formData.password.length >= 8 ? '✓' : '○'} At least 8 characters
                  </li>
                  <li className={`${/[A-Z]/.test(formData.password) ? 'text-green-600' : 'text-neutral-600'}`}>
                    {/[A-Z]/.test(formData.password) ? '✓' : '○'} One uppercase letter
                  </li>
                  <li className={`${/[a-z]/.test(formData.password) ? 'text-green-600' : 'text-neutral-600'}`}>
                    {/[a-z]/.test(formData.password) ? '✓' : '○'} One lowercase letter
                  </li>
                  <li className={`${/[0-9]/.test(formData.password) ? 'text-green-600' : 'text-neutral-600'}`}>
                    {/[0-9]/.test(formData.password) ? '✓' : '○'} One number
                  </li>
                </ul>
              </div>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="confirmPassword" className="form-label">
              Confirm Password <span className="text-red-500">*</span>
            </label>
            <input
              id="confirmPassword"
              type="password"
              name="confirmPassword"
              placeholder="••••••••"
              value={formData.confirmPassword}
              onChange={handleChange}
              onBlur={() => handleBlur('confirmPassword')}
              className={`input-field ${touched.confirmPassword && errors.confirmPassword ? 'border-red-500' : ''}`}
              required
            />
            {touched.confirmPassword && errors.confirmPassword && (
              <p className="mt-1 text-sm text-red-500">{errors.confirmPassword}</p>
            )}
            {formData.confirmPassword && formData.password === formData.confirmPassword && (
              <p className="mt-1 text-sm text-green-600">✓ Passwords match</p>
            )}
          </div>

          <button type="submit" className="btn-primary w-full py-2.5 font-semibold">
            Create Account
          </button>
        </form>

        <div className="mt-6 border-t border-neutral-200 pt-6 text-center">
          <p className="text-neutral-600">
            Already have an account?{' '}
            <Link to="/login" className="link font-semibold">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
