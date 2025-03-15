
// components/loads/LoadsList.js
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAlert } from '../../context/alert/AlertContext';
import axios from 'axios';
import LoadCard from './LoadCard';

const LoadsList = ({ userRole = 'shipper' }) => {
  const { setAlert } = useAlert();
  const router = useRouter();
  
  const [loads, setLoads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    status: '',
    loadType: '',
    dateRange: ''
  });

  useEffect(() => {
    const fetchLoads = async () => {
      try {
        let endpoint = '/api/v1/loads';
        
        if (userRole === 'shipper') {
          endpoint = '/api/v1/loads/shipper/me';
        } else if (userRole === 'trucker') {
          endpoint = '/api/v1/loads/available';
        }
        
        const res = await axios.get(endpoint);
        setLoads(res.data.data);
        setLoading(false);
      } catch (err) {
        setAlert('Failed to fetch loads', 'danger');
        setLoading(false);
      }
    };

    fetchLoads();
  }, [userRole]);

  const onFilterChange = e => {
    setFilters({
      ...filters,
      [e.target.name]: e.target.value
    });
  };

  // Apply filters
  const filteredLoads = loads.filter(load => {
    // Status filter
    if (filters.status && load.status !== filters.status) {
      return false;
    }
    
    // Load type filter
    if (filters.loadType && load.loadType !== filters.loadType) {
      return false;
    }
    
    // Date range filter (placeholder - would need better implementation)
    if (filters.dateRange) {
      // Handle date range filtering
    }
    
    return true;
  });

  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-gray-800">
          {userRole === 'shipper' ? 'My Loads' : 'Available Loads'}
        </h2>
        
        {userRole === 'shipper' && (
          <button
            onClick={() => router.push('/dashboard/shipper/post-load')}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Post New Load
          </button>
        )}
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div>
          <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">
            Status
          </label>
          <select
            id="status"
            name="status"
            value={filters.status}
            onChange={onFilterChange}
            className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          >
            <option value="">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="open">Open</option>
            <option value="assigned">Assigned</option>
            <option value="in_transit">In Transit</option>
            <option value="delivered">Delivered</option>
            <option value="completed">Completed</option>
          </select>
        </div>
        
        <div>
          <label htmlFor="loadType" className="block text-sm font-medium text-gray-700 mb-1">
            Load Type
          </label>
          <select
            id="loadType"
            name="loadType"
            value={filters.loadType}
            onChange={onFilterChange}
            className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          >
            <option value="">All Types</option>
            <option value="fTL">Full Truckload (FTL)</option>
            <option value="lTL">Less Than Truckload (LTL)</option>
            <option value="flatbed">Flatbed</option>
            <option value="refrigerated">Refrigerated</option>
            <option value="container">Container</option>
            <option value="hazardous">Hazardous Materials</option>
            <option value="oversized">Oversized</option>
            <option value="other">Other</option>
          </select>
        </div>
        
        <div>
          <label htmlFor="dateRange" className="block text-sm font-medium text-gray-700 mb-1">
            Date Range
          </label>
          <select
            id="dateRange"
            name="dateRange"
            value={filters.dateRange}
            onChange={onFilterChange}
            className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          >
            <option value="">All Dates</option>
            <option value="today">Today</option>
            <option value="week">This Week</option>
            <option value="month">This Month</option>
          </select>
        </div>
      </div>

      {/* Loads List */}
      {loading ? (
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-900"></div>
        </div>
      ) : filteredLoads.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-600">No loads found matching your filters.</p>
          {userRole === 'shipper' && (
            <button
              onClick={() => router.push('/dashboard/shipper/post-load')}
              className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Post New Load
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {filteredLoads.map(load => (
            <LoadCard
              key={load._id}
              load={load}
              userRole={userRole}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default LoadsList;