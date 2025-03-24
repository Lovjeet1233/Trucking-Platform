// components/shipper/PostLoad.js
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAlert } from '../../context/alert/AlertContext';
import api from '../../utils/api';

const PostLoad = () => {
  const { setAlert } = useAlert();
  const router = useRouter();
  
  const [loading, setLoading] = useState(false);
  const [checkingProfile, setCheckingProfile] = useState(true);
  const [distance, setDistance] = useState(null);
  const [error, setError] = useState('');
  const [calculateLoading, setCalculateLoading] = useState(false);
  const [mapsLoaded, setMapsLoaded] = useState(false);
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    pickupLocation: {
      address: '',
      zipCode: ''
    },
    deliveryLocation: {
      address: '',
      zipCode: ''
    },
    pickupDate: '',
    deliveryDate: '',
    weight: '',
    dimensions: {
      length: '',
      width: '',
      height: ''
    },
    loadType: '',
    specialRequirements: '',
    budget: '',
    biddingDeadline: '',
    distance: {
      miles: '',
      kilometers: ''
    }
  });

  // Load Google Maps API script
  useEffect(() => {
    const checkShipperProfile = async () => {
      try {
        await api.get('/shippers/profile');
        setCheckingProfile(false);
      } catch (err) {
        if (err.response?.status === 404) {
          setAlert('You need to create a shipper profile first', 'danger');
          router.push('/dashboard/shipper/profile');
        } else {
          setAlert('Error checking shipper profile', 'danger');
        }
      }
    };

    checkShipperProfile();
    
    // Load Google Maps API script if it's not already loaded
    if (!window.google || !window.google.maps) {
      // Define the callback function
      window.initMap = () => {
        console.log("Google Maps API loaded successfully");
        setMapsLoaded(true);
      };
      
      const script = document.createElement('script');
      // Include your API key properly in the URL
      script.src = `https://maps.googleapis.com/maps/api/js?key=AIzaSyB41DRUbKWJHPxaFjMAwdrzWzbVKartNGg&callback=initMap&v=weekly`;
      script.async = true;
      script.defer = true;
      script.onerror = () => {
        console.error("Failed to load Google Maps API");
        setAlert('Failed to load mapping service. Distance calculation may not work properly.', 'warning');
      };
      document.head.appendChild(script);
    } else {
      setMapsLoaded(true);
    }
  }, []);

  const {
    title,
    description,
    pickupLocation,
    deliveryLocation,
    pickupDate,
    deliveryDate,
    weight,
    dimensions,
    loadType,
    specialRequirements,
    budget,
    biddingDeadline
  } = formData;

  const onChange = e => {
    if (e.target.name.includes('.')) {
      // Handle nested properties
      const [parent, child] = e.target.name.split('.');
      setFormData({
        ...formData,
        [parent]: {
          ...formData[parent],
          [child]: e.target.value
        }
      });
    } else {
      setFormData({ ...formData, [e.target.name]: e.target.value });
    }
  };

  // Replace the existing calculateDistance function with this improved version
// Improved distance calculation function to fix the "p is undefined" error
const calculateDistance = () => {
  // Reset states
  setDistance(null);
  setError('');
  setCalculateLoading(true);
  
  console.log("Starting distance calculation...");
  
  const pickupZip = pickupLocation.zipCode;
  const deliveryZip = deliveryLocation.zipCode;
  
  // Basic validation
  if (!pickupZip || !deliveryZip) {
    setError('Please enter both pickup and delivery zip codes');
    setCalculateLoading(false);
    return;
  }
  
  // Safety timeout to ensure loading state is reset
  const timeoutId = setTimeout(() => {
    console.log("Safety timeout triggered");
    setCalculateLoading(false);
  }, 15000);
  
  // Format addresses for better geocoding
  let origin = pickupLocation.address ? 
    `${pickupLocation.address}, ${pickupZip}` : pickupZip;
  
  let destination = deliveryLocation.address ? 
    `${deliveryLocation.address}, ${deliveryZip}` : deliveryZip;
  
  // Check if Maps API is properly loaded with required services
  const isGoogleMapsReady = () => {
    return window.google && 
           window.google.maps && 
           window.google.maps.DistanceMatrixService;
  };
  
  const calculateWithAPI = () => {
    try {
      console.log("Using Google Maps Distance Matrix API");
      console.log(`Calculating distance between: ${origin} and ${destination}`);
      
      // Create a new instance of the Distance Matrix service
      const service = new window.google.maps.DistanceMatrixService();
      
      service.getDistanceMatrix({
        origins: [origin],
        destinations: [destination],
        travelMode: window.google.maps.TravelMode.DRIVING,
        unitSystem: window.google.maps.UnitSystem.METRIC,
        avoidHighways: false,
        avoidTolls: false,
      }, handleDistanceResponse);
    } catch (error) {
      console.error("Error in distance calculation:", error);
      handleError(error.message);
    }
  };
  
  const handleDistanceResponse = (response, status) => {
    clearTimeout(timeoutId);
    
    if (status !== 'OK') {
      handleError(`Google Maps API returned status: ${status}`);
      return;
    }
    
    try {
      // Verify that we have a valid response
      if (!response || 
          !response.rows || 
          !response.rows[0] || 
          !response.rows[0].elements || 
          !response.rows[0].elements[0]) {
        handleError('Invalid response from Google Maps API');
        return;
      }
      
      const element = response.rows[0].elements[0];
      
      if (element.status !== 'OK') {
        handleError(`Could not determine distance: ${element.status}`);
        return;
      }
      
      // Process successful response
      const distanceInMeters = element.distance.value;
      const distanceText = element.distance.text;
      const durationText = element.duration.text;
      
      // Convert to kilometers and miles
      const distanceInKm = distanceInMeters / 1000;
      const distanceInMiles = distanceInKm * 0.621371;
      
      // Create result object
      const distanceResult = {
        miles: parseFloat(distanceInMiles.toFixed(2)),
        kilometers: parseFloat(distanceInKm.toFixed(2)),
        duration: durationText,
        distanceText: distanceText
      };
      
      // Update state
      setDistance(distanceResult);
      setFormData({
        ...formData,
        distance: distanceResult
      });
      
      setAlert(`Distance calculated: ${distanceText} - Driving time: ${durationText}`, 'success');
      setCalculateLoading(false);
    } catch (error) {
      console.error("Error processing distance response:", error);
      handleError("Error processing the distance calculation results");
    }
  };
  
  const handleError = (errorMessage) => {
    console.error(errorMessage);
    setError(`Distance calculation error: ${errorMessage}`);
    setCalculateLoading(false);
    clearTimeout(timeoutId);
  };
  
  // Use existing Google Maps API if available
  if (isGoogleMapsReady()) {
    calculateWithAPI();
  } else {
    // The Maps API might not be fully loaded or initialized
    console.log("Google Maps API not ready. Loading API...");
    
    // Clean up any existing script to avoid conflicts
    const existingScript = document.querySelector('script[src*="maps.googleapis.com"]');
    if (existingScript) {
      existingScript.remove();
    }
    
    // Define callback function to run when API loads
    window.initMap = function() {
      console.log("Google Maps API loaded successfully");
      if (isGoogleMapsReady()) {
        calculateWithAPI();
      } else {
        handleError("Failed to initialize Google Maps services");
      }
    };
    
    // Create and append script element
    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=AIzaSyBVmvkILV0qNAZA1gBUitabRogCKbr4ICI&callback=initMap`;
    script.async = true;
    script.defer = true;
    script.onerror = () => handleError("Failed to load Google Maps API");
    
    document.head.appendChild(script);
  }
};
  const onSubmit = async e => {
    e.preventDefault();
    setLoading(true);
  
    try {
      // Format special requirements as array
      const specialReqArray = specialRequirements
        ? specialRequirements.split(',').map(req => req.trim())
        : [];
  
      // Create load data with proper GeoJSON coordinates
      const loadData = {
        ...formData,
        specialRequirements: specialReqArray,
        pickupLocation: {
          address: pickupLocation.address,
          zipCode: pickupLocation.zipCode,
          coordinates: {
            type: "Point",
            coordinates: [0, 0] // Default coordinates - replace with actual if you have them
          }
        },
        deliveryLocation: {
          address: deliveryLocation.address,
          zipCode: deliveryLocation.zipCode,
          coordinates: {
            type: "Point",
            coordinates: [0, 0] // Default coordinates - replace with actual if you have them
          }
        }
      };
  
      // Send request
      const res = await api.post('/loads', loadData);
      
      setAlert('Load posted successfully', 'success');
      router.push('/dashboard/shipper/loads');
    } catch (err) {
      console.error(err);
      setAlert(err.response?.data?.error || 'Failed to post load', 'danger');
      setLoading(false);
    }
  };
  
  if (checkingProfile) {
    return <div className="flex justify-center items-center h-64">Loading...</div>;
  }

  return (
    <div className="container mx-auto">
      <div className="bg-white p-6 rounded-lg shadow mb-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-4">Post a New Load</h1>
        <p className="text-gray-600 mb-6">
          Fill in the details below to create a new load. Truckers will be able to bid on your job.
        </p>

        <form onSubmit={onSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Basic Information */}
            <div className="space-y-4">
              <div>
                <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                  Load Title
                </label>
                <input
                  type="text"
                  id="title"
                  name="title"
                  value={title}
                  onChange={onChange}
                  required
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="e.g. 20ft Container of Electronics"
                />
              </div>

              <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  id="description"
                  name="description"
                  value={description}
                  onChange={onChange}
                  required
                  rows="4"
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="Detailed description of the load"
                ></textarea>
              </div>

              <div>
                <label htmlFor="loadType" className="block text-sm font-medium text-gray-700 mb-1">
                  Load Type
                </label>
                <select
                  id="loadType"
                  name="loadType"
                  value={loadType}
                  onChange={onChange}
                  required
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                >
                  <option value="">Select Load Type</option>
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
            </div>

            {/* Dimensions and Weight */}
            <div className="space-y-4">
              <div>
                <label htmlFor="weight" className="block text-sm font-medium text-gray-700 mb-1">
                  Weight (in kg)
                </label>
                <input
                  type="number"
                  id="weight"
                  name="weight"
                  value={weight}
                  onChange={onChange}
                  required
                  min="1"
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="Total weight in kg"
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label htmlFor="dimensions.length" className="block text-sm font-medium text-gray-700 mb-1">
                    Length (cm)
                  </label>
                  <input
                    type="number"
                    id="dimensions.length"
                    name="dimensions.length"
                    value={dimensions.length}
                    onChange={onChange}
                    min="1"
                    className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    placeholder="Length"
                  />
                </div>
                <div>
                  <label htmlFor="dimensions.width" className="block text-sm font-medium text-gray-700 mb-1">
                    Width (cm)
                  </label>
                  <input
                    type="number"
                    id="dimensions.width"
                    name="dimensions.width"
                    value={dimensions.width}
                    onChange={onChange}
                    min="1"
                    className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    placeholder="Width"
                  />
                </div>
                <div>
                  <label htmlFor="dimensions.height" className="block text-sm font-medium text-gray-700 mb-1">
                    Height (cm)
                  </label>
                  <input
                    type="number"
                    id="dimensions.height"
                    name="dimensions.height"
                    value={dimensions.height}
                    onChange={onChange}
                    min="1"
                    className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    placeholder="Height"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="specialRequirements" className="block text-sm font-medium text-gray-700 mb-1">
                  Special Requirements
                </label>
                <input
                  type="text"
                  id="specialRequirements"
                  name="specialRequirements"
                  value={specialRequirements}
                  onChange={onChange}
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="e.g. Temperature controlled, Fragile, etc. (comma-separated)"
                />
              </div>
            </div>
          </div>

          {/* Locations and Dates */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <label htmlFor="pickupLocation.address" className="block text-sm font-medium text-gray-700 mb-1">
                  Pickup Location
                </label>
                <input
                  type="text"
                  id="pickupLocation.address"
                  name="pickupLocation.address"
                  value={pickupLocation.address}
                  onChange={onChange}
                  required
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="Full pickup address"
                />
              </div>
              
              <div>
                <label htmlFor="pickupLocation.zipCode" className="block text-sm font-medium text-gray-700 mb-1">
                  Pickup Zip Code
                </label>
                <input
                  type="text"
                  id="pickupLocation.zipCode"
                  name="pickupLocation.zipCode"
                  value={pickupLocation.zipCode}
                  onChange={onChange}
                  required
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="Zip code"
                />
              </div>
              
              <div>
                <label htmlFor="pickupDate" className="block text-sm font-medium text-gray-700 mb-1">
                  Pickup Date
                </label>
                <input
                  type="datetime-local"
                  id="pickupDate"
                  name="pickupDate"
                  value={pickupDate}
                  onChange={onChange}
                  required
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                />
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label htmlFor="deliveryLocation.address" className="block text-sm font-medium text-gray-700 mb-1">
                  Delivery Location
                </label>
                <input
                  type="text"
                  id="deliveryLocation.address"
                  name="deliveryLocation.address"
                  value={deliveryLocation.address}
                  onChange={onChange}
                  required
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="Full delivery address"
                />
              </div>
              
              <div>
                <label htmlFor="deliveryLocation.zipCode" className="block text-sm font-medium text-gray-700 mb-1">
                  Delivery Zip Code
                </label>
                <input
                  type="text"
                  id="deliveryLocation.zipCode"
                  name="deliveryLocation.zipCode"
                  value={deliveryLocation.zipCode}
                  onChange={onChange}
                  required
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="Zip code"
                />
              </div>

              <div>
                <label htmlFor="deliveryDate" className="block text-sm font-medium text-gray-700 mb-1">
                  Delivery Date
                </label>
                <input
                  type="datetime-local"
                  id="deliveryDate"
                  name="deliveryDate"
                  value={deliveryDate}
                  onChange={onChange}
                  required
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                />
              </div>
            </div>
          </div>

          {/* Distance Calculation */}
          <div className="bg-gray-50 p-4 rounded-md">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-700">Distance Calculation</h3>
              <button
                type="button"
                onClick={calculateDistance}
                disabled={calculateLoading || !mapsLoaded}
                className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
              >
                {calculateLoading ? 'Calculating...' : !mapsLoaded ? 'Loading Maps...' : 'Calculate Distance'}
              </button>
            </div>
            
            {error && (
              <div className="p-3 bg-red-100 border border-red-400 text-red-700 rounded-md">
                {error}
              </div>
            )}
            
            {distance && (
              <div className="p-4 bg-green-50 border border-green-200 rounded-md">
                <h3 className="font-medium text-green-800 mb-2">Distance Results</h3>
                <p className="text-green-700">
                  <span className="font-bold">{distance.distanceText || `${distance.kilometers} km`}</span>
                </p>
                <p className="text-green-700">
                  <span className="font-bold">{distance.miles}</span> miles
                </p>
                {distance.duration && (
                  <p className="text-green-700 mt-2">
                    <span className="font-medium">Estimated driving time:</span> {distance.duration}
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Budget and Bidding */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="budget" className="block text-sm font-medium text-gray-700 mb-1">
                Budget (USD)
              </label>
              <input
                type="number"
                id="budget"
                name="budget"
                value={budget}
                onChange={onChange}
                required
                min="1"
                className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                placeholder="Maximum budget for this load"
              />
            </div>

            <div>
              <label htmlFor="biddingDeadline" className="block text-sm font-medium text-gray-700 mb-1">
                Bidding Deadline
              </label>
              <input
                type="datetime-local"
                id="biddingDeadline"
                name="biddingDeadline"
                value={biddingDeadline}
                onChange={onChange}
                required
                className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              />
            </div>
          </div>

          <div className="flex justify-end">
            <button
              type="button"
              onClick={() => router.back()}
              className="mr-4 px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
            >
              {loading ? 'Posting...' : 'Post Load'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PostLoad;