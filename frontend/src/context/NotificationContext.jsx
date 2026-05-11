import React, { createContext, useState, useCallback, useContext } from 'react';
import { 
  CheckCircle, 
  AlertCircle, 
  Info, 
  X,
  Bell
} from 'lucide-react';

export const NotificationContext = createContext();

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);

  const addNotification = useCallback((message, type = 'success') => {
    const id = Date.now();
    setNotifications(prev => [...prev, { id, message, type }]);
    
    // Auto remove after 4 seconds
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== id));
    }, 4000);
  }, []);

  const removeNotification = useCallback((id) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  }, []);

  return (
    <NotificationContext.Provider value={{ addNotification }}>
      {children}
      
      {/* Toast Container */}
      <div className="fixed bottom-6 right-6 z-[200] flex flex-col gap-3 max-w-md w-full pointer-events-none">
        {notifications.map((n) => (
          <div 
            key={n.id} 
            className={`pointer-events-auto flex items-center justify-between p-4 rounded-2xl shadow-2xl border animate-in slide-in-from-right-10 duration-300 ${
              n.type === 'success' ? 'bg-emerald-50 border-emerald-100 text-emerald-800' : 
              n.type === 'error' ? 'bg-red-50 border-red-100 text-red-800' : 
              'bg-blue-50 border-blue-100 text-blue-800'
            }`}
          >
            <div className="flex items-center gap-3">
              {n.type === 'success' && <CheckCircle size={20} />}
              {n.type === 'error' && <AlertCircle size={20} />}
              {n.type === 'info' && <Info size={20} />}
              <span className="text-sm font-semibold tracking-tight">{n.message}</span>
            </div>
            <button 
              onClick={() => removeNotification(n.id)}
              className="p-1 hover:bg-black/5 rounded-lg transition-colors ml-4"
            >
              <X size={16} />
            </button>
          </div>
        ))}
      </div>
    </NotificationContext.Provider>
  );
};

export const useNotification = () => useContext(NotificationContext);
