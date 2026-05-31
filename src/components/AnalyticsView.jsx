import React, { useState } from 'react';
import { CATEGORY_COLORS, CATEGORY_ICONS } from './RecordsView';

const AnalyticsView = ({ transactions, accounts, onTabChange }) => {
  // Local Month & Account State
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedAccountId, setSelectedAccountId] = useState('all');
  
  // Tooltip State for Donut Chart
  const [tooltip, setTooltip] = useState({ show: false, x: 0, y: 0, category: '', percentage: 0, amount: 0, color: '' });

  const year = selectedDate.getFullYear();
  const month = selectedDate.getMonth(); // 0-11

  // Handle Month Navigation
  const handlePrevMonth = () => {
    setSelectedDate(new Date(year, month - 1, 1));
  };

  const handleNextMonth = () => {
    setSelectedDate(new Date(year, month + 1, 1));
  };

  const getMonthName = (m) => {
    const months = [
      'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
      'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
    ];
    return months[m];
  };

  // Format Currency
  const formatIDR = (num) => {
    const formatted = new Intl.NumberFormat('id-ID', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(Math.abs(num));
    return `Rp${formatted}`;
  };

  // Filter transactions by selected month, account, and type === expense
  const monthTransactions = transactions.filter(t => {
    const tDate = new Date(t.date);
    const matchesMonth = tDate.getFullYear() === year && tDate.getMonth() === month;
    const matchesAccount = selectedAccountId === 'all' || t.accountId === selectedAccountId;
    return matchesMonth && matchesAccount;
  });

  const monthExpenses = monthTransactions.filter(t => t.type === 'expense');
  const totalExpense = monthExpenses.reduce((sum, t) => sum + Number(t.amount), 0);

  // Sum spending by category
  const expenseCategories = Object.keys(CATEGORY_ICONS).filter(c => c !== 'Income');

  const categoryTotals = expenseCategories.reduce((acc, cat) => {
    acc[cat] = 0; // initialize all with zero
    return acc;
  }, {});

  monthExpenses.forEach(t => {
    if (categoryTotals[t.category] !== undefined) {
      categoryTotals[t.category] += Number(t.amount);
    }
  });

  // Map to array, calculate percentage
  const allCategoriesData = expenseCategories.map(cat => {
    const amount = categoryTotals[cat];
    const percentage = totalExpense > 0 ? (amount / totalExpense) * 100 : 0;
    return {
      category: cat,
      amount,
      percentage,
      icon: CATEGORY_ICONS[cat],
      color: CATEGORY_COLORS[cat]
    };
  });

  // Split into spent and zero-spending categories
  const spentCategories = allCategoriesData.filter(d => d.amount > 0).sort((a, b) => b.amount - a.amount);
  const zeroCategories = allCategoriesData.filter(d => d.amount === 0);

  // Combine them: spent categories on top sorted by highest spend, zero-spending on the bottom
  const sortedReportData = [...spentCategories, ...zeroCategories];

  // SVG Donut Config
  const radius = 60;
  const strokeWidth = 12;
  const center = 80;
  const circumference = 2 * Math.PI * radius; // approx 376.99
  let accumulatedPercentage = 0;

  return (
    <div className="analytics-view" style={{ animation: 'fadeIn 0.3s ease-out' }}>
      <div className="view-header">
        <div>
          <h2>Laporan Pengeluaran Bulanan</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: '0.2rem' }}>
            Lihat persentase pengeluaran Anda per kategori pengeluaran bulan ini.
          </p>
        </div>

        {/* Month Selector Widget */}
        <div className="month-selector">
          <button className="month-btn" onClick={handlePrevMonth} title="Bulan Sebelumnya">◀</button>
          <span className="month-label">{getMonthName(month)} {year}</span>
          <button className="month-btn" onClick={handleNextMonth} title="Bulan Selanjutnya">▶</button>
        </div>
      </div>

      <div className="analytics-grid">
        {/* Left Side: Summary List (Spent and zero greying out) */}
        <div className="white-card">
          <h3 className="card-title">
            <span>📊</span> Rincian per Kategori Pengeluaran
          </h3>
          <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '1.25rem' }}>
            Total pengeluaran bulan ini: <strong style={{ fontSize: '1.1rem', color: 'var(--text-primary)' }}>{formatIDR(totalExpense)}</strong>
          </div>

          <div className="category-report-list">
            {sortedReportData.map(item => {
              const isZero = item.amount === 0;

              return (
                <div 
                  key={item.category} 
                  className={`category-report-item ${isZero ? 'zero-spending' : ''}`}
                  onClick={() => onTabChange('records', { filterCategory: item.category, filterMonth: month + 1, filterYear: year })}
                  style={{ cursor: 'pointer' }}
                >
                  {/* Category Icon Wrapper */}
                  <div 
                    className="record-icon-container"
                    style={{ 
                      backgroundColor: `${item.color}15`, 
                      border: `1px solid ${item.color}25`,
                      filter: isZero ? 'grayscale(1)' : 'none'
                    }}
                  >
                    {item.icon}
                  </div>

                  {/* Meta details & Bar fill */}
                  <div className="category-report-progress-block">
                    <div className="category-report-meta">
                      <span style={{ color: isZero ? 'var(--text-muted)' : 'var(--text-primary)' }}>
                        {item.category}
                      </span>
                      <span>
                        {isZero ? 'Rp0' : formatIDR(item.amount)}
                      </span>
                    </div>

                    {!isZero && (
                      <div className="category-report-bar-track">
                        <div 
                          className="category-report-bar-fill"
                          style={{ 
                            width: `${item.percentage}%`, 
                            backgroundColor: item.color 
                          }}
                        />
                      </div>
                    )}
                  </div>

                  {!isZero && (
                    <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-secondary)', minWidth: '40px', textAlign: 'right' }}>
                      {Math.round(item.percentage)}%
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Side: Interactive Svg Chart Visual */}
        <div className="white-card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
          <h3 className="card-title" style={{ width: '100%' }}>
            <span>🍩</span> Proporsi Pengeluaran Bulanan
          </h3>

          {totalExpense === 0 ? (
            <div className="empty-state-box">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" width="48" height="48" style={{ opacity: 0.2, margin: '0 auto 1rem auto', display: 'block' }}>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11 3.055A9.003 9.003 0 1020.945 13H11V3.055z" />
              </svg>
              <p>Tidak ada transaksi pengeluaran di bulan ini.</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', margin: '2rem 0' }}>
              <div className="svg-chart-container" style={{ width: '180px', height: '180px' }}>
                <svg width="160" height="160" viewBox="0 0 160 160" style={{ transform: 'rotate(-90deg)' }}>
                  {/* Gray background track */}
                  <circle
                    cx={center}
                    cy={center}
                    r={radius}
                    fill="transparent"
                    stroke="#f1f5f9"
                    strokeWidth={strokeWidth}
                  />

                  {spentCategories.map(item => {
                    const percent = item.percentage / 100;
                    const dashArray = `${percent * circumference} ${circumference}`;
                    const dashOffset = -accumulatedPercentage * circumference;
                    accumulatedPercentage += percent;

                    return (
                      <circle
                        key={item.category}
                        className="donut-slice"
                        cx={center}
                        cy={center}
                        r={radius}
                        fill="transparent"
                        stroke={item.color}
                        strokeWidth={strokeWidth}
                        strokeDasharray={dashArray}
                        strokeDashoffset={dashOffset}
                        strokeLinecap="round"
                        style={{
                          transition: 'all 0.3s ease',
                          cursor: 'pointer'
                        }}
                        onMouseEnter={(e) => setTooltip({
                          show: true,
                          x: e.clientX,
                          y: e.clientY,
                          category: item.category,
                          percentage: Math.round(item.percentage),
                          amount: item.amount,
                          color: item.color
                        })}
                        onMouseMove={(e) => setTooltip(prev => ({ ...prev, x: e.clientX, y: e.clientY }))}
                        onMouseLeave={() => setTooltip({ ...tooltip, show: false })}
                      />
                    );
                  })}
                </svg>

                <div className="chart-center-text" style={{ top: '48%', transform: 'translate(-50%, -50%)' }}>
                  <div className="title" style={{ fontSize: '0.7rem' }}>TOTAL BELANJA</div>
                  <div className="value" style={{ fontSize: '1.05rem', color: 'var(--color-expense)' }}>
                    Rp{new Intl.NumberFormat('id-ID', { maximumFractionDigits: 0 }).format(totalExpense)}
                  </div>
                </div>
              </div>

              {/* Minimal Chart Legend Grid */}
              <div style={{ marginTop: '2.5rem', display: 'flex', gap: '0.5rem', flexWrap: 'wrap', justifyContent: 'center' }}>
                {spentCategories.map(item => (
                  <span 
                    key={item.category}
                    style={{ 
                      fontSize: '0.75rem', 
                      background: '#f8f9fa', 
                      padding: '0.2rem 0.6rem', 
                      border: `1px solid ${item.color}22`,
                      borderRadius: 'var(--radius-sm)',
                      fontWeight: 600,
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.35rem'
                    }}
                  >
                    <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: item.color }} />
                    {item.category}: {Math.round(item.percentage)}%
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Premium Floating Tooltip */}
      {tooltip.show && (
        <div 
          className="chart-tooltip"
          style={{
            top: tooltip.y - 70,
            left: tooltip.x + 15,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.25rem' }}>
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: tooltip.color }}></span>
            <span style={{ fontWeight: 700, fontSize: '0.8rem', color: 'var(--text-primary)' }}>{tooltip.category}</span>
            <span style={{ marginLeft: 'auto', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)' }}>{tooltip.percentage}%</span>
          </div>
          <div style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--color-expense)' }}>
            Rp{new Intl.NumberFormat('id-ID', { maximumFractionDigits: 0 }).format(tooltip.amount)}
          </div>
        </div>
      )}
    </div>
  );
};

export default AnalyticsView;
