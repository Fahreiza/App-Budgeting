import React, { useState, useEffect } from 'react';
import { CATEGORY_ICONS } from './RecordsView';
import { X } from 'lucide-react';

export function AddTransactionModal({ open, onClose, accounts, onAddTransaction }) {
  const [type, setType] = useState('expense');
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('makan & minum');
  const [accountId, setAccountId] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);

  const categories = Object.keys(CATEGORY_ICONS).filter(c => c !== 'Income');

  useEffect(() => {
    if (open) {
      setAccountId(accounts[0]?.id || '');
    }
  }, [open, accounts]);

  if (!open) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title.trim() || !amount || Number(amount) <= 0 || !accountId) {
      alert('Please fill out all fields correctly.');
      return;
    }

    const newTransaction = {
      id: Date.now().toString(),
      title: title.trim(),
      amount: Number(amount),
      type,
      category: type === 'income' ? 'Income' : category,
      accountId,
      date
    };

    onAddTransaction(newTransaction);

    setTitle('');
    setAmount('');
    setCategory('makan & minum');
    setDate(new Date().toISOString().split('T')[0]);
    onClose();
  };

  return (
    <div className="new-modal-overlay">
      <div className="new-modal-content">
        <div className="new-modal-header">
          <h3>📝 Add Transaction</h3>
          <button onClick={onClose} className="new-modal-close"><X size={20} /></button>
        </div>
        
        <form onSubmit={handleSubmit} className="new-modal-form">
          <div className="new-transaction-type-toggle">
            <button
              type="button"
              className={`new-type-btn ${type === 'income' ? 'active-income' : ''}`}
              onClick={() => { setType('income'); setCategory('Income'); }}
            >
              📈 Income
            </button>
            <button
              type="button"
              className={`new-type-btn ${type === 'expense' ? 'active-expense' : ''}`}
              onClick={() => { setType('expense'); setCategory('makan & minum'); }}
            >
              📉 Expense
            </button>
          </div>

          <div className="new-form-group">
            <label>Note / Title</label>
            <input
              type="text"
              placeholder="e.g., Groceries, Salary"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>

          <div className="new-form-group">
            <label>Amount (Rp)</label>
            <input
              type="number"
              placeholder="e.g., 50000"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              required
              min="1"
            />
          </div>

          <div className="new-form-group">
            <label>Date</label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
            />
          </div>

          <div className="new-form-group">
            <label>Account</label>
            {accounts.length === 0 ? (
              <div className="new-form-error">⚠️ Please add an account first.</div>
            ) : (
              <select value={accountId} onChange={(e) => setAccountId(e.target.value)}>
                {accounts.map(acc => (
                  <option key={acc.id} value={acc.id}>{acc.name} ({acc.type})</option>
                ))}
              </select>
            )}
          </div>

          {type === 'expense' && (
            <div className="new-form-group">
              <label>Category</label>
              <select value={category} onChange={(e) => setCategory(e.target.value)}>
                {categories.map(cat => (
                  <option key={cat} value={cat}>
                    {CATEGORY_ICONS[cat]} {cat}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div className="new-modal-actions">
            <button type="button" onClick={onClose} className="new-btn-cancel">Cancel</button>
            <button type="submit" disabled={accounts.length === 0} className="new-btn-submit">Save</button>
          </div>
        </form>
      </div>
    </div>
  );
}
