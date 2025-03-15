
// pages/dashboard/shipper/index.js
import Dashboard from '../../../components/layout/Dashboard';
import ShipperDashboard from '../../../components/shipper/ShipperDashboard';
import PrivateRoute from '../../../components/routing/PrivateRoute';

const ShipperDashboardPage = () => {
  return (
    <PrivateRoute>
      <Dashboard>
        <ShipperDashboard />
      </Dashboard>
    </PrivateRoute>
  );
};

export default ShipperDashboardPage;






