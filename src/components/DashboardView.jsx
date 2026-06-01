import React, { useState } from "react";
import {
  RadialBarChart, RadialBar, PieChart, Pie, Cell,
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
} from "recharts";
import { ChevronLeft, ChevronRight, Plus, ArrowRight, Landmark, Wallet, Banknote } from "lucide-react";

/* ─── formatters & helpers ─────────────────────────────────────────────── */
const formatRp = (val) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(val);
const formatDateShort = (dateStr) => {
  const d = new Date(dateStr);
  return d.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' });
};
const getMonthName = (monthIdx, year) => {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return `${months[monthIdx]} ${year}`;
};

// Hardcoded category colors for PieChart
const categoryColors = {
  'makan & minum': '#f59e0b',
  'belanja': '#ec4899',
  'rumah': '#10b981',
  'transportasi': '#3b82f6',
  'mobil': '#6366f1',
  'Hobby / entertaiment': '#8b5cf6',
  'internet': '#0ea5e9',
  'kartu kredit': '#ef4444',
  'Kesehatan': '#14b8a6',
  'pendidikan': '#f43f5e',
  'Lain-lain': '#94a3b8',
  'Income': '#22c55e'
};

const getCategoryColor = (name) => categoryColors[name] || '#6366f1';

function typeIcon(type, size = 13) {
  if (type === "bank") return <Landmark size={size} />;
  if (type === "e-wallet") return <Wallet size={size} />;
  return <Banknote size={size} />;
}

/* ─── Spending Meter (semicircle gauge) ─────────────────────── */
function SpendingMeter({ pct }) {
  const clamped = Math.min(pct, 1);
  const r = 70;
  const cx = 90;
  const cy = 88;
  const startAngle = Math.PI;
  const endAngle = 0;
  const totalArc = Math.PI; // 180 deg

  const bgPath = describeArc(cx, cy, r, startAngle, endAngle);
  const fgPath = describeArc(cx, cy, r, startAngle, Math.PI - clamped * totalArc);

  const needleAngle = Math.PI - clamped * Math.PI;
  const needleX = cx + (r - 16) * Math.cos(needleAngle);
  const needleY = cy - (r - 16) * Math.sin(needleAngle);

  const color = pct < 0.5 ? "#22c55e" : pct < 0.8 ? "#f59e0b" : "#ef4444";

  return (
    <svg viewBox="0 0 180 100" className="spending-meter-svg">
      <path d={bgPath} fill="none" stroke="#f1f5f9" strokeWidth="16" strokeLinecap="round" />
      {clamped > 0 && (
        <path d={fgPath} fill="none" stroke={color} strokeWidth="16" strokeLinecap="round" />
      )}
      <circle cx={needleX} cy={needleY} r="5" fill={color} />
      <circle cx={cx} cy={cy} r="4" fill="#94a3b8" />
    </svg>
  );
}

function polarToCartesian(cx, cy, r, angle) {
  return { x: cx + r * Math.cos(angle), y: cy - r * Math.sin(angle) };
}

function describeArc(cx, cy, r, startAngle, endAngle) {
  const s = polarToCartesian(cx, cy, r, startAngle);
  const e = polarToCartesian(cx, cy, r, endAngle);
  const largeArc = endAngle - startAngle < Math.PI ? 0 : 1;
  return `M ${s.x} ${s.y} A ${r} ${r} 0 ${largeArc} 1 ${e.x} ${e.y}`;
}

/* ─── Mini account strip card ───────────────────────────────── */
function AccountStrip({ account }) {
  return (
    <div
      className="account-strip-card"
      style={{
        background: `linear-gradient(135deg, ${account.color}f0 0%, ${account.color}a0 100%)`,
      }}
    >
      <div className="account-strip-overlay" />
      <div className="account-strip-type">
        {typeIcon(account.type)}
        <span>{account.type}</span>
      </div>
      <p className="account-strip-name">{account.name}</p>
      <p className="account-strip-bal-label">Balance</p>
      <p className="account-strip-bal-val">{formatRp(account.balance)}</p>
    </div>
  );
}

/* ─── Custom bar label ───────────────────────────────────────── */
function CustomBarLabel({ x, y, width, value }) {
  if (!value || value === 0) return null;
  return (
    <text x={(x ?? 0) + (width ?? 0) / 2} y={(y ?? 0) - 6} fill="#64748b" textAnchor="middle" fontSize={10} fontWeight={600}>
      {formatRp(value)}
    </text>
  );
}

/* ─── Dashboard ─────────────────────────────────────────────── */
export default function DashboardView({ transactions, accounts, onAddAccountClick, onTabChange }) {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedAccountId, setSelectedAccountId] = useState('all');

  const year = selectedDate.getFullYear();
  const month = selectedDate.getMonth(); // 0-11

  // Navigation
  function prevMonth() {
    setSelectedDate(new Date(year, month - 1, 1));
  }
  function nextMonth() {
    const next = new Date(year, month + 1, 1);
    const limit = new Date(); limit.setDate(1); limit.setMonth(limit.getMonth() + 1);
    if (next > limit) return;
    setSelectedDate(next);
  }

  // Data processing based on selected date
  const endLimit = new Date(year, month + 1, 0, 23, 59, 59);

  const currentMonthTx = transactions.filter(t => {
    const tDate = new Date(t.date);
    const matchesMonth = tDate.getFullYear() === year && tDate.getMonth() === month;
    const matchesAccount = selectedAccountId === 'all' || t.accountId === selectedAccountId || t.toAccountId === selectedAccountId;
    return matchesMonth && matchesAccount;
  });

  // Balances should reflect the cumulative balance up to the selected month
  const accountBalances = accounts.map(acc => {
    // Filter transactions up to the end of the selected month
    const accTx = transactions.filter(t => (t.accountId === acc.id || t.toAccountId === acc.id) && new Date(t.date) <= endLimit);
    const balanceChange = accTx.reduce((sum, t) => {
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
      balance: Number(acc.initialBalance || 0) + balanceChange
    };
  });
  const totalBalance = accountBalances.reduce((s, a) => s + a.balance, 0);

  // Month stats
  const totalIncome = currentMonthTx.filter(t => t.type === 'income').reduce((s, t) => s + Number(t.amount), 0);
  const totalExpense = currentMonthTx.filter(t => t.type === 'expense').reduce((s, t) => s + Number(t.amount), 0);
  const cashFlow = totalIncome - totalExpense;
  const spendingPct = totalIncome > 0 ? totalExpense / totalIncome : 0;

  // Recent transactions
  const recent = [...currentMonthTx]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 5);

  // Categories
  const expenseCategories = currentMonthTx.filter(t => t.type === 'expense');
  const categoryTotals = {};
  expenseCategories.forEach(t => {
    categoryTotals[t.category] = (categoryTotals[t.category] || 0) + Number(t.amount);
  });
  
  const topCategories = Object.entries(categoryTotals)
    .map(([category, total]) => ({ category, total }))
    .sort((a, b) => b.total - a.total);

  const topCategoriesSliced = topCategories.slice(0, 5);

  const barData = [
    { name: "Income", value: totalIncome, fill: "#22c55e" },
    { name: "Expenses", value: totalExpense, fill: "#ef4444" },
  ];

  const pieData = topCategoriesSliced.map(c => ({
    name: c.category,
    value: c.total,
    color: getCategoryColor(c.category)
  }));
  if (pieData.length === 0) pieData.push({ name: "No data", value: 1, color: "#e2e8f0" });

  return (
    <div className="new-dashboard">
      {/* ── Header ── */}
      <div className="new-dashboard-header">
        <div className="new-dashboard-title">
          <h1>Dashboard</h1>
          <p className="new-dashboard-subtitle">
            Total balance:{" "}
            <span className={totalBalance >= 0 ? "text-income" : "text-expense"}>
              {formatRp(totalBalance)}
            </span>
          </p>
        </div>
        <div className="new-dashboard-actions">
          {/* Account selector */}
          <div className="new-month-selector" style={{ padding: '0 0.5rem' }}>
            <select
              value={selectedAccountId}
              onChange={(e) => setSelectedAccountId(e.target.value)}
              style={{ background: 'transparent', border: 'none', outline: 'none', fontWeight: 600, color: 'var(--text-primary)', cursor: 'pointer', padding: '0.25rem' }}
            >
              <option value="all">Semua Akun</option>
              {accounts.map(acc => (
                <option key={acc.id} value={acc.id}>{acc.name}</option>
              ))}
            </select>
          </div>
          {/* Month selector */}
          <div className="new-month-selector">
            <button onClick={prevMonth} className="new-month-btn">
              <ChevronLeft size={16} />
            </button>
            <span className="new-month-label">{getMonthName(month, year)}</span>
            <button onClick={nextMonth} className="new-month-btn">
              <ChevronRight size={16} />
            </button>
          </div>
          <button
            onClick={() => onTabChange('records')}
            className="new-add-btn"
          >
            <Plus size={16} />
            Add
          </button>
        </div>
      </div>

      {/* ── Account Cards Strip ── */}
      <section className="new-dashboard-section">
        <p className="new-section-title">Your Accounts</p>
        {accounts.length === 0 ? (
          <div className="new-empty-accounts">
            <p>No accounts. <span onClick={onAddAccountClick} className="text-primary-link">Add one</span></p>
          </div>
        ) : (
          <div className="new-account-strip-container">
            {accountBalances.map(a => <AccountStrip key={a.id} account={{ ...a, balance: a.balance ?? 0 }} />)}
          </div>
        )}
      </section>

      {/* ── 3 Stat Widgets ── */}
      <section className="new-dashboard-section">
        <p className="new-section-title">
          {getMonthName(month, year)} — Overview
        </p>
        <div className="new-widgets-grid">

          {/* Widget 1: Cash Flow Bar */}
          <div className="new-widget-card">
            <p className="new-widget-title">Cash Flow</p>
            <p className={`new-widget-val ${cashFlow >= 0 ? "text-income" : "text-expense"}`}>
              {cashFlow >= 0 ? "+" : ""}{formatRp(cashFlow)}
            </p>
            <div className="new-widget-chart-container">
              <ResponsiveContainer width="100%" height={110}>
                <BarChart data={barData} barCategoryGap="30%" margin={{ top: 20, right: 4, left: 4, bottom: 0 }}>
                  <XAxis dataKey="name" tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
                  <Bar dataKey="value" radius={[6, 6, 0, 0]} label={<CustomBarLabel />}>
                    {barData.map((entry, i) => <Cell key={i} fill={entry.fill} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Widget 2: Spending Gauge */}
          <div className="new-widget-card">
            <p className="new-widget-title">Spending Rate</p>
            <p className="new-widget-val" style={{
              color: spendingPct < 0.5 ? "#22c55e" : spendingPct < 0.8 ? "#f59e0b" : "#ef4444"
            }}>
              {totalIncome > 0 ? `${Math.round(spendingPct * 100)}%` : "—"}
            </p>
            <div className="new-gauge-container">
              <SpendingMeter pct={spendingPct} />
              <div className="new-gauge-labels">
                <span>0%</span>
                <span>of income</span>
                <span>100%</span>
              </div>
              <p className="new-gauge-desc">
                {formatRp(totalExpense)} spent of {formatRp(totalIncome)}
              </p>
            </div>
          </div>

          {/* Widget 3: Spending Donut */}
          <div className="new-widget-card">
            <p className="new-widget-title">Top Spending</p>
            <p className="new-widget-val text-expense mb-3">{formatRp(totalExpense)}</p>
            <div className="new-donut-container">
              <ResponsiveContainer width={90} height={90}>
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={26}
                    outerRadius={42}
                    dataKey="value"
                    strokeWidth={0}
                  >
                    {pieData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              <div className="new-donut-legend">
                {topCategoriesSliced.slice(0, 4).map(c => {
                  return (
                    <div key={c.category} className="new-donut-legend-item">
                      <span
                        className="new-legend-dot"
                        style={{ backgroundColor: getCategoryColor(c.category) }}
                      />
                      <span className="new-legend-text">{c.category}</span>
                    </div>
                  );
                })}
                {topCategoriesSliced.length === 0 && (
                  <p className="new-legend-text">No expenses</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Spending by Category (horizontal bar) ── */}
      {topCategories.length > 0 && (
        <section className="new-dashboard-section">
          <p className="new-section-title">Category Breakdown</p>
          <div className="new-breakdown-card">
            {topCategories.map(c => {
              const pct = totalExpense > 0 ? (c.total / totalExpense) * 100 : 0;
              return (
                <div key={c.category} className="new-breakdown-row">
                  <div className="new-breakdown-icon" style={{ backgroundColor: getCategoryColor(c.category) }} />
                  <div className="new-breakdown-info">
                    <div className="new-breakdown-header">
                      <p className="new-breakdown-name">{c.category}</p>
                      <p className="new-breakdown-val">{formatRp(c.total)}</p>
                    </div>
                    <div className="new-breakdown-track">
                      <div
                        className="new-breakdown-bar"
                        style={{ width: `${pct}%`, backgroundColor: getCategoryColor(c.category) }}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* ── Recent Transactions ── */}
      <section className="new-dashboard-section">
        <div className="new-recent-card">
          <div className="new-recent-header">
            <p className="new-recent-title">Recent Transactions</p>
            <span className="new-recent-view-all" onClick={() => onTabChange('records')}>
              View all <ArrowRight size={14} />
            </span>
          </div>

          {recent.length === 0 ? (
            <div className="new-recent-empty">
              <p>No transactions for {getMonthName(month, year)}.</p>
              <button onClick={() => onTabChange('records')}>Add your first transaction</button>
            </div>
          ) : (
            <div className="new-recent-list">
              {recent.map((tx) => {
                return (
                  <div key={tx.id} className="new-recent-item">
                    <div className="new-recent-icon" style={{ backgroundColor: getCategoryColor(tx.category) }} />
                    <div className="new-recent-info">
                      <p className="new-recent-cat">{tx.category}</p>
                      <p className="new-recent-note">
                        {accounts.find(a => a.id === tx.accountId)?.name || tx.accountId}{tx.note ? ` · ${tx.note}` : ""}
                      </p>
                    </div>
                    <div className="new-recent-amount">
                      <p className={tx.type === "income" ? "text-income" : "text-expense"}>
                        {tx.type === "income" ? "+" : "-"}{formatRp(Number(tx.amount))}
                      </p>
                      <p className="new-recent-date">{formatDateShort(tx.date)}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
