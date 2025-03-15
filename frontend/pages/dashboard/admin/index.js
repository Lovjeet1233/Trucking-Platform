
// pages/dashboard/admin/index.js
import Dashboard from '../../../components/layout/Dashboard';
import PrivateRoute from '../../../components/routing/PrivateRoute';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../../../context/auth/AuthContext';
import { useAlert } from '../../../context/alert/AlertContext';
import axios from 'axios';

const AdminDashboardPage = () => {
  const { user } = useAuth();
  const { setAlert } = useAlert();
  const router = useRouter();
  
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    users: 0,
    shippers: 0,
    truckers: 0,
    loads: 0,
    pendingVerifications: 0
  });
  const [loadStats, setLoadStats] = useState({
    open: 0,
    assigned: 0,
    inTransit: 0,
    delivered: 0,
    completed: 0
  });
  const [recentLoads, setRecentLoads] = useState([]);
  const [pendingVerifications, setPendingVerifications] = useState([]);

  useEffect(() => {
    fetchAdminData();
  }, []);

  const fetchAdminData = async () => {
    try {
      const res = await axios.get('/api/v1/admin/dashboard');
      
      setStats(res.data.data.counts);
      setLoadStats(res.data.data.loadStats);
      setRecentLoads(res.data.data.recentData.loads);
      setPendingVerifications(res.data.data.recentData.pendingVerifications);
      
      setLoading(false);
    } catch (err) {
      setAlert('Failed to fetch dashboard data', 'danger');
      setLoading(false);
    }
  };

  return (
    <PrivateRoute>
      <Dashboard>
        <div className="container mx-auto">
          <div className="bg-white p-6 rounded-lg shadow mb-6">
            <h1 className="text-2xl font-bold text-gray-800 mb-4">Admin Dashboard</h1>
            <p className="text-gray-600">
              Welcome to the admin dashboard. Here you can manage users, loads, and system settings.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-6">
            {/* Stats Cards */}
            <div className="bg-white p-6 rounded-lg shadow text-center">
              <h3 className="text-lg font-medium text-gray-700">Users</h3>
              <p className="mt-2 text-3xl font-semibold">{stats.users}</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow text-center">
              <h3 className="text-lg font-medium text-gray-700">Shippers</h3>
              <p className="mt-2 text-3xl font-semibold">{stats.shippers}</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow text-center">
              <h3 className="text-lg font-medium text-gray-700">Truckers</h3>
              <p className="mt-2 text-3xl font-semibold">{stats.truckers}</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow text-center">
              <h3 className="text-lg font-medium text-gray-700">Loads</h3>
              <p className="mt-2 text-3xl font-semibold">{stats.loads}</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow text-center">
              <h3 className="text-lg font-medium text-gray-700 text-yellow-600">Pending Verifications</h3>
              <p className="mt-2 text-3xl font-semibold text-yellow-600">{stats.pendingVerifications}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            {/* Load Statistics */}
            <div className="bg-white p-6 rounded-lg shadow">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">Load Statistics</h2>
              
              {loading ? (
                <div className="flex justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-900"></div>
                </div>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  <div className="bg-blue-50 p-4 rounded-lg text-center">
                    <h3 className="text-sm font-medium text-blue-700">Open</h3>
                    <p className="mt-1 text-2xl font-semibold text-blue-700">{loadStats.open}</p>
                  </div>
                  <div className="bg-purple-50 p-4 rounded-lg text-center">
                    <h3 className="text-sm font-medium text-purple-700">Assigned</h3>
                    <p className="mt-1 text-2xl font-semibold text-purple-700">{loadStats.assigned}</p>
                  </div>
                  <div className="bg-indigo-50 p-4 rounded-lg text-center">
                    <h3 className="text-sm font-medium text-indigo-700">In Transit</h3>
                    <p className="mt-1 text-2xl font-semibold text-indigo-700">{loadStats.inTransit}</p>
                  </div>
                  <div className="bg-green-50 p-4 rounded-lg text-center">
                    <h3 className="text-sm font-medium text-green-700">Delivered</h3>
                    <p className="mt-1 text-2xl font-semibold text-green-700">{loadStats.delivered}</p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg text-center">
                    <h3 className="text-sm font-medium text-gray-700">Completed</h3>
                    <p className="mt-1 text-2xl font-semibold text-gray-700">{loadStats.completed}</p>
                  </div>
                  <div className="bg-yellow-50 p-4 rounded-lg text-center">
                    <h3 className="text-sm font-medium text-yellow-700">Total</h3>
                    <p className="mt-1 text-2xl font-semibold text-yellow-700">{stats.loads}</p>
                  </div>
                </div>
              )}
            </div>

            {/* Pending Verifications */}
            <div className="bg-white p-6 rounded-lg shadow">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold text-gray-800">Pending Verifications</h2>
                <a href="/dashboard/admin/verifications" className="text-blue-600 hover:text-blue-800">
                  View All
                </a>
              </div>
              
              {loading ? (
                <div className="flex justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-900"></div>
                </div>
              ) : pendingVerifications.length === 0 ? (
                <p className="text-gray-600">No pending verifications.</p>
              ) : (
                <div className="space-y-4">
                  {pendingVerifications.map(trucker => (
                    <div key={trucker._id} className="border rounded-lg p-4">
                      <div className="flex justify-between items-center">
                        <div>
                          <h3 className="font-medium text-gray-900">{trucker.user?.name || 'Trucker'}</h3>
                          <p className="text-sm text-gray-600">{trucker.user?.email}</p>
                        </div>
                        <button
                          onClick={() => router.push(`/dashboard/admin/verifications/${trucker._id}`)}
                          className="px-3 py-1 text-sm text-white bg-blue-600 rounded hover:bg-blue-700"
                        >
                          Review
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Recent Loads */}
          <div className="bg-white p-6 rounded-lg shadow mb-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-gray-800">Recent Loads</h2>
              <a href="/dashboard/admin/loads" className="text-blue-600 hover:text-blue-800">
                View All
              </a>
            </div>
            
            {loading ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-900"></div>
              </div>
            ) : recentLoads.length === 0 ? (
              <p className="text-gray-600">No loads found.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Title
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Shipper
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Budget
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {recentLoads.map(load => (
                      <tr key={load._id}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">{load.title}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{load.shipper?.company || 'Unknown'}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            load.status === 'open' 
                              ? 'bg-blue-100 text-blue-800' 
                              : load.status === 'assigned'
                              ? 'bg-purple-100 text-purple-800'
                              : load.status === 'in_transit'
                              ? 'bg-indigo-100 text-indigo-800'
                              : load.status === 'delivered'
                              ? 'bg-green-100 text-green-800'
                              : 'bg-gray-100 text-gray-800'
                          }`}>
                            {load.status.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          ${load.budget}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <button
                            onClick={() => router.push(`/dashboard/admin/loads/${load._id}`)}
                            className="text-blue-600 hover:text-blue-900"
                          >
                            View
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Quick Actions */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Quick Actions</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <a
                href="/dashboard/admin/users"
                className="bg-blue-600 text-white p-4 rounded flex flex-col items-center justify-center hover:bg-blue-700"
              >
                <span className="text-lg mb-2">Manage Users</span>
                <span className="text-xs">View and edit user accounts</span>
              </a>
              <a
                href="/dashboard/admin/verifications"
                className="bg-yellow-600 text-white p-4 rounded flex flex-col items-center justify-center hover:bg-yellow-700"
              >
                <span className="text-lg mb-2">Verifications</span>
                <span className="text-xs">Review trucker verifications</span>
              </a>
              <a
                href="/dashboard/admin/loads"
                className="bg-green-600 text-white p-4 rounded flex flex-col items-center justify-center hover:bg-green-700"
              >
                <span className="text-lg mb-2">Manage Loads</span>
                <span className="text-xs">View all system loads</span>
              </a>
              <a
                href="/dashboard/admin/benefits"
                className="bg-purple-600 text-white p-4 rounded flex flex-col items-center justify-center hover:bg-purple-700"
              >
                <span className="text-lg mb-2">Benefits</span>
                <span className="text-xs">Manage trucker benefits</span>
              </a>
            </div>
          </div>
        </div>
      </Dashboard>
    </PrivateRoute>
  );
};

export default AdminDashboardPage;