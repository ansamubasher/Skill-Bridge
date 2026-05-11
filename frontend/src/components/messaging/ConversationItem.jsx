import React from 'react';

const ConversationItem = ({ conversation, isSelected, onClick, currentUser }) => {
  const otherUser = conversation.participants?.find(p => p._id !== currentUser?._id);
  
  if (!otherUser || !currentUser) return null;

  const formatTime = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const now = new Date();
    if (date.toDateString() === now.toDateString()) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
    return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
  };

  return (
    <div 
      onClick={() => onClick(otherUser)}
      className={`p-3 rounded-lg cursor-pointer transition-all duration-200 flex items-center gap-3
        ${isSelected 
          ? 'bg-white shadow-sm border border-gray-200/60 relative' 
          : 'hover:bg-white/60 border border-transparent'}`}
    >
      {isSelected && (
        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-primary rounded-r-md"></div>
      )}
      
      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-sb-orange text-white flex items-center justify-center font-bold shadow-sm shrink-0">
        {otherUser.name.charAt(0).toUpperCase()}
      </div>
      <div className="overflow-hidden flex-1">
        <div className="flex justify-between items-start mb-0.5">
          <h3 className={`font-semibold text-sm truncate ${isSelected ? 'text-primary' : 'text-text-dark'}`}>
            {otherUser.name}
          </h3>
          <span className="text-[10px] text-gray-400 shrink-0 ml-2 mt-0.5">
            {formatTime(conversation.lastMessageTime)}
          </span>
        </div>
        <div className="flex justify-between items-center">
          <p className="text-[12px] text-text-muted truncate pr-2 flex-1">
            {conversation.lastMessage || "Started a project"}
          </p>
          {conversation.project && (
            <span className="text-[9px] px-1.5 py-0.5 bg-sb-orange/10 text-sb-orange rounded-full border border-sb-orange/20 font-medium truncate max-w-[60px]">
              {conversation.project.title}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default ConversationItem;
