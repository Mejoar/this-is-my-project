import React, { useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useAuth } from '../../contexts/AuthContext';
import { LoginFormData } from '../../types';

const Login: React.FC = () => {
  const { login, loading, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm<LoginFormData>();

  // Redirect after successful login
  useEffect(() => {
    if (user && !loading) {
      const from = location.state?.from?.pathname;
      
      if (from) {
        // If they were trying to access a specific page, redirect there
        navigate(from, { replace: true });
      } else {
        // Redirect based on user role
        if (user.role === 'super_admin') {
          navigate('/super-admin', { replace: true });
        } else if (user.role === 'admin') {
          navigate('/admin', { replace: true });
        } else {
          navigate('/user/panel', { replace: true });
        }
      }
    }
  }, [user, loading, navigate, location.state?.from?.pathname]);

  const onSubmit = async (data: LoginFormData) => {
    try {
      await login(data.email, data.password);
      // Redirection will be handled by useEffect above
    } catch (error) {
      // Error is handled by the context
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Sign in to your account
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Or{' '}
            <Link
              to="/signup"
              className="font-medium text-primary-600 hover:text-primary-500"
            >
              create a new account
            </Link>
          </p>
        </div>
        
        <form className="mt-8 space-y-6" onSubmit={handleSubmit(onSubmit)}>
          <div className="space-y-4">
            {/* Email */}
            <div>
              <label htmlFor="email" className="sr-only">
                Email address
              </label>
              <input
                {...register('email', {
                  required: 'Email is required',
                  pattern: {
                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                    message: 'Invalid email address'
                  }
                })}
                type="email"
                autoComplete="email"
                placeholder="Email address"
                className="form-input"
              />
              {errors.email && (
                <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
              )}
            </div>

            {/* Password */}
            <div>
              <label htmlFor="password" className="sr-only">
                Password
              </label>
              <input
                {...register('password', {
                  required: 'Password is required'
                })}
                type="password"
                autoComplete="current-password"
                placeholder="Password"
                className="form-input"
              />
              {errors.password && (
                <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>
              )}
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary w-full flex justify-center items-center"
            >
              {loading ? (
                <>
                  <div className="loading-spinner w-4 h-4 mr-2" />
                  Signing in...
                </>
              ) : (
                'Sign in'
              )}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};

export default Login;
