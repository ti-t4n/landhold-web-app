import React from 'react';
import useAuth from './hooks/useAuth';
import AuthHero from './components/AuthHero';
import Workspace from './components/Workspace';

export default function App() {
  const authHook = useAuth();
  const { user, loading, needsVerification, refresh, logout } = authHook;

  if (loading) {
    return (
      <div className="app-shell hero-section app-loader-wrap">
        <span className="brand app-loader-brand">LandHold</span>
        <div className="spinner-ring"></div>
      </div>
    );
  }

  if (!user || needsVerification) {
    return (
      <AuthHero 
        pendingUser={needsVerification ? user : null} 
        onRefresh={refresh} 
        onLogout={logout} 
        authHook={authHook} 
      />
    );
  }

  return <Workspace key={user.uid} user={user} onLogout={logout} />;
}