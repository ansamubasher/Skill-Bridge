import axiosInstance from '../api/axiosInstance';

/**
 * paymentService.js
 * Frontend API integration for the SkillBridge payment module.
 * Reuses the global axiosInstance which automatically attaches JWT tokens.
 */

/**
 * Create a payment request (usually when a project is marked completed)
 * @param {string} projectId 
 * @param {Object} data - { amount, freelancerId }
 */
export const createPaymentRequest = async (projectId, data) => {
  try {
    const response = await axiosInstance.post(`/payments/${projectId}/request`, data);
    return response.data;
  } catch (error) {
    throw error;
  }
};

/**
 * Client reviews/approves the completed work
 * @param {string} paymentId 
 */
export const reviewPayment = async (paymentId) => {
  try {
    const response = await axiosInstance.post(`/payments/${paymentId}/review`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

/**
 * Trigger payout to freelancer (Release Payment)
 * @param {string} paymentId 
 */
export const releasePayment = async (paymentId) => {
  try {
    const response = await axiosInstance.post(`/payments/${paymentId}/payout`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

/**
 * Fetch payments for a client
 */
export const getClientPayments = async () => {
  try {
    const response = await axiosInstance.get('/payments/client');
    return response.data;
  } catch (error) {
    throw error;
  }
};

/**
 * Fetch payments for a freelancer
 */
export const getFreelancerPayments = async () => {
  try {
    const response = await axiosInstance.get('/payments/freelancer');
    return response.data;
  } catch (error) {
    throw error;
  }
};

const paymentService = {
  createPaymentRequest,
  reviewPayment,
  releasePayment,
  getClientPayments,
  getFreelancerPayments,
};

export default paymentService;
