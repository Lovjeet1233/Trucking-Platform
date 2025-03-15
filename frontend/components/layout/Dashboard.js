
// components/layout/Dashboard.js
import React from 'react';
import Header from './Header';
import Sidebar from './Sidebar';
import Footer from './Footer';
import { useAuth } from '../../context/auth/AuthContext';
import { useRouter } from 'next/router';

const Dashboard = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  const router = useRouter();

  // If not authenticated and not loading, redirect to login
  React.useEffect(() => {
    if (!isAuthenticated && !loading) {
      router.push('/login');
    }
  }, [isAuthenticated, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-900"></div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <div className="flex flex-1">
        <Sidebar />
        <main className="flex-1 bg-gray-100 p-6">{children}</main>
      </div>
      <Footer />
    </div>
  );
};

export default Dashboard;
