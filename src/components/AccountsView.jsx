import React, { useState } from 'react';

const AccountsView = ({ transactions, accounts, onAddAccount, onAddTransaction }) => {
  const [name, setName] = useState('');
  const [type, setType] = useState('bank'); // 'bank', 'e-wallet', 'cash'
  const [color, setColor] = useState('#3b82f6');
  const [initialBalance, setInitialBalance] = useState('');

  // Default color palette choices
  const COLOR_PALETTE = [
    '#3b82f6', // Royal Blue
    '#ff5722', // SeaBank Orange
    '#10b981', // Emerald Green
    '#00a2b9', // Gopay Cyan
    '#6366f1', // Premium Violet
    '#ef4444', // Bright Red
    '#005caa', // BCA Dark Blue
    '#2e7d32', // Cash Green
    '#c62828', // Credit Card Deep Red
    '#475569'  // Dark Gray
  ];

  // Format Currency
  const formatIDR = (num) => {
    const formatted = new Intl.NumberFormat('id-ID', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(Math.abs(num));
    return num < 0 ? `-Rp${formatted}` : `Rp${formatted}`;
  };

  const handleAdjustBalance = (accountId, currentBalance) => {
    const input = prompt('Masukkan saldo riil Anda saat ini untuk rekening ini:');
    if (input === null || input.trim() === '') return;
    
    const actualBalance = Number(input);
    if (isNaN(actualBalance)) {
      alert('Mohon masukkan angka yang valid!');
      return;
    }
    
    const delta = actualBalance - currentBalance;
    if (delta === 0) {
      alert('Saldo riil sama dengan saldo sistem. Tidak ada penyesuaian.');
      return;
    }
    
    if (confirm(`Sistem akan membuat transaksi Penyesuaian Saldo sebesar ${formatIDR(delta)}. Lanjutkan?`)) {
      const newTransaction = {
        id: Date.now().toString(),
        title: 'Penyesuaian Sistem',
        amount: delta,
        type: 'adjustment',
        category: 'Lain-lain',
        accountId,
        date: new Date().toISOString().split('T')[0]
      };
      if (onAddTransaction) {
        onAddTransaction(newTransaction);
      }
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!name.trim()) {
      alert('Silakan masukkan nama akun!');
      return;
    }

    const initial = initialBalance === '' ? 0 : Number(initialBalance);
    if (isNaN(initial)) {
      alert('Silakan masukkan saldo awal yang valid!');
      return;
    }

    const newAccount = {
      id: Date.now().toString(),
      name: name.trim(),
      type,
      color,
      initialBalance: initial
    };

    onAddAccount(newAccount);

    // Reset Form
    setName('');
    setType('bank');
    setColor('#3b82f6');
    setInitialBalance('');
    alert('Akun baru berhasil ditambahkan!');
  };

  // Calculate dynamic balances
  const accountBalances = accounts.map(acc => {
    const accTransactions = transactions.filter(t => t.accountId === acc.id || t.toAccountId === acc.id);
    const balanceChange = accTransactions.reduce((sum, t) => {
      if (t.type === 'income') {
        return t.accountId === acc.id ? sum + Number(t.amount) : sum;
      } else if (t.type === 'expense') {
        return t.accountId === acc.id ? sum - Number(t.amount) : sum;
      } else if (t.type === 'transfer') {
        if (t.accountId === acc.id) return sum - Number(t.amount);
        if (t.toAccountId === acc.id) return sum + Number(t.amount);
      } else if (t.type === 'adjustment' && t.accountId === acc.id) {
        return sum + Number(t.amount);
      }
      return sum;
    }, 0);
    return {
      ...acc,
      currentBalance: Number(acc.initialBalance) + balanceChange
    };
  });

  return (
    <div className="accounts-view" style={{ animation: 'fadeIn 0.3s ease-out' }}>
      <div className="view-header">
        <div>
          <h2>Rekening & Dompet</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: '0.2rem' }}>
            Kelola semua akun perbankan, dompet digital, dan kas fisik Anda secara dinamis.
          </p>
        </div>
      </div>

      <div className="analytics-grid">
        {/* Left Side: Accounts Cards Grid */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)' }}>
            Daftar Akun ({accounts.length})
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '1rem' }}>
            {accountBalances.map(acc => (
              <div
                key={acc.id}
                className="account-card"
                style={{
                  background: `linear-gradient(135deg, ${acc.color}, ${acc.color}cc)`
                }}
              >
                <div className="account-card-header">
                  <span className="account-card-name">{acc.name}</span>
                  <span className="account-card-type">{acc.type}</span>
                </div>
                <div className="account-card-balance-wrapper">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '0.25rem' }}>
                    <span className="account-card-balance-label">Current Balance</span>
                    <span 
                      style={{ cursor: 'pointer', fontSize: '0.75rem', textDecoration: 'underline', opacity: 0.8 }} 
                      onClick={() => handleAdjustBalance(acc.id, acc.currentBalance)}
                    >
                      Sesuaikan
                    </span>
                  </div>
                  <div className="account-card-balance">
                    {formatIDR(acc.currentBalance)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Side: + Add Account Form Card */}
        <div className="white-card">
          <h3 className="card-title">
            <span>➕</span> Tambah Akun Baru
          </h3>

          <form onSubmit={handleSubmit}>
            {/* Account Name */}
            <div className="form-group">
              <label htmlFor="accName">Nama Rekening/Akun</label>
              <input
                type="text"
                id="accName"
                className="form-control"
                placeholder="e.g., SeaBank, Gopay, Dana, Cash"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>

            {/* Account Type */}
            <div className="form-group">
              <label htmlFor="accType">Jenis Akun</label>
              <select
                id="accType"
                className="form-control"
                value={type}
                onChange={(e) => setType(e.target.value)}
                style={{ cursor: 'pointer' }}
              >
                <option value="bank">🏦 Bank (Tabungan)</option>
                <option value="e-wallet">📱 E-Wallet (Dompet Digital)</option>
                <option value="cash">💵 Cash (Kas Fisik)</option>
              </select>
            </div>

            {/* Initial Balance */}
            <div className="form-group">
              <label htmlFor="accBalance">Saldo Awal (Rp)</label>
              <input
                type="number"
                id="accBalance"
                className="form-control"
                placeholder="e.g., 500000"
                value={initialBalance}
                onChange={(e) => setInitialBalance(e.target.value)}
              />
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem', display: 'block' }}>
                *Masukkan saldo awal saat pembuatan akun ini.
              </span>
            </div>

            {/* Custom Color Circle Selection */}
            <div className="form-group">
              <label>Pilih Warna Kartu</label>
              <div className="color-picker-grid">
                {COLOR_PALETTE.map(col => (
                  <div
                    key={col}
                    className={`color-option ${color === col ? 'selected' : ''}`}
                    style={{ backgroundColor: col }}
                    onClick={() => setColor(col)}
                    title={col}
                  >
                    {color === col && <span style={{ color: 'white', fontSize: '0.75rem' }}>✓</span>}
                  </div>
                ))}
              </div>
            </div>

            {/* Submit button */}
            <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '1.5rem' }}>
              Simpan Akun Baru
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AccountsView;
