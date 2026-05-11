import React, { useContext, useEffect, useState } from 'react';
import { AuthContext } from '../context/AuthContext';
import { PaymentContext } from '../context/PaymentContext';
import Navbar from '../components/Navbar';
import { 
  DollarSign, 
  CheckCircle2, 
  Clock, 
  AlertCircle
} from 'lucide-react';
import {
  EarningsSummaryCard,
  TransactionList,
  PaymentLoaderSkeleton
} from '../components/payments/PaymentComponents';
import CheckoutModal from '../components/payments/CheckoutModal';

/**
 * PaymentDashboard
 * Refactored to use reusable PaymentComponents (Prompt 7)
 */
const PaymentDashboard = () => {
  const { user } = useContext(AuthContext);
  const { 
    payments, 
    loading, 
    error, 
    fetchPayments, 
    reviewPayment, 
    releasePayment,
    actionLoading 
  } = useContext(PaymentContext);

  const [checkoutPayment, setCheckoutPayment] = useState(null);
  const role = user?.role;

  useEffect(() => {
    console.log('PaymentDashboard: fetching payments for role:', role);
    fetchPayments();
  }, [fetchPayments, role]);

  const handleReview = async (paymentId) => {
    try {
      await reviewPayment(paymentId);
    } catch (err) {
      console.error('Review error:', err);
      // notification handled by context
    }
  };

  const handleRelease = async (paymentId) => {
    try {
      await releasePayment(paymentId);
    } catch (err) {
      console.error('Release error:', err);
    }
  };

  // Summary stats calculations with defensive checks
  const safePayments = Array.isArray(payments) ? payments : [];
  const totalAmount = safePayments.reduce((sum, p) => sum + (Number(p.amount) || 0), 0);
  const paidAmount = safePayments.filter(p => p.status === 'paid').reduce((sum, p) => sum + (Number(p.amount) || 0), 0);
  const pendingAmount = Math.max(0, totalAmount - paidAmount);

  return (
    <div className="min-h-screen bg-[#F9FAFB] dark:bg-gray-950 transition-colors duration-300">
      <Navbar />
      
      <main className="max-w-7xl mx-auto py-10 px-4 sm:px-6 lg:px-8">
        {/* Page Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-10 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white tracking-tight">
              Manage Finances
            </h1>
            <p className="mt-1 text-gray-500 dark:text-gray-400 text-sm">
              Track your {role === 'client' ? 'spending' : 'earnings'} and manage project transactions.
            </p>
          </div>
          <button 
            onClick={fetchPayments}
            className="w-full sm:w-auto px-4 py-2.5 text-sm font-bold text-gray-700 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 dark:bg-gray-900 dark:border-gray-800 dark:text-gray-300 transition-all shadow-sm active:scale-95"
          >
            Refresh
          </button>
        </div>

        {loading && !payments.length ? (
          <PaymentLoaderSkeleton />
        ) : error ? (
          <div className="flex flex-col items-center justify-center py-20 bg-white dark:bg-gray-900 rounded-3xl border border-dashed border-gray-200 dark:border-gray-800">
            <AlertCircle size={48} className="text-red-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">{error}</h3>
            <button onClick={fetchPayments} className="mt-4 text-primary font-semibold hover:underline">Try again</button>
          </div>
        ) : (
          <div className="space-y-8">
            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <EarningsSummaryCard 
                title={role === 'client' ? 'Total Budget' : 'Total Earnings'}
                amount={totalAmount}
                subtitle="All time activity"
                icon={DollarSign}
                colorClass="primary"
              />
              <EarningsSummaryCard 
                title={role === 'client' ? 'Settled' : 'Paid Transactions'}
                amount={paidAmount}
                subtitle="Successfully processed"
                icon={CheckCircle2}
                colorClass="emerald"
              />
              <EarningsSummaryCard 
                title={role === 'client' ? 'In Pipeline' : 'Pending Payments'}
                amount={pendingAmount}
                subtitle="Awaiting action"
                icon={Clock}
                colorClass="amber"
              />
            </div>

            {/* Transaction List */}
            <TransactionList 
              payments={payments}
              role={role}
              actionLoading={actionLoading}
              onReview={handleReview}
              onRelease={setCheckoutPayment}
            />
          </div>
        )}
      </main>

      {checkoutPayment && (
        <CheckoutModal 
          isOpen={!!checkoutPayment} 
          onClose={() => setCheckoutPayment(null)} 
          onConfirm={handleRelease}
          payment={checkoutPayment}
        />
      )}
    </div>
  );
};

export default PaymentDashboard;
