import React, { createContext, useContext, useState, useEffect } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

interface AuthContextType {
  isAuthenticated: boolean;
  logout: () => void;
}
const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

const AuthCheckAdmin: React.FC = () => {
  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  const logout = async () => {
    try {
      const response = await fetch('http://localhost:5003/admin/logout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include', // 👈 VERY IMPORTANT
      });

      if (response.ok) {
        setIsAuthenticated(false);
        toast.success('Logged out successfully!');
      } else {
        const errorData = await response.json();
        toast.error(errorData.message || 'Logout failed.');
      }
    } catch (error) {
      console.error('Logout error:', error);
      toast.error('An error occurred during logout.');
    }
  };

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await fetch('http://localhost:5003/admin/check_auth', {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
            },
            credentials: 'include', // 👈 include cookie
          });

        if (response.ok) {
          setIsAuthenticated(true);
        } else {
          const errorData = await response.json();
          setIsAuthenticated(false);
  
          navigate('/admin/login');
          toast.error(errorData.message || 'Authentication failed. Please log in again.');
        }
      } catch (error) {

        console.error('Auth check error:', error);
        setIsAuthenticated(false);

        navigate('/admin/login');
        toast.error('An error occurred during authentication check.');
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, [navigate]);

  if (loading) {
    return <div>Loading authentication...</div>; // Or a more sophisticated loading spinner
  }

  if (!isAuthenticated) {
    console.log('AuthCheckAdmin: Not authenticated, redirecting or returning null');
    return null; // Or a message indicating redirection
  }

  console.log('AuthCheckAdmin: Authenticated, rendering children');
  return (
    <AuthContext.Provider value={{ isAuthenticated, logout }}>
      <Outlet />
    </AuthContext.Provider>
  );
};

export default AuthCheckAdmin;