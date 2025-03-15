
// pages/dashboard/trucker/my-loads/index.js
import Dashboard from '../../../../components/layout/Dashboard';
import PrivateRoute from '../../../../components/routing/PrivateRoute';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAlert } from '../../../../context/alert/AlertContext';
import axios from 'axios';

const TruckerMyLoadsPage = () => {
  const router = useRouter();
  const { setAlert } = useAlert();
  
  const [loads, setLoads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedStatus, setSelectedStatus] = useState('active');

  useEffect(() => {
    fetchTruckerLoads();
  }, [selectedStatus]);

  const fetchTruckerLoads = async () => {
    try {
      const res = await axios.get('/api/v1/loads', {
        params: {
          assignedTrucker: true
        }
      });
      
      // Filter based on selected status
      let filteredLoads;
      if (selectedStatus === 'active') {
        filteredLoads = res.data.data.filter(load => 
          ['assigned', 'in_transit'].includes(load.status)
        );
      } else if (selectedStatus === 'delivered') {
        filteredLoads = res.data.data.filter(load => load.status === 'delivered');
      } else if (selectedStatus === 'completed') {
        filteredLoads = res.data.data.filter(load => load.status === 'completed');
      } else {
        filteredLoads = res.data.data;
      }
      
      setLoads(filteredLoads);
      setLoading(false);
    } catch (err) {
      setAlert('Failed to fetch loads', 'danger');
      setLoading(false);
    }
  };

  // Get status badge style
  const getStatusBadge = status => {
    switch(status) {
      case 'assigned':
        return 'bg-purple-100 text-purple-800';
      case 'in_transit':
        return 'bg-indigo-100 text-indigo-800';
      case 'delivered':
        return 'bg-green-100 text-green-800';
      case 'completed':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Format status text
  const formatStatus = status => {
    return status.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  const viewLoadDetails = (loadId) => {
    router.push(`/dashboard/trucker/loads/${loadId}`);
  };

  const updateTracking = (loadId) => {
    router.push(`/dashboard/trucker/tracking/${loadId}`);
  };

  return (
    <PrivateRoute>
      <Dashboard>
        <div className="container mx-auto">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold text-gray-800">My Loads</h1>
            
            <div className="flex items-center">
              <label htmlFor="status-filter" className="mr-2 text-sm text-gray-700">
                Filter by Status:
              </label>
              <select
                id="status-filter"
                value={selectedStatus}
                onChange={e => setSelectedStatus(e.target.value)}
                className="appearance-none border border-gray-300 rounded px-3 py-1 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="active">Active Loads</option>
                <option value="delivered">Delivered</option>
                <option value="completed">Completed</option>
                <option value="all">All Loads</option>
              </select>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            {loading ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-900"></div>
              </div>
            ) : loads.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-600">No loads found with the selected status.</p>
                <button
                  onClick={() => router.push('/dashboard/trucker/loads')}
                  className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  Find Loads
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {loads.map(load => (
                  <div 
                    key={load._id} 
                    className="border rounded-lg p-4 hover:shadow-md transition-shadow duration-200"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="flex items-center mb-2">
                          <h3 className="text-lg font-medium text-gray-900 mr-2">{load.title}</h3>
                          <span className={`px-2 py-1 rounded-full text-xs ${getStatusBadge(load.status)}`}>
                            {formatStatus(load.status)}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600">
                          From: {load.pickupLocation.address.split(',')[0]}
                        </p>
                        <p className="text-sm text-gray-600">
                          To: {load.deliveryLocation.address.split(',')[0]}
                        </p>
                      </div>
                      
                      <div className="flex flex-col space-y-2">
                        {['assigned', 'in_transit'].includes(load.status) && (
                          <button
                            onClick={() => updateTracking(load._id)}
                            className="px-3 py-1 text-sm text-white bg-blue-600 rounded hover:bg-blue-700"
                          >
                            Update Tracking
                          </button>
                        )}
                        <button
                          onClick={() => viewLoadDetails(load._id)}
                          className="px-3 py-1 text-sm text-blue-600 border border-blue-600 rounded hover:bg-blue-50"
                        >
                          View Details
                        </button>
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

export default TruckerMyLoadsPage;
