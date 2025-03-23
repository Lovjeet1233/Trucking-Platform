// pages/dashboard/shipper/index.js
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Dashboard from '../../../components/layout/Dashboard';
import ShipperDashboard from '../../../components/shipper/ShipperDashboard';
import PrivateRoute from '../../../components/routing/PrivateRoute';
import api from '../../../utils/api';
import { useAlert } from '../../../context/alert/AlertContext';

const ShipperDashboardPage = () => {
  const router = useRouter();
  const { setAlert } = useAlert();
  const [checkingProfile, setCheckingProfile] = useState(true);

  useEffect(() => {
    const checkShipperProfile = async () => {
      try {
        await api.get('/shippers/profile');
        setCheckingProfile(false);
      } catch (err) {
        if (err.response?.status === 404) {
          setAlert('Please complete your shipper profile first', 'info');
          router.push('/dashboard/shipper/profile');
        } else {
          setCheckingProfile(false);
        }
      }
    };

    checkShipperProfile();
  }, []);

  if (checkingProfile) {
    return (
      <PrivateRoute>
        <Dashboard>
          <div className="flex justify-center items-center h-64">
            <p>Checking profile status...</p>
          </div>
        </Dashboard>
      </PrivateRoute>
    );
  }

  return (
    <PrivateRoute>
      <Dashboard>
        <ShipperDashboard />
      </Dashboard>
    </PrivateRoute>
  );
};

export default ShipperDashboardPage;