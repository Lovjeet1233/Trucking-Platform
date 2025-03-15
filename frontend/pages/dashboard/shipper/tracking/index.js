
// pages/dashboard/shipper/tracking/index.js
import Dashboard from '../../../../components/layout/Dashboard';
import PrivateRoute from '../../../../components/routing/PrivateRoute';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAlert } from '../../../../context/alert/AlertContext';
import axios from 'axios';

const ShipperTrackingPage = () => {
  const router = useRouter();
  const { setAlert } = useAlert();
  
  const [loads, setLoads] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchShipperLoads();
  }, []);

  const fetchShipperLoads = async () => {
    try {
      const res = await axios.get('/api/v1/loads/shipper/me');
      
      // Filter for loads that are assigned, in transit, or delivered
      const trackableLoads = res.data.data.filter(load => 
        ['assigned', 'in_transit', 'delivered'].includes(load.status)
      );
      
      setLoads(trackableLoads);
      setLoading(false);
    } catch (err) {
      setAlert('Failed to fetch loads', 'danger');
      setLoading(false);
    }
  };

  const viewTracking = (loadId) => {
    router.push(`/dashboard/shipper/tracking/${loadId}`);
  };

  return (
    <PrivateRoute>
      <Dashboard>
        <div className="container mx-auto">
          <h1 className="text-2xl font-bold text-gray-800 mb-6">Load Tracking</h1>
          
          <div className="bg-white p-6 rounded-lg shadow">
            {loading ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-900"></div>
              </div>
            ) : loads.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-600">No active loads to track. Assign a load to a trucker to start tracking.</p>
                <button
                  onClick={() => router.push('/dashboard/shipper/loads')}
                  className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  View My Loads
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                <p className="text-gray-600 mb-4">Select a load to view its tracking details:</p>
                
                {loads.map(load => (
                  <div 
                    key={load._id} 
                    className="border rounded-lg p-4 cursor-pointer hover:shadow-md transition-shadow duration-200"
                    onClick={() => viewTracking(load._id)}
                  >
                    <div className="flex justify-between items-center">
                      <div>
                        <h3 className="text-lg font-medium text-gray-900">{load.title}</h3>
                        <p className="text-sm text-gray-500">Status: {load.status.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}</p>
                      </div>
                      <div className="text-blue-600">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </Dashboard>
    </PrivateRoute>
  );
};

export default ShipperTrackingPage;