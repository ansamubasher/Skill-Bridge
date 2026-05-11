import React, { useState, useEffect } from 'react';
import { 
  X, 
  Lock, 
  CreditCard, 
  ShieldCheck, 
  Loader2, 
  CheckCircle2,
  AlertCircle
} from 'lucide-react';

const CheckoutModal = ({ isOpen, onClose, onConfirm, payment }) => {
  const [formData, setFormData] = useState({
    cardNumber: '',
    expiry: '',
    cvc: '',
    name: ''
  });
  const [errors, setErrors] = useState({});
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  // Reset state when modal opens/closes
  useEffect(() => {
    if (!isOpen) {
      setFormData({ cardNumber: '', expiry: '', cvc: '', name: '' });
      setErrors({});
      setIsProcessing(false);
      setIsSuccess(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const validateForm = () => {
    const newErrors = {};
    if (!formData.cardNumber || formData.cardNumber.replace(/\s/g, '').length !== 16) {
      newErrors.cardNumber = 'Invalid card number (16 digits required)';
    }
    if (!formData.expiry || !/^\d{2}\/\d{2}$/.test(formData.expiry)) {
      newErrors.expiry = 'Invalid expiry (MM/YY)';
    }
    if (!formData.cvc || formData.cvc.length < 3) {
      newErrors.cvc = 'Invalid CVC';
    }
    if (!formData.name) {
      newErrors.name = 'Cardholder name required';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleConfirm = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsProcessing(true);
    try {
      // Simulate bank latency
      await new Promise(resolve => setTimeout(resolve, 2000));
      await onConfirm(payment._id);
      setIsSuccess(true);
      // Close after a short delay to show success
      setTimeout(() => {
        onClose();
      }, 2000);
    } catch (error) {
      setErrors({ global: error.message || 'Payment failed' });
    } finally {
      setIsProcessing(false);
    }
  };

  const formatCardNumber = (value) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    const matches = v.match(/\d{4,16}/g);
    const match = (matches && matches[0]) || '';
    const parts = [];
    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }
    if (parts.length) return parts.join(' ');
    return value;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name === 'cardNumber') {
      setFormData({ ...formData, [name]: formatCardNumber(value) });
    } else if (name === 'expiry') {
      let v = value.replace(/\D/g, '');
      if (v.length > 2) v = v.substring(0, 2) + '/' + v.substring(2, 4);
      setFormData({ ...formData, [name]: v.substring(0, 5) });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white dark:bg-gray-900 w-full max-w-md rounded-3xl shadow-2xl overflow-hidden border border-gray-100 dark:border-gray-800 animate-in zoom-in-95 duration-300">
        
        {/* Header */}
        <div className="px-6 py-6 border-b border-gray-50 dark:border-gray-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-xl text-primary">
              <Lock size={20} />
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">Secure Checkout</h3>
              <p className="text-xs text-gray-500 dark:text-gray-400">Payment for {payment.projectTitle}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors">
            <X size={24} />
          </button>
        </div>

        {isSuccess ? (
          <div className="p-12 flex flex-col items-center justify-center text-center animate-in zoom-in-95 duration-500">
            <div className="w-20 h-20 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 rounded-full flex items-center justify-center mb-6 scale-110">
              <CheckCircle2 size={48} />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Payment Successful</h2>
            <p className="text-gray-500 dark:text-gray-400">Funds have been released to the freelancer.</p>
          </div>
        ) : (
          <form onSubmit={handleConfirm} className="p-6 space-y-6">
            
            {/* Amount Display */}
            <div className="bg-gray-50 dark:bg-gray-800/50 p-4 rounded-2xl border border-gray-100 dark:border-gray-700 flex items-center justify-between">
              <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Amount to Release</span>
              <span className="text-2xl font-black text-gray-900 dark:text-white">${payment.amount?.toLocaleString()}</span>
            </div>

            {errors.global && (
              <div className="p-3 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-sm rounded-xl flex items-center gap-2 border border-red-100 dark:border-red-800/50">
                <AlertCircle size={16} />
                {errors.global}
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 ml-1">Cardholder Name</label>
                <div className="relative">
                  <input 
                    name="name"
                    type="text" 
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="John Doe"
                    className={`w-full px-4 py-3 bg-white dark:bg-gray-800 border ${errors.name ? 'border-red-300' : 'border-gray-200 dark:border-gray-700'} rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all dark:text-white`}
                  />
                </div>
                {errors.name && <p className="text-[10px] text-red-500 mt-1 ml-1">{errors.name}</p>}
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 ml-1">Card Number</label>
                <div className="relative">
                  <input 
                    name="cardNumber"
                    type="text" 
                    value={formData.cardNumber}
                    onChange={handleInputChange}
                    placeholder="0000 0000 0000 0000"
                    maxLength={19}
                    className={`w-full px-4 py-3 bg-white dark:bg-gray-800 border ${errors.cardNumber ? 'border-red-300' : 'border-gray-200 dark:border-gray-700'} rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all dark:text-white font-mono tracking-wider`}
                  />
                  <CreditCard className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-300" size={20} />
                </div>
                {errors.cardNumber && <p className="text-[10px] text-red-500 mt-1 ml-1">{errors.cardNumber}</p>}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 ml-1">Expiry Date</label>
                  <input 
                    name="expiry"
                    type="text" 
                    value={formData.expiry}
                    onChange={handleInputChange}
                    placeholder="MM/YY"
                    maxLength={5}
                    className={`w-full px-4 py-3 bg-white dark:bg-gray-800 border ${errors.expiry ? 'border-red-300' : 'border-gray-200 dark:border-gray-700'} rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all dark:text-white`}
                  />
                  {errors.expiry && <p className="text-[10px] text-red-500 mt-1 ml-1">{errors.expiry}</p>}
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 ml-1">CVC / CVV</label>
                  <input 
                    name="cvc"
                    type="text" 
                    value={formData.cvc}
                    onChange={handleInputChange}
                    placeholder="123"
                    maxLength={4}
                    className={`w-full px-4 py-3 bg-white dark:bg-gray-800 border ${errors.cvc ? 'border-red-300' : 'border-gray-200 dark:border-gray-700'} rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all dark:text-white`}
                  />
                  {errors.cvc && <p className="text-[10px] text-red-500 mt-1 ml-1">{errors.cvc}</p>}
                </div>
              </div>
            </div>

            <div className="pt-2">
              <button 
                type="submit"
                disabled={isProcessing}
                className="w-full py-4 bg-primary text-white font-bold rounded-2xl hover:bg-primary-hover transition-all shadow-xl shadow-primary/20 flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed group"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="animate-spin" size={20} />
                    Processing...
                  </>
                ) : (
                  <>
                    Confirm Release
                    <ShieldCheck size={20} className="group-hover:scale-110 transition-transform" />
                  </>
                )}
              </button>
              <div className="mt-4 flex items-center justify-center gap-2 text-gray-400">
                <Lock size={12} />
                <span className="text-[10px] font-medium uppercase tracking-widest">End-to-End Encrypted</span>
              </div>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default CheckoutModal;
