
// pages/dashboard/trucker/loads/[id].js
import { useRouter } from 'next/router';
import Dashboard from '../../../../components/layout/Dashboard';
import LoadDetail from '../../../../components/loads/LoadDetail';
import PrivateRoute from '../../../../components/routing/PrivateRoute';

const TruckerLoadDetailPage = () => {
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

export default TruckerLoadDetailPage;
