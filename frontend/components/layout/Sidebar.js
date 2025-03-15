
// components/layout/Sidebar.js
import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useAuth } from '../../context/auth/AuthContext';

const Sidebar = () => {
  const { user } = useAuth();
  const router = useRouter();

  // Determine active link
  const isActive = (path) => {
    return router.pathname === path || router.pathname.startsWith(path + '/');
  };

  // Render links based on user role
  const renderLinks = () => {
    if (!user) return null;

    if (user.role === 'shipper') {
      return (
        <ul>
          <li className="mb-2">
            <Link
              href="/dashboard/shipper"
              className={`block p-3 rounded ${
                isActive('/dashboard/shipper')
                  ? 'bg-blue-700 text-white'
                  : 'text-gray-300 hover:bg-blue-800 hover:text-white'
              }`}
            >
              Dashboard
            </Link>
          </li>
          <li className="mb-2">
            <Link
              href="/dashboard/shipper/profile"
              className={`block p-3 rounded ${
                isActive('/dashboard/shipper/profile')
                  ? 'bg-blue-700 text-white'
                  : 'text-gray-300 hover:bg-blue-800 hover:text-white'
              }`}
            >
              Profile
            </Link>
          </li>
          <li className="mb-2">
            <Link
              href="/dashboard/shipper/loads"
              className={`block p-3 rounded ${
                isActive('/dashboard/shipper/loads')
                  ? 'bg-blue-700 text-white'
                  : 'text-gray-300 hover:bg-blue-800 hover:text-white'
              }`}
            >
              My Loads
            </Link>
          </li>
          <li className="mb-2">
            <Link
              href="/dashboard/shipper/post-load"
              className={`block p-3 rounded ${
                isActive('/dashboard/shipper/post-load')
                  ? 'bg-blue-700 text-white'
                  : 'text-gray-300 hover:bg-blue-800 hover:text-white'
              }`}
            >
              Post a Load
            </Link>
          </li>
          <li className="mb-2">
            <Link
              href="/dashboard/shipper/tracking"
              className={`block p-3 rounded ${
                isActive('/dashboard/shipper/tracking')
                  ? 'bg-blue-700 text-white'
                  : 'text-gray-300 hover:bg-blue-800 hover:text-white'
              }`}
            >
              Load Tracking
            </Link>
          </li>
          <li className="mb-2">
            <Link
              href="/dashboard/shipper/financial"
              className={`block p-3 rounded ${
                isActive('/dashboard/shipper/financial')
                  ? 'bg-blue-700 text-white'
                  : 'text-gray-300 hover:bg-blue-800 hover:text-white'
              }`}
            >
              Financial
            </Link>
          </li>
        </ul>
      );
    } else if (user.role === 'trucker') {
      return (
        <ul>
          <li className="mb-2">
            <Link
              href="/dashboard/trucker"
              className={`block p-3 rounded ${
                isActive('/dashboard/trucker')
                  ? 'bg-blue-700 text-white'
                  : 'text-gray-300 hover:bg-blue-800 hover:text-white'
              }`}
            >
              Dashboard
            </Link>
          </li>
          <li className="mb-2">
            <Link
              href="/dashboard/trucker/profile"
              className={`block p-3 rounded ${
                isActive('/dashboard/trucker/profile')
                  ? 'bg-blue-700 text-white'
                  : 'text-gray-300 hover:bg-blue-800 hover:text-white'
              }`}
            >
              Profile
            </Link>
          </li>
          <li className="mb-2">
            <Link
              href="/dashboard/trucker/loads"
              className={`block p-3 rounded ${
                isActive('/dashboard/trucker/loads')
                  ? 'bg-blue-700 text-white'
                  : 'text-gray-300 hover:bg-blue-800 hover:text-white'
              }`}
            >
              Find Loads
            </Link>
          </li>
          <li className="mb-2">
            <Link
              href="/dashboard/trucker/my-loads"
              className={`block p-3 rounded ${
                isActive('/dashboard/trucker/my-loads')
                  ? 'bg-blue-700 text-white'
                  : 'text-gray-300 hover:bg-blue-800 hover:text-white'
              }`}
            >
              My Loads
            </Link>
          </li>
          <li className="mb-2">
            <Link
              href="/dashboard/trucker/bids"
              className={`block p-3 rounded ${
                isActive('/dashboard/trucker/bids')
                  ? 'bg-blue-700 text-white'
                  : 'text-gray-300 hover:bg-blue-800 hover:text-white'
              }`}
            >
              My Bids
            </Link>
          </li>
          <li className="mb-2">
            <Link
              href="/dashboard/trucker/tracking"
              className={`block p-3 rounded ${
                isActive('/dashboard/trucker/tracking')
                  ? 'bg-blue-700 text-white'
                  : 'text-gray-300 hover:bg-blue-800 hover:text-white'
              }`}
            >
              Tracking
            </Link>
          </li>
          <li className="mb-2">
            <Link
              href="/dashboard/trucker/financial"
              className={`block p-3 rounded ${
                isActive('/dashboard/trucker/financial')
                  ? 'bg-blue-700 text-white'
                  : 'text-gray-300 hover:bg-blue-800 hover:text-white'
              }`}
            >
              Financial
            </Link>
          </li>
          <li className="mb-2">
            <Link
              href="/dashboard/trucker/benefits"
              className={`block p-3 rounded ${
                isActive('/dashboard/trucker/benefits')
                  ? 'bg-blue-700 text-white'
                  : 'text-gray-300 hover:bg-blue-800 hover:text-white'
              }`}
            >
              Benefits
            </Link>
          </li>
        </ul>
      );
    } else if (user.role === 'admin') {
      return (
        <ul>
          <li className="mb-2">
            <Link
              href="/dashboard/admin"
              className={`block p-3 rounded ${
                isActive('/dashboard/admin')
                  ? 'bg-blue-700 text-white'
                  : 'text-gray-300 hover:bg-blue-800 hover:text-white'
              }`}
            >
              Dashboard
            </Link>
          </li>
          <li className="mb-2">
            <Link
              href="/dashboard/admin/users"
              className={`block p-3 rounded ${
                isActive('/dashboard/admin/users')
                  ? 'bg-blue-700 text-white'
                  : 'text-gray-300 hover:bg-blue-800 hover:text-white'
              }`}
            >
              Users
            </Link>
          </li>
          <li className="mb-2">
            <Link
              href="/dashboard/admin/shippers"
              className={`block p-3 rounded ${
                isActive('/dashboard/admin/shippers')
                  ? 'bg-blue-700 text-white'
                  : 'text-gray-300 hover:bg-blue-800 hover:text-white'
              }`}
            >
              Shippers
            </Link>
          </li>
          <li className="mb-2">
            <Link
              href="/dashboard/admin/truckers"
              className={`block p-3 rounded ${
                isActive('/dashboard/admin/truckers')
                  ? 'bg-blue-700 text-white'
                  : 'text-gray-300 hover:bg-blue-800 hover:text-white'
              }`}
            >
              Truckers
            </Link>
          </li>
          <li className="mb-2">
            <Link
              href="/dashboard/admin/loads"
              className={`block p-3 rounded ${
                isActive('/dashboard/admin/loads')
                  ? 'bg-blue-700 text-white'
                  : 'text-gray-300 hover:bg-blue-800 hover:text-white'
              }`}
            >
              Loads
            </Link>
          </li>
          <li className="mb-2">
            <Link
              href="/dashboard/admin/verifications"
              className={`block p-3 rounded ${
                isActive('/dashboard/admin/verifications')
                  ? 'bg-blue-700 text-white'
                  : 'text-gray-300 hover:bg-blue-800 hover:text-white'
              }`}
            >
              Verifications
            </Link>
          </li>
          <li className="mb-2">
            <Link
              href="/dashboard/admin/financial"
              className={`block p-3 rounded ${
                isActive('/dashboard/admin/financial')
                  ? 'bg-blue-700 text-white'
                  : 'text-gray-300 hover:bg-blue-800 hover:text-white'
              }`}
            >
              Financial
            </Link>
          </li>
          <li className="mb-2">
            <Link
              href="/dashboard/admin/benefits"
              className={`block p-3 rounded ${
                isActive('/dashboard/admin/benefits')
                  ? 'bg-blue-700 text-white'
                  : 'text-gray-300 hover:bg-blue-800 hover:text-white'
              }`}
            >
              Benefits
            </Link>
          </li>
          <li className="mb-2">
            <Link
              href="/dashboard/admin/settings"
              className={`block p-3 rounded ${
                isActive('/dashboard/admin/settings')
                  ? 'bg-blue-700 text-white'
                  : 'text-gray-300 hover:bg-blue-800 hover:text-white'
              }`}
            >
              Settings
            </Link>
          </li>
        </ul>
      );
    }

    return null;
  };

  return (
    <div className="bg-blue-900 text-white h-full min-h-screen w-64 px-4 py-6">
      <div className="mb-8">
        <h2 className="text-2xl font-bold mb-2">Dashboard</h2>
        <p className="text-sm text-gray-300">
          {user?.role === 'shipper'
            ? 'Shipper Portal'
            : user?.role === 'trucker'
            ? 'Trucker Portal'
            : 'Admin Portal'}
        </p>
      </div>
      <div className="mb-6">
        <div className="py-2 px-4 bg-blue-800 rounded-lg mb-4">
          <p className="text-sm font-medium">Logged in as:</p>
          <p className="font-bold">{user?.name}</p>
          <p className="text-xs text-gray-300">{user?.email}</p>
        </div>
      </div>
      <nav>{renderLinks()}</nav>
    </div>
  );
};

export default Sidebar;