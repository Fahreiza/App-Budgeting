import React, { useState } from 'react';
import { CATEGORY_ICONS } from './CustomChart';

const TransactionList = ({ transactions, onDeleteTransaction }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('all'); // 'all', 'income', 'expense'
  const [categoryFilter, setCategoryFilter] = useState('all'); // 'all', categories...

  // Format currency
  const formatIDR = (num) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0
    }).format(num);
  };

  // Format Date for humans (e.g. 31 Mei 2026)
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('id-ID', options);
  };

  // Filter transactions
  const filteredTransactions = transactions.filter(t => {
    const matchesSearch = t.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = typeFilter === 'all' || t.type === typeFilter;
    const matchesCategory = categoryFilter === 'all' || t.category === categoryFilter;
    return matchesSearch && matchesType && matchesCategory;
  });

  return (
    <div className="glass-card">
      <h3 className="section-title">
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" style={{ color: 'var(--color-income)' }}>
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
        </svg>
        Riwayat Transaksi
      </h3>

      {/* Advanced Filters Bar */}
      <div className="list-filters">
        <div className="search-input-wrapper" style={{ position: 'relative' }}>
          <input
            type="text"
            className="form-control"
            placeholder="Cari transaksi..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ paddingLeft: '2.5rem', fontSize: '0.85rem' }}
          />
          <span style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', opacity: 0.5 }}>🔍</span>
        </div>

        {/* Type Filter */}
        <select
          className="filter-select"
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
        >
          <option value="all">Semua Jenis</option>
          <option value="income">📈 Pemasukan</option>
          <option value="expense">📉 Pengeluaran</option>
        </select>

        {/* Category Filter */}
        {typeFilter !== 'income' && (
          <select
            className="filter-select"
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
          >
            <option value="all">Semua Kategori</option>
            {Object.keys(CATEGORY_ICONS).map(cat => (
              <option key={cat} value={cat}>
                {CATEGORY_ICONS[cat]} {cat}
              </option>
            ))}
          </select>
        )}
      </div>

      {/* Transactions list layout */}
      {filteredTransactions.length === 0 ? (
        <div className="empty-state">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p>Tidak ada transaksi yang cocok</p>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Coba sesuaikan pencarian atau filter Anda</span>
        </div>
      ) : (
        <div className="transactions-container">
          {filteredTransactions.map(t => {
            const isExpense = t.type === 'expense';
            const icon = isExpense ? (CATEGORY_ICONS[t.category] || '📦') : '📈';

            return (
              <div key={t.id} className="transaction-card">
                <div className="transaction-info">
                  <div className="category-icon-wrapper" title={t.category}>
                    {icon}
                  </div>
                  <div className="transaction-text">
                    <h4>{t.title}</h4>
                    <div className="meta-details">
                      <span>{formatDate(t.date)}</span>
                      {isExpense && (
                        <>
                          <span>•</span>
                          <span style={{ color: 'var(--text-muted)' }}>{t.category}</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                <div className="transaction-amount-wrapper">
                  <span className={`transaction-amount ${t.type}`}>
                    {t.type === 'income' ? '+' : '-'} {formatIDR(t.amount)}
                  </span>
                  <button 
                    className="btn-delete"
                    onClick={() => onDeleteTransaction(t.id)}
                    title="Hapus Transaksi"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default TransactionList;
