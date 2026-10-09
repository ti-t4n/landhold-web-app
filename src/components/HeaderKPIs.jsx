import React from 'react';

export default function HeaderKPIs({ entries, symbol }) {
  const today = new Date().toISOString().split('T')[0];
  const isOverdue = (item) =>
    item.isOccupied && item.dueDate && item.dueDate < today && parseFloat(item.amountOwed || 0) > 0;

  const totalOwed = entries.reduce((sum, item) => sum + parseFloat(item.amountOwed || 0), 0);
  const occupiedCount = entries.filter((item) => item.isOccupied).length;
  const overdueCount = entries.filter(isOverdue).length;

  if (entries.length === 0) return null;

  return (
    <div className="summary-bar">
      <div className="summary-stat">
        <span className="stat-value">{symbol}{totalOwed.toLocaleString()}</span>
        <span className="stat-label">Total owed</span>
      </div>
      <div className="summary-stat">
        <span className="stat-value">{occupiedCount}/{entries.length}</span>
        <span className="stat-label">Occupied</span>
      </div>
      <div className="summary-stat stat-overdue">
        <span className="stat-value">{overdueCount}</span>
        <span className="stat-label">Overdue</span>
      </div>
    </div>
  );
}