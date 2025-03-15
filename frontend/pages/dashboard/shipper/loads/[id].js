
// pages/dashboard/shipper/loads/[id].js
import { useRouter } from 'next/router';
import Dashboard from '../../../../components/layout/Dashboard';
import LoadDetail from '../../../../components/loads/LoadDetail';
import PrivateRoute from '../../../../components/routing/PrivateRoute';

const ShipperLoadDetailPage = () => {
  const router = useRouter();
  const { id } = router.query;

  return (
    <PrivateRoute>
      <Dashboard>
        <div className="container mx-auto">
          {id && <LoadDetail />}
        </div>
      </Dashboard>
    </PrivateRoute>
  );
};

export default ShipperLoadDetailPage;