import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Briefcase, FileText, LogOut, MessageCircle, X, Send } from 'lucide-react';
import api from '../services/api';

function Layout({ user, onLogout, children }) {
  const location = useLocation();
  const [showAssistant, setShowAssistant] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  const navItems = [
    { path: '/', icon: LayoutDashboard, label: 'Dashboard' },
    { path: '/jobs', icon: Briefcase, label: 'Job Feed' },
    { path: '/applications', icon: FileText, label: 'Applications' }
  ];

  const handleSendMessage = async () => {
    if (!input.trim() || loading) return;

    const userMessage = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setLoading(true);

    try {
      const response = await api.chatWithAssistant(userMessage);
      
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: response.reply,
        filterActions: response.filterActions 
      }]);

      // Apply filter actions if any
      if (response.filterActions) {
        window.dispatchEvent(new CustomEvent('aiFilterChange', { 
          detail: response.filterActions 
        }));
      }
    } catch (error) {
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: "Sorry, I'm having trouble right now. Please try again." 
      }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      {/* Sidebar */}
      <div style={styles.sidebar}>
        <div style={styles.logo}>
          <Briefcase size={32} style={{ color: '#4f46e5' }} />
          <h2 style={styles.logoText}>Job Tracker</h2>
        </div>

        <nav style={styles.nav}>
          {navItems.map(item => (
            <Link
              key={item.path}
              to={item.path}
              style={{
                ...styles.navItem,
                ...(location.pathname === item.path ? styles.navItemActive : {})
              }}
            >
              <item.icon size={20} />
              <span>{item.label}</span>
            </Link>
          ))}
        </nav>

        <div style={styles.userSection}>
          <div style={styles.userInfo}>
            <div style={styles.userAvatar}>
              {user.email[0].toUpperCase()}
            </div>
            <div>
              <div style={styles.userName}>{user.name || 'User'}</div>
              <div style={styles.userEmail}>{user.email}</div>
            </div>
          </div>
          <button onClick={onLogout} style={styles.logoutBtn}>
            <LogOut size={18} />
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div style={styles.main}>
        {children}
      </div>

      {/* AI Assistant Bubble */}
      <button
        onClick={() => setShowAssistant(!showAssistant)}
        style={styles.assistantBubble}
        title="AI Assistant"
      >
        {showAssistant ? <X size={24} /> : <MessageCircle size={24} />}
      </button>

      {/* AI Assistant Chat */}
      {showAssistant && (
        <div style={styles.assistantPanel}>
          <div style={styles.assistantHeader}>
            <MessageCircle size={20} />
            <span>AI Assistant</span>
          </div>

          <div style={styles.chatMessages}>
            {messages.length === 0 && (
              <div style={styles.welcomeMessage}>
                <p>👋 Hi! I can help you:</p>
                <ul style={styles.helpList}>
                  <li>Filter jobs (try "show remote jobs")</li>
                  <li>Find high match scores</li>
                  <li>Answer product questions</li>
                </ul>
              </div>
            )}
            {messages.map((msg, idx) => (
              <div
                key={idx}
                style={{
                  ...styles.message,
                  ...(msg.role === 'user' ? styles.userMessage : styles.assistantMessage)
                }}
              >
                {msg.content}
              </div>
            ))}
            {loading && (
              <div style={{ ...styles.message, ...styles.assistantMessage }}>
                Thinking...
              </div>
            )}
          </div>

          <div style={styles.chatInput}>
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
              placeholder="Ask me anything..."
              style={styles.input}
              disabled={loading}
            />
            <button
              onClick={handleSendMessage}
              style={styles.sendBtn}
              disabled={loading || !input.trim()}
            >
              <Send size={18} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

const styles = {
  container: {
    display: 'flex',
    minHeight: '100vh',
    background: '#f5f7fa'
  },
  sidebar: {
    width: '260px',
    background: 'white',
    borderRight: '1px solid #e5e7eb',
    display: 'flex',
    flexDirection: 'column',
    position: 'fixed',
    height: '100vh',
    left: 0,
    top: 0
  },
  logo: {
    padding: '24px 20px',
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    borderBottom: '1px solid #e5e7eb'
  },
  logoText: {
    fontSize: '20px',
    fontWeight: 'bold',
    color: '#1f2937'
  },
  nav: {
    flex: 1,
    padding: '20px 12px',
    display: 'flex',
    flexDirection: 'column',
    gap: '4px'
  },
  navItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '12px 16px',
    borderRadius: '8px',
    color: '#6b7280',
    textDecoration: 'none',
    transition: 'all 0.2s',
    fontWeight: '500'
  },
  navItemActive: {
    background: '#eef2ff',
    color: '#4f46e5'
  },
  userSection: {
    padding: '16px',
    borderTop: '1px solid #e5e7eb',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  userInfo: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    flex: 1
  },
  userAvatar: {
    width: '40px',
    height: '40px',
    borderRadius: '50%',
    background: '#4f46e5',
    color: 'white',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: 'bold'
  },
  userName: {
    fontSize: '14px',
    fontWeight: '600',
    color: '#1f2937'
  },
  userEmail: {
    fontSize: '12px',
    color: '#6b7280'
  },
  logoutBtn: {
    padding: '8px',
    background: 'transparent',
    border: 'none',
    color: '#6b7280',
    borderRadius: '6px',
    transition: 'all 0.2s'
  },
  main: {
    marginLeft: '260px',
    flex: 1,
    padding: '24px',
    minHeight: '100vh'
  },
  assistantBubble: {
    position: 'fixed',
    bottom: '24px',
    right: '24px',
    width: '56px',
    height: '56px',
    borderRadius: '50%',
    background: '#4f46e5',
    color: 'white',
    border: 'none',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0 4px 12px rgba(79, 70, 229, 0.4)',
    zIndex: 1000,
    transition: 'all 0.2s'
  },
  assistantPanel: {
    position: 'fixed',
    bottom: '96px',
    right: '24px',
    width: '360px',
    height: '500px',
    background: 'white',
    borderRadius: '12px',
    boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
    display: 'flex',
    flexDirection: 'column',
    zIndex: 999
  },
  assistantHeader: {
    padding: '16px',
    borderBottom: '1px solid #e5e7eb',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    fontWeight: '600',
    color: '#1f2937'
  },
  chatMessages: {
    flex: 1,
    overflowY: 'auto',
    padding: '16px',
    display: 'flex',
    flexDirection: 'column',
    gap: '12px'
  },
  message: {
    padding: '10px 14px',
    borderRadius: '12px',
    maxWidth: '85%',
    fontSize: '14px',
    lineHeight: '1.5'
  },
  userMessage: {
    background: '#4f46e5',
    color: 'white',
    alignSelf: 'flex-end',
    borderBottomRightRadius: '4px'
  },
  assistantMessage: {
    background: '#f3f4f6',
    color: '#1f2937',
    alignSelf: 'flex-start',
    borderBottomLeftRadius: '4px'
  },
  welcomeMessage: {
    padding: '16px',
    background: '#eff6ff',
    borderRadius: '8px',
    fontSize: '14px',
    color: '#1e40af'
  },
  helpList: {
    marginTop: '12px',
    marginLeft: '20px',
    lineHeight: '1.8'
  },
  chatInput: {
    padding: '16px',
    borderTop: '1px solid #e5e7eb',
    display: 'flex',
    gap: '8px'
  },
  input: {
    flex: 1,
    padding: '10px 14px',
    border: '1px solid #d1d5db',
    borderRadius: '8px',
    fontSize: '14px',
    outline: 'none'
  },
  sendBtn: {
    padding: '10px 16px',
    background: '#4f46e5',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  }
};

export default Layout;
