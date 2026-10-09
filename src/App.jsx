import React, { useState, useEffect } from 'react';
import { useLocalStorage } from './hooks/useLocalStorage';
import { Icons, CURRENCIES } from './constants/icons';

import HeaderKPIs from './components/HeaderKPIs';
import PropertyCard from './components/PropertyCard';
import RecordModal from './components/RecordModal';
import SettingsModal from './components/SettingsModal';
import AuthSlider from './components/AuthSlider';

import './index.css';

export default function App() {
  const [passcode, setPasscode] = useLocalStorage('landhold_passcode', '');
  const [entries, setEntries] = useLocalStorage('landhold_entries', []);
  const [currency, setCurrency] = useLocalStorage('landhold_currency', 'NGN');
  const [confirmDelete, setConfirmDelete] = useLocalStorage('landhold_confirm_delete', true);

  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [toastMsg, setToastMsg] = useState('');
  const [showToast, setShowToast] = useState(false);

  const [showRecordModal, setShowRecordModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('newest');

  const triggerToast = (msg) => {
    setToastMsg(msg);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 2200);
  };

  const symbol = CURRENCIES[currency]?.symbol || '₦';

  const visibleEntries = entries
    .filter((item) => {
      const q = searchQuery.trim().toLowerCase();
      if (!q) return true;
      return (
        item.property.toLowerCase().includes(q) ||
        (item.tenantName || '').toLowerCase().includes(q)
      );
    })
    .sort((a, b) => {
      if (sortBy === 'amount') return parseFloat(b.amountOwed || 0) - parseFloat(a.amountOwed || 0);
      if (sortBy === 'due') {
        if (!a.dueDate) return 1;
        if (!b.dueDate) return -1;
        return a.dueDate.localeCompare(b.dueDate);
      }
      return 0;
    });

  const handleSaveRecord = (formData) => {
    if (editingItem) {
      setEntries(entries.map((e) => (e.id === editingItem.id ? { ...formData, id: editingItem.id } : e)));
      triggerToast('Record updated');
    } else {
      const newEntry = { ...formData, id: Date.now() };
      setEntries([newEntry, ...entries]);
      triggerToast('Record created');
    }
    setShowRecordModal(false);
    setEditingItem(null);
  };

  const handlePaid = (item) => {
    setEntries(entries.map((e) => (e.id === item.id ? { ...e, amountOwed: '0' } : e)));
    triggerToast(`Marked "${item.property}" as paid`);
  };

  const handleDelete = (item) => {
    if (confirmDelete) {
      setDeleteTarget(item);
    } else {
      setEntries(entries.filter((e) => e.id !== item.id));
      triggerToast('Record deleted');
    }
  };

  const confirmDeleteAction = () => {
    if (deleteTarget) {
      setEntries(entries.filter((e) => e.id !== deleteTarget.id));
      setDeleteTarget(null);
      triggerToast('Record deleted');
    }
  };

  return (
    <div id="app" className="app-screen">
      <div className={`toast ${showToast ? 'show' : ''}`}>{toastMsg}</div>

      {!isAuthenticated ? (
        <AuthSlider
          hasAccount={Boolean(passcode)}
          storedPasscode={passcode}
          onSuccess={(newPass) => {
            if (newPass) setPasscode(newPass);
            setIsAuthenticated(true);
          }}
          triggerToast={triggerToast}
        />
      ) : (
        <div className="dashboard-container">
          <header className="app-header">
            <h1>LandHold</h1>
            <button
              className="icon-btn"
              onClick={() => setShowSettingsModal(true)}
              title="Settings"
              aria-label="Open settings"
            >
              <Icons.Gear />
            </button>
          </header>

          <main className="dashboard-content">
            <HeaderKPIs entries={entries} symbol={symbol} />

            <div className="records-header">
              <h2>Property Records ({entries.length})</h2>
              <button className="add-btn" onClick={() => { setEditingItem(null); setShowRecordModal(true); }}>
                <Icons.Plus /> Add Record
              </button>
            </div>

            {entries.length > 1 && (
              <div className="toolbar-row">
                <div className="search-field">
                  <Icons.Search />
                  <input
                    type="text"
                    className="search-input"
                    placeholder="Search property or tenant"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    aria-label="Search records"
                  />
                </div>
                <select className="sort-select" value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
                  <option value="newest">Newest</option>
                  <option value="due">Due soonest</option>
                  <option value="amount">Amount owed</option>
                </select>
              </div>
            )}

            {entries.length === 0 ? (
              <p className="empty-state">No records found. Tap "+ Add Record" above.</p>
            ) : visibleEntries.length === 0 ? (
              <p className="empty-state">No records match "{searchQuery}".</p>
            ) : (
              <div className="records-list">
                {visibleEntries.map((item) => (
                  <PropertyCard
                    key={item.id}
                    item={item}
                    symbol={symbol}
                    onEdit={(record) => { setEditingItem(record); setShowRecordModal(true); }}
                    onPaid={handlePaid}
                    onDelete={handleDelete}
                  />
                ))}
              </div>
            )}
          </main>

          <RecordModal
            isOpen={showRecordModal}
            onClose={() => setShowRecordModal(false)}
            onSave={handleSaveRecord}
            editingItem={editingItem}
            symbol={symbol}
          />

          <SettingsModal
            isOpen={showSettingsModal}
            onClose={() => setShowSettingsModal(false)}
            currency={currency}
            setCurrency={setCurrency}
            confirmDelete={confirmDelete}
            setConfirmDelete={setConfirmDelete}
            passcode={passcode}
            setPasscode={setPasscode}
            entriesCount={entries.length}
            onLogout={() => { setIsAuthenticated(false); setShowSettingsModal(false); }}
            triggerToast={triggerToast}
          />

          {deleteTarget && (
            <div className="modal-overlay" onClick={() => setDeleteTarget(null)}>
              <div className="confirm-modal" onClick={(e) => e.stopPropagation()}>
                <h3>Delete Record</h3>
                <p>Are you sure you want to delete "{deleteTarget.property}"? This action cannot be undone.</p>
                <div className="modal-actions">
                  <button type="button" className="btn btn-secondary" onClick={() => setDeleteTarget(null)}>
                    Cancel
                  </button>
                  <button type="button" className="btn btn-danger" onClick={confirmDeleteAction}>
                    Delete
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}