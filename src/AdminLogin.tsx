import { useState } from 'react';
import './AdminLogin.css';

interface AdminLoginProps {
  onLogin: () => void;
}

function AdminLogin({ onLogin }: AdminLoginProps) {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Simple password check (in production, use proper authentication)
    if (password === 'admin2035') {
      localStorage.setItem('adminAuthenticated', 'true');
      onLogin();
    } else {
      setError('Incorrect password');
      setPassword('');
    }
  };

  return (
    <div className="admin-login-container">
      <div className="admin-login-card">
        <h1>Admin Panel</h1>
        <p>Enter password to continue</p>
        <form onSubmit={handleSubmit}>
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              setError('');
            }}
            autoFocus
          />
          {error && <div className="admin-login-error">{error}</div>}
          <button type="submit" className="admin-login-btn">
            Login
          </button>
        </form>
        <p className="admin-login-hint">Password: admin2035</p>
      </div>
    </div>
  );
}

export default AdminLogin;
