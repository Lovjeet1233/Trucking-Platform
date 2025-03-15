
// components/loads/LoadStats.js
import React from 'react';

const LoadStats = ({ stats, loading }) => {
  const { total, open, assigned, inTransit, delivered, completed } = stats;

  if (loading) {
    return (
      <>
        <div className="p-4 rounded-lg shadow bg-white border-l-4 border-blue-500 animate-pulse">
          <div className="h-6 bg-slate-200 rounded mb-2"></div>
          <div className="h-8 bg-slate-200 rounded"></div>
        </div>
        <div className="p-4 rounded-lg shadow bg-white border-l-4 border-indigo-500 animate-pulse">
          <div className="h-6 bg-slate-200 rounded mb-2"></div>
          <div className="h-8 bg-slate-200 rounded"></div>
        </div>
        <div className="p-4 rounded-lg shadow bg-white border-l-4 border-green-500 animate-pulse">
          <div className="h-6 bg-slate-200 rounded mb-2"></div>
          <div className="h-8 bg-slate-200 rounded"></div>
        </div>
      </>
    );
  }

  return (
    <>
      <div className="p-4 rounded-lg shadow bg-white border-l-4 border-blue-500">
        <h3 className="text-lg font-medium text-gray-700">Total Loads</h3>
        <p className="mt-2 text-3xl font-semibold">{total}</p>
        <div className="mt-4 grid grid-cols-2 gap-2">
          <div className="text-center">
            <span className="text-xs text-gray-500">Open</span>
            <p className="font-medium">{open}</p>
          </div>
          <div className="text-center">
            <span className="text-xs text-gray-500">In Progress</span>
            <p className="font-medium">{assigned + inTransit}</p>
          </div>
        </div>
      </div>

      <div className="p-4 rounded-lg shadow bg-white border-l-4 border-indigo-500">
        <h3 className="text-lg font-medium text-gray-700">Active Transports</h3>
        <p className="mt-2 text-3xl font-semibold">{assigned + inTransit}</p>
        <div className="mt-4 grid grid-cols-2 gap-2">
          <div className="text-center">
            <span className="text-xs text-gray-500">Assigned</span>
            <p className="font-medium">{assigned}</p>
          </div>
          <div className="text-center">
            <span className="text-xs text-gray-500">In Transit</span>
            <p className="font-medium">{inTransit}</p>
          </div>
        </div>
      </div>

      <div className="p-4 rounded-lg shadow bg-white border-l-4 border-green-500">
        <h3 className="text-lg font-medium text-gray-700">Deliveries</h3>
        <p className="mt-2 text-3xl font-semibold">{delivered + completed}</p>
        <div className="mt-4 grid grid-cols-2 gap-2">
          <div className="text-center">
            <span className="text-xs text-gray-500">Delivered</span>
            <p className="font-medium">{delivered}</p>
          </div>
          <div className="text-center">
            <span className="text-xs text-gray-500">Completed</span>
            <p className="font-medium">{completed}</p>
          </div>
        </div>
      </div>
    </>
  );
};

export default LoadStats;