import React from 'react';

const Sidebar = ({ currentTab, onTabChange }) => {
  const menuItems = [
    { id: 'dashboard', name: 'Dashboard', icon: '📊' },
    { id: 'accounts', name: 'Accounts', icon: '💳' },
    { id: 'records', name: 'Records', icon: '📝' },
    { id: 'analytics', name: 'Analytics', icon: '📈' },
    { id: 'budgets', name: 'Budgets', icon: '🎯' },
    { id: 'import', name: 'Import', icon: '📥' }
  ];

  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <div className="sidebar-logo-icon">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" width="22" height="22">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h1>Financely</h1>
      </div>

      <nav>
        <ul className="sidebar-menu">
          {menuItems.map((item) => (
            <li key={item.id}>
              <a
                className={`sidebar-item ${currentTab === item.id ? 'active' : ''}`}
                onClick={() => onTabChange(item.id)}
              >
                <span>{item.icon}</span>
                <span>{item.name}</span>
              </a>
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  );
};

export default Sidebar;
