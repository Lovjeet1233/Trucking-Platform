// components/shipper/ShipperDashboard.js
import { useState, useEffect } from 'react';
import { useAuth } from '../../context/auth/AuthContext';
import { useAlert } from '../../context/alert/AlertContext';
import axios from 'axios';
import LoadCard from '../loads/LoadCard';
import LoadStats from '../loads/LoadStats';

const ShipperDashboard = () => {
  const { user } = useAuth();
  const { setAlert } = useAlert();
  const [loading, setLoading] = useState(true);
  const [loads, setLoads] = useState([]);
  const [stats, setStats] = useState({
    total: 0,
    open: 0,
    assigned: 0,
    inTransit: 0,
    delivered: 0,
    completed: 0
  });

  // Fetch shipper loads
  useEffect(() => {
    const fetchShipperLoads = async () => {
      try {
        const res = await axios.get('/api/v1/loads/shipper/me');
        setLoads(res.data.data);
        
        // Calculate stats
        const loadStats = {
          total: res.data.data.length,
          open: 0,
          assigned: 0,
          inTransit: 0,
          delivered: 0,
          completed: 0
        };
        
        res.data.data.forEach(load => {
          switch(load.status) {
            case 'open':
              loadStats.open++;
              break;
            case 'assigned':
              loadStats.assigned++;
              break;
            case 'in_transit':
              loadStats.inTransit++;
              break;
            case 'delivered':
              loadStats.delivered++;
              break;
            case 'completed':
              loadStats.completed++;
              break;
            default:
              break;
          }
        });
        
        setStats(loadStats);
        setLoading(false);
      } catch (err) {
        setAlert('Failed to fetch loads', 'danger');
        setLoading(false);
      }
    };

    fetchShipperLoads();
  }, []);

  const recentLoads = loads.slice(0, 5);

  return (
    <div className="container mx-auto">
      <div className="bg-white p-6 rounded-lg shadow mb-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-4">Welcome, {user?.name}</h1>
        <p className="text-gray-600">
          This is your shipper dashboard. Here you can manage your loads, view load status, and track your shipments.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <LoadStats stats={stats} loading={loading} />
      </div>

      <div className="bg-white p-6 rounded-lg shadow mb-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-800">Recent Loads</h2>
          <a href="/dashboard/shipper/loads" className="text-blue-600 hover:text-blue-800">
            View All
          </a>
        </div>

        {loading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-900"></div>
          </div>
        ) : recentLoads.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-600">No loads found. Start by posting a new load.</p>
            <a
              href="/dashboard/shipper/post-load"
              className="mt-4 inline-block bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            >
              Post a Load
            </a>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {recentLoads.map(load => (
              <LoadCard key={load._id} load={load} />
            ))}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Quick Actions</h2>
          <div className="grid grid-cols-2 gap-4">
            <a
              href="/dashboard/shipper/post-load"
              className="bg-blue-600 text-white p-4 rounded flex flex-col items-center justify-center hover:bg-blue-700"
            >
              <span className="text-lg mb-2">Post Load</span>
              <span className="text-xs">Create a new load listing</span>
            </a>
            <a
              href="/dashboard/shipper/tracking"
              className="bg-green-600 text-white p-4 rounded flex flex-col items-center justify-center hover:bg-green-700"
            >
              <span className="text-lg mb-2">Track Loads</span>
              <span className="text-xs">Monitor your active shipments</span>
            </a>
            <a
              href="/dashboard/shipper/financial"
              className="bg-purple-600 text-white p-4 rounded flex flex-col items-center justify-center hover:bg-purple-700"
            >
              <span className="text-lg mb-2">Financial</span>
              <span className="text-xs">View payments and transactions</span>
            </a>
            <a
              href="/dashboard/shipper/profile"
              className="bg-gray-600 text-white p-4 rounded flex flex-col items-center justify-center hover:bg-gray-700"
            >
              <span className="text-lg mb-2">Profile</span>
              <span className="text-xs">Update your company details</span>
            </a>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Notifications</h2>
          <div className="space-y-4">
            {/* Placeholder for notifications */}
            <p className="text-gray-600">No new notifications</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ShipperDashboard;

