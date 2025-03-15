
// components/layout/Footer.js
import React from 'react';
import Link from 'next/link';

const Footer = () => {
  return (
    <footer className="bg-gray-800 text-white py-8">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h3 className="text-xl font-bold mb-4">Trucking Platform</h3>
            <p className="text-gray-300">
              Connecting shippers and truckers for efficient load management.
            </p>
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/" className="text-gray-300 hover:text-white">
                  Home
                </Link>
              </li>
              <li>
                <Link href="/about" className="text-gray-300 hover:text-white">
                  About Us
                </Link>
              </li>
              <li>
                <Link href="/services" className="text-gray-300 hover:text-white">
                  Services
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-gray-300 hover:text-white">
                  Contact
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-4">For Shippers</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/shipper/register" className="text-gray-300 hover:text-white">
                  Register as Shipper
                </Link>
              </li>
              <li>
                <Link href="/shipper/post-load" className="text-gray-300 hover:text-white">
                  Post a Load
                </Link>
              </li>
              <li>
                <Link href="/how-it-works-shipper" className="text-gray-300 hover:text-white">
                  How It Works
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-4">For Truckers</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/trucker/register" className="text-gray-300 hover:text-white">
                  Register as Trucker
                </Link>
              </li>
              <li>
                <Link href="/trucker/find-loads" className="text-gray-300 hover:text-white">
                  Find Loads
                </Link>
              </li>
              <li>
                <Link href="/trucker/benefits" className="text-gray-300 hover:text-white">
                  Benefits
                </Link>
              </li>
            </ul>
          </div>
        </div>
        <div className="border-t border-gray-700 mt-8 pt-8 text-center text-gray-400">
          <p>&copy; {new Date().getFullYear()} Trucking Platform. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;