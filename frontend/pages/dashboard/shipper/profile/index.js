// pages/dashboard/shipper/profile/index.js
import { useState } from 'react';
import { useRouter } from 'next/router';
import Dashboard from '../../../../components/layout/Dashboard';
import PrivateRoute from '../../../../components/routing/PrivateRoute';
import api from '../../../../utils/api';
import { useAlert } from '../../../../context/alert/AlertContext';

const ShipperProfilePage = () => {
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
    taxId: '',
    businessType: 'company'
  });

  const { company, address, taxId, businessType } = formData;

  const onChange = e => {
    if (e.target.name.includes('.')) {
      // Handle nested objects (address)
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
      await api.post('/shippers', formData);
      setAlert('Profile created successfully', 'success');
      router.push('/dashboard/shipper');
    } catch (err) {
      setAlert(err.response?.data?.error || 'Failed to create profile', 'danger');
      setLoading(false);
    }
  };

  return (
    <PrivateRoute>
      <Dashboard>
        <div className="container mx-auto px-4 py-6">
          <div className="bg-white p-6 rounded-lg shadow mb-6">
            <h1 className="text-2xl font-bold text-gray-800 mb-4">Complete Your Shipper Profile</h1>
            <p className="text-gray-600 mb-6">
              You need to complete your profile before you can post loads or access other shipper features.
            </p>

            <form onSubmit={onSubmit} className="space-y-6">
              <div>
                <label htmlFor="company" className="block text-sm font-medium text-gray-700 mb-1">
                  Company Name
                </label>
                <input
                  type="text"
                  id="company"
                  name="company"
                  value={company}
                  onChange={onChange}
                  required
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="Your company name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
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

              <div>
                <label htmlFor="taxId" className="block text-sm font-medium text-gray-700 mb-1">
                  Tax ID
                </label>
                <input
                  type="text"
                  id="taxId"
                  name="taxId"
                  value={taxId}
                  onChange={onChange}
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="Your tax ID number"
                />
              </div>

              <div>
                <label htmlFor="businessType" className="block text-sm font-medium text-gray-700 mb-1">
                  Business Type
                </label>
                <select
                  id="businessType"
                  name="businessType"
                  value={businessType}
                  onChange={onChange}
                  required
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                >
                  <option value="company">Company</option>
                  <option value="individual">Individual</option>
                </select>
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

export default ShipperProfilePage;