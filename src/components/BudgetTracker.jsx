import React, { useState, useEffect } from 'react';
import { CATEGORY_COLORS, CATEGORY_ICONS } from './CustomChart';

const BudgetTracker = ({ transactions, budgets, onUpdateBudget }) => {
  const [editingCategory, setEditingCategory] = useState(null);
  const [tempLimit, setTempLimit] = useState('');

  // SEO Optimization
  useEffect(() => {
    document.title = "Sistem Anggaran (Budgets) - Financely";
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute("content", "Kelola batas anggaran pengeluaran bulanan Anda. Pantau pengeluaran per kategori agar tidak melebihi budget yang telah ditetapkan.");
    } else {
      const meta = document.createElement('meta');
      meta.name = "description";
      meta.content = "Kelola batas anggaran pengeluaran bulanan Anda. Pantau pengeluaran per kategori agar tidak melebihi budget yang telah ditetapkan.";
      document.head.appendChild(meta);
    }
  }, []);

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

  const totalLimit = Object.values(budgets).reduce((sum, val) => sum + Number(val || 0), 0);
  const totalSpentBudgeted = categories.filter(c => budgets[c] > 0).reduce((sum, c) => sum + (categorySpent[c] || 0), 0);
  const totalRemaining = totalLimit - totalSpentBudgeted;

  const activeBudgets = categories.filter(c => budgets[c] > 0);
  const inactiveBudgets = categories.filter(c => !budgets[c] || budgets[c] === 0);

  return (
    <div className="budget-tracker-view" style={{ animation: 'fadeIn 0.3s ease-out' }}>
      <div className="view-header">
        <div>
          <h1 id="budgets-heading">Sistem Anggaran</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: '0.2rem' }}>
            Atur dan pantau batas pengeluaran untuk setiap kategori agar keuangan Anda tetap sehat.
          </p>
        </div>
      </div>

      <div className="budget-summary-cards">
        <div className="budget-summary-card">
          <span className="budget-summary-label">Total Anggaran Bulanan</span>
          <span className="budget-summary-value">{formatIDR(totalLimit)}</span>
        </div>
        <div className="budget-summary-card">
          <span className="budget-summary-label">Total Terpakai (Teranggarkan)</span>
          <span className="budget-summary-value" style={{ color: 'var(--color-expense)' }}>{formatIDR(totalSpentBudgeted)}</span>
        </div>
        <div className="budget-summary-card">
          <span className="budget-summary-label">Total Sisa Anggaran</span>
          <span className="budget-summary-value" style={{ color: totalRemaining < 0 ? 'var(--color-expense)' : 'var(--color-income)' }}>
            {formatIDR(totalRemaining)}
          </span>
        </div>
      </div>

      <section aria-labelledby="budgets-heading">
        <h2 className="section-title" id="budget-category-list-heading" style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor" style={{ color: 'var(--color-warning)' }} aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
          </svg>
          Kategori Teraplikasi ({activeBudgets.length})
        </h2>

        {activeBudgets.length === 0 && (
          <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>Belum ada anggaran yang diatur. Silakan atur anggaran dari daftar di bawah.</p>
        )}

        <div className="budget-cards-grid" style={{ marginBottom: '3rem' }}>
          {activeBudgets.map(category => {
            const spent = categorySpent[category] || 0;
            const limit = budgets[category] || 0;
            const percentage = limit > 0 ? Math.min((spent / limit) * 100, 100) : 0;
            const isOverBudget = spent > limit;
            const remaining = limit - spent;

            let barColor = 'var(--color-income)';
            if (percentage >= 100) barColor = 'var(--color-expense)';
            else if (percentage >= 75) barColor = 'var(--color-warning)';

            const categoryColor = CATEGORY_COLORS[category];

            return (
              <div key={category} className="budget-card">
                <div className="budget-card-header">
                  <div className="budget-card-title">
                    <div className="budget-card-icon" style={{ backgroundColor: `${categoryColor}15`, color: categoryColor }}>
                      {CATEGORY_ICONS[category]}
                    </div>
                    {category}
                  </div>
                  <button className="budget-card-action" onClick={() => handleEditClick(category, limit)} title="Ubah Anggaran">
                    ✏️
                  </button>
                </div>

                {editingCategory === category ? (
                  <div className="budget-edit-form">
                    <input
                      type="number"
                      className="form-control"
                      placeholder="Batas Anggaran (Rp)"
                      value={tempLimit}
                      onChange={(e) => setTempLimit(e.target.value)}
                      autoFocus
                    />
                    <div className="budget-edit-actions">
                      <button className="btn btn-primary" style={{ flex: 1, padding: '0.5rem', border: 'none' }} onClick={() => handleSaveClick(category)}>Simpan</button>
                      <button className="btn btn-secondary" style={{ flex: 1, padding: '0.5rem' }} onClick={() => setEditingCategory(null)}>Batal</button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="budget-remaining">
                      <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Sisa Anggaran</span>
                      <span className="budget-remaining-value" style={{ color: isOverBudget ? 'var(--color-expense)' : 'var(--text-primary)' }}>
                        {isOverBudget ? `Overbudget ${formatIDR(spent - limit)}` : formatIDR(remaining)}
                      </span>
                    </div>

                    <div>
                      <div className="budget-track">
                        <div 
                          className="budget-fill"
                          style={{ 
                            width: `${percentage}%`, 
                            backgroundColor: barColor,
                            boxShadow: `0 0 10px ${barColor}`
                          }}
                        />
                      </div>
                      <div className="budget-meta" style={{ marginTop: '0.5rem' }}>
                        <span>Terpakai: {formatIDR(spent)}</span>
                        <span>Batas: {formatIDR(limit)}</span>
                      </div>
                    </div>
                  </>
                )}
              </div>
            );
          })}
        </div>

        <h2 className="section-title" style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span style={{ fontSize: '1.2rem' }}>💡</span>
          Kategori Tersedia
        </h2>

        <div className="budget-cards-grid">
          {inactiveBudgets.map(category => (
            editingCategory === category ? (
              <div key={category} className="budget-card" style={{ borderColor: 'var(--color-primary)' }}>
                <div className="budget-card-title" style={{ marginBottom: '1rem' }}>
                  <div className="budget-card-icon" style={{ backgroundColor: `${CATEGORY_COLORS[category]}15`, color: CATEGORY_COLORS[category] }}>
                    {CATEGORY_ICONS[category]}
                  </div>
                  {category}
                </div>
                <div className="budget-edit-form">
                  <input
                    type="number"
                    className="form-control"
                    placeholder="Batas Anggaran (Rp)"
                    value={tempLimit}
                    onChange={(e) => setTempLimit(e.target.value)}
                    autoFocus
                  />
                  <div className="budget-edit-actions">
                    <button className="btn btn-primary" style={{ flex: 1, padding: '0.5rem', border: 'none' }} onClick={() => handleSaveClick(category)}>Simpan</button>
                    <button className="btn btn-secondary" style={{ flex: 1, padding: '0.5rem' }} onClick={() => setEditingCategory(null)}>Batal</button>
                  </div>
                </div>
              </div>
            ) : (
              <div 
                key={category} 
                className="budget-card budget-card-inactive"
                onClick={() => handleEditClick(category, 0)}
              >
                <div className="budget-card-icon" style={{ backgroundColor: `${CATEGORY_COLORS[category]}15`, color: CATEGORY_COLORS[category], margin: '0 auto 0.5rem' }}>
                  {CATEGORY_ICONS[category]}
                </div>
                <div style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{category}</div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Klik untuk atur anggaran</div>
              </div>
            )
          ))}
        </div>
      </section>
    </div>
  );
};

export default BudgetTracker;
