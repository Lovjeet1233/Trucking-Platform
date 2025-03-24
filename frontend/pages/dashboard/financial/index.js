// pages/dashboard/financial/index.js
import { useState, useEffect } from 'react';
import Dashboard from '../../../components/layout/Dashboard';
import PrivateRoute from '../../../components/routing/PrivateRoute';
import api from '../../../utils/api';
import { useAlert } from '../../../context/alert/AlertContext';
import { format } from 'date-fns';
import { useAuth } from '../../../context/auth/AuthContext';

const FinancialPage = () => {
  const { setAlert } = useAlert();
  const { user } = useAuth();
  const [transactions, setTransactions] = useState([]);
  const [summary, setSummary] = useState({
    totalEarnings: 0,
    totalExpenses: 0,
    balance: 0,
    pendingAmount: 0
  });
  const [filters, setFilters] = useState({
    type: 'all',
    status: 'all',
    dateRange: 'all'
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        const res = await api.get('/financial/user/me');
        const transactionData = res.data.data;
        setTransactions(transactionData);
        calculateSummary(transactionData);
      } catch (err) {
        setAlert(err.response?.data?.error || 'Error fetching financial data', 'danger');
      } finally {
        setLoading(false);
      }
    };

    fetchTransactions();
  }, []);

  const calculateSummary = (transactionData) => {
    const summary = transactionData.reduce(
      (acc, transaction) => {
        const amount = transaction.amount || 0;
        
        // For shipper: payments are expenses, payouts are income (refunds)
        // For trucker: payouts are income, payments are expenses (fees)
        if (user.role === 'shipper') {
          if (transaction.type === 'payment') {
            acc.totalExpenses += amount;
          } else if (transaction.type === 'refund') {
            acc.totalEarnings += amount;
          }
        } else if (user.role === 'trucker') {
          if (transaction.type === 'payout') {
            acc.totalEarnings += amount;
          } else if (transaction.type === 'fee') {
            acc.totalExpenses += amount;
          }
        }

        // Calculate pending amount
        if (transaction.status === 'pending') {
          if (['payment', 'payout'].includes(transaction.type)) {
            acc.pendingAmount += amount;
          }
        }

        return acc;
      },
      { totalEarnings: 0, totalExpenses: 0, pendingAmount: 0 }
    );

    // Calculate balance
    summary.balance = summary.totalEarnings - summary.totalExpenses;

    setSummary(summary);
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters({
      ...filters,
      [name]: value
    });
  };

  const filteredTransactions = transactions.filter(transaction => {
    // Filter by type
    if (filters.type !== 'all' && transaction.type !== filters.type) {
      return false;
    }

    // Filter by status
    if (filters.status !== 'all' && transaction.status !== filters.status) {
      return false;
    }

    // Filter by date range
    if (filters.dateRange !== 'all') {
      const transactionDate = new Date(transaction.createdAt);
      const today = new Date();
      
      if (filters.dateRange === 'last7days') {
        const lastWeek = new Date(today.setDate(today.getDate() - 7));
        if (transactionDate < lastWeek) {
          return false;
        }
      } else if (filters.dateRange === 'last30days') {
        const lastMonth = new Date(today.setDate(today.getDate() - 30));
        if (transactionDate < lastMonth) {
          return false;
        }
      } else if (filters.dateRange === 'last90days') {
        const lastQuarter = new Date(today.setDate(today.getDate() - 90));
        if (transactionDate < lastQuarter) {
          return false;
        }
      }
    }

    return true;
  });

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const formatDate = (dateString) => {
    return format(new Date(dateString), 'MMM d, yyyy');
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      case 'cancelled':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getTransactionTypeColor = (type) => {
    switch (type) {
      case 'payment':
        return 'text-red-600';
      case 'payout':
        return 'text-green-600';
      case 'refund':
        return 'text-blue-600';
      case 'fee':
        return 'text-orange-600';
      case 'benefit':
        return 'text-purple-600';
      default:
        return 'text-gray-600';
    }
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
          <h1 className="text-2xl font-bold text-gray-800 mb-6">Financial Management</h1>
          
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0 bg-green-100 rounded-md p-3">
                    <svg className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">Total Earnings</dt>
                      <dd>
                        <div className="text-lg font-medium text-gray-900">{formatCurrency(summary.totalEarnings)}</div>
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0 bg-red-100 rounded-md p-3">
                    <svg className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">Total Expenses</dt>
                      <dd>
                        <div className="text-lg font-medium text-gray-900">{formatCurrency(summary.totalExpenses)}</div>
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0 bg-blue-100 rounded-md p-3">
                    <svg className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" />
                    </svg>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">Balance</dt>
                      <dd>
                        <div className={`text-lg font-medium ${summary.balance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {formatCurrency(summary.balance)}
                        </div>
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0 bg-yellow-100 rounded-md p-3">
                    <svg className="h-6 w-6 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">Pending Amount</dt>
                      <dd>
                        <div className="text-lg font-medium text-gray-900">{formatCurrency(summary.pendingAmount)}</div>
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Filters */}
          <div className="bg-white rounded-lg shadow overflow-hidden mb-8">
            <div className="p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4">Filter Transactions</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label htmlFor="type" className="block text-sm font-medium text-gray-700 mb-1">
                    Transaction Type
                  </label>
                  <select
                    id="type"
                    name="type"
                    value={filters.type}
                    onChange={handleFilterChange}
                    className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                  >
                    <option value="all">All Types</option>
                    <option value="payment">Payment</option>
                    <option value="payout">Payout</option>
                    <option value="refund">Refund</option>
                    <option value="fee">Fee</option>
                    <option value="benefit">Benefit</option>
                  </select>
                </div>
                
                <div>
                  <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">
                    Status
                  </label>
                  <select
                    id="status"
                    name="status"
                    value={filters.status}
                    onChange={handleFilterChange}
                    className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                  >
                    <option value="all">All Statuses</option>
                    <option value="pending">Pending</option>
                    <option value="completed">Completed</option>
                    <option value="failed">Failed</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>
                
                <div>
                  <label htmlFor="dateRange" className="block text-sm font-medium text-gray-700 mb-1">
                    Date Range
                  </label>
                  <select
                    id="dateRange"
                    name="dateRange"
                    value={filters.dateRange}
                    onChange={handleFilterChange}
                    className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                  >
                    <option value="all">All Time</option>
                    <option value="last7days">Last 7 Days</option>
                    <option value="last30days">Last 30 Days</option>
                    <option value="last90days">Last 90 Days</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
          
          {/* Transactions List */}
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4">Transaction History</h2>
              
              {filteredTransactions.length === 0 ? (
                <p className="text-gray-600 text-center py-6">No transactions found.</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Date
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Description
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Type
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Status
                        </th>
                        <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Amount
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {filteredTransactions.map(transaction => (
                        <tr key={transaction._id}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {formatDate(transaction.createdAt)}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-900">
                            {transaction.description || 
                              (transaction.relatedLoad ? 
                                `Transaction for load: ${transaction.relatedLoad.title || transaction.relatedLoad}` : 
                                `${transaction.type.charAt(0).toUpperCase() + transaction.type.slice(1)}`
                              )
                            }
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm">
                            <span className={`font-medium ${getTransactionTypeColor(transaction.type)}`}>
                              {transaction.type.charAt(0).toUpperCase() + transaction.type.slice(1)}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm">
                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(transaction.status)}`}>
                              {transaction.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-right font-medium">
                            <span className={
                              transaction.type === 'payment' || transaction.type === 'fee' ? 
                                'text-red-600' : 
                                'text-green-600'
                            }>
                              {transaction.type === 'payment' || transaction.type === 'fee' ? 
                                '-' : 
                                '+'
                              }
                              {formatCurrency(transaction.amount)}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
          
          {/* Payment Methods - Future Enhancement */}
          <div className="mt-8 bg-white rounded-lg shadow overflow-hidden">
            <div className="p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4">Payment Methods</h2>
              <p className="text-gray-600 mb-4">Add and manage your payment methods for seamless transactions.</p>
              <button 
                className="px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                onClick={() => setAlert('Payment method management will be available soon!', 'info')}
              >
                Add Payment Method
              </button>
            </div>
          </div>
        </div>
      </Dashboard>
    </PrivateRoute>
  );
};

export default FinancialPage;