
// components/tracking/TrackerUpdateForm.js
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAlert } from '../../context/alert/AlertContext';
import axios from 'axios';

const TrackerUpdateForm = ({ loadId, onUpdateSubmitted }) => {
  const { setAlert } = useAlert();
  const router = useRouter();
  
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    status: 'in_transit',
    location: {
      address: ''
    },
    notes: '',
    estimatedArrival: ''
  });

  const { status, location, notes, estimatedArrival } = formData;
  
  // Get current location
  useEffect(() => {
    if (showForm && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          try {
            // Reverse geocode to get address
            const { latitude, longitude } = position.coords;
            const response = await axios.get(
              `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}`
            );
            
            if (response.data.status === 'OK' && response.data.results[0]) {
              setFormData({
                ...formData,
                location: {
                  address: response.data.results[0].formatted_address,
                  coordinates: [longitude, latitude]
                }
              });
            }
          } catch (err) {
            console.error('Error getting location address:', err);
          }
        },
        (error) => {
          console.error('Error getting location:', error);
        }
      );
    }
  }, [showForm]);

  const onChange = e => {
    if (e.target.name === 'location.address') {
      setFormData({
        ...formData,
        location: {
          ...formData.location,
          address: e.target.value
        }
      });
    } else {
      setFormData({ ...formData, [e.target.name]: e.target.value });
    }
  };

  const onSubmit = async e => {
    e.preventDefault();
    setLoading(true);

    try {
      const updateData = {
        load: loadId,
        ...formData
      };

      await axios.post('/api/v1/tracking', updateData);
      
      setAlert('Tracking update submitted successfully', 'success');
      setFormData({
        status: 'in_transit',
        location: {
          address: ''
        },
        notes: '',
        estimatedArrival: ''
      });
      setShowForm(false);
      
      if (onUpdateSubmitted) {
        onUpdateSubmitted();
      }
    } catch (err) {
      setAlert(err.response?.data?.error || 'Failed to submit tracking update', 'danger');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mt-6">
      {!showForm ? (
        <button
          onClick={() => setShowForm(true)}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Add Tracking Update
        </button>
      ) : (
        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Add Tracking Update</h3>
          
          <form onSubmit={onSubmit} className="space-y-4">
            <div>
              <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">
                Status
              </label>
              <select
                id="status"
                name="status"
                value={status}
                onChange={onChange}
                required
                className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              >
                <option value="in_transit">In Transit</option>
                <option value="delayed">Delayed</option>
                <option value="issue_reported">Issue Reported</option>
                <option value="picked_up">Picked Up</option>
                <option value="delivered">Delivered</option>
              </select>
            </div>
            
            <div>
              <label htmlFor="location.address" className="block text-sm font-medium text-gray-700 mb-1">
                Current Location
              </label>
              <input
                type="text"
                id="location.address"
                name="location.address"
                value={location.address}
                onChange={onChange}
                required
                className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                placeholder="Current address"
              />
            </div>
            
            <div>
              <label htmlFor="estimatedArrival" className="block text-sm font-medium text-gray-700 mb-1">
                Estimated Arrival (Optional)
              </label>
              <input
                type="datetime-local"
                id="estimatedArrival"
                name="estimatedArrival"
                value={estimatedArrival}
                onChange={onChange}
                className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              />
            </div>
            
            <div>
              <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-1">
                Notes
              </label>
              <textarea
                id="notes"
                name="notes"
                value={notes}
                onChange={onChange}
                rows="3"
                className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                placeholder="Additional details about the current status"
              ></textarea>
            </div>
            
            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="mr-3 px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
              >
                {loading ? 'Submitting...' : 'Submit Update'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default TrackerUpdateForm;