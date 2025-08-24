
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AuthCheck from '@/components/AuthCheck';

const Index: React.FC = () => {
  const navigate = useNavigate();

  useEffect(() => {
    navigate('/home');
  }, [navigate]);

  return (
    <AuthCheck>
      <div>Redirecting...</div>
    </AuthCheck>
  );
};

export default Index;
