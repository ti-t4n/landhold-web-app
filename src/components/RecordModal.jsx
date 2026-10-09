import React, { useState, useEffect } from 'react';
import { Icons } from '../constants/icons';

const EMPTY_FORM = {
  property: '',
  tenantName: '',
  isOccupied: true,
  amountOwed: '',
  dueDate: '',
  overdraftForwardPayment: ''
};

export default function RecordModal({ isOpen, onClose, onSave, editingItem, symbol }) {
  const [formData, setFormData] = useState(EMPTY_FORM);

  useEffect(() => {
    if (editingItem) setFormData({ ...editingItem });
    else setFormData(EMPTY_FORM);
  }, [editingItem, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.property.trim()) return;
    onSave(formData);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{editingItem ? 'Edit Record' : 'Add Property Record'}</h2>
          <button className="close-btn" onClick={onClose}><Icons.Close /></button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Property / Unit Name</label>
            <input
              type="text"
              className="form-input"
              value={formData.property}
              onChange={(e) => setFormData({ ...formData, property: e.target.value })}
              required
              placeholder="e.g. Apt 4B, Sunrise Suites"
            />
          </div>

          <div className="form-group">
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={formData.isOccupied}
                onChange={(e) => setFormData({ ...formData, isOccupied: e.target.checked })}
              />
              Currently Occupied
            </label>
          </div>

          {formData.isOccupied && (
            <div className="form-group">
              <label>Tenant Name</label>
              <input
                type="text"
                className="form-input"
                value={formData.tenantName}
                onChange={(e) => setFormData({ ...formData, tenantName: e.target.value })}
                placeholder="John Doe"
              />
            </div>
          )}

          <div className="form-row">
            <div className="form-group">
              <label>Amount Owed ({symbol})</label>
              <input
                type="number"
                step="any"
                className="form-input"
                value={formData.amountOwed}
                onChange={(e) => setFormData({ ...formData, amountOwed: e.target.value })}
                placeholder="0.00"
              />
            </div>
            <div className="form-group">
              <label>Due Date</label>
              <input
                type="date"
                className="form-input"
                value={formData.dueDate}
                onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
              />
            </div>
          </div>

          <div className="form-group">
            <label>Forward Payment / Credit ({symbol})</label>
            <input
              type="number"
              step="any"
              className="form-input"
              value={formData.overdraftForwardPayment}
              onChange={(e) => setFormData({ ...formData, overdraftForwardPayment: e.target.value })}
              placeholder="0.00"
            />
          </div>

          <div className="form-actions">
            <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary">
              {editingItem ? 'Save Changes' : 'Create Record'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}