import React, { useState } from 'react';
import { Icons } from '../constants/icons';

export default function AuthSlider({ hasAccount, storedPasscode, onSuccess, triggerToast }) {
  const [showLoginPanel, setShowLoginPanel] = useState(false);
  const [showContactBubble, setShowContactBubble] = useState(false);
  const [inputPasscode, setInputPasscode] = useState('');
  const [authError, setAuthError] = useState('');

  const handleCopy = (text) => {
    navigator.clipboard.writeText(text);
    triggerToast(`Copied: ${text}`);
    setShowContactBubble(false);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!hasAccount) {
      if (inputPasscode.trim().length < 4) {
        setAuthError('Passcode must be at least 4 characters.');
        return;
      }
      onSuccess(inputPasscode);
    } else {
      if (inputPasscode === storedPasscode) {
        onSuccess();
      } else {
        setAuthError('Incorrect passcode.');
      }
    }
  };

  return (
    <div className={`auth-slider ${showLoginPanel ? 'show-login' : ''}`}>
      {/* Slide 1: Hero / Onboarding */}
      <div className="slide-panel">
        <section className="hero-section">
          <h1 className="hero-title">LandHold</h1>
          <p className="hero-subtitle">
            A simple register for every unit, tenant, and payment you're keeping track of.
          </p>

          <div className="mid-group">
            <button
              type="button"
              className="btn btn-primary"
              onClick={() => setShowLoginPanel(true)}
            >
              {hasAccount ? 'Sign in' : 'Get Started'}
            </button>
          </div>

          <div className="base-group">
            <div className="contact-wrapper">
              <div className={`bubble ${showContactBubble ? 'is-visible' : ''}`}>
                <span className="bubble-label">Support</span>
                <div className="copy-item" onClick={() => handleCopy('+234 809 083 9412')}>
                  📞 +234 809 083 9412
                </div>
                <div className="copy-item" onClick={() => handleCopy('info@fortranhouse.com')}>
                  📧 info@fortranhouse.com
                </div>
              </div>

              <button
                type="button"
                className="pill-btn"
                onClick={() => setShowContactBubble(!showContactBubble)}
              >
                <span className="icon-circle"><Icons.Headset /></span>
                <span>Contact Info</span>
              </button>
            </div>
          </div>
        </section>
      </div>

      {/* Slide 2: Login / Auth Panel */}
      <div className="slide-panel">
        <section className="login-section">
          <button
            type="button"
            className="back-btn"
            onClick={() => setShowLoginPanel(false)}
          >
            <Icons.Back /> Back
          </button>

          <div className="login-header">
            <h2>{hasAccount ? 'Welcome back' : 'Create Account'}</h2>
            <p>
              {hasAccount
                ? 'Enter your passcode to unlock records.'
                : 'Create a local passcode to secure your register.'}
            </p>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>{hasAccount ? 'Passcode' : 'New Passcode'}</label>
              <input
                type="password"
                className="form-input"
                placeholder="••••"
                value={inputPasscode}
                onChange={(e) => setInputPasscode(e.target.value)}
                required
              />
            </div>

            {authError && <div className="error-msg">{authError}</div>}

            <button type="submit" className="btn btn-primary">
              {hasAccount ? 'Unlock Workspace' : 'Set Passcode'}
            </button>
          </form>
        </section>
      </div>
    </div>
  );
}