import { useState, useEffect } from 'react';
import './AdminLogin.css';

interface AdminLoginProps {
  onLogin: () => void;
}

const MAX_ATTEMPTS = 5;
const LOCKOUT_MS = 30_000;

function AdminLogin({ onLogin }: AdminLoginProps) {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLocked, setIsLocked] = useState(() => {
    try {
      const stored = localStorage.getItem('adminLoginAttempts');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed.count >= MAX_ATTEMPTS && Date.now() < parsed.until) {
          return true;
        }
      }
    } catch {
      // ignore parse errors
    }
    return false;
  });
  const [lockedUntil, setLockedUntil] = useState(() => {
    try {
      const stored = localStorage.getItem('adminLoginAttempts');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed.count >= MAX_ATTEMPTS && Date.now() < parsed.until) {
          return parsed.until;
        }
      }
    } catch {
      // ignore parse errors
    }
    return 0;
  });

  useEffect(() => {
    if (lockedUntil > 0 && Date.now() < lockedUntil) {
      const timer = setInterval(() => {
        setIsLocked(Date.now() < lockedUntil);
        setError(`Too many attempts. Try again in ${Math.ceil((lockedUntil - Date.now()) / 1000)}s.`);
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [lockedUntil]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (Date.now() < lockedUntil) {
      setError(`Too many attempts. Try again in ${Math.ceil((lockedUntil - Date.now()) / 1000)}s.`);
      return;
    }
    if (password === 'demo@222') {
      localStorage.removeItem('adminLoginAttempts');
      localStorage.setItem('adminAuthenticated', 'true');
      onLogin();
    } else {
      const newAttempts = (() => {
        try {
          const stored = localStorage.getItem('adminLoginAttempts');
          if (stored) return JSON.parse(stored).count + 1;
        } catch {
          // ignore
        }
        return 1;
      })();

      if (newAttempts >= MAX_ATTEMPTS) {
        const until = Date.now() + LOCKOUT_MS;
        setLockedUntil(until);
        setIsLocked(true);
        localStorage.setItem('adminLoginAttempts', JSON.stringify({ count: newAttempts, until }));
        setError(`Too many attempts. Try again in ${LOCKOUT_MS / 1000}s.`);
      } else {
        setError(`Incorrect password (${newAttempts}/${MAX_ATTEMPTS})`);
      }
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
            disabled={isLocked}
          />
          {error && <div className="admin-login-error">{error}</div>}
          <button type="submit" className="admin-login-btn" disabled={isLocked}>
            {isLocked ? 'Locked' : 'Login'}
          </button>
        </form>
      </div>
    </div>
  );
}

export default AdminLogin;
