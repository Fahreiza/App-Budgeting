import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import DashboardView from './components/DashboardView';
import AccountsView from './components/AccountsView';
import RecordsView from './components/RecordsView';
import AnalyticsView from './components/AnalyticsView';
import ImportView from './components/ImportView';
import BudgetTracker from './components/BudgetTracker';

// Initial Mock Accounts template with zero balances
const INITIAL_ACCOUNTS = [
  { id: 'acc-1', name: 'Bank BCA', type: 'bank', color: '#005caa', initialBalance: 0 },
  { id: 'acc-2', name: 'SeaBank', type: 'bank', color: '#ff5722', initialBalance: 0 },
  { id: 'acc-3', name: 'Dana', type: 'e-wallet', color: '#10b981', initialBalance: 0 },
  { id: 'acc-4', name: 'Gopay', type: 'e-wallet', color: '#00a2b9', initialBalance: 0 },
  { id: 'acc-5', name: 'Cash', type: 'cash', color: '#2e7d32', initialBalance: 0 }
];

// Start with empty transactions so user can import their own PDF
const INITIAL_TRANSACTIONS = [];

function App() {
  const [currentTab, setCurrentTab] = useState('dashboard');
  const [tabParams, setTabParams] = useState({});

  const handleTabChange = (tab, params = {}) => {
    setCurrentTab(tab);
    setTabParams(params);
  };

  // Load state from localStorage or fall back to mock data
  const [accounts, setAccounts] = useState(() => {
    const localAccounts = localStorage.getItem('financely_v9_accounts');
    if (localAccounts) {
      return JSON.parse(localAccounts);
    }
    return INITIAL_ACCOUNTS;
  });

  const [transactions, setTransactions] = useState(() => {
    const localTransactions = localStorage.getItem('financely_v9_transactions');
    if (localTransactions) {
      return JSON.parse(localTransactions);
    }
    return INITIAL_TRANSACTIONS;
  });

  const [budgets, setBudgets] = useState(() => {
    const localBudgets = localStorage.getItem('financely_v9_budgets');
    if (localBudgets) {
      return JSON.parse(localBudgets);
    }
    return {};
  });

  // Sync Accounts with LocalStorage
  useEffect(() => {
    localStorage.setItem('financely_v9_accounts', JSON.stringify(accounts));
  }, [accounts]);

  // Sync Transactions with LocalStorage
  useEffect(() => {
    localStorage.setItem('financely_v9_transactions', JSON.stringify(transactions));
  }, [transactions]);

  // Sync Budgets with LocalStorage
  useEffect(() => {
    localStorage.setItem('financely_v9_budgets', JSON.stringify(budgets));
  }, [budgets]);

  // Handle Account Addition
  const handleAddAccount = (newAccount) => {
    setAccounts([...accounts, newAccount]);
  };

  // Handle Transaction Addition
  const handleAddTransaction = (newTransaction) => {
    setTransactions([newTransaction, ...transactions]);
  };

  // Handle Transaction Deletion
  const handleDeleteTransaction = (id) => {
    if (window.confirm('Apakah Anda yakin ingin menghapus transaksi ini?')) {
      setTransactions(transactions.filter(t => t.id !== id));
    }
  };

  // Handle CSV Imported Transactions
  const handleImportTransactions = (importedTransactions) => {
    setTransactions([...importedTransactions, ...transactions]);
  };

  const handleUpdateBudget = (category, limit) => {
    setBudgets(prev => ({ ...prev, [category]: limit }));
  };

  // Render View Active Tab
  const renderActiveView = () => {
    switch (currentTab) {
      case 'dashboard':
        return (
          <DashboardView
            transactions={transactions}
            accounts={accounts}
            onAddAccountClick={() => handleTabChange('accounts')}
            onTabChange={handleTabChange}
          />
        );
      case 'accounts':
        return (
          <AccountsView
            transactions={transactions}
            accounts={accounts}
            onAddAccount={handleAddAccount}
            onAddTransaction={handleAddTransaction}
          />
        );
      case 'records':
        return (
          <RecordsView
            transactions={transactions}
            accounts={accounts}
            onAddTransaction={handleAddTransaction}
            onDeleteTransaction={handleDeleteTransaction}
            initialFilterCategory={tabParams.filterCategory}
            initialFilterMonth={tabParams.filterMonth}
            initialFilterYear={tabParams.filterYear}
          />
        );
      case 'analytics':
        return (
          <AnalyticsView
            transactions={transactions}
            accounts={accounts}
            onTabChange={handleTabChange}
          />
        );
      case 'budgets':
        return (
          <BudgetTracker
            transactions={transactions}
            budgets={budgets}
            onUpdateBudget={handleUpdateBudget}
          />
        );
      case 'import':
        return (
          <ImportView
            accounts={accounts}
            onImportTransactions={handleImportTransactions}
          />
        );
      default:
        return (
          <DashboardView
            transactions={transactions}
            accounts={accounts}
            onAddAccountClick={() => handleTabChange('accounts')}
            onTabChange={handleTabChange}
          />
        );
    }
  };

  return (
    <div className="app-layout">
      {/* Navigation Sidebar panel */}
      <Sidebar currentTab={currentTab} onTabChange={handleTabChange} />

      {/* Main Panel Area */}
      <main className="main-content">
        {renderActiveView()}
      </main>
    </div>
  );
}

export default App;
