// pages/dashboard/index.js
import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../../context/auth/AuthContext';

const DashboardIndex = () => {
  const { isAuthenticated, user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (!isAuthenticated) {
        router.push('/login');
      } else {
        if (user?.role === 'shipper') {
          router.push('/dashboard/shipper');
        } else if (user?.role === 'trucker') {
          router.push('/dashboard/trucker');
        } else if (user?.role === 'admin') {
          router.push('/dashboard/admin');
        }
      }
    }
  }, [isAuthenticated, user, loading]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-900"></div>
    </div>
  );
};

export default DashboardIndex;
