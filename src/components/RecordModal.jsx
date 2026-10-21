import React, { useState, useEffect } from 'react';
import { Icons } from '../constants/icons';

const EMPTY_FORM = {
  propertyName: '',
  propertyAddress: '',
  tenants: [{ name: '', phone: '' }],
  isOccupied: true,
  rentRate: '',
  paymentInterval: 'Monthly',
  leasePurpose: 'Personal',
  enterpriseDescription: '',
  startDate: '',
  endDate: '',
  totalPaid: 0
};

export default function RecordModal({ isOpen, onClose, onSave, editingItem, symbol }) {
  const [formData, setFormData] = useState(EMPTY_FORM);

  useEffect(() => {
    if (editingItem) {
      // Normalize tenants structure if it's legacy single-tenant format
      let tenantsList = editingItem.tenants;
      if (!tenantsList || tenantsList.length === 0) {
        tenantsList = [{ name: editingItem.tenantName || '', phone: editingItem.tenantPhone || '' }];
      }
      setFormData({ ...EMPTY_FORM, ...editingItem, tenants: tenantsList });
    } else {
      setFormData(EMPTY_FORM);
    }
  }, [editingItem, isOpen]);

  if (!isOpen) return null;

  const handleTenantChange = (index, field, value) => {
    const updated = [...formData.tenants];
    updated[index][field] = value;
    setFormData({ ...formData, tenants: updated });
  };

  const addTenantField = () => {
    setFormData({ ...formData, tenants: [...formData.tenants, { name: '', phone: '' }] });
  };

  const removeTenantField = (index) => {
    const updated = formData.tenants.filter((_, i) => i !== index);
    setFormData({ ...formData, tenants: updated.length ? updated : [{ name: '', phone: '' }] });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.propertyName.trim()) return;
    onSave(formData);
  };

  return (
    <div className="overlay overlay-top" onClick={onClose}>
      <div className="sheet modal modal-wide" onClick={(e) => e.stopPropagation()}>
        <div className="modal-head">
          <div className="modal-titles">
            <h2>{editingItem ? 'Edit Property Record' : 'Add Property Record'}</h2>
          </div>
          <button className="icon-btn" onClick={onClose}><Icons.Close /></button>
        </div>

        <form onSubmit={handleSubmit} className="modal-body form">
          <div className="field">
            <label className="field-label">Property / Unit Name</label>
            <input
              type="text"
              className="control"
              value={formData.propertyName}
              onChange={(e) => setFormData({ ...formData, propertyName: e.target.value })}
              required
              placeholder="e.g. Apt 4B, Sunrise Suites"
            />
          </div>

          <div className="field">
            <label className="field-label">Property Address</label>
            <input
              type="text"
              className="control"
              value={formData.propertyAddress}
              onChange={(e) => setFormData({ ...formData, propertyAddress: e.target.value })}
              placeholder="e.g. 12 Freedom Way, Lekki"
            />
          </div>

          <div className="grid-2">
            <div className="field">
              <label className="field-label">Lease Purpose</label>
              <select
                className="control"
                value={formData.leasePurpose || 'Personal'}
                onChange={(e) => setFormData({ ...formData, leasePurpose: e.target.value })}
              >
                <option value="Personal">Personal / Living</option>
                <option value="Business">Business / Commercial</option>
              </select>
            </div>
            {formData.leasePurpose === 'Business' && (
              <div className="field">
                <label className="field-label">Enterprise Description</label>
                <input
                  type="text"
                  className="control"
                  value={formData.enterpriseDescription || ''}
                  onChange={(e) => setFormData({ ...formData, enterpriseDescription: e.target.value })}
                  placeholder="e.g. Coffee Shop & Bakery"
                />
              </div>
            )}
          </div>

          <label className="check">
            <input
              type="checkbox"
              checked={formData.isOccupied}
              onChange={(e) => setFormData({ ...formData, isOccupied: e.target.checked })}
            />
            Currently Occupied
          </label>

          {formData.isOccupied && (
            <div style={{ background: 'rgba(0,0,0,0.02)', padding: '12px', borderRadius: '8px', border: '1px solid var(--border)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <label className="field-label" style={{ margin: 0 }}>Tenants</label>
                <button type="button" className="btn btn-ghost btn-sm" onClick={addTenantField}>+ Add Tenant</button>
              </div>
              {formData.tenants.map((t, index) => (
                <div key={index} style={{ display: 'flex', gap: '8px', marginBottom: '8px', alignItems: 'center' }}>
                  <input
                    type="text"
                    className="control"
                    placeholder="Tenant Name"
                    value={t.name}
                    onChange={(e) => handleTenantChange(index, 'name', e.target.value)}
                  />
                  <input
                    type="tel"
                    className="control"
                    placeholder="Phone Number"
                    value={t.phone}
                    onChange={(e) => handleTenantChange(index, 'phone', e.target.value)}
                  />
                  {formData.tenants.length > 1 && (
                    <button type="button" className="icon-btn" onClick={() => removeTenantField(index)}><Icons.Close /></button>
                  )}
                </div>
              ))}
            </div>
          )}

          <div className="grid-2">
            <div className="field">
              <label className="field-label">Start Date</label>
              <input
                type="date"
                className="control"
                value={formData.startDate || ''}
                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
              />
            </div>
            <div className="field">
              <label className="field-label">End / Due Date</label>
              <input
                type="date"
                className="control"
                value={formData.endDate || ''}
                onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
              />
            </div>
          </div>

          <div className="grid-2">
            <div className="field">
              <label className="field-label">Rent Rate ({symbol})</label>
              <input
                type="number"
                step="any"
                className="control"
                value={formData.rentRate}
                onChange={(e) => setFormData({ ...formData, rentRate: e.target.value })}
                placeholder="0.00"
              />
            </div>
            <div className="field">
              <label className="field-label">Billing Interval</label>
              <select
                className="control"
                value={formData.paymentInterval || 'Monthly'}
                onChange={(e) => setFormData({ ...formData, paymentInterval: e.target.value })}
              >
                <option value="Monthly">Monthly</option>
                <option value="Quarterly">Quarterly</option>
                <option value="Bi-Annual">Bi-Annual</option>
                <option value="Yearly">Yearly</option>
              </select>
            </div>
          </div>

          <div className="modal-foot" style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '16px' }}>
            <button type="button" className="btn btn-ghost" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary">
              {editingItem ? 'Save Changes' : 'Create Record'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}