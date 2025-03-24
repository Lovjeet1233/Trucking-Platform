// pages/dashboard/trucker/benefits/index.js
import { useState, useEffect } from 'react';
import Dashboard from '../../../../components/layout/Dashboard';
import PrivateRoute from '../../../../components/routing/PrivateRoute';
import api from '../../../../utils/api';
import { useAlert } from '../../../../context/alert/AlertContext';

const TruckerBenefitsPage = () => {
  const { setAlert } = useAlert();
  const [benefits, setBenefits] = useState([]);
  const [myClaims, setMyClaims] = useState([]);
  const [loading, setLoading] = useState(true);
  const [claimLoading, setClaimLoading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch available benefits and claimed benefits
        const [benefitsRes, claimsRes] = await Promise.all([
          api.get('/benefits'),
          api.get('/benefits/claims/me')
        ]);
        
        setBenefits(benefitsRes.data.data);
        setMyClaims(claimsRes.data.data);
      } catch (err) {
        setAlert(err.response?.data?.error || 'Error fetching benefits data', 'danger');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleClaimBenefit = async (benefitId) => {
    setClaimLoading(true);
    try {
      await api.post(`/benefits/${benefitId}/claim`, {
        location: {
          address: 'Current Location' // In a real app, you'd get this from geolocation
        }
      });
      
      // Refetch claims to update the list
      const claimsRes = await api.get('/benefits/claims/me');
      setMyClaims(claimsRes.data.data);
      setAlert('Benefit claimed successfully', 'success');
    } catch (err) {
      setAlert(err.response?.data?.error || 'Failed to claim benefit', 'danger');
    } finally {
      setClaimLoading(false);
    }
  };

  const getClaimStatus = (benefitId) => {
    const claim = myClaims.find(claim => claim.benefit._id === benefitId);
    return claim ? claim.status : null;
  };

  if (loading) {
    return (
      <PrivateRoute>
        <Dashboard>
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-900"></div>
          </div>
        </Dashboard>
      </PrivateRoute>
    );
  }

  return (
    <PrivateRoute>
      <Dashboard>
        <div className="container mx-auto px-4 py-6">
          <h1 className="text-2xl font-bold text-gray-800 mb-6">Trucker Benefits Program</h1>
          
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">My Claimed Benefits</h2>
            {myClaims.length === 0 ? (
              <p className="text-gray-600">You haven't claimed any benefits yet.</p>
            ) : (
              <div className="bg-white shadow overflow-hidden rounded-lg">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Benefit</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Claimed Date</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {myClaims.map(claim => (
                      <tr key={claim._id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{claim.benefit.name}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{claim.benefit.type}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(claim.claimDate).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                            ${claim.status === 'approved' ? 'bg-green-100 text-green-800' : 
                              claim.status === 'rejected' ? 'bg-red-100 text-red-800' : 
                              'bg-yellow-100 text-yellow-800'}`}>
                            {claim.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
          
          <div>
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Available Benefits</h2>
            {benefits.length === 0 ? (
              <p className="text-gray-600">No benefits are currently available.</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {benefits.map(benefit => {
                  const claimStatus = getClaimStatus(benefit._id);
                  
                  return (
                    <div key={benefit._id} className="bg-white rounded-lg shadow overflow-hidden">
                      <div className={`h-2 ${
                        benefit.category === 'fuel' ? 'bg-red-500' :
                        benefit.category === 'tire' ? 'bg-blue-500' :
                        benefit.category === 'service' ? 'bg-green-500' :
                        benefit.category === 'lodging' ? 'bg-purple-500' :
                        benefit.category === 'food' ? 'bg-yellow-500' :
                        'bg-gray-500'
                      }`}></div>
                      <div className="p-6">
                        <h3 className="text-lg font-bold text-gray-900 mb-2">{benefit.name}</h3>
                        <span className="inline-block bg-gray-100 rounded-full px-3 py-1 text-sm font-semibold text-gray-700 mb-3">
                          {benefit.category}
                        </span>
                        <p className="text-gray-700 mb-4">{benefit.description}</p>
                        
                        {benefit.discount && (
                          <p className="text-lg font-semibold text-green-600 mb-4">{benefit.discount}% Off</p>
                        )}
                        
                        {benefit.provider && (
                          <div className="mb-4 text-sm">
                            <p className="text-gray-600">Provider: {benefit.provider.name}</p>
                            {benefit.provider.website && (
                              <a 
                                href={benefit.provider.website} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="text-blue-600 hover:underline"
                              >
                                Visit Website
                              </a>
                            )}
                          </div>
                        )}
                        
                        {!claimStatus ? (
                          <button
                            onClick={() => handleClaimBenefit(benefit._id)}
                            disabled={claimLoading}
                            className="w-full px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
                          >
                            {claimLoading ? 'Processing...' : 'Claim Benefit'}
                          </button>
                        ) : (
                          <div className={`w-full px-4 py-2 text-center rounded text-white
                            ${claimStatus === 'approved' ? 'bg-green-600' : 
                              claimStatus === 'rejected' ? 'bg-red-600' : 
                              'bg-yellow-600'}`}>
                            {claimStatus === 'approved' ? 'Approved' : 
                              claimStatus === 'rejected' ? 'Rejected' : 
                              'Pending Approval'}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </Dashboard>
    </PrivateRoute>
  );
};

export default TruckerBenefitsPage;