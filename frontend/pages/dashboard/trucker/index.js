
// pages/dashboard/trucker/index.js
import Dashboard from '../../../components/layout/Dashboard';
import PrivateRoute from '../../../components/routing/PrivateRoute';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../../../context/auth/AuthContext';
import { useAlert } from '../../../context/alert/AlertContext';
import axios from 'axios';
import { format } from 'date-fns';

const TruckerDashboardPage = () => {
  const { user } = useAuth();
  const { setAlert } = useAlert();
  const router = useRouter();
  
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalBids: 0,
    activeBids: 0,
    wonBids: 0,
    activeLoads: 0,
    completedLoads: 0
  });
  const [activeLoads, setActiveLoads] = useState([]);
  const [recentBids, setRecentBids] = useState([]);
  const [checkingProfile, setCheckingProfile] = useState(true);

  useEffect(() => {
    const checkTruckerProfile = async () => {
      try {
        await api.get('/truckers/profile');
        setCheckingProfile(false);
      } catch (err) {
        if (err.response?.status === 404) {
          setAlert('Please complete your trucker profile first', 'info');
          router.push('/dashboard/trucker/profile');
        } else {
          setCheckingProfile(false);
        }
      }
    };

    checkTruckerProfile();
  }, []);

  useEffect(() => {
    fetchTruckerData();
  }, []);

  const fetchTruckerData = async () => {
    try {
      // Get trucker's bids
      const bidsRes = await axios.get('/api/v1/bids/trucker/me');
      const bids = bidsRes.data.data;
      
      // Calculate bid statistics
      const activeBids = bids.filter(bid => bid.status === 'pending');
      const wonBids = bids.filter(bid => bid.status === 'accepted');
      
      // Get loads where this trucker is assigned
      const loadsRes = await axios.get('/api/v1/loads', {
        params: {
          assignedTrucker: true
        }
      });
      const loads = loadsRes.data.data;
      
      // Filter active and completed loads
      const active = loads.filter(load => ['assigned', 'in_transit'].includes(load.status));
      const completed = loads.filter(load => load.status === 'completed');
      
      setStats({
        totalBids: bids.length,
        activeBids: activeBids.length,
        wonBids: wonBids.length,
        activeLoads: active.length,
        completedLoads: completed.length
      });
      
      setActiveLoads(active);
      setRecentBids(bids.slice(0, 5)); // Get 5 most recent bids
      
      setLoading(false);
    } catch (err) {
      setAlert('Failed to fetch dashboard data', 'danger');
      setLoading(false);
    }
  };

  // Format dates for display
  const formatDateTime = dateString => {
    if (!dateString) return 'N/A';
    return format(new Date(dateString), 'MMM d, yyyy');
  };

  return (
    <PrivateRoute>
      <Dashboard>
        <div className="container mx-auto">
          <div className="bg-white p-6 rounded-lg shadow mb-6">
            <h1 className="text-2xl font-bold text-gray-800 mb-4">Welcome, {user?.name}</h1>
            <p className="text-gray-600">
              This is your trucker dashboard. Here you can find available loads, manage your bids, and track your active transports.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            {/* Stats Cards */}
            <div className="bg-white p-6 rounded-lg shadow border-l-4 border-blue-500">
              <h3 className="text-lg font-medium text-gray-700">Bids</h3>
              <p className="mt-2 text-3xl font-semibold">{stats.totalBids}</p>
              <div className="mt-4 grid grid-cols-2 gap-2">
                <div className="text-center">
                  <span className="text-xs text-gray-500">Active</span>
                  <p className="font-medium">{stats.activeBids}</p>
                </div>
                <div className="text-center">
                  <span className="text-xs text-gray-500">Won</span>
                  <p className="font-medium">{stats.wonBids}</p>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow border-l-4 border-green-500">
              <h3 className="text-lg font-medium text-gray-700">Active Loads</h3>
              <p className="mt-2 text-3xl font-semibold">{stats.activeLoads}</p>
              <div className="mt-4 text-center">
                <button
                  onClick={() => router.push('/dashboard/trucker/my-loads')}
                  className="text-blue-600 hover:text-blue-800"
                >
                  View Active Loads
                </button>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow border-l-4 border-purple-500">
              <h3 className="text-lg font-medium text-gray-700">Completed Loads</h3>
              <p className="mt-2 text-3xl font-semibold">{stats.completedLoads}</p>
              <div className="mt-4 text-center">
                <button
                  onClick={() => router.push('/dashboard/trucker/financial')}
                  className="text-blue-600 hover:text-blue-800"
                >
                  View Earnings
                </button>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            {/* Active Loads */}
            <div className="bg-white p-6 rounded-lg shadow">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold text-gray-800">Active Loads</h2>
                <a href="/dashboard/trucker/my-loads" className="text-blue-600 hover:text-blue-800">
                  View All
                </a>
              </div>

              {loading ? (
                <div className="flex justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-900"></div>
                </div>
              ) : activeLoads.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-600">No active loads.</p>
                  <a
                    href="/dashboard/trucker/loads"
                    className="mt-4 inline-block text-blue-600 hover:text-blue-800"
                  >
                    Find loads to transport
                  </a>
                </div>
              ) : (
                <div className="space-y-4">
                  {activeLoads.map(load => (
                    <div 
                      key={load._id} 
                      className="border rounded-lg p-4 cursor-pointer hover:shadow-md transition-shadow duration-200"
                      onClick={() => router.push(`/dashboard/trucker/loads/${load._id}`)}
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

            {/* Recent Bids */}
            <div className="bg-white p-6 rounded-lg shadow">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold text-gray-800">Recent Bids</h2>
                <a href="/dashboard/trucker/bids" className="text-blue-600 hover:text-blue-800">
                  View All
                </a>
              </div>

              {loading ? (
                <div className="flex justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-900"></div>
                </div>
              ) : recentBids.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-600">No bids placed yet.</p>
                  <a
                    href="/dashboard/trucker/loads"
                    className="mt-4 inline-block text-blue-600 hover:text-blue-800"
                  >
                    Find loads to bid on
                  </a>
                </div>
              ) : (
                <div className="space-y-4">
                  {recentBids.map(bid => (
                    <div 
                      key={bid._id} 
                      className="border rounded-lg p-4 cursor-pointer hover:shadow-md transition-shadow duration-200"
                      // Continuation of pages/dashboard/trucker/index.js
                      onClick={() => router.push(`/dashboard/trucker/loads/${bid.load?._id}`)}
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="text-lg font-medium text-gray-900">${bid.amount}</h3>
                          <p className="text-sm text-gray-600">{bid.load?.title || 'Load'}</p>
                          <div className="flex items-center mt-1">
                            <span className={`px-2 py-1 rounded-full text-xs ${
                              bid.status === 'pending' 
                                ? 'bg-yellow-100 text-yellow-800' 
                                : bid.status === 'accepted'
                                ? 'bg-green-100 text-green-800'
                                : bid.status === 'rejected'
                                ? 'bg-red-100 text-red-800'
                                : 'bg-gray-100 text-gray-800'
                            }`}>
                              {bid.status.charAt(0).toUpperCase() + bid.status.slice(1)}
                            </span>
                          </div>
                        </div>
                        <div className="text-right text-xs text-gray-500">
                          {formatDateTime(bid.createdAt)}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Quick Actions</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <a
                href="/dashboard/trucker/loads"
                className="bg-blue-600 text-white p-4 rounded flex flex-col items-center justify-center hover:bg-blue-700"
              >
                <span className="text-lg mb-2">Find Loads</span>
                <span className="text-xs">Browse available loads</span>
              </a>
              <a
                href="/dashboard/trucker/bids"
                className="bg-green-600 text-white p-4 rounded flex flex-col items-center justify-center hover:bg-green-700"
              >
                <span className="text-lg mb-2">My Bids</span>
                <span className="text-xs">Manage your bids</span>
              </a>
              <a
                href="/dashboard/trucker/tracking"
                className="bg-purple-600 text-white p-4 rounded flex flex-col items-center justify-center hover:bg-purple-700"
              >
                <span className="text-lg mb-2">Update Tracking</span>
                <span className="text-xs">Update load status</span>
              </a>
              <a
                href="/dashboard/trucker/benefits"
                className="bg-orange-600 text-white p-4 rounded flex flex-col items-center justify-center hover:bg-orange-700"
              >
                <span className="text-lg mb-2">Benefits</span>
                <span className="text-xs">View trucker benefits</span>
              </a>
            </div>
          </div>
        </div>
      </Dashboard>
    </PrivateRoute>
  );
};

export default TruckerDashboardPage;





