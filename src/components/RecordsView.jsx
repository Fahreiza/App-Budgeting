import React, { useState, useEffect } from 'react';
import { Plus, ChevronLeft, ChevronRight, Trash2 } from "lucide-react";
import { AddTransactionModal } from './AddTransactionModal';

export const CATEGORY_COLORS = {
  'makan & minum': '#ff6b6b',
  'belanja': '#f59f00',
  'rumah': '#37b24d',
  'transportasi': '#1c7ed6',
  'mobil': '#748ffc',
  'Hobby / entertaiment': '#ae3ec9',
  'internet': '#10b981',
  'kartu kredit': '#f03e3e',
  'Kesehatan': '#e64980',
  'pendidikan': '#15aabf',
  'Income': '#2b8a3e',
  'Lain-lain': '#94a3b8'
};

export const CATEGORY_ICONS = {
  'makan & minum': '🍔',
  'belanja': '🛍️',
  'rumah': '🏠',
  'transportasi': '🚗',
  'mobil': '🚙',
  'Hobby / entertaiment': '🎮',
  'internet': '🌐',
  'kartu kredit': '💳',
  'Kesehatan': '🏥',
  'pendidikan': '🎓',
  'Income': '📈',
  'Lain-lain': '📦'
};

const formatRp = (val) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(Math.abs(val));

const formatDate = (dateString) => {
  const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
  return new Date(dateString).toLocaleDateString('id-ID', options);
};

const getMonthName = (monthIdx, year) => {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return `${months[monthIdx - 1]} ${year}`; // User snippet passed month 1-12
};

function groupByDate(transactions) {
  const map = new Map();
  for (const tx of transactions) {
    const existing = map.get(tx.date) ?? [];
    existing.push(tx);
    map.set(tx.date, existing);
  }
  return Array.from(map.entries()).sort(([a], [b]) => b.localeCompare(a));
}

export default function RecordsView({ transactions, accounts, onAddTransaction, onDeleteTransaction, initialFilterCategory, initialFilterMonth, initialFilterYear }) {
  const now = new Date();
  const [month, setMonth] = useState(initialFilterMonth || now.getMonth() + 1);
  const [year, setYear] = useState(initialFilterYear || now.getFullYear());
  const [showModal, setShowModal] = useState(false);
  const [categoryFilter, setCategoryFilter] = useState(initialFilterCategory || 'All');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (initialFilterCategory) setCategoryFilter(initialFilterCategory);
    if (initialFilterMonth) setMonth(initialFilterMonth);
    if (initialFilterYear) setYear(initialFilterYear);
  }, [initialFilterCategory, initialFilterMonth, initialFilterYear]);

  // Filter local transactions by month/year, category, and search query
  const monthTransactions = transactions.filter(t => {
    const tDate = new Date(t.date);
    const isSameMonth = (tDate.getMonth() + 1) === month && tDate.getFullYear() === year;
    const isSameCategory = categoryFilter === 'All' || t.category === categoryFilter;
    const matchesSearch = !searchQuery || 
      (t.title && t.title.toLowerCase().includes(searchQuery.toLowerCase())) || 
      (t.category && t.category.toLowerCase().includes(searchQuery.toLowerCase()));
      
    return isSameMonth && isSameCategory && matchesSearch;
  });

  const sorted = [...monthTransactions].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  const grouped = groupByDate(sorted);

  function prevMonth() {
    if (month === 1) { setMonth(12); setYear(year - 1); }
    else setMonth(month - 1);
  }
  function nextMonth() {
    const n = new Date(); n.setDate(1); n.setMonth(n.getMonth() + 1);
    const next = new Date(year, month - 1 + 1, 1);
    if (next > n) return;
    if (month === 12) { setMonth(1); setYear(year + 1); }
    else setMonth(month + 1);
  }

  function handleDelete(id) {
    if (!confirm("Delete this transaction?")) return;
    onDeleteTransaction(id);
  }

  return (
    <div className="new-records-view">
      <div className="new-records-header">
        <div>
          <h1>Records</h1>
          <p>All transactions</p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', flexWrap: 'wrap' }}>
          <input 
            type="text" 
            placeholder="Search..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              padding: '0.5rem 1rem',
              borderRadius: '0.75rem',
              border: '1px solid var(--border-color)',
              backgroundColor: 'var(--bg-card)',
              fontSize: '0.875rem',
              color: 'var(--text-primary)',
              outline: 'none',
              width: '180px'
            }}
          />
          <select 
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            style={{
              padding: '0.5rem 1rem',
              borderRadius: '0.75rem',
              border: '1px solid var(--border-color)',
              backgroundColor: 'var(--bg-card)',
              fontSize: '0.875rem',
              color: 'var(--text-primary)',
              cursor: 'pointer',
              outline: 'none'
            }}
          >
            <option value="All">All Categories</option>
            {Object.keys(CATEGORY_ICONS).map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
            <option value="Transfer">Transfer</option>
          </select>
          <button onClick={() => setShowModal(true)} className="new-records-add-btn">
            <Plus size={16} />
            Add Transaction
          </button>
        </div>
      </div>

      {/* Month nav */}
      <div className="new-records-month-nav">
        <button onClick={prevMonth}><ChevronLeft size={18} /></button>
        <span>{getMonthName(month, year)}</span>
        <button onClick={nextMonth}><ChevronRight size={18} /></button>
      </div>

      {grouped.length === 0 ? (
        <div className="new-records-empty">
          <p>No records found for {getMonthName(month, year)}.</p>
          <button onClick={() => setShowModal(true)}>Add a transaction</button>
        </div>
      ) : (
        <div className="new-records-list">
          {grouped.map(([date, txs]) => {
            const dayIncome = txs.filter((t) => t.type === "income").reduce((s, t) => s + Number(t.amount), 0);
            const dayExpense = txs.filter((t) => t.type === "expense").reduce((s, t) => s + Number(t.amount), 0);
            return (
              <div key={date} className="new-date-group">
                <div className="new-date-group-header">
                  <p>{formatDate(date)}</p>
                  <div className="new-date-group-summary">
                    {dayIncome > 0 && <span className="text-income">+{formatRp(dayIncome)}</span>}
                    {dayExpense > 0 && <span className="text-expense">-{formatRp(dayExpense)}</span>}
                  </div>
                </div>
                <div className="new-date-group-items">
                  {txs.map((tx) => {
                    const acc = accounts.find(a => a.id === tx.accountId);
                    const toAcc = accounts.find(a => a.id === tx.toAccountId);
                    const accName = acc ? acc.name : tx.accountId;
                    const toAccName = toAcc ? toAcc.name : tx.toAccountId;
                    const catColor = tx.type === 'transfer' ? '#3b82f6' : (CATEGORY_COLORS[tx.category] || '#94a3b8');
                    const icon = tx.type === 'transfer' ? '🔄' : (CATEGORY_ICONS[tx.category] || '📦');
                    
                    return (
                      <div key={tx.id} className="new-record-item">
                        <div className="new-record-icon" style={{ backgroundColor: `${catColor}20`, color: catColor }}>
                          {icon}
                        </div>
                        <div className="new-record-info">
                          <p className="new-record-cat">{tx.category}</p>
                          <p className="new-record-note">
                            {tx.type === 'transfer' ? `${accName} → ${toAccName}` : accName}
                            {tx.title ? ` · ${tx.title}` : ""}
                          </p>
                        </div>
                        <p className={`new-record-amount ${tx.type === "income" ? "text-income" : (tx.type === "expense" ? "text-expense" : "")}`} style={tx.type === 'transfer' ? {color: '#3b82f6'} : {}}>
                          {tx.type === "income" ? "+" : (tx.type === "expense" ? "-" : "")}{formatRp(Number(tx.amount))}
                        </p>
                        <button
                          onClick={() => handleDelete(tx.id)}
                          className="new-record-delete"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}

      <AddTransactionModal 
        open={showModal} 
        onClose={() => setShowModal(false)} 
        accounts={accounts} 
        onAddTransaction={onAddTransaction} 
      />
    </div>
  );
}
