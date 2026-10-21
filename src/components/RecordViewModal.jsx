import React, { useState } from 'react';
import { Icons } from '../constants/icons';

export default function RecordViewModal({ record, onClose, onUpdate, onDelete, symbol, quickSuggestions, onEdit }) {
  const [paymentInput, setPaymentInput] = useState('');
  const [undoStack, setUndoStack] = useState([]);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [dismissSuggestion, setDismissSuggestion] = useState(false);

  const payments = record.payments || [];
  const totalPaid = parseFloat(record.totalPaid || 0);
  const rate = parseFloat(record.rentRate || 0);

  // Replace the old checkIsOverdue in RecordViewModal.jsx with this:
  const checkIsOverdue = (record) => {
    if (!record || !record.startDate || !record.rentRate) return false;
    
    const start = new Date(record.startDate);
    const now = new Date();
    
    if (now < start) return false;

    let monthsElapsed = (now.getFullYear() - start.getFullYear()) * 12 + (now.getMonth() - start.getMonth());
    if (now.getDate() < start.getDate()) {
      monthsElapsed -= 1;
    }
    
    let intervalMonths = 1;
    const interval = record.paymentInterval || 'Monthly';
    if (interval === 'Quarterly') intervalMonths = 3;
    if (interval === 'Bi-Annual') intervalMonths = 6;
    if (interval === 'Yearly') intervalMonths = 12;

    const billingCyclesDue = Math.max(1, Math.floor(monthsElapsed / intervalMonths) + 1);
    const rate = parseFloat(record.rentRate || 0);
    const totalPaid = parseFloat(record.totalPaid || 0);

    return totalPaid < (billingCyclesDue * rate);
  };

  const isOverdue = checkIsOverdue(record);

  const handleAddPayment = (amount) => {
    const val = parseFloat(amount);
    if (isNaN(val) || val <= 0) return;

    const newPayment = { amount: val, date: new Date().toISOString() };
    const updatedPayments = [...payments, newPayment];
    const newTotalPaid = totalPaid + val;

    setUndoStack([...undoStack, { payments, totalPaid }]);

    onUpdate({
      ...record,
      payments: updatedPayments,
      totalPaid: newTotalPaid
    });
    setPaymentInput('');
  };

  const handleUndo = () => {
    if (undoStack.length === 0) return;
    const lastState = undoStack[undoStack.length - 1];
    setUndoStack(undoStack.slice(0, -1));

    onUpdate({
      ...record,
      payments: lastState.payments,
      totalPaid: lastState.totalPaid
    });
  };

  // Safe helper to render tenant names
  const renderTenantNames = () => {
    if (Array.isArray(record.tenants) && record.tenants.length > 0) {
      return record.tenants.map(t => typeof t === 'string' ? t : t.name).filter(Boolean).join(', ');
    }
    return record.tenantName || 'None';
  };

  return (
    <div className="overlay overlay-top" onClick={onClose}>
      <div className="sheet modal modal-wide" onClick={e => e.stopPropagation()}>
        <div className="modal-head">
          <div className="modal-titles">
            <h2>{record.propertyName || record.property}</h2>
            <p>{record.propertyAddress || record.address || 'No address provided'}</p>
          </div>
          <div className="head-actions" style={{ display: 'flex', gap: '8px' }}>
            {onEdit && (
              <button className="btn btn-ghost btn-sm" onClick={() => onEdit(record)}>
                Edit Record
              </button>
            )}
            <button className="btn btn-ghost btn-sm" onClick={() => setShowDeleteConfirm(true)}>
              Delete
            </button>
            <button className="icon-btn" onClick={onClose}><Icons.Close /></button>
          </div>
        </div>

        <div className="modal-body view-grid">
          <div>
            <div className="section-title">Lease Information</div>
            <dl className="facts">
              <dt>Purpose</dt><dd>{record.leasePurpose || 'Personal'}</dd>
              <dt>Tenants</dt><dd>{renderTenantNames()}</dd>
              {record.leasePurpose === 'Business' && (
                <>
                  <dt>Enterprise</dt><dd>{record.enterpriseDescription || record.description || 'N/A'}</dd>
                </>
              )}
              <dt>Start Date</dt><dd>{record.startDate || 'N/A'}</dd>
              <dt>End Date</dt>
              <dd>
                {record.endDate || 'Indefinite'} 
                {isOverdue && <span style={{ color: '#ef4444', fontWeight: '600', marginLeft: '6px' }}>(Overdue)</span>}
              </dd>
              <dt>Payment Rate</dt><dd>{symbol}{rate.toLocaleString()} / {record.paymentInterval || 'Monthly'}</dd>
            </dl>

            <div className="section-title" style={{ marginTop: '24px' }}>Financial Register</div>
            <div className="stat-grid">
              <div className="stat">
                <span>Total Paid</span>
                <strong>{symbol}{totalPaid.toLocaleString()}</strong>
              </div>
              <div className="stat">
                <span>Billing Interval</span>
                <strong>{record.paymentInterval || 'Monthly'}</strong>
              </div>
            </div>

            {quickSuggestions && isOverdue && !dismissSuggestion && rate > 0 && (
              <div className="bubble" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px' }}>
                <span>💡 Rent is overdue. Add 1 installment ({symbol}{rate.toLocaleString()}) to top up?</span>
                <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                  <button className="btn btn-primary btn-sm" onClick={() => handleAddPayment(rate)}>Add Instant</button>
                  <button className="icon-btn icon-btn-sm" onClick={() => setDismissSuggestion(true)} title="Dismiss">
                    <Icons.Close />
                  </button>
                </div>
              </div>
            )}
          </div>

          <div>
            <div className="section-title">Log Payment</div>
            <div className="pay-form">
              <div className="field">
                <input 
                  type="number" 
                  step="any" 
                  className="control" 
                  placeholder="Enter payment amount..." 
                  value={paymentInput}
                  onChange={e => setPaymentInput(e.target.value)}
                />
              </div>
              <button className="btn btn-primary" onClick={() => handleAddPayment(paymentInput)}>Record Payment</button>
            </div>

            <div className="history">
              <div className="history-head" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div className="section-title" style={{ margin: 0 }}>Transaction History</div>
                <button className="btn btn-ghost btn-sm" onClick={handleUndo} disabled={undoStack.length === 0}>
                  Undo ({undoStack.length})
                </button>
              </div>
              <div className="ledger-wrap" style={{ marginTop: '12px' }}>
                <table className="ledger ledger-compact">
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th className="num">Amount Paid</th>
                    </tr>
                  </thead>
                  <tbody>
                    {payments.length === 0 ? (
                      <tr><td colSpan="2" style={{ textAlign: 'center', color: 'var(--text-faint)' }}>No payments recorded yet.</td></tr>
                    ) : (
                      payments.slice().reverse().map((p, idx) => (
                        <tr key={idx}>
                          <td>{new Date(p.date).toLocaleDateString()}</td>
                          <td className="num" style={{ color: 'var(--green)' }}>+{symbol}{parseFloat(p.amount).toLocaleString()}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>

      {showDeleteConfirm && (
        <div className="overlay overlay-top">
          <div className="sheet confirm">
            <h3>Delete Property Record?</h3>
            <p>This action cannot be undone. All payment history for {record.propertyName} will be removed.</p>
            <div className="confirm-actions">
              <button className="btn btn-ghost" onClick={() => setShowDeleteConfirm(false)}>Cancel</button>
              <button className="btn btn-danger" onClick={() => onDelete(record.id)}>Confirm Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}