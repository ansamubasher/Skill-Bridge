import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import Navbar from '../../components/Navbar';
import { AuthContext } from '../../context/AuthContext';
import ConversationList from '../../components/messaging/ConversationList';
import ChatWindow from '../../components/messaging/ChatWindow';

const MessagesPage = () => {
  const { user, token } = useContext(AuthContext);
  const [conversations, setConversations] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sendError, setSendError] = useState(null);
  const [fetchError, setFetchError] = useState(null);

  const API_BASE_URL = 'http://localhost:5000/api/messages';

  // Axios instance with auth
  const api = axios.create({
    baseURL: API_BASE_URL,
    headers: { Authorization: `Bearer ${token}` }
  });

  // Fetch conversations
  useEffect(() => {
    const fetchConversations = async () => {
      try {
        const response = await api.get('/conversations');
        if (response.data.success) {
          setConversations(response.data.data);
        }
      } catch (error) {
        console.error("Failed to fetch conversations", error);
      } finally {
        setLoading(false);
      }
    };
    if (token) fetchConversations();
  }, [token]);

  // Fetch messages when a user is selected
  useEffect(() => {
    if (!selectedUser) return;
    
    const fetchMessages = async () => {
      setFetchError(null);
      try {
        const response = await api.get(`/${selectedUser._id}`);
        if (response.data.success) {
          setMessages(response.data.data);
        } else {
          setFetchError("Unable to load messages.");
        }
      } catch (error) {
        console.error("Failed to fetch messages", error);
        setFetchError("Connection error. Reconnecting...");
      }
    };

    fetchMessages();
    const intervalId = setInterval(fetchMessages, 3000);
    return () => clearInterval(intervalId);
  }, [selectedUser, token]);

  const handleSendMessage = async (content) => {
    if (!content.trim() || !selectedUser) return;

    setSendError(null);
    try {
      const response = await api.post('/send', {
        receiver: selectedUser._id,
        content: content
      });

      if (response.data.success) {
        const newMessage = response.data.data;
        setMessages(prev => [...prev, newMessage]);
        
        // Update the conversation's last message locally and sort it to the top
        setConversations(prev => {
          const updatedConvs = prev.map(conv => {
            const otherParticipant = conv.participants.find(p => p._id !== user._id);
            if (otherParticipant && otherParticipant._id === selectedUser._id) {
              return { ...conv, lastMessage: newMessage.content, lastMessageTime: new Date() };
            }
            return conv;
          });
          return updatedConvs.sort((a, b) => new Date(b.lastMessageTime) - new Date(a.lastMessageTime));
        });
      } else {
         setSendError("Failed to send message.");
      }
    } catch (error) {
      console.error("Failed to send message", error);
      setSendError("Network error. Please try again.");
    }
  };

  return (
    <div className="sb-page min-h-screen bg-bg-light flex flex-col">
      <Navbar />
      
      <div className="sb-container flex-1 py-8 flex flex-col max-w-6xl mx-auto w-full px-4">
        <h1 className="text-3xl font-bold mb-6 text-text-dark">Messages</h1>
        
        <div className="flex-1 grid grid-cols-1 md:grid-cols-12 gap-6 min-h-[600px]">
          <ConversationList 
            conversations={conversations}
            selectedUser={selectedUser}
            onSelectUser={setSelectedUser}
            loading={loading}
            currentUser={user}
            isSidebarHidden={!!selectedUser}
          />
          
          <ChatWindow 
            selectedUser={selectedUser}
            messages={messages}
            onSendMessage={handleSendMessage}
            onBack={() => setSelectedUser(null)}
            fetchError={fetchError}
            sendError={sendError}
            currentUser={user}
          />
        </div>
      </div>
    </div>
  );
};

export default MessagesPage;
