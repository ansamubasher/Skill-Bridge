import React, { useState } from 'react';
import { Send, Paperclip } from 'lucide-react';

const MessageInput = ({ onSendMessage, selectedUser, sendError }) => {
  const [newMessage, setNewMessage] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (newMessage.trim()) {
      onSendMessage(newMessage);
      setNewMessage('');
    }
  };

  return (
    <div className="p-4 border-t border-gray-200/50 bg-white/60 backdrop-blur-md flex flex-col">
      {sendError && <p className="text-xs text-red-500 mb-2 px-2 animate-pulse">{sendError}</p>}
      <form onSubmit={handleSubmit} className="flex gap-3 items-end">
        <button 
          type="button"
          className="text-gray-400 hover:text-text-dark transition-colors duration-200 p-2 shrink-0 mb-1"
          title="Attach File (Coming Soon)"
        >
          <Paperclip size={20} />
        </button>
        <textarea
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              handleSubmit(e);
            }
          }}
          placeholder={`Message ${selectedUser?.role ? selectedUser.role.toLowerCase() : 'user'}...`}
          className="flex-1 bg-white border border-gray-200 rounded-2xl px-5 py-3 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all shadow-inner resize-none min-h-[48px] max-h-[120px]"
          rows={1}
        />
        <button 
          type="submit"
          disabled={!newMessage.trim()}
          className="bg-primary hover:bg-primary-hover disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-full w-12 h-12 shrink-0 flex items-center justify-center transition-colors duration-200 shadow-sm mb-0.5"
        >
          <Send size={20} className="ml-1" />
        </button>
      </form>
    </div>
  );
};

export default MessageInput;
