
// pages/dashboard/trucker/loads/[id]/bid.js
import { useRouter } from 'next/router';
import Dashboard from '../../../../../components/layout/Dashboard';
import PlaceBid from '../../../../../components/bids/PlaceBid';
import PrivateRoute from '../../../../../components/routing/PrivateRoute';

const TruckerPlaceBidPage = () => {
  const router = useRouter();
  const { id } = router.query;

  return (
    <PrivateRoute>
      <Dashboard>
        <div className="container mx-auto">
          <PlaceBid loadId={id} />
        </div>
      </Dashboard>
    </PrivateRoute>
  );
};

export default TruckerPlaceBidPage;