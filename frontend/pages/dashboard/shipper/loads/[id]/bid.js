
// pages/dashboard/shipper/loads/[id]/bids.js
import { useRouter } from 'next/router';
import { useState, useEffect } from 'react';
import Dashboard from '../../../../../components/layout/Dashboard';
import BidsList from '../../../../../components/bids/BidsList';
import PrivateRoute from '../../../../../components/routing/PrivateRoute';
import axios from 'axios';
import { useAlert } from '../../../../../context/alert/AlertContext';

const ShipperLoadBidsPage = () => {
  const router = useRouter();
  const { id } = router.query;
  const { setAlert } = useAlert();
  
  const [load, setLoad] = useState(null);
  const [bids, setBids] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      fetchData();
    }
  }, [id]);

  const fetchData = async () => {
    try {
      // Get load details
      const loadRes = await axios.get(`/api/v1/loads/${id}`);
      setLoad(loadRes.data.data);

      // Get bids for this load
      const bidsRes = await axios.get(`/api/v1/bids/load/${id}`);
      setBids(bidsRes.data.data);

      setLoading(false);
    } catch (err) {
      setAlert('Failed to fetch data', 'danger');
      setLoading(false);
    }
  };

  return (
    <PrivateRoute>
      <Dashboard>
        <div className="container mx-auto">
          {loading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-900"></div>
            </div>
          ) : (
            <>
              <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-gray-800">
                  Bids for: {load?.title}
                </h1>
                <button
                  onClick={() => router.back()}
                  className="px-4 py-2 border border-gray-300 rounded text-gray-700 hover:bg-gray-50"
                >
                  Back to Load
                </button>
              </div>

              <div className="bg-white p-6 rounded-lg shadow">
                <BidsList bids={bids} loadId={id} onBidAccepted={fetchData} />
              </div>
            </>
          )}
        </div>
      </Dashboard>
    </PrivateRoute>
  );
};

export default ShipperLoadBidsPage;