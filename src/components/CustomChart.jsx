import React, { useState } from 'react';

import { CATEGORY_COLORS as RV_COLORS, CATEGORY_ICONS as RV_ICONS } from './RecordsView';

// Export Category Colors and Icons so other components can use them consistently
export const CATEGORY_COLORS = RV_COLORS;
export const CATEGORY_ICONS = RV_ICONS;

const CustomChart = ({ transactions }) => {
  const [activeCategory, setActiveCategory] = useState(null);

  // Filter only expenses
  const expenses = transactions.filter(t => t.type === 'expense');
  
  // Calculate total expense
  const totalExpense = expenses.reduce((sum, t) => sum + Number(t.amount), 0);

  // Calculate sum by category
  const categoryTotals = expenses.reduce((acc, t) => {
    acc[t.category] = (acc[t.category] || 0) + Number(t.amount);
    return acc;
  }, {});

  // Convert to array and calculate percentage
  const chartData = Object.keys(categoryTotals).map(category => ({
    category,
    value: categoryTotals[category],
    percentage: totalExpense > 0 ? (categoryTotals[category] / totalExpense) : 0,
    color: CATEGORY_COLORS[category] || CATEGORY_COLORS['Lain-lain']
  })).sort((a, b) => b.value - a.value); // Sort descending

  // SVG Configuration
  const radius = 70;
  const strokeWidth = 16;
  const center = 110;
  const circumference = 2 * Math.PI * radius; // Approx 439.82

  let accumulatedPercentage = 0;

  // Formatting currency helper
  const formatIDR = (num) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0
    }).format(num);
  };

  // Find currently active or hover item to display in the center
  const displayItem = activeCategory 
    ? chartData.find(d => d.category === activeCategory)
    : chartData[0]; // default to biggest expense category

  return (
    <div className="glass-card">
      <h3 className="section-title">
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" style={{ color: 'var(--color-primary)' }}>
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 3.055A9.003 9.003 0 1020.945 13H11V3.055z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z" />
        </svg>
        Alokasi Pengeluaran
      </h3>

      {totalExpense === 0 ? (
        <div className="empty-state">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
          <p>Belum ada pengeluaran dicatat</p>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Tambahkan transaksi pengeluaran untuk melihat grafik</span>
        </div>
      ) : (
        <div className="chart-wrapper">
          <div className="svg-chart-container">
            <svg width="220" height="220" viewBox="0 0 220 220" style={{ transform: 'rotate(-90deg)' }}>
              {/* Background circle */}
              <circle
                cx={center}
                cy={center}
                r={radius}
                fill="transparent"
                stroke="rgba(255,255,255,0.03)"
                strokeWidth={strokeWidth}
              />
              
              {chartData.map((item, index) => {
                const dashArray = `${item.percentage * circumference} ${circumference}`;
                const dashOffset = -accumulatedPercentage * circumference;
                accumulatedPercentage += item.percentage;

                const isHovered = activeCategory === item.category;

                return (
                  <circle
                    key={item.category}
                    className="donut-segment"
                    cx={center}
                    cy={center}
                    r={radius}
                    fill="transparent"
                    stroke={item.color}
                    strokeWidth={isHovered ? strokeWidth + 4 : strokeWidth}
                    strokeDasharray={dashArray}
                    strokeDashoffset={dashOffset}
                    strokeLinecap="round"
                    onMouseEnter={() => setActiveCategory(item.category)}
                    onMouseLeave={() => setActiveCategory(null)}
                    style={{
                      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                      filter: isHovered ? `drop-shadow(0 0 8px ${item.color}50)` : 'none'
                    }}
                  />
                );
              })}
            </svg>

            {/* Inner Dashboard Display */}
            <div className="chart-center-text">
              {displayItem ? (
                <>
                  <div className="title">
                    {CATEGORY_ICONS[displayItem.category]} {displayItem.category}
                  </div>
                  <div className="value" style={{ color: displayItem.color }}>
                    {Math.round(displayItem.percentage * 100)}%
                  </div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                    {formatIDR(displayItem.value)}
                  </div>
                </>
              ) : (
                <>
                  <div className="title">Total</div>
                  <div className="value" style={{ color: 'var(--color-primary)' }}>100%</div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                    {formatIDR(totalExpense)}
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Detailed Responsive Legend Grid */}
          <div className="chart-legend">
            {chartData.map(item => (
              <div
                key={item.category}
                className="legend-item"
                onMouseEnter={() => setActiveCategory(item.category)}
                onMouseLeave={() => setActiveCategory(null)}
                style={{
                  background: activeCategory === item.category ? 'rgba(255, 255, 255, 0.05)' : 'transparent',
                  borderLeft: `3px solid ${item.color}`
                }}
              >
                <span>{CATEGORY_ICONS[item.category]} {item.category}</span>
                <span className="legend-value">{formatIDR(item.value)}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomChart;
