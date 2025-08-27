import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const AdminLoginPage: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isRegistering, setIsRegistering] = useState(false); // New state for toggling between login/register
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const endpoint = isRegistering ? 'http://localhost:5003/admin/register' : 'http://localhost:5003/admin/login';
    const successMessage = isRegistering ? 'Admin registration successful!' : 'Admin login successful!';
    const errorMessage = isRegistering ? 'Registration failed. Please try again.' : 'Invalid credentials. Please try again.';

    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
        credentials: 'include', // 👈 VERY IMPORTANT
      });

      if (response.ok) {
        const data = await response.json();
        toast.success(data.message || successMessage);
        if (!isRegistering) {
          navigate('/admin-dashboard');
        } else {
          // After successful registration, switch to login form
          setIsRegistering(false);
        }
      } else {
        const contentType = response.headers.get("content-type");
        if (contentType && contentType.indexOf("application/json") !== -1) {
          const errorData = await response.json();
          console.error("Backend error data:", errorData);
          toast.error(errorData.message || errorMessage);
        } else {
          const errorText = await response.text();
          console.error("Backend non-JSON error:", errorText);
          toast.error(`Error: ${response.status} ${response.statusText}. ${errorText || errorMessage}`);
        }
      }
    } catch (error) {
      console.error(`${isRegistering ? 'Registration' : 'Login'} error:`, error);
      toast.error(`An error occurred during ${isRegistering ? 'registration' : 'login'}. Please try again later.`);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
        <h2 className="text-3xl font-bold text-center text-indigo-700 mb-6">
          {isRegistering ? 'Admin Register' : 'Admin Login'}
        </h2>
        <p className="text-center text-gray-600 mb-8">
          {isRegistering ? 'Create a new admin account' : 'Access to the Campus Connect Admin Panel'}
        </p>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="username" className="block text-sm font-medium text-gray-700">Username</label>
            <input
              type="text"
              id="username"
              name="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            />
          </div>
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">Password</label>
            <input
              type="password"
              id="password"
              name="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            />
          </div>
          <button
            type="submit"
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-500"
          >
            {isRegistering ? 'Register' : 'Login'}
          </button>
        </form>
        <p className="mt-6 text-center text-sm text-gray-600">
          {isRegistering ? (
            <>Already have an account?{' '}
              <button
                type="button"
                onClick={() => setIsRegistering(false)}
                className="font-medium text-indigo-600 hover:text-indigo-500 focus:outline-none"
              >
                Login
              </button>
            </>
          ) : (
            <>Don't have an account?{' '}
              {/* <button
                type="button"
                onClick={() => setIsRegistering(true)}
                className="font-medium text-indigo-600 hover:text-indigo-500 focus:outline-none"
              >
                Register
              </button> */}
            </>
          )}
        </p>
        <p className="mt-2 text-center text-sm text-gray-600">
          <a href="/" className="font-medium text-indigo-600 hover:text-indigo-500">
            Back to Home
          </a>
        </p>
      </div>
    </div>
  );
};

export default AdminLoginPage;