import React, { createContext, useState, useCallback, useContext } from 'react';
import paymentService from '../services/paymentService';
import { AuthContext } from './AuthContext';
import { useNotification } from './NotificationContext';

export const PaymentContext = createContext();

export const PaymentProvider = ({ children }) => {
  const { user } = useContext(AuthContext);
  const { addNotification } = useNotification();
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [actionLoading, setActionLoading] = useState(new Set()); // Track IDs being processed

  const fetchPayments = useCallback(async () => {
    if (!user?.role) return;
    setLoading(true);
    setError(null);
    try {
      const data = await (user.role === 'client' 
        ? paymentService.getClientPayments() 
        : paymentService.getFreelancerPayments());
      setPayments(data || []);
    } catch (err) {
      setError(err.message || 'Failed to fetch payments');
    } finally {
      setLoading(false);
    }
  }, [user?.role]);

  const reviewPayment = async (paymentId) => {
    if (actionLoading.has(paymentId)) return; // Prevent duplicate requests
    
    // Optimistic Update
    const previousPayments = [...payments];
    setPayments(prev => prev.map(p => 
      p._id === paymentId ? { ...p, status: 'reviewed' } : p
    ));
    
    setActionLoading(prev => new Set(prev).add(paymentId));
    try {
      await paymentService.reviewPayment(paymentId);
      addNotification('Project reviewed successfully!', 'success');
      // Success: Server and local state are now in sync
    } catch (err) {
      // Rollback on error
      setPayments(previousPayments);
      addNotification(err.message || 'Failed to review project', 'error');
    } finally {
      setActionLoading(prev => {
        const next = new Set(prev);
        next.delete(paymentId);
        return next;
      });
    }
  };

  const releasePayment = async (paymentId) => {
    if (actionLoading.has(paymentId)) return; // Prevent duplicate requests

    // Optimistic Update
    const previousPayments = [...payments];
    setPayments(prev => prev.map(p => 
      p._id === paymentId ? { ...p, status: 'paid' } : p
    ));

    setActionLoading(prev => new Set(prev).add(paymentId));
    try {
      await paymentService.releasePayment(paymentId);
      addNotification('Payment released successfully!', 'success');
      // Success: Server and local state are now in sync
    } catch (err) {
      // Rollback on error
      setPayments(previousPayments);
      addNotification(err.message || 'Failed to release payment', 'error');
    } finally {
      setActionLoading(prev => {
        const next = new Set(prev);
        next.delete(paymentId);
        return next;
      });
    }
  };

  const value = {
    payments,
    loading,
    error,
    selectedPayment,
    setSelectedPayment,
    actionLoading,
    fetchPayments,
    reviewPayment,
    releasePayment
  };

  return (
    <PaymentContext.Provider value={value}>
      {children}
    </PaymentContext.Provider>
  );
};
