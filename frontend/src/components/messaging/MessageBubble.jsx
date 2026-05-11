import React from 'react';

const MessageBubble = ({ msg, isMe }) => {
  return (
    <div className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
      <div 
        className={`max-w-[70%] p-3 rounded-xl shadow-sm ${
          isMe 
            ? 'bg-primary text-white rounded-br-none' 
            : 'bg-white border border-gray-100 text-text-dark rounded-bl-none'
        }`}
      >
        <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
        <div className={`text-[10px] mt-1 flex items-center gap-1 ${isMe ? 'text-white/70 justify-end' : 'text-gray-400'}`}>
          <span>{new Date(msg.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
          {isMe && (
            <span className="ml-1" title="Read status">
              {msg.isRead ? '✓✓' : '✓'}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default MessageBubble;
