// pages/dashboard/trucker/profile/index.js
import { useState } from 'react';
import { useRouter } from 'next/router';
import Dashboard from '../../../../components/layout/Dashboard';
import PrivateRoute from '../../../../components/routing/PrivateRoute';
import api from '../../../../utils/api';
import { useAlert } from '../../../../context/alert/AlertContext';

const TruckerProfilePage = () => {
  const router = useRouter();
  const { setAlert } = useAlert();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    company: '',
    address: {
      street: '',
      city: '',
      state: '',
      zipCode: '',
      country: ''
    },
    drivingLicense: {
      number: '',
      issueDate: '',
      expiryDate: '',
      state: ''
    },
    truck: {
      registrationNumber: '',
      type: '',
      capacity: '',
      manufactureYear: ''
    }
  });

  const { company, address, drivingLicense, truck } = formData;

  const onChange = e => {
    if (e.target.name.includes('.')) {
      // Handle nested objects
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
      await api.post('/truckers', formData);
      setAlert('Trucker profile created successfully', 'success');
      router.push('/dashboard/trucker');
    } catch (err) {
      console.error("Profile creation error:", err.response ? err.response.data : err.message);
      setAlert(err.response?.data?.error || 'Failed to create profile', 'danger');
      setLoading(false);
    }
  };

  return (
    <PrivateRoute>
      <Dashboard>
        <div className="container mx-auto px-4 py-6">
          <div className="bg-white p-6 rounded-lg shadow mb-6">
            <h1 className="text-2xl font-bold text-gray-800 mb-4">Complete Your Trucker Profile</h1>
            <p className="text-gray-600 mb-6">
              You need to complete your profile before you can bid on loads or access other trucker features.
            </p>

            <form onSubmit={onSubmit} className="space-y-6">
              {/* Company Information */}
              <div>
                <label htmlFor="company" className="block text-sm font-medium text-gray-700 mb-1">
                  Company Name (Optional)
                </label>
                <input
                  type="text"
                  id="company"
                  name="company"
                  value={company}
                  onChange={onChange}
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="Your company name (if applicable)"
                />
              </div>

              {/* Address Section */}
              <div>
                <h3 className="text-lg font-medium text-gray-700 mb-2">Address</h3>
                <div className="space-y-2">
                  <input
                    type="text"
                    name="address.street"
                    value={address.street}
                    onChange={onChange}
                    placeholder="Street"
                    className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  />
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="text"
                      name="address.city"
                      value={address.city}
                      onChange={onChange}
                      placeholder="City"
                      className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    />
                    <input
                      type="text"
                      name="address.state"
                      value={address.state}
                      onChange={onChange}
                      placeholder="State"
                      className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="text"
                      name="address.zipCode"
                      value={address.zipCode}
                      onChange={onChange}
                      placeholder="Zip Code"
                      className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    />
                    <input
                      type="text"
                      name="address.country"
                      value={address.country}
                      onChange={onChange}
                      placeholder="Country"
                      className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    />
                  </div>
                </div>
              </div>

              {/* Driving License Section */}
              <div>
                <h3 className="text-lg font-medium text-gray-700 mb-2">Driving License</h3>
                <div className="space-y-2">
                  <input
                    type="text"
                    name="drivingLicense.number"
                    value={drivingLicense.number}
                    onChange={onChange}
                    required
                    placeholder="License Number"
                    className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  />
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Issue Date
                      </label>
                      <input
                        type="date"
                        name="drivingLicense.issueDate"
                        value={drivingLicense.issueDate}
                        onChange={onChange}
                        required
                        className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Expiry Date
                      </label>
                      <input
                        type="date"
                        name="drivingLicense.expiryDate"
                        value={drivingLicense.expiryDate}
                        onChange={onChange}
                        required
                        className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      />
                    </div>
                  </div>
                  <input
                    type="text"
                    name="drivingLicense.state"
                    value={drivingLicense.state}
                    onChange={onChange}
                    placeholder="Issuing State"
                    className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  />
                </div>
              </div>

              {/* Truck Information */}
              <div>
                <h3 className="text-lg font-medium text-gray-700 mb-2">Truck Information</h3>
                <div className="space-y-2">
                  <input
                    type="text"
                    name="truck.registrationNumber"
                    value={truck.registrationNumber}
                    onChange={onChange}
                    required
                    placeholder="Registration Number"
                    className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  />
                  <div className="grid grid-cols-2 gap-2">
                    <select
                      name="truck.type"
                      value={truck.type}
                      onChange={onChange}
                      required
                      className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    >
                      <option value="">Select Truck Type</option>
                      <option value="flatbed">Flatbed</option>
                      <option value="refrigerated">Refrigerated</option>
                      <option value="tanker">Tanker</option>
                      <option value="semi">Semi-Trailer</option>
                      <option value="box">Box Truck</option>
                      <option value="container">Container Truck</option>
                    </select>
                    <input
                      type="number"
                      name="truck.capacity"
                      value={truck.capacity}
                      onChange={onChange}
                      required
                      placeholder="Capacity (kg)"
                      className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    />
                  </div>
                  <input
                    type="number"
                    name="truck.manufactureYear"
                    value={truck.manufactureYear}
                    onChange={onChange}
                    required
                    placeholder="Manufacture Year"
                    min="1990"
                    max="2024"
                    className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  />
                </div>
              </div>

              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={loading}
                  className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                >
                  {loading ? 'Creating Profile...' : 'Create Profile'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </Dashboard>
    </PrivateRoute>
  );
};

export default TruckerProfilePage;