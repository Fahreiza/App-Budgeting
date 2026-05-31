import React, { useState } from 'react';
import { CATEGORY_ICONS } from './CustomChart';

const TransactionForm = ({ onAddTransaction }) => {
  const [type, setType] = useState('expense'); // 'income' or 'expense'
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('Makanan');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!title.trim()) {
      alert('Silakan isi judul transaksi!');
      return;
    }

    if (!amount || Number(amount) <= 0) {
      alert('Silakan masukkan jumlah nominal yang valid!');
      return;
    }

    const newTransaction = {
      id: Date.now().toString(),
      title: title.trim(),
      amount: Number(amount),
      type,
      category: type === 'income' ? 'Lain-lain' : category, // Income defaults to 'Lain-lain'
      date
    };

    onAddTransaction(newTransaction);

    // Reset Form
    setTitle('');
    setAmount('');
    setCategory('Makanan');
    setDate(new Date().toISOString().split('T')[0]);
  };

  return (
    <div className="glass-card">
      <h3 className="section-title">
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" style={{ color: 'var(--color-primary)' }}>
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        Tambah Transaksi
      </h3>

      <form onSubmit={handleSubmit}>
        {/* Toggle Income vs Expense */}
        <div className="type-toggle">
          <button
            type="button"
            className={`toggle-btn income ${type === 'income' ? 'active' : ''}`}
            onClick={() => setType('income')}
          >
            📈 Pemasukan
          </button>
          <button
            type="button"
            className={`toggle-btn expense ${type === 'expense' ? 'active' : ''}`}
            onClick={() => setType('expense')}
          >
            📉 Pengeluaran
          </button>
        </div>

        {/* Title Input */}
        <div className="form-group">
          <label htmlFor="title">Judul Transaksi</label>
          <div className="input-wrapper">
            <span className="input-icon">✏️</span>
            <input
              type="text"
              id="title"
              className="form-control"
              placeholder="e.g., Makan Siang, Gaji Bulanan"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>
        </div>

        {/* Amount & Date Input */}
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="amount">Nominal (Rp)</label>
            <div className="input-wrapper">
              <span className="input-icon">💰</span>
              <input
                type="number"
                id="amount"
                className="form-control"
                placeholder="e.g., 50000"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                required
                min="1"
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="date">Tanggal</label>
            <div className="input-wrapper">
              <span className="input-icon">📅</span>
              <input
                type="date"
                id="date"
                className="form-control"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
              />
            </div>
          </div>
        </div>

        {/* Category Select (Only show if Expense) */}
        {type === 'expense' && (
          <div className="form-group">
            <label htmlFor="category">Kategori</label>
            <div className="input-wrapper">
              <span className="input-icon">{CATEGORY_ICONS[category] || '📦'}</span>
              <select
                id="category"
                className="form-control filter-select"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                style={{ paddingLeft: '2.5rem' }}
              >
                {Object.keys(CATEGORY_ICONS).map((cat) => (
                  <option key={cat} value={cat}>
                    {CATEGORY_ICONS[cat]} {cat}
                  </option>
                ))}
              </select>
            </div>
          </div>
        )}

        {/* Submit Button */}
        <button type="submit" className="btn-primary">
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
          </svg>
          Simpan Transaksi
        </button>
      </form>
    </div>
  );
};

export default TransactionForm;
