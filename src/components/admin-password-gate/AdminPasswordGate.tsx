import { useState, useEffect, ReactNode } from 'react';
import './AdminPasswordGate.css';

interface AdminPasswordGateProps {
  customer: string;
  children: ReactNode;
}

type GateState = 'set-password' | 'enter-password' | 'granted';

const CONFIG_URL = 'https://weddappvows.vercel.app/api/admin/config';

export default function AdminPasswordGate({ customer, children }: AdminPasswordGateProps) {
  const storageKey = `admin_pass_${customer}`;
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState('');
  const [master, setMaster] = useState<string | null>(null);

  const stored = localStorage.getItem(storageKey);
  const [state, setState] = useState<GateState>(stored ? 'enter-password' : 'set-password');

  // Fetch master password from main app config endpoint
  useEffect(() => {
    if (!customer) return;

    fetch(`${CONFIG_URL}?customer=${encodeURIComponent(customer)}`)
      .then((r) => r.json())
      .then((d) => {
        if (d.has_master_password) setMaster(d.master_password || null);
      })
      .catch(() => setMaster(null));
  }, [customer]);

  function savePassword(e: React.FormEvent) {
    e.preventDefault();
    if (password.length < 4) {
      setError('Password must be at least 4 characters');
      return;
    }
    if (password !== confirm) {
      setError('Passwords do not match');
      return;
    }
    localStorage.setItem(storageKey, password);
    setState('granted');
    setError('');
  }

  async function verifyPassword(e: React.FormEvent) {
    e.preventDefault();
    if (!password) return;
    setError('');

    if (master && password === master) {
      setState('granted');
      return;
    }

    const stored = localStorage.getItem(storageKey);
    if (stored === password) {
      setState('granted');
    } else {
      setError('Incorrect password');
    }
  }

  if (state === 'granted') {
    return (
      <div className="admin-gate admin-gate--granted">
        {children}
      </div>
    );
  }

  if (state === 'set-password') {
    return (
      <div className="admin-gate admin-gate--set">
        <div className="admin-gate-card">
          <h2>Admin Access</h2>
          <p className="admin-gate-sub">
            Set a password for your admin panel. You'll need this to make
            future edits. You can change it anytime later.
          </p>
          <div className="admin-gate-field">
            <input
              type="password"
              placeholder="New password"
              value={password}
              onChange={(e) => { setPassword(e.target.value); setError(''); }}
              autoFocus
            />
          </div>
          <div className="admin-gate-field">
            <label className="admin-gate-label">Confirm password</label>
            <input
              type="password"
              placeholder="Confirm password"
              value={confirm}
              onChange={(e) => { setConfirm(e.target.value); setError(''); }}
            />
          </div>
          {master && (
            <p className="admin-gate-hint">
              Lost access? Contact support — a master password is on file.
            </p>
          )}
          <button type="button" className="admin-gate-btn" onClick={savePassword}>
            Set Password
          </button>
          {error && <p className="admin-gate-error">{error}</p>}
        </div>
      </div>
    );
  }

  // enter-password
  return (
    <div className="admin-gate admin-gate--enter">
      <div className="admin-gate-card">
        <h2>Admin Access</h2>
        <form onSubmit={verifyPassword}>
          <div className="admin-gate-field">
            <input
              type="password"
              placeholder="Enter admin password"
              value={password}
              onChange={(e) => { setPassword(e.target.value); setError(''); }}
              autoFocus
            />
          </div>
          <button type="submit" className="admin-gate-btn">
            Sign In
          </button>
          {error && <p className="admin-gate-error">{error}</p>}
        </form>
        {master && (
          <p className="admin-gate-hint">
            A master password is available — contact support if you've
            forgotten yours.
          </p>
        )}
      </div>
    </div>
  );
}