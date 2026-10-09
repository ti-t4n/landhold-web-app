import React, { useState } from 'react';
import { Icons, CURRENCIES } from '../constants/icons';

export default function SettingsModal({
  isOpen,
  onClose,
  currency,
  setCurrency,
  confirmDelete,
  setConfirmDelete,
  passcode,
  setPasscode,
  entriesCount,
  onLogout,
  triggerToast
}) {
  const [showPasscodeChange, setShowPasscodeChange] = useState(false);
  const [oldPasscode, setOldPasscode] = useState('');
  const [newPasscode, setNewPasscode] = useState('');
  const [passcodeError, setPasscodeError] = useState('');

  if (!isOpen) return null;

  const handlePasscodeSubmit = (e) => {
    e.preventDefault();
    if (oldPasscode !== passcode) {
      setPasscodeError('Current passcode is incorrect.');
      return;
    }
    if (newPasscode.trim().length < 4) {
      setPasscodeError('New passcode must be at least 4 characters.');
      return;
    }
    setPasscode(newPasscode);
    setOldPasscode('');
    setNewPasscode('');
    setPasscodeError('');
    setShowPasscodeChange(false);
    triggerToast('Passcode updated successfully');
  };

  const handleResetData = () => {
    if (entriesCount > 0) {
      triggerToast('Cannot delete account while records exist');
      return;
    }
    localStorage.clear();
    window.location.reload();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Settings</h2>
          <button className="close-btn" onClick={onClose}><Icons.Close /></button>
        </div>

        {!showPasscodeChange ? (
          <>
            <div className="settings-list">
              <div className="setting-item">
                <label>Currency</label>
                <select
                  className="select-input"
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

              <div className="setting-item">
                <label>Confirm Deletions</label>
                <input
                  type="checkbox"
                  checked={confirmDelete}
                  onChange={(e) => setConfirmDelete(e.target.checked)}
                  style={{ width: '18px', height: '18px', accentColor: 'var(--forest)' }}
                />
              </div>

              <div className="setting-item">
                <label>Security Passcode</label>
                <button
                  type="button"
                  className="btn-sm btn-edit"
                  onClick={() => setShowPasscodeChange(true)}
                >
                  Change
                </button>
              </div>
            </div>

            <div className="settings-actions">
              <button type="button" className="btn-logout" onClick={onLogout}>
                <Icons.Logout /> Log Out
              </button>
              <button type="button" className="btn-danger-outline" onClick={handleResetData}>
                Delete All Data & Reset Account
              </button>
            </div>
          </>
        ) : (
          <form onSubmit={handlePasscodeSubmit}>
            <div className="form-group">
              <label>Current Passcode</label>
              <input
                type="password"
                className="form-input"
                value={oldPasscode}
                onChange={(e) => setOldPasscode(e.target.value)}
                required
              />
            </div>
            <div className="form-group">
              <label>New Passcode</label>
              <input
                type="password"
                className="form-input"
                value={newPasscode}
                onChange={(e) => setNewPasscode(e.target.value)}
                required
              />
            </div>

            {passcodeError && <div className="error-msg">{passcodeError}</div>}

            <div className="form-actions">
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => setShowPasscodeChange(false)}
              >
                Cancel
              </button>
              <button type="submit" className="btn btn-primary">Update Passcode</button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}