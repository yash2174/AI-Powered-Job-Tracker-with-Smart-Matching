import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import api from './services/api';

// Components
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import JobFeed from './components/JobFeed';
import Applications from './components/Applications';
import Layout from './components/Layout';
import ResumeUpload from './components/ResumeUpload';

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showResumePrompt, setShowResumePrompt] = useState(false);

  useEffect(() => {
    const currentUser = api.getCurrentUser();
    setUser(currentUser);
    
    if (currentUser) {
      checkResume();
    }
    setLoading(false);
  }, []);

  const checkResume = async () => {
    try {
      const resumeData = await api.getResume();
      if (!resumeData.hasResume) {
        setShowResumePrompt(true);
      }
    } catch (error) {
      console.error('Error checking resume:', error);
    }
  };

  const handleLogin = (userData) => {
    setUser(userData);
    checkResume();
  };

  const handleLogout = () => {
    api.logout();
    setUser(null);
  };

  const handleResumeUploaded = () => {
    setShowResumePrompt(false);
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <div>Loading...</div>
      </div>
    );
  }

  return (
    <Router>
      <Routes>
        <Route
          path="/login"
          element={
            user ? <Navigate to="/" replace /> : <Login onLogin={handleLogin} />
          }
        />
        <Route
          path="/"
          element={
            user ? (
              <Layout user={user} onLogout={handleLogout}>
                {showResumePrompt && (
                  <ResumeUpload 
                    onClose={() => setShowResumePrompt(false)}
                    onUploaded={handleResumeUploaded}
                  />
                )}
                <Dashboard />
              </Layout>
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />
        <Route
          path="/jobs"
          element={
            user ? (
              <Layout user={user} onLogout={handleLogout}>
                <JobFeed />
              </Layout>
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />
        <Route
          path="/applications"
          element={
            user ? (
              <Layout user={user} onLogout={handleLogout}>
                <Applications />
              </Layout>
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />
      </Routes>
    </Router>
  );
}

export default App;
