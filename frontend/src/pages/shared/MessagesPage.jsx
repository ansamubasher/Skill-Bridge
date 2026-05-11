import React, { useState, useEffect, useRef, useContext, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import axiosInstance from '../../api/axiosInstance';
import Navbar from '../../components/Navbar';
import { Send, Search, ArrowLeft, Paperclip } from 'lucide-react';

/* ─── helpers ─── */
function avatar(name = '?') {
  return name.charAt(0).toUpperCase();
}

function timeLabel(iso) {
  if (!iso) return '';
  const d = new Date(iso);
  const now = new Date();
  if (d.toDateString() === now.toDateString())
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  return d.toLocaleDateString([], { month: 'short', day: 'numeric' });
}

/* ─── Sidebar Item ─── */
function SideItem({ name, subtitle, isSelected, onClick, badge }) {
  return (
    <div
      onClick={onClick}
      className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all duration-150 ${
        isSelected ? 'bg-orange-50 border border-orange-200' : 'hover:bg-gray-50 border border-transparent'
      }`}
    >
      <div
        className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm shrink-0"
        style={{ background: 'linear-gradient(135deg,#f97316,#ea580c)' }}
      >
        {avatar(name)}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex justify-between items-center">
          <span className={`text-sm font-semibold truncate ${isSelected ? 'text-orange-600' : 'text-gray-800'}`}>
            {name}
          </span>
          {badge && <span className="text-[10px] text-gray-400 shrink-0 ml-1">{badge}</span>}
        </div>
        {subtitle && <p className="text-xs text-gray-400 truncate mt-0.5">{subtitle}</p>}
      </div>
    </div>
  );
}

/* ─── Bubble ─── */
function Bubble({ msg, isMe }) {
  return (
    <div className={`flex ${isMe ? 'justify-end' : 'justify-start'} mb-2`}>
      <div
        className={`max-w-[70%] px-4 py-2.5 rounded-2xl text-sm shadow-sm ${
          isMe
            ? 'text-white rounded-br-sm'
            : 'bg-white border border-gray-100 text-gray-800 rounded-bl-sm'
        }`}
        style={isMe ? { background: 'linear-gradient(135deg,#f97316,#ea580c)' } : {}}
      >
        <p className="whitespace-pre-wrap leading-relaxed">{msg.content}</p>
        <p className={`text-[10px] mt-1 ${isMe ? 'text-white/70 text-right' : 'text-gray-400'}`}>
          {timeLabel(msg.createdAt)}
        </p>
      </div>
    </div>
  );
}

/* ════════════════════════ MAIN PAGE ════════════════════════ */
export default function MessagesPage() {
  const location  = useLocation();
  const navigate  = useNavigate();
  const { user }  = useContext(AuthContext);

  /* sidebar */
  const [conversations, setConversations] = useState([]);
  const [searchQuery,   setSearchQuery]   = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [loadingSidebar, setLoadingSidebar] = useState(true);

  /* chat */
  const [selectedUser, setSelectedUser] = useState(null); // { _id, name, email, projectId? }
  const [messages,     setMessages]     = useState([]);
  const [loadingMsgs,  setLoadingMsgs]  = useState(false);
  const [msgInput,     setMsgInput]     = useState('');
  const [sending,      setSending]      = useState(false);
  const [sendErr,      setSendErr]      = useState('');
  const [fetchErr,     setFetchErr]     = useState('');

  /* mobile: show chat pane */
  const [mobileChat, setMobileChat] = useState(false);

  const bottomRef  = useRef(null);
  const pollRef    = useRef(null);

  /* ── Pre-select user from navigate state (e.g. from bid card) ── */
  useEffect(() => {
    if (location.state?.targetUser) {
      const tu = location.state.targetUser;
      if (tu._id) {
        setSelectedUser(tu);
        setMobileChat(true);
      }
    }
  }, []); // run once on mount

  /* ── Fetch conversations ── */
  const fetchConversations = useCallback(async () => {
    try {
      const res = await axiosInstance.get('/messages/conversations');
      if (res.data?.success) setConversations(res.data.data || []);
    } catch (e) {
      console.error('fetchConversations error', e);
    } finally {
      setLoadingSidebar(false);
    }
  }, []);

  useEffect(() => { fetchConversations(); }, [fetchConversations]);

  /* ── User search ── */
  useEffect(() => {
    if (!searchQuery.trim()) { setSearchResults([]); return; }
    const t = setTimeout(async () => {
      try {
        const res = await axiosInstance.get(`/users/search?query=${encodeURIComponent(searchQuery)}`);
        if (res.data?.success) setSearchResults(res.data.users || []);
      } catch (e) { console.error('search error', e); }
    }, 300);
    return () => clearTimeout(t);
  }, [searchQuery]);

  /* ── Fetch messages for selected user ── */
  const fetchMessages = useCallback(async () => {
    if (!selectedUser?._id) return;
    try {
      const res = await axiosInstance.get(`/messages/${selectedUser._id}`);
      if (res.data?.success) setMessages(res.data.data || []);
      else setFetchErr('Could not load messages.');
    } catch (e) {
      console.error('fetchMessages error', e);
      setFetchErr('Connection error.');
    }
  }, [selectedUser]);

  useEffect(() => {
    if (!selectedUser?._id) { setMessages([]); return; }
    setLoadingMsgs(true);
    setFetchErr('');
    fetchMessages().finally(() => setLoadingMsgs(false));

    clearInterval(pollRef.current);
    pollRef.current = setInterval(fetchMessages, 3000);
    return () => clearInterval(pollRef.current);
  }, [selectedUser, fetchMessages]);

  /* auto-scroll */
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  /* ── Send message ── */
  const handleSend = async () => {
    const content = msgInput.trim();
    if (!content || !selectedUser?._id || sending) return;
    setSending(true);
    setSendErr('');
    try {
      const res = await axiosInstance.post('/messages/send', {
        receiver:  selectedUser._id,
        content,
        projectId: selectedUser.projectId || undefined,
      });
      if (res.data?.success) {
        setMessages(prev => [...prev, res.data.data]);
        setMsgInput('');
        fetchConversations(); // refresh sidebar
      } else {
        setSendErr('Failed to send. Please try again.');
      }
    } catch (e) {
      console.error('send error', e);
      setSendErr('Network error. Please try again.');
    } finally {
      setSending(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  /* ── Select a contact ── */
  const selectUser = (u) => {
    setSelectedUser(u);
    setSearchQuery('');
    setSearchResults([]);
    setMobileChat(true);
    setSendErr('');
    setFetchErr('');
  };

  /* ── Derive display list for sidebar ── */
  const convUsers = conversations.map(c => {
    const other = c.participants?.find(p => p._id !== user?._id);
    return other
      ? { _id: other._id, name: other.name, email: other.email,
          subtitle: c.lastMessage || 'Start a conversation',
          badge: timeLabel(c.lastMessageTime),
          projectTitle: c.project?.title }
      : null;
  }).filter(Boolean);

  const sidebarList = searchQuery.trim()
    ? searchResults.map(u => ({ ...u, subtitle: u.email, badge: '' }))
    : convUsers;

  const isNewContact = selectedUser && !convUsers.some(u => u._id === selectedUser._id);

  /* ─────────────────────── RENDER ─────────────────────── */
  return (
    <div style={{ minHeight: '100vh', background: '#f9fafb', display: 'flex', flexDirection: 'column', fontFamily: "'Inter',sans-serif" }}>
      <Navbar />

      <div style={{ flex: 1, maxWidth: 1100, margin: '0 auto', width: '100%', padding: '24px 16px', display: 'flex', flexDirection: 'column' }}>
        <h1 style={{ fontSize: 26, fontWeight: 800, color: '#111827', marginBottom: 20 }}>Messages</h1>

        <div style={{ flex: 1, display: 'grid', gridTemplateColumns: '320px 1fr', gap: 16, minHeight: 580 }}>

          {/* ──────────── SIDEBAR ──────────── */}
          <div
            style={{
              background: '#fff',
              borderRadius: 16,
              border: '1px solid #e5e7eb',
              display: mobileChat ? 'none' : 'flex',
              flexDirection: 'column',
              overflow: 'hidden',
            }}
            className="md-sidebar"
          >
            {/* Search */}
            <div style={{ padding: '16px 16px 12px', borderBottom: '1px solid #f3f4f6' }}>
              <h2 style={{ fontSize: 15, fontWeight: 700, marginBottom: 10, color: '#111827' }}>Chats</h2>
              <div style={{ position: 'relative' }}>
                <Search size={15} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: '#9ca3af' }} />
                <input
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  placeholder="Search users…"
                  style={{
                    width: '100%', padding: '8px 10px 8px 32px', borderRadius: 10,
                    border: '1px solid #e5e7eb', fontSize: 13, outline: 'none',
                    background: '#f9fafb', boxSizing: 'border-box',
                  }}
                />
              </div>
            </div>

            {/* List */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '8px 8px' }}>
              {loadingSidebar ? (
                [1,2,3].map(i => (
                  <div key={i} style={{ display: 'flex', gap: 10, padding: 12, alignItems: 'center' }}>
                    <div style={{ width: 40, height: 40, borderRadius: '50%', background: '#f3f4f6' }} />
                    <div style={{ flex: 1 }}>
                      <div style={{ height: 12, background: '#f3f4f6', borderRadius: 6, width: '60%', marginBottom: 6 }} />
                      <div style={{ height: 10, background: '#f3f4f6', borderRadius: 6, width: '40%' }} />
                    </div>
                  </div>
                ))
              ) : sidebarList.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '40px 16px', color: '#9ca3af' }}>
                  <div style={{ fontSize: 36, marginBottom: 8 }}>💬</div>
                  <p style={{ fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 4 }}>
                    {searchQuery ? 'No users found' : 'No conversations yet'}
                  </p>
                  <p style={{ fontSize: 12 }}>
                    {searchQuery ? 'Try a different name or email' : 'Search for a user above to start chatting'}
                  </p>
                </div>
              ) : (
                <>
                  {/* New contact pinned at top */}
                  {isNewContact && (
                    <SideItem
                      name={selectedUser.name || 'User'}
                      subtitle="New Conversation"
                      isSelected
                      onClick={() => selectUser(selectedUser)}
                    />
                  )}
                  {sidebarList.map(u => (
                    <SideItem
                      key={u._id}
                      name={u.name || 'User'}
                      subtitle={u.subtitle}
                      badge={u.badge}
                      isSelected={selectedUser?._id === u._id}
                      onClick={() => selectUser(u)}
                    />
                  ))}
                </>
              )}
            </div>
          </div>

          {/* ──────────── CHAT PANE ──────────── */}
          <div
            style={{
              background: '#fff',
              borderRadius: 16,
              border: '1px solid #e5e7eb',
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden',
            }}
          >
            {!selectedUser ? (
              /* Empty state */
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 40, color: '#9ca3af' }}>
                <div style={{ fontSize: 56, marginBottom: 16 }}>💬</div>
                <h3 style={{ fontSize: 18, fontWeight: 700, color: '#374151', marginBottom: 6 }}>Your Messages</h3>
                <p style={{ fontSize: 13, textAlign: 'center', maxWidth: 280 }}>
                  Select a contact from the list on the left, or search for someone to start a new conversation.
                </p>
              </div>
            ) : (
              <>
                {/* Chat Header */}
                <div style={{ padding: '14px 20px', borderBottom: '1px solid #f3f4f6', display: 'flex', alignItems: 'center', gap: 12 }}>
                  <button
                    onClick={() => { setMobileChat(false); setSelectedUser(null); }}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#6b7280', padding: 4, display: 'flex', alignItems: 'center' }}
                  >
                    <ArrowLeft size={18} />
                  </button>
                  <div
                    style={{ width: 38, height: 38, borderRadius: '50%', background: 'linear-gradient(135deg,#f97316,#ea580c)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 14, shrink: 0 }}
                  >
                    {avatar(selectedUser.name)}
                  </div>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 15, color: '#111827' }}>{selectedUser.name || 'User'}</div>
                    {selectedUser.email && <div style={{ fontSize: 11, color: '#9ca3af' }}>{selectedUser.email}</div>}
                  </div>
                </div>

                {/* Messages */}
                <div style={{ flex: 1, overflowY: 'auto', padding: '16px 20px', display: 'flex', flexDirection: 'column' }}>
                  {loadingMsgs ? (
                    <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#9ca3af', fontSize: 13 }}>
                      Loading messages…
                    </div>
                  ) : fetchErr ? (
                    <div style={{ textAlign: 'center', color: '#ef4444', fontSize: 13, padding: 20 }}>{fetchErr}</div>
                  ) : messages.length === 0 ? (
                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#9ca3af', gap: 8 }}>
                      <div style={{ fontSize: 40 }}>👋</div>
                      <p style={{ fontSize: 13, fontWeight: 600, color: '#374151' }}>Start the conversation!</p>
                      <p style={{ fontSize: 12 }}>Send your first message to {selectedUser.name}.</p>
                    </div>
                  ) : (
                    messages.map((msg, i) => (
                      <Bubble
                        key={msg._id || i}
                        msg={msg}
                        isMe={
                          msg.sender === user?._id ||
                          msg.sender?._id === user?._id
                        }
                      />
                    ))
                  )}
                  <div ref={bottomRef} />
                </div>

                {/* Input */}
                <div style={{ padding: '12px 16px', borderTop: '1px solid #f3f4f6', background: '#fff' }}>
                  {sendErr && (
                    <p style={{ color: '#ef4444', fontSize: 12, marginBottom: 8 }}>⚠️ {sendErr}</p>
                  )}
                  <div style={{ display: 'flex', gap: 10, alignItems: 'flex-end' }}>
                    <button style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#9ca3af', padding: '8px 4px' }}>
                      <Paperclip size={18} />
                    </button>
                    <textarea
                      value={msgInput}
                      onChange={e => setMsgInput(e.target.value)}
                      onKeyDown={handleKeyDown}
                      placeholder={`Message ${selectedUser.name || 'user'}…`}
                      rows={1}
                      style={{
                        flex: 1, border: '1px solid #e5e7eb', borderRadius: 20,
                        padding: '10px 16px', fontSize: 13, resize: 'none',
                        outline: 'none', fontFamily: 'inherit',
                        maxHeight: 100, overflowY: 'auto',
                        transition: 'border-color 0.2s',
                      }}
                      onFocus={e => e.target.style.borderColor = '#f97316'}
                      onBlur={e => e.target.style.borderColor = '#e5e7eb'}
                    />
                    <button
                      onClick={handleSend}
                      disabled={!msgInput.trim() || sending}
                      style={{
                        width: 42, height: 42, borderRadius: '50%', border: 'none',
                        background: msgInput.trim() && !sending ? 'linear-gradient(135deg,#f97316,#ea580c)' : '#e5e7eb',
                        color: msgInput.trim() && !sending ? '#fff' : '#9ca3af',
                        cursor: msgInput.trim() && !sending ? 'pointer' : 'not-allowed',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        flexShrink: 0, transition: 'all 0.2s',
                      }}
                    >
                      <Send size={17} style={{ marginLeft: 2 }} />
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>

        </div>
      </div>

      {/* Responsive override: always show sidebar on md+ */}
      <style>{`
        @media (min-width: 768px) {
          .md-sidebar { display: flex !important; }
        }
      `}</style>
    </div>
  );
}
