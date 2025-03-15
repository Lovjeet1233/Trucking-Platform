
// pages/dashboard/shipper/loads/index.js
import Dashboard from '../../../../components/layout/Dashboard';
import LoadsList from '../../../../components/loads/LoadsList';
import PrivateRoute from '../../../../components/routing/PrivateRoute';

const ShipperLoadsPage = () => {
  return (
    <PrivateRoute>
      <Dashboard>
        <div className="container mx-auto">
          <h1 className="text-2xl font-bold text-gray-800 mb-6">My Loads</h1>
          <LoadsList userRole="shipper" />
        </div>
      </Dashboard>
    </PrivateRoute>
  );
};

export default ShipperLoadsPage;