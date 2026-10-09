import React from 'react';
import { Icons } from '../constants/icons';

export default function PropertyCard({ item, symbol, onEdit, onPaid, onDelete }) {
  const today = new Date().toISOString().split('T')[0];
  const isOverdue = item.isOccupied && item.dueDate && item.dueDate < today && parseFloat(item.amountOwed || 0) > 0;

  return (
    <div className={`record-card ${!item.isOccupied ? 'is-vacant' : ''}`}>
      <div className="record-top">
        <h3>{item.property}</h3>
        <div className="badge-group">
          <span className={`status-badge ${item.isOccupied ? 'occupied' : 'vacant'}`}>
            {item.isOccupied ? 'Occupied' : 'Vacant'}
          </span>
          {isOverdue && <span className="overdue-tag">Overdue</span>}
        </div>
      </div>
      <div className="record-details">
        {item.isOccupied && (
          <p><strong>Tenant</strong> <span>{item.tenantName}</span></p>
        )}
        <p>
          <strong>Owed</strong>
          <span className="money">{symbol}{parseFloat(item.amountOwed || 0).toLocaleString()}</span>
        </p>
        <p><strong>Due</strong> <span>{item.dueDate || 'N/A'}</span></p>
        <p>
          <strong>Forward</strong>
          <span className="money">{symbol}{parseFloat(item.overdraftForwardPayment || 0).toLocaleString()}</span>
        </p>
      </div>
      <div className="record-actions">
        <button className="btn-sm btn-edit" onClick={() => onEdit(item)}>Edit</button>
        {parseFloat(item.amountOwed || 0) > 0 && (
          <button className="btn-sm btn-paid" onClick={() => onPaid(item)}>
            <Icons.Check /> Paid
          </button>
        )}
        <button className="btn-sm btn-delete" onClick={() => onDelete(item)} aria-label={`Delete ${item.property}`}>
          Delete
        </button>
      </div>
    </div>
  );
}