import { useMemo, useState, useEffect, useCallback } from 'react';
import Homepage from './pages/Homepage';
import Accounts from './pages/Accounts';
import ClientProfile from './pages/ClientProfile';
import Forms from './pages/Forms';
import InteractionPage from './pages/InteractionPage';
import SpendDetails from './pages/SpendDetails';

const formatCurrency = (value) =>
  new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(value);

function App() {
  const [clients, setClients] = useState([]);
  const [search, setSearch] = useState('');
  const [selectedId, setSelectedId] = useState('');
  const [tabs, setTabs] = useState([]);
  const [activeTab, setActiveTab] = useState('');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const controller = new AbortController();

    async function loadClients() {
      try {
        const response = await fetch('/api/clients', {
          signal: controller.signal,
        });

        if (!response.ok) {
          throw new Error(`Failed to load clients: ${response.status}`);
        }

        const data = await response.json();
        setClients(data);

        if (data.length > 0) {
          setSelectedId(data[0].id);
          setTabs([{ id: 'homepage', name: 'Homepage', Component: Homepage, closable: false }]);
          setActiveTab('homepage');
        }
      } catch (fetchError) {
        if (fetchError.name !== 'AbortError') {
          setError(fetchError.message);
        }
      } finally {
        setLoading(false);
      }
    }

    loadClients();

    return () => controller.abort();
  }, []);

  const filteredClients = useMemo(() => {
    const normalized = search.trim().toLowerCase();
    if (!normalized) return clients;
    return clients.filter(
      (client) =>
        client.name.toLowerCase().includes(normalized) ||
        client.id.toLowerCase().includes(normalized)
    );
  }, [clients, search]);

  const selectedClient = useMemo(() => {
    if (!clients.length) return null;
    return clients.find((client) => client.id === selectedId) || filteredClients[0] || clients[0];
  }, [clients, selectedId, filteredClients]);

  const openTab = useCallback((id, name, Component) => {
    setTabs((prevTabs) => {
      if (prevTabs.some((tab) => tab.id === id)) {
        return prevTabs;
      }
      return [...prevTabs, { id, name, Component, closable: true }];
    });
    setActiveTab(id);
  }, []);

  const closeTab = (id) => {
    setTabs((prevTabs) => {
      const nextTabs = prevTabs.filter((tab) => tab.id !== id);
      if (nextTabs.length === prevTabs.length) return prevTabs;

      if (activeTab === id) {
        const nextActive = nextTabs[nextTabs.length - 1]?.id || 'homepage';
        setActiveTab(nextActive);
      }
      return nextTabs;
    });
  };

  const handleMenuItemClick = (id, name, Component) => {
    setIsMenuOpen(false);
    openTab(id, name, Component);
  };

  const tabProps = {
    selectedClient,
    setSelectedId,
    filteredClients,
    openTab,
  };

  const contentBackground = activeTab === 'homepage' ? '#F4EFE7' : '#BDDDBD';

  if (loading) {
    return (
      <div className="page">
        <div className="content" style={{ background: '#F4EFE7' }}>
          <div className="loading-screen">Loading client data...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="page">
        <div className="content" style={{ background: '#F4EFE7' }}>
          <div className="error-screen">Error: {error}</div>
        </div>
      </div>
    );
  }

  if (!selectedClient) {
    return (
      <div className="page">
        <div className="content" style={{ background: '#F4EFE7' }}>
          <div className="loading-screen">No clients available.</div>
        </div>
      </div>
    );
  }

  const activeTabObj = tabs.find((tab) => tab.id === activeTab);
  const ActiveTabComponent = activeTabObj?.Component;

  return (
    <div className="page">
      {/* Hamburger Menu */}
      <div className="hamburger-menu">
        <button
          className={`hamburger-toggle ${isMenuOpen ? 'open' : ''}`}
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          aria-label="Toggle menu"
        >
          <span></span>
          <span></span>
          <span></span>
        </button>
        {isMenuOpen && (
          <div className="menu-overlay" onClick={() => setIsMenuOpen(false)}></div>
        )}
        <nav className={`hamburger-nav ${isMenuOpen ? 'open' : ''}`}>
          <button className="menu-item" onClick={() => handleMenuItemClick('homepage', 'Homepage', Homepage)}>
            Homepage
          </button>
          <button className="menu-item" onClick={() => handleMenuItemClick('forms', 'Forms', Forms)}>
            Forms
          </button>
          <button className="menu-item" onClick={() => handleMenuItemClick('accounts', 'Accounts', Accounts)}>
            Accounts
          </button>
          <button className="menu-item" onClick={() => handleMenuItemClick('client-profile', 'Client Profile', ClientProfile)}>
            Client Profile
          </button>
          <button className="menu-item" onClick={() => handleMenuItemClick('interaction', 'Client Interaction', InteractionPage)}>
            Client Interaction
          </button>
        </nav>
      </div>

      {/* header container */}
      <header className="header card">
        <div className="header__left">
          <div className="avatar" aria-hidden="true"></div>
          <div className="pronouns">{selectedClient.pronouns || 'she/her'}</div>
        </div>

        <div className="header__grid">
          <div className="info">
            <div className="label">Name</div>
            <div className="value strong">{selectedClient.name.toUpperCase()}</div>
          </div>
          <div className="info">
            <div className="label">Marital Status</div>
            <div className="value">{selectedClient.maritalStatus}</div>
          </div>
          <div className="info">
            <div className="label">Location</div>
            <div className="value">{selectedClient.location}</div>
          </div>
          <div className="info">
            <div className="label">Housing Status</div>
            <div className="value">{selectedClient.housingStatus}</div>
          </div>
          <div className="info">
            <div className="label">Age</div>
            <div className="value">{selectedClient.age} yrs</div>
          </div>
          <div className="info">
            <div className="label">Time with PNC</div>
            <div className="value">{selectedClient.timeWithBank}</div>
          </div>
          <div className="info">
            <div className="label">Employment</div>
            <div className="value">{selectedClient.employment}</div>
          </div>
        </div>

        <div className="header__right">
          <button className="btn" onClick={() => openTab('client-profile', 'Client Profile', ClientProfile)}>
            Client profile <span aria-hidden="true">↗</span>
          </button>
        </div>
      </header>

      {/* tab navigation */}
      <nav className="tabs">
        {tabs.map((tab) => (
          <div key={tab.id} className={`tab ${activeTab === tab.id ? 'active' : ''} ${tab.id}`} onClick={() => setActiveTab(tab.id)}>
            {tab.name}
            {tab.closable && <button onClick={(e) => { e.stopPropagation(); closeTab(tab.id); }}>x</button>}
          </div>
        ))}
      </nav>

      {/* content */}
      <div className="content" style={{ background: contentBackground }}>
        {ActiveTabComponent ? <ActiveTabComponent {...tabProps} /> : null}
      </div>
    </div>
  );
}

export default App;
