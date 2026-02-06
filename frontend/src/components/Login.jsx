import React, { useState } from 'react';
import api from '../services/api';
import { LogIn } from 'lucide-react';

function Login({ onLogin }) {
  const [email, setEmail] = useState('test@gmail.com');
  const [password, setPassword] = useState('test@123');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await api.login(email, password);
      if (response.success) {
        onLogin(response.user);
      } else {
        setError(response.message || 'Login failed');
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <div style={styles.header}>
          <LogIn size={48} style={{ color: '#4f46e5' }} />
          <h1 style={styles.title}>AI Job Tracker</h1>
          <p style={styles.subtitle}>Find your perfect job with AI-powered matching</p>
        </div>

        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.inputGroup}>
            <label style={styles.label}>Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={styles.input}
              required
            />
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.label}>Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={styles.input}
              required
            />
          </div>

          {error && <div style={styles.error}>{error}</div>}

          <button type="submit" style={styles.button} disabled={loading}>
            {loading ? 'Logging in...' : 'Login'}
          </button>

          <div style={styles.hint}>
            Demo credentials are pre-filled. Click Login to continue.
          </div>
        </form>
      </div>
    </div>
  );
}

const styles = {
  container: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    padding: '20px'
  },
  card: {
    background: 'white',
    borderRadius: '12px',
    padding: '40px',
    maxWidth: '420px',
    width: '100%',
    boxShadow: '0 20px 60px rgba(0,0,0,0.3)'
  },
  header: {
    textAlign: 'center',
    marginBottom: '30px'
  },
  title: {
    fontSize: '28px',
    fontWeight: 'bold',
    margin: '16px 0 8px',
    color: '#1f2937'
  },
  subtitle: {
    color: '#6b7280',
    fontSize: '14px'
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px'
  },
  inputGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px'
  },
  label: {
    fontSize: '14px',
    fontWeight: '500',
    color: '#374151'
  },
  input: {
    padding: '10px 14px',
    border: '1px solid #d1d5db',
    borderRadius: '6px',
    fontSize: '15px',
    outline: 'none',
    transition: 'border-color 0.2s'
  },
  button: {
    padding: '12px',
    background: '#4f46e5',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    fontSize: '16px',
    fontWeight: '600',
    marginTop: '10px',
    transition: 'background 0.2s'
  },
  error: {
    padding: '10px',
    background: '#fee2e2',
    color: '#dc2626',
    borderRadius: '6px',
    fontSize: '14px'
  },
  hint: {
    textAlign: 'center',
    fontSize: '13px',
    color: '#6b7280',
    marginTop: '10px'
  }
};

export default Login;
