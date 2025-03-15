// pages/dashboard/trucker/bids/index.js
import Dashboard from '../../../../components/layout/Dashboard';
import TruckerBids from '../../../../components/bids/TruckerBids';
import PrivateRoute from '../../../../components/routing/PrivateRoute';

const TruckerBidsPage = () => {
  return (
    <PrivateRoute>
      <Dashboard>
        <div className="container mx-auto">
          <TruckerBids />
        </div>
      </Dashboard>
    </PrivateRoute>
  );
};

export default TruckerBidsPage;