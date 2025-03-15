

// components/loads/LoadDetail.js
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAlert } from '../../context/alert/AlertContext';
import { useAuth } from '../../context/auth/AuthContext';
import axios from 'axios';
import { format } from 'date-fns';
import BidsList from '../bids/BidsList';
import TrackingTimeline from '../tracking/TrackingTimeline';

const LoadDetail = () => {
  const { user } = useAuth();
  const { setAlert } = useAlert();
  const router = useRouter();
  const { id } = router.query;

  const [load, setLoad] = useState(null);
  const [bids, setBids] = useState([]);
  const [trackingUpdates, setTrackingUpdates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    if (id) {
      fetchLoadDetails();
    }
  }, [id]);

  const fetchLoadDetails = async () => {
    try {
      // Get load details
      const loadRes = await axios.get(`/api/v1/loads/${id}`);
      setLoad(loadRes.data.data);

      // Get bids if the user is the shipper and the load is open
      if (user.role === 'shipper' && loadRes.data.data.status === 'open') {
        const bidsRes = await axios.get(`/api/v1/bids/load/${id}`);
        setBids(bidsRes.data.data);
      }

      // Get tracking updates if the load is assigned, in transit, or delivered
      if (['assigned', 'in_transit', 'delivered', 'completed'].includes(loadRes.data.data.status)) {
        const trackingRes = await axios.get(`/api/v1/tracking/load/${id}`);
        setTrackingUpdates(trackingRes.data.data);
      }

      setLoading(false);
    } catch (err) {
      setAlert('Failed to fetch load details', 'danger');
      setLoading(false);
    }
  };

  // Format dates for display
  const formatDateTime = dateString => {
    if (!dateString) return 'N/A';
    return format(new Date(dateString), 'MMM d, yyyy h:mm a');
  };

  // Cancel load (shipper only)
  const handleCancelLoad = async () => {
    if (window.confirm('Are you sure you want to cancel this load?')) {
      try {
        setActionLoading(true);
        await axios.put(`/api/v1/loads/${id}/cancel`);
        setAlert('Load cancelled successfully', 'success');
        fetchLoadDetails();
      } catch (err) {
        setAlert(err.response?.data?.error || 'Failed to cancel load', 'danger');
      } finally {
        setActionLoading(false);
      }
    }
  };

  // Mark load as delivered (trucker only)
  const handleMarkDelivered = async () => {
    if (window.confirm('Are you sure you want to mark this load as delivered?')) {
      try {
        setActionLoading(true);
        await axios.put(`/api/v1/loads/${id}/deliver`);
        setAlert('Load marked as delivered successfully', 'success');
        fetchLoadDetails();
      } catch (err) {
        setAlert(err.response?.data?.error || 'Failed to mark load as delivered', 'danger');
      } finally {
        setActionLoading(false);
      }
    }
  };

  // Mark load as completed (shipper only)
  const handleMarkCompleted = async () => {
    if (window.confirm('Are you sure you want to mark this load as completed?')) {
      try {
        setActionLoading(true);
        await axios.put(`/api/v1/loads/${id}/complete`);
        setAlert('Load marked as completed successfully', 'success');
        fetchLoadDetails();
      } catch (err) {
        setAlert(err.response?.data?.error || 'Failed to mark load as completed', 'danger');
      } finally {
        setActionLoading(false);
      }
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-900"></div>
      </div>
    );
  }

  if (!load) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-600">Load not found</p>
        <button
          onClick={() => router.back()}
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Go Back
        </button>
      </div>
    );
  }

  // Get status badge style
  const getStatusBadge = status => {
    switch(status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'open':
        return 'bg-blue-100 text-blue-800';
      case 'assigned':
        return 'bg-purple-100 text-purple-800';
      case 'in_transit':
        return 'bg-indigo-100 text-indigo-800';
      case 'delivered':
        return 'bg-green-100 text-green-800';
      case 'completed':
        return 'bg-gray-100 text-gray-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="container mx-auto">
      <div className="bg-white p-6 rounded-lg shadow mb-6">
        <div className="flex justify-between items-center mb-4">
          <div>
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-gray-800 mr-3">{load.title}</h1>
              <span className={`px-3 py-1 rounded-full text-sm ${getStatusBadge(load.status)}`}>
                {load.status.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
              </span>
            </div>
            <p className="text-gray-600 mt-1">ID: {load._id}</p>
          </div>
          <div>
            <button
              onClick={() => router.back()}
              className="mr-2 px-4 py-2 border border-gray-300 rounded text-gray-700 hover:bg-gray-50"
            >
              Back
            </button>
            
            {user.role === 'shipper' && load.status === 'open' && (
              <button
                onClick={handleCancelLoad}
                disabled={actionLoading}
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50"
              >
                {actionLoading ? 'Processing...' : 'Cancel Load'}
              </button>
            )}
            
            {user.role === 'trucker' && load.status === 'in_transit' && (
              <button
                onClick={handleMarkDelivered}
                disabled={actionLoading}
                className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50"
              >
                {actionLoading ? 'Processing...' : 'Mark as Delivered'}
              </button>
            )}
            
            {user.role === 'shipper' && load.status === 'delivered' && (
              <button
                onClick={handleMarkCompleted}
                disabled={actionLoading}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
              >
                {actionLoading ? 'Processing...' : 'Mark as Completed'}
              </button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <div className="bg-gray-50 p-4 rounded-lg mb-6">
              <h2 className="text-lg font-semibold text-gray-800 mb-3">Load Details</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Pickup Location</h3>
                  <p className="text-gray-900">{load.pickupLocation.address}</p>
                </div>
                
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Delivery Location</h3>
                  <p className="text-gray-900">{load.deliveryLocation.address}</p>
                </div>
                
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Pickup Date</h3>
                  <p className="text-gray-900">{formatDateTime(load.pickupDate)}</p>
                </div>
                
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Delivery Date</h3>
                  <p className="text-gray-900">{formatDateTime(load.deliveryDate)}</p>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Load Type</h3>
                  <p className="text-gray-900">{load.loadType}</p>
                </div>
                
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Weight</h3>
                  <p className="text-gray-900">{load.weight} kg</p>
                </div>
                
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Budget</h3>
                  <p className="text-gray-900">${load.budget}</p>
                </div>
              </div>
              
              {load.dimensions && (Object.values(load.dimensions).some(v => v)) && (
                <div className="mb-4">
                  <h3 className="text-sm font-medium text-gray-500">Dimensions</h3>
                  <p className="text-gray-900">
                    {load.dimensions.length ? `${load.dimensions.length} × ` : ''}
                    {load.dimensions.width ? `${load.dimensions.width} × ` : ''}
                    {load.dimensions.height ? `${load.dimensions.height} cm` : ''}
                  </p>
                </div>
              )}
              
              <div className="mb-4">
                <h3 className="text-sm font-medium text-gray-500">Description</h3>
                <p className="text-gray-900 mt-1">{load.description}</p>
              </div>
              
              {load.specialRequirements && load.specialRequirements.length > 0 && (
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Special Requirements</h3>
                  <div className="flex flex-wrap gap-2 mt-1">
                    {load.specialRequirements.map((req, index) => (
                      <span 
                        key={index} 
                        className="px-2 py-1 bg-gray-200 text-gray-800 text-xs rounded-full"
                      >
                        {req}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Tracking Updates */}
            {['assigned', 'in_transit', 'delivered', 'completed'].includes(load.status) && (
              <div className="bg-gray-50 p-4 rounded-lg mb-6">
                <h2 className="text-lg font-semibold text-gray-800 mb-3">Tracking Updates</h2>
                
                {trackingUpdates.length > 0 ? (
                  <TrackingTimeline updates={trackingUpdates} />
                ) : (
                  <p className="text-gray-600">No tracking updates available yet.</p>
                )}
              </div>
            )}
          </div>
          
          <div>
            {/* Shipper / Trucker Info */}
            <div className="bg-gray-50 p-4 rounded-lg mb-6">
              {user.role === 'shipper' ? (
                <>
                  <h2 className="text-lg font-semibold text-gray-800 mb-3">Assigned Trucker</h2>
                  
                  {load.assignedTrucker ? (
                    <div>
                      <p className="text-gray-900 font-medium">{load.assignedTrucker.user?.name || 'Trucker'}</p>
                      {/* More trucker details can be shown here */}
                    </div>
                  ) : (
                    <p className="text-gray-600">No trucker assigned yet</p>
                  )}
                </>
              ) : (
                <>
                  <h2 className="text-lg font-semibold text-gray-800 mb-3">Shipper Information</h2>
                  
                  <div>
                    <p className="text-gray-900 font-medium">{load.shipper?.company || 'Shipper'}</p>
                    {/* More shipper details can be shown here */}
                  </div>
                </>
              )}
            </div>
            
            {/* Bid Information */}
            {load.status === 'open' && user.role === 'shipper' && (
              <div className="bg-gray-50 p-4 rounded-lg">
                <h2 className="text-lg font-semibold text-gray-800 mb-3">Bids</h2>
                
                {bids.length > 0 ? (
                  <BidsList bids={bids} loadId={load._id} onBidAccepted={fetchLoadDetails} />
                ) : (
                  <p className="text-gray-600">No bids received yet</p>
                )}
              </div>
            )}
            
            {load.status === 'open' && user.role === 'trucker' && (
              <div className="bg-gray-50 p-4 rounded-lg">
                <h2 className="text-lg font-semibold text-gray-800 mb-3">Place a Bid</h2>
                
                <button
                  onClick={() => router.push(`/dashboard/trucker/loads/${load._id}/bid`)}
                  className="w-full px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  Bid on this Load
                </button>
              </div>
            )}
            
            {load.acceptedBid && ['assigned', 'in_transit', 'delivered', 'completed'].includes(load.status) && (
              <div className="bg-gray-50 p-4 rounded-lg">
                <h2 className="text-lg font-semibold text-gray-800 mb-3">Contract Details</h2>
                
                <div className="space-y-2">
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Contract Amount</h3>
                    <p className="text-gray-900">${load.acceptedBid.amount}</p>
                  </div>
                  
                  {load.acceptedBid.proposedPickupDate && (
                    <div>
                      <h3 className="text-sm font-medium text-gray-500">Pickup Date</h3>
                      <p className="text-gray-900">{formatDateTime(load.acceptedBid.proposedPickupDate)}</p>
                    </div>
                  )}
                  
                  {load.acceptedBid.proposedDeliveryDate && (
                    <div>
                      <h3 className="text-sm font-medium text-gray-500">Delivery Date</h3>
                      <p className="text-gray-900">{formatDateTime(load.acceptedBid.proposedDeliveryDate)}</p>
                    </div>
                  )}
                  
                  {load.acceptedBid.notes && (
                    <div>
                      <h3 className="text-sm font-medium text-gray-500">Notes</h3>
                      <p className="text-gray-900">{load.acceptedBid.notes}</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoadDetail;