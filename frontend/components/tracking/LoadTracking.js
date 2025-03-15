
// components/tracking/LoadTracking.js
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAlert } from '../../context/alert/AlertContext';
import { useAuth } from '../../context/auth/AuthContext';
import axios from 'axios';
import TrackingTimeline from './TrackingTimeline';
import TrackingMap from './TrackingMap';
import TrackerUpdateForm from './TrackerUpdateForm';
import { format } from 'date-fns';

const LoadTracking = ({ loadId }) => {
  const { user } = useAuth();
  const { setAlert } = useAlert();
  const router = useRouter();

  const [load, setLoad] = useState(null);
  const [trackingUpdates, setTrackingUpdates] = useState([]);
  const [currentLocation, setCurrentLocation] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (loadId) {
      fetchTrackingDetails();
    }
  }, [loadId]);

  const fetchTrackingDetails = async () => {
    try {
      // Get load details
      const loadRes = await axios.get(`/api/v1/loads/${loadId}`);
      setLoad(loadRes.data.data);

      // Get tracking updates
      const trackingRes = await axios.get(`/api/v1/tracking/load/${loadId}`);
      setTrackingUpdates(trackingRes.data.data);

      // Get latest tracking update for current location
      if (trackingRes.data.data.length > 0) {
        const latestUpdate = trackingRes.data.data.sort(
          (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
        )[0];
        
        if (latestUpdate.location) {
          setCurrentLocation(latestUpdate.location);
        }
      }

      setLoading(false);
    } catch (err) {
      setAlert('Failed to fetch tracking details', 'danger');
      setLoading(false);
    }
  };

  // Format dates for display
  const formatDateTime = (dateString) => {
    if (!dateString) return 'N/A';
    return format(new Date(dateString), 'MMM d, yyyy h:mm a');
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

  // Check if the load is actively being tracked
  const isActiveLoad = ['assigned', 'in_transit', 'delivered'].includes(load.status);

  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">{load.title}</h1>
          <p className="text-gray-600">Tracking ID: {load._id}</p>
        </div>
        <button
          onClick={() => router.back()}
          className="px-4 py-2 border border-gray-300 rounded text-gray-700 hover:bg-gray-50"
        >
          Back
        </button>
      </div>

      {!isActiveLoad ? (
        <div className="text-center py-8 bg-gray-50 rounded-lg">
          <p className="text-gray-600">
            This load is not currently being tracked. Tracking is available once a load is assigned to a trucker.
          </p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
            <div className="lg:col-span-2">
              <div className="bg-gray-50 p-4 rounded-lg">
                <h2 className="text-lg font-semibold text-gray-800 mb-3">Tracking Timeline</h2>
                
                {trackingUpdates.length > 0 ? (
                  <TrackingTimeline updates={trackingUpdates} />
                ) : (
                  <p className="text-gray-600">No tracking updates available yet.</p>
                )}
              </div>
            </div>
            
            <div>
              <div className="bg-gray-50 p-4 rounded-lg mb-4">
                <h2 className="text-lg font-semibold text-gray-800 mb-3">Shipment Details</h2>
                
                <div className="space-y-3">
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Status</h3>
                    <p className="text-gray-900">{load.status.replace('_', ' ').replace(/\b\w/g, (l) => l.toUpperCase())}</p>
                  </div>
                  
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Pickup</h3>
                    <p className="text-gray-900">{load.pickupLocation.address}</p>
                    <p className="text-sm text-gray-500">{formatDateTime(load.pickupDate)}</p>
                  </div>
                  
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Delivery</h3>
                    <p className="text-gray-900">{load.deliveryLocation.address}</p>
                    <p className="text-sm text-gray-500">{formatDateTime(load.deliveryDate)}</p>
                  </div>
                  
                  {load.assignedTrucker && (
                    <div>
                      <h3 className="text-sm font-medium text-gray-500">Assigned Trucker</h3>
                      <p className="text-gray-900">{load.assignedTrucker.user?.name || 'Trucker'}</p>
                    </div>
                  )}
                </div>
              </div>
              
              {user.role === 'trucker' && load.status === 'in_transit' && (
                <div className="bg-gray-50 p-4 rounded-lg">
                  <TrackerUpdateForm 
                    loadId={loadId} 
                    onUpdateSubmitted={fetchTrackingDetails} 
                  />
                </div>
              )}
            </div>
          </div>
          
          {/* Map */}
          {load.pickupLocation.coordinates && load.deliveryLocation.coordinates && (
            <div className="bg-gray-50 p-4 rounded-lg">
              <h2 className="text-lg font-semibold text-gray-800 mb-3">Tracking Map</h2>
              
              <TrackingMap 
                currentLocation={currentLocation}
                pickupLocation={load.pickupLocation}
                deliveryLocation={load.deliveryLocation}
              />
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default LoadTracking;