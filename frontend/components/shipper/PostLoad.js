
// components/shipper/PostLoad.js
import { useState } from 'react';
import { useRouter } from 'next/router';
import { useAlert } from '../../context/alert/AlertContext';
import axios from 'axios';
import api from '../../utils/api';
const PostLoad = () => {
  const { setAlert } = useAlert();
  const router = useRouter();
  
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    pickupLocation: {
      address: ''
    },
    deliveryLocation: {
      address: ''
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
    biddingDeadline: ''
  });

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

  const onSubmit = async e => {
    e.preventDefault();
    setLoading(true);

    try {
      // Format special requirements as array
      const specialReqArray = specialRequirements
        ? specialRequirements.split(',').map(req => req.trim())
        : [];

      const loadData = {
        ...formData,
        specialRequirements: specialReqArray
      };

      const res = await api.post('/loads', loadData);
      
      setAlert('Load posted successfully', 'success');
      router.push('/dashboard/shipper/loads');
    } catch (err) {
      console.error(err);
      setAlert(err.response?.data?.error || 'Failed to post load', 'danger');
      setLoading(false);
    }
  };

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