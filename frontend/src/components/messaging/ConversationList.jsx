import React from 'react';
import ConversationItem from './ConversationItem';

const ConversationList = ({ 
  conversations, 
  searchResults, 
  isSearching, 
  onSearch, 
  selectedUser, 
  onSelectUser, 
  loading, 
  currentUser, 
  isSidebarHidden 
}) => {
  return (
    <div className={`${isSidebarHidden ? 'hidden md:flex' : 'flex'} md:col-span-4 lg:col-span-4 bg-white/60 backdrop-blur-lg border border-white/40 shadow-sm hover:shadow-md transition-shadow duration-200 rounded-xl flex-col overflow-hidden`}>
      <div className="p-4 border-b border-gray-200/50 bg-white/40">
        <h2 className="font-semibold text-lg text-text-dark mb-3">Chats</h2>
        <div className="relative">
          <input 
            type="text" 
            placeholder="Search freelancers..." 
            onChange={(e) => onSearch(e.target.value)}
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
        ) : isSearching ? (
          searchResults.length === 0 ? (
            <div className="text-center p-6 text-text-muted opacity-80 mt-10">
              <p className="font-medium text-text-dark">No users found</p>
            </div>
          ) : (
            searchResults.map(u => (
              <div 
                key={u._id}
                onClick={() => onSelectUser(u)}
                className="p-3 rounded-lg cursor-pointer hover:bg-white/60 flex items-center gap-3"
              >
                <div className="w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center font-bold">
                  {u.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h3 className="font-semibold text-sm text-text-dark">{u.name}</h3>
                  <p className="text-[11px] text-text-muted">{u.email}</p>
                </div>
              </div>
            ))
          )
        ) : (
          <>
            {/* If we have a selected user who isn't in the conversation list yet (e.g. from search), show them at the top */}
            {selectedUser && !conversations.some(c => c.participants?.some(p => p._id === selectedUser._id)) && (
              <div 
                onClick={() => onSelectUser(selectedUser)}
                className="p-3 rounded-lg cursor-pointer bg-white shadow-sm border border-gray-200/60 relative flex items-center gap-3 mb-2"
              >
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-primary rounded-r-md"></div>
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-sb-orange text-white flex items-center justify-center font-bold shadow-sm shrink-0">
                  {selectedUser.name.charAt(0).toUpperCase()}
                </div>
                <div className="overflow-hidden flex-1">
                  <div className="flex justify-between items-start mb-0.5">
                    <h3 className="font-semibold text-sm truncate text-primary">
                      {selectedUser.name}
                    </h3>
                  </div>
                  <p className="text-[12px] text-text-muted truncate pr-2">
                    New Conversation
                  </p>
                </div>
              </div>
            )}

            {conversations.length === 0 ? (
              !selectedUser && (
                <div className="text-center p-6 text-text-muted opacity-80 mt-10">
                  <p className="font-medium text-text-dark mb-2">No active conversations yet</p>
                  <p className="text-xs">Search for a freelancer above or start a conversation from a project bid.</p>
                </div>
              )
            ) : (
              conversations.map(conv => (
                <ConversationItem 
                  key={conv._id}
                  conversation={conv}
                  isSelected={selectedUser && selectedUser._id === conv.participants?.find(p => p._id !== currentUser?._id)?._id}
                  onClick={onSelectUser}
                  currentUser={currentUser}
                />
              ))
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default ConversationList;
