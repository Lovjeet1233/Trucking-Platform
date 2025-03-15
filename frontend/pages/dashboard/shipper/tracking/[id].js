
// pages/dashboard/shipper/tracking/[id].js
import { useRouter } from 'next/router';
import Dashboard from '../../../../components/layout/Dashboard';
import LoadTracking from '../../../../components/tracking/LoadTracking';
import PrivateRoute from '../../../../components/routing/PrivateRoute';

const ShipperLoadTrackingPage = () => {
  const router = useRouter();
  const { id } = router.query;

  return (
    <PrivateRoute>
      <Dashboard>
        <div className="container mx-auto">
          {id && <LoadTracking loadId={id} />}
        </div>
      </Dashboard>
    </PrivateRoute>
  );
};

export default ShipperLoadTrackingPage;
