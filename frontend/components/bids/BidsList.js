
// components/bids/BidsList.js
import { useState } from 'react';
import { useAlert } from '../../context/alert/AlertContext';
import axios from 'axios';
import { format } from 'date-fns';

const BidsList = ({ bids, loadId, onBidAccepted }) => {
  const { setAlert } = useAlert();
  const [loading, setLoading] = useState(false);
  const [selectedBid, setSelectedBid] = useState(null);

  // Sort bids by amount (lowest first)
  const sortedBids = [...bids].sort((a, b) => a.amount - b.amount);

  // Format dates for display
  const formatDateTime = dateString => {
    if (!dateString) return 'N/A';
    return format(new Date(dateString), 'MMM d, yyyy h:mm a');
  };

  const handleAcceptBid = async (bidId) => {
    if (window.confirm('Are you sure you want to accept this bid? This will assign the load to this trucker.')) {
      try {
        setLoading(true);
        setSelectedBid(bidId);
        
        // Accept the bid
        await axios.put(`/api/v1/bids/${bidId}/accept`);
        
        // Assign the load to the trucker (as a backup, though the controller should handle this)
        await axios.put(`/api/v1/loads/${loadId}/assign`, { bidId });
        
        setAlert('Bid accepted successfully', 'success');
        
        // Refresh load data if callback provided
        if (onBidAccepted) {
          onBidAccepted();
        }
      } catch (err) {
        setAlert(err.response?.data?.error || 'Failed to accept bid', 'danger');
        setLoading(false);
        setSelectedBid(null);
      }
    }
  };

  const handleRejectBid = async (bidId) => {
    if (window.confirm('Are you sure you want to reject this bid?')) {
      try {
        setLoading(true);
        setSelectedBid(bidId);
        
        await axios.put(`/api/v1/bids/${bidId}/reject`);
        
        setAlert('Bid rejected successfully', 'success');
        
        // Refresh load data if callback provided
        if (onBidAccepted) {
          onBidAccepted();
        }
      } catch (err) {
        setAlert(err.response?.data?.error || 'Failed to reject bid', 'danger');
        setLoading(false);
        setSelectedBid(null);
      }
    }
  };

  return (
    <div className="space-y-4">
      {sortedBids.length === 0 ? (
        <p className="text-gray-600">No bids have been placed yet.</p>
      ) : (
        sortedBids.map(bid => (
          <div 
            key={bid._id} 
            className={`border rounded-lg p-4 ${
              bid.status === 'accepted' 
                ? 'border-green-500 bg-green-50' 
                : bid.status === 'rejected'
                ? 'border-red-300 bg-red-50'
                : 'border-gray-200'
            }`}
          >
            <div className="flex justify-between items-start">
              <div>
                <div className="flex items-center mb-2">
                  <h3 className="text-lg font-medium text-gray-900 mr-2">
                    ${bid.amount}
                  </h3>
                  {bid.status === 'accepted' && (
                    <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                      Accepted
                    </span>
                  )}
                  {bid.status === 'rejected' && (
                    <span className="px-2 py-1 bg-red-100 text-red-800 text-xs rounded-full">
                      Rejected
                    </span>
                  )}
                  {bid.status === 'withdrawn' && (
                    <span className="px-2 py-1 bg-gray-100 text-gray-800 text-xs rounded-full">
                      Withdrawn
                    </span>
                  )}
                </div>
                <p className="text-gray-600 text-sm mb-2">
                  From: {bid.trucker?.user?.name || 'Trucker'}
                </p>
              </div>
              
              {bid.status === 'pending' && (
                <div className="flex">
                  <button
                    onClick={() => handleAcceptBid(bid._id)}
                    disabled={loading && selectedBid === bid._id}
                    className="mr-2 px-3 py-1 text-sm text-white bg-green-600 rounded hover:bg-green-700 disabled:opacity-50"
                  >
                    {loading && selectedBid === bid._id ? 'Processing...' : 'Accept'}
                  </button>
                  <button
                    onClick={() => handleRejectBid(bid._id)}
                    disabled={loading && selectedBid === bid._id}
                    className="px-3 py-1 text-sm text-white bg-red-600 rounded hover:bg-red-700 disabled:opacity-50"
                  >
                    Reject
                  </button>
                </div>
              )}
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-3">
              {bid.proposedPickupDate && (
                <div>
                  <h4 className="text-xs font-medium text-gray-500">Proposed Pickup</h4>
                  <p className="text-sm text-gray-900">{formatDateTime(bid.proposedPickupDate)}</p>
                </div>
              )}
              
              {bid.proposedDeliveryDate && (
                <div>
                  <h4 className="text-xs font-medium text-gray-500">Proposed Delivery</h4>
                  <p className="text-sm text-gray-900">{formatDateTime(bid.proposedDeliveryDate)}</p>
                </div>
              )}
            </div>
            
            {bid.notes && (
              <div className="mt-3">
                <h4 className="text-xs font-medium text-gray-500">Notes</h4>
                <p className="text-sm text-gray-900">{bid.notes}</p>
              </div>
            )}
            
            <div className="mt-3 text-right">
              <span className="text-xs text-gray-500">
                Bid placed on {formatDateTime(bid.createdAt)}
              </span>
            </div>
          </div>
        ))
      )}
    </div>
  );
};

export default BidsList;