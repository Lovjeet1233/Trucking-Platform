
// components/bids/TruckerBids.js
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAlert } from '../../context/alert/AlertContext';
import axios from 'axios';
import { format, formatDistance } from 'date-fns';

const TruckerBids = () => {
  const { setAlert } = useAlert();
  const router = useRouter();
  
  const [bids, setBids] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedStatus, setSelectedStatus] = useState('all');

  useEffect(() => {
    fetchTruckerBids();
  }, []);

  const fetchTruckerBids = async () => {
    try {
      const res = await axios.get('/api/v1/bids/trucker/me');
      setBids(res.data.data);
      setLoading(false);
    } catch (err) {
      setAlert('Failed to fetch bids', 'danger');
      setLoading(false);
    }
  };

  // Format dates for display
  const formatDateTime = dateString => {
    if (!dateString) return 'N/A';
    return format(new Date(dateString), 'MMM d, yyyy h:mm a');
  };

  // Get status badge style
  const getStatusBadge = status => {
    switch(status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'accepted':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      case 'withdrawn':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Filter bids by status
  const filteredBids = selectedStatus === 'all' 
    ? bids
    : bids.filter(bid => bid.status === selectedStatus);

  const handleWithdrawBid = async (bidId) => {
    if (window.confirm('Are you sure you want to withdraw this bid?')) {
      try {
        await axios.put(`/api/v1/bids/${bidId}/withdraw`);
        setAlert('Bid withdrawn successfully', 'success');
        fetchTruckerBids();
      } catch (err) {
        setAlert(err.response?.data?.error || 'Failed to withdraw bid', 'danger');
      }
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">My Bids</h1>
        
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
            <option value="all">All Bids</option>
            <option value="pending">Pending</option>
            <option value="accepted">Accepted</option>
            <option value="rejected">Rejected</option>
            <option value="withdrawn">Withdrawn</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-900"></div>
        </div>
      ) : filteredBids.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-600">No bids found. Start by browsing available loads.</p>
          <button
            onClick={() => router.push('/dashboard/trucker/loads')}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Find Loads
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredBids.map(bid => (
            <div 
              key={bid._id} 
              className={`border rounded-lg overflow-hidden ${
                bid.status === 'accepted' 
                  ? 'border-green-500' 
                  : bid.status === 'rejected'
                  ? 'border-red-300'
                  : 'border-gray-200'
              }`}
            >
              <div className="p-4">
                <div className="flex justify-between mb-2">
                  <div>
                    <h3 className="text-lg font-medium text-gray-900">
                      {bid.load?.title || 'Load'}
                    </h3>
                    <div className="flex items-center mt-1">
                      <span className={`px-2 py-1 rounded-full text-xs ${getStatusBadge(bid.status)}`}>
                        {bid.status.charAt(0).toUpperCase() + bid.status.slice(1)}
                      </span>
                      <span className="ml-2 text-sm text-gray-500">
                        Bid: ${bid.amount}
                      </span>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <p className="text-sm text-gray-500">
                      {formatDistance(new Date(bid.createdAt), new Date(), { addSuffix: true })}
                    </p>
                    {bid.status === 'pending' && (
                      <div className="mt-2">
                        <button
                          onClick={() => router.push(`/dashboard/trucker/loads/${bid.load?._id}/bid`)}
                          className="mr-2 text-sm text-blue-600 hover:text-blue-800"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleWithdrawBid(bid._id)}
                          className="text-sm text-red-600 hover:text-red-800"
                        >
                          Withdraw
                        </button>
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-3">
                  <div>
                    <h4 className="text-xs font-medium text-gray-500">Pickup</h4>
                    <p className="text-sm text-gray-900">{bid.load?.pickupLocation?.address || 'N/A'}</p>
                    <p className="text-xs text-gray-500">
                      {bid.load?.pickupDate ? formatDateTime(bid.load.pickupDate) : 'N/A'}
                    </p>
                  </div>
                  
                  <div>
                    <h4 className="text-xs font-medium text-gray-500">Delivery</h4>
                    <p className="text-sm text-gray-900">{bid.load?.deliveryLocation?.address || 'N/A'}</p>
                    <p className="text-xs text-gray-500">
                      {bid.load?.deliveryDate ? formatDateTime(bid.load.deliveryDate) : 'N/A'}
                    </p>
                  </div>
                </div>
                
                {(bid.proposedPickupDate || bid.proposedDeliveryDate) && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-3 pb-3 border-b border-gray-200">
                    {bid.proposedPickupDate && (
                      <div>
                        <h4 className="text-xs font-medium text-gray-500">Your Proposed Pickup</h4>
                        <p className="text-sm text-gray-900">{formatDateTime(bid.proposedPickupDate)}</p>
                      </div>
                    )}
                    
                    {bid.proposedDeliveryDate && (
                      <div>
                        <h4 className="text-xs font-medium text-gray-500">Your Proposed Delivery</h4>
                        <p className="text-sm text-gray-900">{formatDateTime(bid.proposedDeliveryDate)}</p>
                      </div>
                    )}
                  </div>
                )}
                
                <div className="mt-3">
                  <button
                    onClick={() => router.push(`/dashboard/trucker/loads/${bid.load?._id}`)}
                    className="text-blue-600 hover:text-blue-800"
                  >
                    View Load Details
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default TruckerBids;