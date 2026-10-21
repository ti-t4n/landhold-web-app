import React, { useState } from 'react';
import { Icons } from '../constants/icons';

export default function AuthHero({ pendingUser, onRefresh, onLogout, authHook }) {
  const [authMode, setAuthMode] = useState('landing'); // 'landing', 'email', 'phone', 'forgot'
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [confirmationResult, setConfirmationResult] = useState(null);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // If user registered with email but needs verification
  if (pendingUser) {
    return (
      <div className="hero-section app-shell auth-center">
        <div className="sheet auth-card">
          <h2>Verify Your Email</h2>
          <p className="lede">
            We've sent a verification link to <strong>{pendingUser.email}</strong>. Please check your inbox and verify to continue. Also check your spam folder!
          </p>
          {message && <div className="notice notice-ok">{message}</div>}
          <div className="stack" style={{ marginTop: '16px' }}>
            <button className="btn btn-primary btn-block" onClick={onRefresh}>I've Verified / Refresh</button>
            <button className="btn btn-ghost btn-block" onClick={onLogout}>Sign Out</button>
          </div>
        </div>
      </div>
    );
  }

  const handleEmailAuth = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');

    if (isSignUp) {
      if (password.length < 6) {
        setError('Password must be at least 6 characters.');
        return;
      }
      if (password !== confirmPassword) {
        setError('Passwords do not match.');
        return;
      }
    }

    setLoading(true);
    try {
      if (isSignUp) {
        await authHook.registerWithEmail(email, password);
        setMessage('Verification email sent! Check your inbox and spam folder.');
      } else {
        await authHook.loginWithEmail(email, password);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await authHook.resetPassword(email);
      setMessage('Password reset email sent! Also check your spam folder!');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handlePhoneSendOtp = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const formattedPhone = phone.startsWith('0') ? '+234' + phone.slice(1) : phone;
      const verifier = authHook.setupRecaptcha('recaptcha-container');
      const confirmation = await authHook.loginWithPhone(formattedPhone, verifier);
      setConfirmationResult(confirmation);
      setMessage('SMS OTP sent successfully!');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handlePhoneVerifyOtp = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await confirmationResult.confirm(otp);
    } catch (err) {
      setError('Invalid OTP code.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="hero-section app-shell auth-center">
      <div className="auth-layout">
        <div className="auth-pitch">
          <span className="brand">LandHold</span>
          <h1>Secure Lease & Rent Management</h1>
          <p className="pitch-copy">
            Professional register for every property unit, multi-tenant lease, automated calculation, and payment tracking.
          </p>
        </div>

        <div className="sheet auth-card">
          {authMode === 'landing' && (
            <>
              <h2>Sign In</h2>
              <p className="lede">Choose your preferred sign-in method.</p>
              
              <button 
                className="btn btn-ghost btn-block" 
                onClick={authHook.handleGoogleLogin || authHook.loginWithGoogle} 
                disabled={authHook.isLoggingIn}
                style={{ background: '#fff', color: '#14261c' }}
              >
                {authHook.isLoggingIn ? 'Connecting...' : 'Continue with Google'}
              </button>

              <div className="divider">or</div>

              <button className="btn btn-primary btn-block" onClick={() => setAuthMode('email')}>
                Continue with Email
              </button>

              <button className="btn btn-ghost btn-block" onClick={() => setAuthMode('phone')}>
                Continue with Phone (SMS)
              </button>
            </>
          )}

          {authMode === 'email' && (
            <>
              <button className="link-btn" onClick={() => { setAuthMode('landing'); setError(''); setMessage(''); }}>← Back</button>
              <h2>{isSignUp ? 'Create Account' : 'Email Sign In'}</h2>

              <form onSubmit={handleEmailAuth} className="form">
                <div className="field">
                  <label className="field-label">Email Address</label>
                  <input 
                    type="email" 
                    value={email} 
                    onChange={e => setEmail(e.target.value)} 
                    required 
                    placeholder="name@example.com" 
                  />
                </div>

                <div className="field">
                  <label className="field-label">{isSignUp ? 'Password (min. 6 characters)' : 'Password'}</label>
                  <div className="password-field-wrap">
                    <input 
                      type={showPassword ? "text" : "password"} 
                      value={password} 
                      onChange={e => setPassword(e.target.value)} 
                      required 
                      placeholder="••••••••" 
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

                {/* Confirm Password Field (Only shown during Sign Up) */}
                {isSignUp && (
                  <div className="field">
                    <label className="field-label">Confirm Password</label>
                    <div className="password-field-wrap">
                      <input 
                        type={showConfirmPassword ? "text" : "password"} 
                        value={confirmPassword} 
                        onChange={e => setConfirmPassword(e.target.value)} 
                        required 
                        placeholder="Re-enter password" 
                      />
                      <button 
                        type="button" 
                        className="password-toggle-btn"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        title={showConfirmPassword ? "Hide password" : "Show password"}
                      >
                        {showConfirmPassword ? (
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
                )}

                {error && <div className="notice notice-error">{error}</div>}
                {message && <div className="notice notice-ok">{message}</div>}

                <button type="submit" className="btn btn-primary btn-block" disabled={loading}>
                  {loading ? 'Processing...' : (isSignUp ? 'Sign Up' : 'Sign In')}
                </button>

                <div className="auth-links">
                  <button 
                    type="button" 
                    className="link-btn" 
                    onClick={() => {
                      setIsSignUp(!isSignUp);
                      setError('');
                      setMessage('');
                      setPassword('');
                      setConfirmPassword('');
                    }}
                  >
                    {isSignUp ? 'Already have an account? Sign In' : 'Need an account? Sign Up'}
                  </button>
                  {!isSignUp && (
                    <button type="button" className="link-btn" onClick={() => setAuthMode('forgot')}>
                      Forgot Password?
                    </button>
                  )}
                </div>
              </form>
            </>
          )}

          {authMode === 'forgot' && (
            <>
              <button className="link-btn" onClick={() => setAuthMode('email')}>← Back to Sign In</button>
              <h2>Reset Password</h2>
              <form onSubmit={handleForgotPassword} className="form">
                <div className="field">
                  <label className="field-label">Email Address</label>
                  <input type="email" value={email} onChange={e => setEmail(e.target.value)} required placeholder="name@example.com" />
                </div>
                {error && <div className="notice notice-error">{error}</div>}
                {message && <div className="notice notice-ok">{message}</div>}
                <button type="submit" className="btn btn-primary btn-block" disabled={loading}>Send Reset Link</button>
              </form>
            </>
          )}

          {authMode === 'phone' && (
            <>
              <button className="link-btn" onClick={() => { setAuthMode('landing'); setError(''); setMessage(''); }}>← Back</button>
              <h2>Phone Sign In</h2>
              {!confirmationResult ? (
                <form onSubmit={handlePhoneSendOtp} className="form">
                  <div className="field">
                    <label className="field-label">Phone Number</label>
                    <input type="tel" value={phone} onChange={e => setPhone(e.target.value)} required placeholder="08090839412" />
                  </div>
                  <div id="recaptcha-container"></div>
                  {error && <div className="notice notice-error">{error}</div>}
                  {message && <div className="notice notice-ok">{message}</div>}
                  <button type="submit" className="btn btn-primary btn-block" disabled={loading}>Send OTP</button>
                </form>
              ) : (
                <form onSubmit={handlePhoneVerifyOtp} className="form">
                  <div className="field">
                    <label className="field-label">Enter 6-Digit OTP</label>
                    <input type="text" value={otp} onChange={e => setOtp(e.target.value)} required placeholder="123456" />
                  </div>
                  {error && <div className="notice notice-error">{error}</div>}
                  <button type="submit" className="btn btn-primary btn-block" disabled={loading}>Verify & Sign In</button>
                </form>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}