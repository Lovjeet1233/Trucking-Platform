// components/bids/PlaceBid.js
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAlert } from '../../context/alert/AlertContext';
import api from '../../utils/api'; // Use your configured API instance instead of axios
import { format } from 'date-fns';

const PlaceBid = () => {
  const { setAlert } = useAlert();
  const router = useRouter();
  const { loadId } = router.query;
  
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [load, setLoad] = useState(null);
  const [existingBid, setExistingBid] = useState(null);
  const [checkingProfile, setCheckingProfile] = useState(true);
  
  const [formData, setFormData] = useState({
    amount: '',
    proposedPickupDate: '',
    proposedDeliveryDate: '',
    notes: ''
  });

  const { amount, proposedPickupDate, proposedDeliveryDate, notes } = formData;

  // First check if the user has a trucker profile
  useEffect(() => {
    const checkTruckerProfile = async () => {
      try {
        await api.get('/truckers/profile');
        setCheckingProfile(false);
      } catch (err) {
        if (err.response?.status === 404) {
          setAlert('You need to complete your trucker profile first', 'danger');
          router.push('/dashboard/trucker/profile');
        } else {
          setAlert('Error checking trucker profile', 'danger');
        }
      }
    };

    checkTruckerProfile();
  }, []);

  // Then fetch load details once we know the user has a profile
  useEffect(() => {
    if (loadId && !checkingProfile) {
      fetchLoadDetails();
    }
  }, [loadId, checkingProfile]);

  const fetchLoadDetails = async () => {
    try {
      // Get load details
      const loadRes = await api.get(`/loads/${loadId}`);
      setLoad(loadRes.data.data);
      
      // Check if the user already has a bid on this load
      try {
        const bidsRes = await api.get(`/bids/load/${loadId}`);
        if (bidsRes.data.data && bidsRes.data.data.length > 0) {
          const userBid = bidsRes.data.data[0]; // From the controller, a trucker will only get their own bid
          setExistingBid(userBid);
          
          // Pre-fill form with existing bid data
          setFormData({
            amount: userBid.amount,
            proposedPickupDate: userBid.proposedPickupDate ? new Date(userBid.proposedPickupDate).toISOString().slice(0, 16) : '',
            proposedDeliveryDate: userBid.proposedDeliveryDate ? new Date(userBid.proposedDeliveryDate).toISOString().slice(0, 16) : '',
            notes: userBid.notes || ''
          });
        }
      } catch (err) {
        // No existing bid or error fetching bids, which is fine
      }
      
      setLoading(false);
    } catch (err) {
      setAlert('Failed to fetch load details', 'danger');
      setLoading(false);
    }
  };

  const onChange = e => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const onSubmit = async e => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const bidData = {
        load: loadId,
        ...formData
      };

      if (existingBid) {
        // Update existing bid
        await api.put(`/bids/${existingBid._id}`, formData);
        setAlert('Bid updated successfully', 'success');
      } else {
        // Create new bid
        await api.post('/bids', bidData);
        setAlert('Bid placed successfully', 'success');
      }
      
      router.push('/dashboard/trucker/bids');
    } catch (err) {
      setAlert(err.response?.data?.error || 'Failed to submit bid', 'danger');
      setSubmitting(false);
    }
  };

  const handleWithdrawBid = async () => {
    if (!existingBid) return;
    
    if (window.confirm('Are you sure you want to withdraw your bid?')) {
      try {
        setSubmitting(true);
        await api.put(`/bids/${existingBid._id}/withdraw`);
        setAlert('Bid withdrawn successfully', 'success');
        router.push('/dashboard/trucker/bids');
      } catch (err) {
        setAlert(err.response?.data?.error || 'Failed to withdraw bid', 'danger');
        setSubmitting(false);
      }
    }
  };

  // Format dates for display
  const formatDateTime = dateString => {
    if (!dateString) return 'N/A';
    return format(new Date(dateString), 'MMM d, yyyy h:mm a');
  };

  if (checkingProfile || loading) {
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

  // Check if load is still open for bidding
  const isBiddingOpen = load.status === 'open' && new Date(load.biddingDeadline) > new Date();
  
  if (!isBiddingOpen) {
    return (
      <div className="bg-white p-6 rounded-lg shadow">
        <h1 className="text-2xl font-bold text-gray-800 mb-4">Bidding Closed</h1>
        <p className="text-gray-600 mb-6">
          This load is no longer accepting bids. The bidding deadline has passed or the load has been assigned.
        </p>
        <button
          onClick={() => router.back()}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Go Back
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <h1 className="text-2xl font-bold text-gray-800 mb-4">
        {existingBid ? 'Update Your Bid' : 'Place a Bid'}
      </h1>
      
      <div className="bg-gray-50 p-4 rounded-lg mb-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-3">Load Details</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <h3 className="text-sm font-medium text-gray-500">Load Title</h3>
            <p className="text-gray-900">{load.title}</p>
          </div>
          
          <div>
            <h3 className="text-sm font-medium text-gray-500">Shipper</h3>
            <p className="text-gray-900">{load.shipper?.company || 'Unknown'}</p>
          </div>
          
          <div>
            <h3 className="text-sm font-medium text-gray-500">Pickup</h3>
            <p className="text-gray-900">{load.pickupLocation.address}</p>
            <p className="text-gray-600 text-sm">{formatDateTime(load.pickupDate)}</p>
          </div>
          
          <div>
            <h3 className="text-sm font-medium text-gray-500">Delivery</h3>
            <p className="text-gray-900">{load.deliveryLocation.address}</p>
            <p className="text-gray-600 text-sm">{formatDateTime(load.deliveryDate)}</p>
          </div>
          
          <div>
            <h3 className="text-sm font-medium text-gray-500">Weight</h3>
            <p className="text-gray-900">{load.weight} kg</p>
          </div>
          
          <div>
            <h3 className="text-sm font-medium text-gray-500">Load Type</h3>
            <p className="text-gray-900">{load.loadType}</p>
          </div>
          
          <div>
            <h3 className="text-sm font-medium text-gray-500">Budget</h3>
            <p className="text-gray-900">${load.budget}</p>
          </div>
          
          <div>
            <h3 className="text-sm font-medium text-gray-500">Bidding Deadline</h3>
            <p className="text-gray-900">{formatDateTime(load.biddingDeadline)}</p>
          </div>
        </div>
      </div>
      
      <form onSubmit={onSubmit} className="space-y-6">
        <div>
          <label htmlFor="amount" className="block text-sm font-medium text-gray-700 mb-1">
            Bid Amount (USD)
          </label>
          <input
            type="number"
            id="amount"
            name="amount"
            value={amount}
            onChange={onChange}
            required
            min="1"
            max={load.budget}
            step="0.01"
            className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            placeholder="Enter your bid amount"
          />
          <p className="mt-1 text-sm text-gray-500">Maximum budget: ${load.budget}</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label htmlFor="proposedPickupDate" className="block text-sm font-medium text-gray-700 mb-1">
              Proposed Pickup Date (Optional)
            </label>
            <input
              type="datetime-local"
              id="proposedPickupDate"
              name="proposedPickupDate"
              value={proposedPickupDate}
              onChange={onChange}
              className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            />
            <p className="mt-1 text-sm text-gray-500">
              Original pickup: {formatDateTime(load.pickupDate)}
            </p>
          </div>
          
          <div>
            <label htmlFor="proposedDeliveryDate" className="block text-sm font-medium text-gray-700 mb-1">
              Proposed Delivery Date (Optional)
            </label>
            <input
              type="datetime-local"
              id="proposedDeliveryDate"
              name="proposedDeliveryDate"
              value={proposedDeliveryDate}
              onChange={onChange}
              className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            />
            <p className="mt-1 text-sm text-gray-500">
              Original delivery: {formatDateTime(load.deliveryDate)}
            </p>
          </div>
        </div>
        
        <div>
          <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-1">
            Notes (Optional)
          </label>
          <textarea
            id="notes"
            name="notes"
            value={notes}
            onChange={onChange}
            rows="4"
            className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            placeholder="Any additional information about your bid"
          ></textarea>
        </div>
        
        <div className="flex justify-end">
          <button
            type="button"
            onClick={() => router.back()}
            className="mr-2 px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Cancel
          </button>
          
          {existingBid && existingBid.status === 'pending' && (
            <button
              type="button"
              onClick={handleWithdrawBid}
              disabled={submitting}
              className="mr-2 px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50"
            >
              {submitting ? 'Processing...' : 'Withdraw Bid'}
            </button>
          )}
          
          <button
            type="submit"
            disabled={submitting}
            className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
          >
            {submitting ? 'Submitting...' : (existingBid ? 'Update Bid' : 'Submit Bid')}
          </button>
        </div>
      </form>
    </div>
  );
};

export default PlaceBid;

