import React, { useState, useEffect } from 'react';
import { db } from '../firebase';
import { collection, doc, getDocs, addDoc, updateDoc, deleteDoc } from 'firebase/firestore';
import { Icons, CURRENCIES } from '../constants/icons';
import RecordModal from './RecordModal';
import RecordViewModal from './RecordViewModal';
import SettingsModal from './SettingsModal';

export default function Workspace({ user, onLogout }) {
  const [records, setRecords] = useState([]);
  const [settings, setSettings] = useState({ currency: 'NGN', confirmDelete: true, quickSuggestions: true });
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState(null);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  const triggerToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3000);
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const recSnap = await getDocs(collection(db, `users/${user.uid}/records`));
        setRecords(recSnap.docs.map(d => ({ id: d.id, ...d.data() })));
      } catch (err) {
        console.error("Error fetching data:", err);
      }
    };
    fetchData();
  }, [user.uid]);

  const handleSaveRecord = async (formData) => {
    try {
      if (formData.id) {
        const ref = doc(db, `users/${user.uid}/records`, formData.id);
        const { id, ...dataToSave } = formData;
        await updateDoc(ref, dataToSave);

        const updatedItem = { id: formData.id, ...formData };
        setRecords(prev => prev.map(r => r.id === formData.id ? updatedItem : r));
        
        if (selectedRecord && selectedRecord.id === formData.id) {
          setSelectedRecord(updatedItem);
        }
        setIsCreateOpen(false);
        setEditingRecord(null);
        triggerToast('Record updated successfully');
      } else {
        const ref = collection(db, `users/${user.uid}/records`);
        const { id, ...dataToSave } = formData;
        const docRef = await addDoc(ref, { ...dataToSave, createdAt: new Date().toISOString() });
        
        setRecords(prev => [...prev, { id: docRef.id, ...formData }]);
        setIsCreateOpen(false);
        triggerToast('Record created successfully');
      }
    } catch (err) {
      console.error("Error saving record:", err);
      triggerToast('Failed to save record');
    }
  };

  const handleDeleteRecord = async (id) => {
    try {
      await deleteDoc(doc(db, `users/${user.uid}/records`, id));
      setRecords(records.filter(r => r.id !== id));
      setSelectedRecord(null);
      triggerToast('Record deleted');
    } catch (err) {
      console.error("Error deleting record:", err);
    }
  };

  const checkIsOverdue = (record) => {
    if (!record || !record.startDate || !record.rentRate) return false;
    
    const start = new Date(record.startDate);
    const now = new Date();
    
    if (now < start) return false;

    // Calculate full months elapsed based on calendar years and months
    let monthsElapsed = (now.getFullYear() - start.getFullYear()) * 12 + (now.getMonth() - start.getMonth());
    
    // Adjust if the current day of month hasn't reached the start day yet
    if (now.getDate() < start.getDate()) {
      monthsElapsed -= 1;
    }
    
    // Account for payment intervals (Monthly = 1 month per cycle, Quarterly = 3, etc.)
    let intervalMonths = 1;
    const interval = record.paymentInterval || 'Monthly';
    if (interval === 'Quarterly') intervalMonths = 3;
    if (interval === 'Bi-Annual') intervalMonths = 6;
    if (interval === 'Yearly') intervalMonths = 12;

    // How many full billing periods *should* have been paid by now (at least 1 if start date has passed)
    const billingCyclesDue = Math.max(1, Math.floor(monthsElapsed / intervalMonths) + 1);

    const rate = parseFloat(record.rentRate || 0);
    const totalPaid = parseFloat(record.totalPaid || 0);

    const expectedAmountDue = billingCyclesDue * rate;

    // It's overdue if total paid is less than what is expected for the elapsed cycles
    return totalPaid < expectedAmountDue;
  };

  const symbol = CURRENCIES[settings.currency]?.symbol || '₦';

  const totalOwedSum = records.reduce((sum, r) => sum + parseFloat(r.totalPaid || 0), 0);
  const occupiedCount = records.filter(r => r.isOccupied).length;

  const filteredRecords = records.filter(r => {
    const query = searchQuery.toLowerCase();
    const name = (r.propertyName || r.property || '').toLowerCase();
    const address = (r.propertyAddress || r.address || '').toLowerCase();
    const tenant = (
      Array.isArray(r.tenants) 
        ? r.tenants.map(t => typeof t === 'string' ? t : t.name).join(' ') 
        : (r.tenantName || '')
    ).toLowerCase();
    
    return name.includes(query) || address.includes(query) || tenant.includes(query);
  });

  return (
    <div className="app-shell hero-section">
      <header className="topbar">
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', minWidth: 0 }}>
          <span className="brand">LandHold</span>
          <span className="account" title={user.email || user.phoneNumber}>
            {user.email || user.phoneNumber || 'Authenticated User'}
          </span>
        </div>
        <div className="topbar-right">
          <button className="icon-btn icon-btn-light" onClick={() => setIsSettingsOpen(true)}>
            <Icons.Gear />
          </button>
          <button 
            className="icon-btn icon-btn-light" 
            title="Log Out"
            onClick={() => {
              if (window.confirm("Are you sure you want to log out?")) {
                onLogout();
              }
            }}
          >
            <Icons.Logout />
          </button>
        </div>
      </header>

      <main className="workspace">
        <div className="sheet kpis">
          <div className="kpi">
            <span className="kpi-label">Total Properties</span>
            <span className="kpi-value">{records.length}</span>
          </div>
          <div className="kpi">
            <span className="kpi-label">Occupied Units</span>
            <span className="kpi-value">{occupiedCount}</span>
          </div>
          <div className="kpi">
            <span className="kpi-label">Total Revenue Tracked</span>
            <span className="kpi-value">{symbol}{totalOwedSum.toLocaleString()}</span>
          </div>
        </div>

        <div className="sheet ledger-sheet">
          <div className="toolbar">
            <div className="search">
              <Icons.Search />
              <input 
                type="text" 
                className="control" 
                placeholder="Search property, address, or tenant..." 
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
              />
            </div>
            <button className="btn btn-primary" onClick={() => { setEditingRecord(null); setIsCreateOpen(true); }}>
              <Icons.Plus /> New Property Record
            </button>
          </div>

          <div className="ledger-wrap">
            {filteredRecords.length === 0 ? (
              <div className="empty-state">
                <p>No property records found.</p>
                <button className="btn btn-primary btn-sm" onClick={() => { setEditingRecord(null); setIsCreateOpen(true); }}>
                  Add your first record
                </button>
              </div>
            ) : (
              <table className="ledger">
                <thead>
                  <tr>
                    <th>Property Name</th>
                    <th>Address</th>
                    <th>Tenants</th>
                    <th>Purpose</th>
                    <th className="num">Rate / Interval</th>
                    <th className="num">Total Paid</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredRecords.map(r => {
                    const isOverdue = checkIsOverdue(r);
                    const tenantNames = Array.isArray(r.tenants) 
                      ? r.tenants.map(t => typeof t === 'string' ? t : t.name).join(', ') 
                      : (r.tenantName || 'None');

                    return (
                      <tr key={r.id} onClick={() => setSelectedRecord(r)}>
                        <td className="cell-property" data-label="Property Name">
                          <div className="cell-title">{r.propertyName || r.property || 'Unnamed Property'}</div>
                          <div className="cell-sub">
                            {r.isOccupied ? 'Occupied' : 'Vacant'} 
                            {isOverdue && <span style={{ color: '#ef4444', marginLeft: '6px', fontWeight: '600' }}>• Overdue</span>}
                          </div>
                        </td>
                        <td data-label="Address">{r.propertyAddress || r.address || 'N/A'}</td>
                        <td data-label="Tenants">{tenantNames}</td>
                        <td data-label="Purpose">{r.leasePurpose || 'Personal'}</td>
                        <td className="num" data-label="Rate / Interval">{symbol}{parseFloat(r.rentRate || 0).toLocaleString()} / {r.paymentInterval || 'Monthly'}</td>
                        <td className="num" data-label="Total Paid">
                          <div>{symbol}{parseFloat(r.totalPaid || 0).toLocaleString()}</div>
                          {isOverdue && (
                            <div style={{ color: '#ef4444', fontSize: '11px', fontWeight: '600' }}>
                              ⚠️ Overdue
                            </div>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </main>

      <RecordModal 
        isOpen={isCreateOpen} 
        onClose={() => { setIsCreateOpen(false); setEditingRecord(null); }} 
        onSave={handleSaveRecord} 
        editingItem={editingRecord}
        symbol={symbol} 
      />

      {selectedRecord && (
        <RecordViewModal 
          record={selectedRecord} 
          onClose={() => setSelectedRecord(null)} 
          onUpdate={handleSaveRecord} 
          onDelete={handleDeleteRecord}
          onEdit={(item) => {
            setSelectedRecord(null);
            setEditingRecord(item);
            setIsCreateOpen(true);
          }}
          symbol={symbol}
          quickSuggestions={settings.quickSuggestions}
          userId={user.uid}
        />
      )}

      <SettingsModal 
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        currency={settings.currency}
        setCurrency={(c) => setSettings({ ...settings, currency: c })}
        confirmDelete={settings.confirmDelete}
        setConfirmDelete={(val) => setSettings({ ...settings, confirmDelete: val })}
        quickSuggestions={settings.quickSuggestions}
        setQuickSuggestions={(val) => setSettings({ ...settings, quickSuggestions: val })}
        onLogout={onLogout}
        triggerToast={triggerToast}
      />

      <div className={`toast ${toastMessage ? 'show' : ''}`}>{toastMessage}</div>
    </div>
  );
}