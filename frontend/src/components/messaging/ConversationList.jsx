import React from 'react';
import ConversationItem from './ConversationItem';

const ConversationList = ({ conversations, selectedUser, onSelectUser, loading, currentUser, isSidebarHidden }) => {
  return (
    <div className={`${isSidebarHidden ? 'hidden md:flex' : 'flex'} md:col-span-4 lg:col-span-4 bg-white/60 backdrop-blur-lg border border-white/40 shadow-sm hover:shadow-md transition-shadow duration-200 rounded-xl flex-col overflow-hidden`}>
      <div className="p-4 border-b border-gray-200/50 bg-white/40">
        <h2 className="font-semibold text-lg text-text-dark mb-3">Chats</h2>
        <div className="relative">
          <input 
            type="text" 
            placeholder="Search conversations..." 
            className="w-full bg-white/70 border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all shadow-inner placeholder-gray-400"
          />
        </div>
      </div>
      
      <div className="flex-1 overflow-y-auto p-2 space-y-1">
        {loading ? (
          <div className="space-y-3 p-2">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="flex items-center gap-3 p-3">
                <div className="w-10 h-10 rounded-full bg-gray-200 animate-pulse shrink-0"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-3 bg-gray-200 rounded w-2/3 animate-pulse"></div>
                  <div className="h-2 bg-gray-200 rounded w-1/2 animate-pulse"></div>
                </div>
              </div>
            ))}
          </div>
        ) : conversations.length === 0 ? (
          <div className="text-center p-6 text-text-muted opacity-80 mt-10">
            <p className="font-medium text-text-dark mb-2">No active conversations yet</p>
            <p className="text-xs">Conversations begin automatically after project collaboration starts (i.e. when a bid is accepted).</p>
          </div>
        ) : (
          conversations.map(conv => (
            <ConversationItem 
              key={conv._id}
              conversation={conv}
              isSelected={selectedUser && selectedUser._id === conv.participants.find(p => p._id !== currentUser._id)?._id}
              onClick={onSelectUser}
              currentUser={currentUser}
            />
          ))
        )}
      </div>
    </div>
  );
};

export default ConversationList;
