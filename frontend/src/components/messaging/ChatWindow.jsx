import React, { useEffect, useRef } from 'react';
import { ChevronLeft, MessageSquare } from 'lucide-react';
import MessageBubble from './MessageBubble';
import MessageInput from './MessageInput';

const ChatWindow = ({ 
  selectedUser, 
  messages, 
  onSendMessage, 
  onBack, 
  fetchError, 
  sendError, 
  currentUser 
}) => {
  console.log('ChatWindow selectedUser:', selectedUser);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  return (
    <div className={`${!selectedUser ? 'hidden md:flex' : 'flex'} md:col-span-8 lg:col-span-8 bg-white/60 backdrop-blur-lg border border-white/40 shadow-sm hover:shadow-md transition-shadow duration-200 rounded-xl flex-col overflow-hidden`}>
      {selectedUser ? (
        <>
          {/* Chat Header */}
          <div className="p-4 border-b border-gray-200/50 bg-white/40 flex items-center justify-between">
            <div className="flex items-center gap-2 md:gap-3">
              <button 
                onClick={onBack}
                className="md:hidden p-1.5 -ml-1 text-gray-500 hover:text-text-dark transition-colors"
                aria-label="Back to conversations"
              >
                <ChevronLeft size={24} />
              </button>
              <div className="relative">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-gray-200 to-gray-300 text-text-dark flex items-center justify-center font-bold shadow-sm">
                  {selectedUser.name.charAt(0).toUpperCase()}
                </div>
                <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 border-2 border-white rounded-full"></span>
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="font-semibold text-lg text-text-dark">{selectedUser.name}</h2>
                  <span className="text-[10px] px-2 py-0.5 bg-gray-100 text-gray-600 rounded-full border border-gray-200 font-medium capitalize">
                    {selectedUser.role || 'Freelancer'}
                  </span>
                </div>
                <div className="flex items-center gap-1 h-4">
                  <p className="text-xs text-text-muted">{selectedUser.email}</p>
                </div>
              </div>
            </div>
            <div className="hidden md:flex items-center gap-4">
              <div className="flex flex-col items-end text-right">
                <p className="text-xs font-medium text-text-dark">Project Collaboration</p>
                <p className="text-[10px] text-text-muted">Status: <span className="text-primary font-medium">In Progress</span></p>
              </div>
              <button className="text-gray-400 hover:text-text-dark transition-colors duration-200" title="Project Options (Coming Soon)">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="1"></circle><circle cx="12" cy="5" r="1"></circle><circle cx="12" cy="19" r="1"></circle></svg>
              </button>
            </div>
          </div>
          
          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-gray-50/30">
            {fetchError && (
              <div className="flex justify-center mb-4">
                <span className="bg-red-50 text-red-500 text-xs px-3 py-1 rounded-full border border-red-100">{fetchError}</span>
              </div>
            )}
            {messages.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-text-muted opacity-80">
                <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mb-4 shadow-sm border border-gray-100">
                  <MessageSquare size={32} className="text-primary" />
                </div>
                <h3 className="text-lg font-medium text-text-dark mb-1">Start the conversation</h3>
                <p className="text-sm">Discuss project requirements, timelines, and deliverables.</p>
              </div>
            ) : (
              messages.map((msg, idx) => (
                <MessageBubble 
                  key={idx} 
                  msg={msg} 
                  isMe={msg.sender === currentUser?._id} 
                />
              ))
            )}
            <div ref={messagesEndRef} />
          </div>
          
          {/* Input Area */}
          <MessageInput 
            onSendMessage={onSendMessage} 
            selectedUser={selectedUser} 
            sendError={sendError} 
          />
        </>
      ) : (
        <div className="flex-1 flex flex-col items-center justify-center text-text-muted opacity-80 p-8 text-center">
          <div className="w-20 h-20 bg-white shadow-sm border border-gray-100 rounded-full flex items-center justify-center mb-6">
            <MessageSquare size={40} className="text-primary" />
          </div>
          <h3 className="text-xl font-medium text-text-dark mb-2">Select a conversation</h3>
          <p className="max-w-md">Collaborate with freelancers and clients after accepting project bids.</p>
        </div>
      )}
    </div>
  );
};

export default ChatWindow;
