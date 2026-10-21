import React, { useState } from 'react';
import { getAuth, EmailAuthProvider, linkWithCredential } from 'firebase/auth';
import { Icons, CURRENCIES } from '../constants/icons';

export default function SettingsModal({
  isOpen,
  onClose,
  currency,
  setCurrency,
  confirmDelete,
  setConfirmDelete,
  quickSuggestions,
  setQuickSuggestions,
  onLogout,
  triggerToast
}) {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLinking, setIsLinking] = useState(false);

  const auth = getAuth();
  const currentUser = auth.currentUser;
  
  const isGoogleUser = currentUser?.providerData.some(p => p.providerId === 'google.com');
  const hasPasswordProvider = currentUser?.providerData.some(p => p.providerId === 'password');

  const handleLinkPassword = async (e) => {
    e.preventDefault();
    if (!newPassword || newPassword.length < 6) {
      triggerToast('Password must be at least 6 characters');
      return;
    }
    if (newPassword !== confirmPassword) {
      triggerToast('Passwords do not match');
      return;
    }
    
    setIsLinking(true);
    try {
      const credential = EmailAuthProvider.credential(currentUser.email, newPassword);
      await linkWithCredential(currentUser, credential);
      triggerToast('Password added! You can now log in with email or Google.');
      setNewPassword('');
      setConfirmPassword('');
    } catch (error) {
      console.error("Error linking account:", error);
      if (error.code === 'auth/credential-already-in-use') {
        triggerToast('An account already exists with this email.');
      } else {
        triggerToast(error.message);
      }
    } finally {
      setIsLinking(false);
    }
  };

  const handleResetData = () => {
    if (window.confirm("Are you sure you want to clear local settings?")) {
      localStorage.clear();
      window.location.reload();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="overlay overlay-top" onClick={onClose}>
      <div className="sheet modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-head">
          <div className="modal-titles">
            <h2>Settings</h2>
            <p>Manage your preferences and security</p>
          </div>
          <button className="icon-btn" onClick={onClose}><Icons.Close /></button>
        </div>

        <div className="modal-body form">
          <div className="field">
            <label className="field-label">Currency</label>
            <select
              className="control"
              value={currency}
              onChange={(e) => {
                setCurrency(e.target.value);
                triggerToast(`Currency changed to ${e.target.value}`);
              }}
            >
              {Object.keys(CURRENCIES).map((key) => (
                <option key={key} value={key}>{CURRENCIES[key].name}</option>
              ))}
            </select>
          </div>

          <div className="field" style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '10px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 12px', background: 'rgba(255, 255, 255, 0.03)', borderRadius: '8px', border: '1px solid var(--border)' }}>
              <div>
                <span style={{ fontWeight: 600, display: 'block', color: 'var(--text-main, #fff)' }}>Quick Payment Suggestions</span>
                <small style={{ color: 'var(--text-muted)' }}>Show one-click rent top-up bubble in records</small>
              </div>
              <input 
                type="checkbox" 
                checked={quickSuggestions} 
                onChange={(e) => setQuickSuggestions(e.target.checked)} 
                style={{ width: '20px', height: '20px', cursor: 'pointer', accentColor: 'var(--primary)' }}
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 12px', background: 'rgba(255, 255, 255, 0.03)', borderRadius: '8px', border: '1px solid var(--border)' }}>
              <div>
                <span style={{ fontWeight: 600, display: 'block', color: 'var(--text-main, #fff)' }}>Confirm Deletions</span>
                <small style={{ color: 'var(--text-muted)' }}>Ask for confirmation before deleting records</small>
              </div>
              <input 
                type="checkbox" 
                checked={confirmDelete} 
                onChange={(e) => setConfirmDelete(e.target.checked)} 
                style={{ width: '20px', height: '20px', cursor: 'pointer', accentColor: 'var(--primary)' }}
              />
            </div>
          </div>

          {/* Security section with password linking and eye toggle */}
          {isGoogleUser && !hasPasswordProvider && (
            <>
              <div className="divider">Security & Sign-in</div>
              <form onSubmit={handleLinkPassword} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <div className="field">
                  <label className="field-label">Set Password for Email Login</label>
                  <div className="password-field-wrap">
                    <input
                      type={showPassword ? "text" : "password"}
                      className="control"
                      placeholder="Enter new password (min. 6 characters)"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                    />
                    <button 
                      type="button" 
                      className="password-toggle-btn"
                      onClick={() => setShowPassword(!showPassword)}
                      title={showPassword ? "Hide password" : "Show password"}
                    >
                      {showPassword ? (
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                          <line x1="1" y1="1" x2="23" y2="23"></line>
                        </svg>
                      ) : (
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                          <circle cx="12" cy="12" r="3"></circle>
                        </svg>
                      )}
                    </button>
                  </div>
                </div>
                <button type="submit" className="btn btn-primary btn-sm" disabled={isLinking}>
                  {isLinking ? 'Linking Password...' : 'Link Email & Password Login'}
                </button>
              </form>
            </>
          )}

          <div className="divider">Account Actions</div>

          <div style={{ display: 'flex', gap: '10px' }}>
            <button 
              type="button" 
              className="btn btn-ghost" 
              onClick={() => {
                if (window.confirm("Are you sure you want to log out?")) {
                  onLogout();
                }
              }} 
              style={{ flex: 1 }}
            >
              <Icons.Logout /> Log Out
            </button>
            <button type="button" className="btn btn-danger" onClick={handleResetData} style={{ flex: 1 }}>
              Reset Local Settings
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}