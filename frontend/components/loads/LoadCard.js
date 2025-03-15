// components/loads/LoadCard.js
import { useState } from 'react';
import { useRouter } from 'next/router';
import { formatDistance, format } from 'date-fns';

const LoadCard = ({ load, userRole = 'shipper' }) => {
  const router = useRouter();
  const [expanded, setExpanded] = useState(false);

  const toggleExpand = () => {
    setExpanded(!expanded);
  };

  // Format dates for display
  const formatDateTime = dateString => {
    if (!dateString) return 'N/A';
    return format(new Date(dateString), 'MMM d, yyyy h:mm a');
  };

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

  // Format status text
  const formatStatus = status => {
    return status.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  // View load details
  const viewLoadDetails = () => {
    router.push(`/dashboard/${userRole}/loads/${load._id}`);
  };

  return (
    <div className="border rounded-lg overflow-hidden hover:shadow-md transition-shadow duration-200">
      <div 
        className="px-4 py-3 bg-gray-50 flex justify-between items-center cursor-pointer"
        onClick={toggleExpand}
      >
        <div className="flex items-center space-x-2">
          <span className={`px-2 py-1 rounded-full text-xs ${getStatusBadge(load.status)}`}>
            {formatStatus(load.status)}
          </span>
          <h3 className="text-lg font-medium text-gray-900">{load.title}</h3>
        </div>
        <div className="flex items-center">
          {load.biddingDeadline && load.status === 'open' && (
            <span className="text-sm text-gray-500 mr-3">
              Bidding ends: {formatDistance(new Date(load.biddingDeadline), new Date(), { addSuffix: true })}
            </span>
          )}
          <button 
            className="p-1 rounded-full hover:bg-gray-200"
            onClick={e => {
              e.stopPropagation();
              toggleExpand();
            }}
          >
            <svg 
              className={`h-5 w-5 transform transition-transform ${expanded ? 'rotate-180' : ''}`} 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
        </div>
      </div>

      {expanded && (
        <div className="p-4 border-t">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h4 className="text-sm font-medium text-gray-500">Pickup</h4>
              <p className="text-gray-900">{load.pickupLocation?.address}</p>
              <p className="text-gray-600 text-sm">{formatDateTime(load.pickupDate)}</p>
            </div>

            <div>
              <h4 className="text-sm font-medium text-gray-500">Delivery</h4>
              <p className="text-gray-900">{load.deliveryLocation?.address}</p>
              <p className="text-gray-600 text-sm">{formatDateTime(load.deliveryDate)}</p>
            </div>

            <div>
              <h4 className="text-sm font-medium text-gray-500">Load Type</h4>
              <p className="text-gray-900">{load.loadType}</p>
            </div>

            <div>
              <h4 className="text-sm font-medium text-gray-500">Weight</h4>
              <p className="text-gray-900">{load.weight} kg</p>
            </div>

            {load.dimensions && (
              <div>
                <h4 className="text-sm font-medium text-gray-500">Dimensions</h4>
                <p className="text-gray-900">
                  {load.dimensions.length ? `${load.dimensions.length} × ` : ''}
                  {load.dimensions.width ? `${load.dimensions.width} × ` : ''}
                  {load.dimensions.height ? `${load.dimensions.height} cm` : ''}
                </p>
              </div>
            )}

            <div>
              <h4 className="text-sm font-medium text-gray-500">Budget</h4>
              <p className="text-gray-900">${load.budget}</p>
            </div>
          </div>

          <div className="mt-4">
            <h4 className="text-sm font-medium text-gray-500">Description</h4>
            <p className="text-gray-900 mt-1">{load.description}</p>
          </div>

          {load.specialRequirements && load.specialRequirements.length > 0 && (
            <div className="mt-4">
              <h4 className="text-sm font-medium text-gray-500">Special Requirements</h4>
              <div className="flex flex-wrap gap-2 mt-1">
                {load.specialRequirements.map((req, index) => (
                  <span 
                    key={index} 
                    className="px-2 py-1 bg-gray-100 text-gray-800 text-xs rounded-full"
                  >
                    {req}
                  </span>
                ))}
              </div>
            </div>
          )}

          <div className="mt-4 flex justify-end">
            {userRole === 'shipper' && load.status === 'open' && (
              <button
                onClick={() => router.push(`/dashboard/shipper/loads/${load._id}/bids`)}
                className="mr-2 px-4 py-2 text-sm text-blue-600 hover:text-blue-800"
              >
                View Bids
              </button>
            )}

            {userRole === 'trucker' && load.status === 'open' && (
              <button
                onClick={() => router.push(`/dashboard/trucker/loads/${load._id}/bid`)}
                className="mr-2 px-4 py-2 text-sm text-blue-600 hover:text-blue-800"
              >
                Place Bid
              </button>
            )}

            <button
              onClick={viewLoadDetails}
              className="px-4 py-2 text-sm text-white bg-blue-600 rounded hover:bg-blue-700"
            >
              View Details
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default LoadCard;
