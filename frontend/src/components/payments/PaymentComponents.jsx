import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  CheckCircle2, 
  Clock, 
  FileCheck, 
  DollarSign, 
  ArrowRight,
  User,
  ExternalLink,
  MoreVertical,
  MessageSquare
} from 'lucide-react';

/**
 * PaymentStatusBadge
 * Renders a stylized badge based on the payment status.
 */
export const PaymentStatusBadge = ({ status }) => {
  const getStatusStyles = (status) => {
    switch (status) {
      case 'paid':
        return 'bg-emerald-50 text-emerald-700 border-emerald-100';
      case 'reviewed':
        return 'bg-blue-50 text-blue-700 border-blue-100';
      case 'requested':
        return 'bg-amber-50 text-amber-700 border-amber-100';
      default:
        return 'bg-gray-50 text-gray-700 border-gray-100';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'paid':
        return <CheckCircle2 size={14} className="mr-1.5" />;
      case 'reviewed':
        return <FileCheck size={14} className="mr-1.5" />;
      case 'requested':
        return <Clock size={14} className="mr-1.5" />;
      default:
        return null;
    }
  };

  return (
    <div className={`flex items-center px-2.5 py-1 rounded-full text-xs font-bold border ${getStatusStyles(status)}`}>
      {getStatusIcon(status)}
      {status?.toUpperCase()}
    </div>
  );
};

/**
 * EarningsSummaryCard
 * Displays a summary metric with a large amount and descriptive subtitle.
 */
export const EarningsSummaryCard = ({ title, amount, subtitle, icon: Icon, colorClass = 'primary' }) => {
  const colorMap = {
    primary: 'bg-primary/10 text-primary',
    emerald: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/30 dark:text-emerald-400',
    amber: 'bg-amber-50 text-amber-600 dark:bg-amber-950/30 dark:text-amber-400',
  };

  return (
    <div className="bg-white dark:bg-gray-900 p-6 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm hover:shadow-md transition-shadow group">
      <div className="flex items-center justify-between mb-4">
        <div className={`p-2.5 rounded-xl ${colorMap[colorClass]}`}>
          {Icon && <Icon size={20} />}
        </div>
        <span className="text-xs font-medium text-gray-400 uppercase tracking-wider">{title}</span>
      </div>
      <div className="text-3xl font-bold text-gray-900 dark:text-white">
        ${typeof amount === 'number' ? amount.toLocaleString() : amount}
      </div>
      <div className={`mt-2 text-sm flex items-center ${colorClass === 'primary' ? 'text-gray-500' : 'font-medium opacity-90'}`}>
        {subtitle}
        {colorClass === 'primary' && <ArrowRight size={14} className="ml-1 opacity-0 group-hover:opacity-100 transition-all -translate-x-2 group-hover:translate-x-0" />}
      </div>
    </div>
  );
};

/**
 * PaymentActionButtons
 * Renders contextual actions based on payment status and user role.
 * Includes messaging integration.
 */
export const PaymentActionButtons = ({ payment, role, actionLoading, onReview, onRelease }) => {
  const navigate = useNavigate();

  const handleMessage = () => {
    // Navigate to messaging with context (could be expanded to open a specific conversation)
    navigate('/messages');
  };

  return (
    <div className="flex items-center gap-2 shrink-0">
      {role === 'client' ? (
        <>
          {payment.status === 'requested' && (
            <button
              onClick={() => onReview(payment._id)}
              disabled={actionLoading.has(payment._id)}
              className="flex-1 sm:flex-none px-4 py-2 text-sm font-bold text-white bg-primary rounded-xl hover:bg-primary-hover transition-all shadow-lg shadow-primary/20 disabled:opacity-50 disabled:shadow-none"
            >
              {actionLoading.has(payment._id) ? 'Processing...' : 'Review Project'}
            </button>
          )}
          {payment.status === 'reviewed' && (
            <button
              onClick={() => onRelease(payment)}
              disabled={actionLoading.has(payment._id)}
              className="flex-1 sm:flex-none px-4 py-2 text-sm font-bold text-white bg-emerald-600 rounded-xl hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-500/20 disabled:opacity-50 disabled:shadow-none"
            >
              {actionLoading.has(payment._id) ? 'Processing...' : 'Release Payment'}
            </button>
          )}
          {payment.status === 'paid' && (
            <div className="px-4 py-2 text-sm font-medium text-gray-400 bg-gray-50 dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-800 cursor-not-allowed">
              Settled
            </div>
          )}
        </>
      ) : (
        <button 
          onClick={handleMessage}
          className="flex items-center gap-2 px-4 py-2 text-sm font-bold text-gray-600 dark:text-gray-300 bg-gray-50 dark:bg-gray-800 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 transition-all border border-gray-100 dark:border-gray-700"
        >
          <MessageSquare size={16} />
          Message Client
        </button>
      )}
      
      {role === 'client' && (
        <button 
          onClick={handleMessage}
          className="p-2 text-gray-400 hover:text-primary transition-colors"
          title="Message Freelancer"
        >
          <MessageSquare size={20} />
        </button>
      )}
      
      <button className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors">
        <MoreVertical size={20} />
      </button>
    </div>
  );
};

/**
 * PaymentCard
 * The primary row component for the transaction list.
 */
export const PaymentCard = ({ payment, role, actionLoading, onReview, onRelease }) => {
  return (
    <div className="px-6 py-6 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors flex flex-col lg:flex-row lg:items-center justify-between gap-6">
      <div className="flex items-start gap-4">
        <div className="hidden sm:flex shrink-0 w-12 h-12 rounded-2xl bg-gray-50 dark:bg-gray-800 items-center justify-center text-gray-400">
          <User size={20} />
        </div>
        <div>
          <h4 className="text-base font-bold text-gray-900 dark:text-white group flex items-center">
            {payment.projectTitle}
            <ExternalLink size={14} className="ml-2 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer text-gray-400" />
          </h4>
          <div className="flex flex-wrap items-center mt-1.5 gap-y-1">
            <span className="text-sm text-gray-500 dark:text-gray-400 flex items-center">
              {role === 'client' ? 'Freelancer: ' : 'Client: '} 
              <span className="ml-1 text-gray-700 dark:text-gray-300 font-medium">
                {role === 'client' ? payment.freelancerName : payment.clientName}
              </span>
            </span>
            <span className="mx-2 text-gray-300 hidden sm:inline">•</span>
            <span className="text-sm text-gray-500 dark:text-gray-400 flex items-center">
              {new Date(payment.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
            </span>
          </div>
        </div>
      </div>

      <div className="flex flex-row lg:flex-col items-center lg:items-end justify-between lg:justify-center gap-4 lg:gap-2">
        <div className="text-xl font-black text-gray-900 dark:text-white">
          ${payment.amount?.toLocaleString()}
        </div>
        <PaymentStatusBadge status={payment.status} />
      </div>

      <PaymentActionButtons 
        payment={payment} 
        role={role} 
        actionLoading={actionLoading} 
        onReview={onReview} 
        onRelease={onRelease} 
      />
    </div>
  );
};

/**
 * EmptyPaymentsState
 * Renders when no payments are available.
 */
export const EmptyPaymentsState = () => (
  <div className="py-20 flex flex-col items-center justify-center text-center animate-in fade-in duration-500">
    <div className="bg-gray-50 dark:bg-gray-800 p-6 rounded-full mb-4">
      <DollarSign size={32} className="text-gray-300" />
    </div>
    <h3 className="text-gray-900 dark:text-white font-medium mb-1">No transactions yet</h3>
    <p className="text-gray-500 text-sm max-w-xs">Payments will appear here once projects reach completion milestones.</p>
  </div>
);

/**
 * PaymentLoaderSkeleton
 * Loading placeholders for summary cards and list items.
 */
export const PaymentLoaderSkeleton = () => (
  <div className="space-y-6">
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {[1, 2, 3].map(i => (
        <div key={i} className="h-32 bg-gray-200 dark:bg-gray-800 rounded-2xl animate-pulse" />
      ))}
    </div>
    <div className="space-y-4">
      {[1, 2, 3, 4].map(i => (
        <div key={i} className="h-24 bg-gray-100 dark:bg-gray-900 rounded-xl animate-pulse" />
      ))}
    </div>
  </div>
);

/**
 * TransactionList
 * Main list container for all payment entries.
 */
export const TransactionList = ({ payments, role, actionLoading, onReview, onRelease }) => {
  return (
    <div className="bg-white dark:bg-gray-900 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden animate-in slide-in-from-bottom-4 duration-500">
      <div className="px-6 py-5 border-b border-gray-50 dark:border-gray-800 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Transaction History</h2>
        <div className="text-sm text-gray-500">{payments.length} items</div>
      </div>

      {payments.length === 0 ? (
        <EmptyPaymentsState />
      ) : (
        <div className="divide-y divide-gray-50 dark:divide-gray-800">
          {payments.map((p) => (
            <PaymentCard 
              key={p._id} 
              payment={p} 
              role={role} 
              actionLoading={actionLoading} 
              onReview={onReview} 
              onRelease={onRelease} 
            />
          ))}
        </div>
      )}
    </div>
  );
};
