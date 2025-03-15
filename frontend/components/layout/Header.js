// components/layout/Header.js
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useAuth } from '../../context/auth/AuthContext';

const Header = () => {
  const { isAuthenticated, user, logout } = useAuth();
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  const onLogout = () => {
    logout();
    router.push('/login');
  };

  const authLinks = (
    <>
      <li className="px-3 py-2 md:px-4">
        <span className="text-gray-600">Welcome, {user?.name}</span>
      </li>
      <li className="px-3 py-2 md:px-4">
        <Link href="/dashboard" className="text-blue-800 hover:text-blue-600">
          Dashboard
        </Link>
      </li>
      <li className="px-3 py-2 md:px-4">
        <button
          onClick={onLogout}
          className="text-red-600 hover:text-red-800"
        >
          Logout
        </button>
      </li>
    </>
  );

  const guestLinks = (
    <>
      <li className="px-3 py-2 md:px-4">
        <Link href="/register" className="text-blue-800 hover:text-blue-600">
          Register
        </Link>
      </li>
      <li className="px-3 py-2 md:px-4">
        <Link href="/login" className="text-blue-800 hover:text-blue-600">
          Login
        </Link>
      </li>
    </>
  );

  return (
    <header className="bg-white shadow-md">
      <div className="container mx-auto px-4 py-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <Link href="/" className="text-2xl font-bold text-blue-900">
              Trucking Platform
            </Link>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={toggleMenu}
              className="text-gray-500 hover:text-gray-600 focus:outline-none"
            >
              <svg
                className="h-6 w-6"
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                {isOpen ? (
                  <path d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:block">
            <ul className="flex items-center">
              <li className="px-4">
                <Link href="/loads" className="text-blue-800 hover:text-blue-600">
                  Loads
                </Link>
              </li>
              <li className="px-4">
                <Link href="/about" className="text-blue-800 hover:text-blue-600">
                  About
                </Link>
              </li>
              <li className="px-4">
                <Link href="/contact" className="text-blue-800 hover:text-blue-600">
                  Contact
                </Link>
              </li>
              {isAuthenticated ? authLinks : guestLinks}
            </ul>
          </nav>
        </div>

        {/* Mobile Navigation */}
        {isOpen && (
          <nav className="md:hidden mt-2 pt-2 border-t border-gray-200">
            <ul>
              <li className="py-2">
                <Link href="/loads" className="block text-blue-800 hover:text-blue-600">
                  Loads
                </Link>
              </li>
              <li className="py-2">
                <Link href="/about" className="block text-blue-800 hover:text-blue-600">
                  About
                </Link>
              </li>
              <li className="py-2">
                <Link href="/contact" className="block text-blue-800 hover:text-blue-600">
                  Contact
                </Link>
              </li>
              {isAuthenticated ? authLinks : guestLinks}
            </ul>
          </nav>
        )}
      </div>
    </header>
  );
};

export default Header;


