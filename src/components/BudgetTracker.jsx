import React, { useState } from 'react';
import { CATEGORY_COLORS, CATEGORY_ICONS } from './CustomChart';

const BudgetTracker = ({ transactions, budgets, onUpdateBudget }) => {
  const [editingCategory, setEditingCategory] = useState(null);
  const [tempLimit, setTempLimit] = useState('');

  // Categories list
  const categories = Object.keys(CATEGORY_ICONS);

  // Formatting currency helper
  const formatIDR = (num) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0
    }).format(num);
  };

  // Calculate expenses spent by category
  const expenses = transactions.filter(t => t.type === 'expense');
  const categorySpent = expenses.reduce((acc, t) => {
    acc[t.category] = (acc[t.category] || 0) + Number(t.amount);
    return acc;
  }, {});

  const handleEditClick = (category, currentLimit) => {
    setEditingCategory(category);
    setTempLimit(currentLimit || '');
  };

  const handleSaveClick = (category) => {
    const limit = Number(tempLimit);
    if (!isNaN(limit) && limit >= 0) {
      onUpdateBudget(category, limit);
    }
    setEditingCategory(null);
    setTempLimit('');
  };

  return (
    <div className="glass-card">
      <h3 className="section-title">
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" style={{ color: 'var(--color-warning)' }}>
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
        </svg>
        Batas Anggaran Kategori
      </h3>

      <div className="budget-list">
        {categories.map(category => {
          const spent = categorySpent[category] || 0;
          const limit = budgets[category] || 0;
          const percentage = limit > 0 ? Math.min((spent / limit) * 100, 100) : 0;
          const isOverBudget = spent > limit && limit > 0;

          // Progress bar color based on usage
          let barColor = 'var(--color-income)'; // Green
          let glowColor = 'var(--color-income-glow)';
          if (percentage >= 100) {
            barColor = 'var(--color-expense)'; // Red
            glowColor = 'var(--color-expense-glow)';
          } else if (percentage >= 75) {
            barColor = 'var(--color-warning)'; // Yellow
            glowColor = 'var(--color-warning-glow)';
          }

          const categoryColor = CATEGORY_COLORS[category];

          return (
            <div key={category} className="budget-item">
              <div className="budget-info">
                <div className="category-label" style={{ color: categoryColor }}>
                  <span>{CATEGORY_ICONS[category]}</span>
                  <span>{category}</span>
                </div>
                <div className="amounts">
                  <span>{formatIDR(spent)}</span>
                  {limit > 0 ? (
                    <>
                      {` / `}
                      <span 
                        onClick={() => handleEditClick(category, limit)} 
                        style={{ cursor: 'pointer', textDecoration: 'underline', color: 'var(--text-muted)' }}
                        title="Klik untuk ubah anggaran"
                      >
                        {formatIDR(limit)}
                      </span>
                    </>
                  ) : (
                    <>
                      {` / `}
                      <span 
                        onClick={() => handleEditClick(category, 0)} 
                        style={{ cursor: 'pointer', fontStyle: 'italic', color: 'var(--text-muted)', fontSize: '0.8rem' }}
                      >
                        Atur Budget
                      </span>
                    </>
                  )}
                </div>
              </div>

              {limit > 0 ? (
                <div className="progress-track" style={{ boxShadow: `0 0 10px ${glowColor}` }}>
                  <div 
                    className="progress-bar"
                    style={{ 
                      width: `${percentage}%`, 
                      backgroundColor: barColor,
                      boxShadow: `0 0 8px ${barColor}`
                    }}
                  />
                </div>
              ) : (
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>
                  Belum ada batasan anggaran yang diset untuk kategori ini
                </div>
              )}

              {/* Overbudget warning badge */}
              {isOverBudget && (
                <div style={{ color: 'var(--color-expense)', fontSize: '0.75rem', marginTop: '0.4rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                  ⚠️ Melebihi anggaran sebesar {formatIDR(spent - limit)}!
                </div>
              )}

              {/* Compact Inline Edit Form */}
              {editingCategory === category && (
                <div className="budget-form-compact">
                  <input
                    type="number"
                    className="form-control"
                    placeholder="Batas Anggaran (Rp)"
                    value={tempLimit}
                    onChange={(e) => setTempLimit(e.target.value)}
                    style={{ padding: '0.4rem 0.75rem', fontSize: '0.85rem' }}
                    autoFocus
                  />
                  <button 
                    className="btn-primary" 
                    onClick={() => handleSaveClick(category)}
                    style={{ padding: '0.4rem 0.85rem', width: 'auto', fontSize: '0.85rem', boxShadow: 'none' }}
                  >
                    Simpan
                  </button>
                  <button 
                    className="toggle-btn" 
                    onClick={() => setEditingCategory(null)}
                    style={{ padding: '0.4rem 0.85rem', fontSize: '0.85rem' }}
                  >
                    Batal
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default BudgetTracker;
