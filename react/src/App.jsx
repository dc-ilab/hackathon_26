import { useMemo, useState } from 'react';
import Homepage from './pages/Homepage';
import Accounts from './pages/Accounts';
import ClientProfile from './pages/ClientProfile';
import Forms from './pages/Forms';
import InteractionPage from './pages/InteractionPage';
import { clients } from './data/clients';

const formatCurrency = (value) =>
  new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(value);

// Simple donut chart component
function DonutChart() {
  return (
    <div className="donut" aria-hidden="true"></div>
  );
}

function App() {
  const [search, setSearch] = useState('');
  const [selectedId, setSelectedId] = useState(clients[0].id);
  const [tabs, setTabs] = useState([{id: 'homepage', name: 'Homepage', component: <Homepage selectedClient={clients.find(c => c.id === selectedId) || clients[0]} setSelectedId={setSelectedId} filteredClients={[]} openTab={(id, name, Component) => openTab(id, name, Component)} />, closable: false}]);
  const [activeTab, setActiveTab] = useState('homepage');
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const filteredClients = useMemo(() => {
    const normalized = search.trim().toLowerCase();
    if (!normalized) return clients;
    return clients.filter(
      (client) =>
        client.name.toLowerCase().includes(normalized) ||
        client.id.toLowerCase().includes(normalized)
    );
  }, [search]);

  const selectedClient = clients.find((client) => client.id === selectedId) || filteredClients[0] || clients[0];

  const openTab = (id, name, Component) => {
    const existing = tabs.find(t => t.id === id);
    if (!existing) {
      setTabs([...tabs, {id, name, component: <Component selectedClient={selectedClient} openTab={openTab} />, closable: true}]);
    }
    setActiveTab(id);
  };

  const closeTab = (id) => {
    const tabToClose = tabs.find(t => t.id === id);
    if (tabToClose && tabToClose.closable && tabs.length > 1) {
      setTabs(tabs.filter(t => t.id !== id));
      if (activeTab === id) {
        setActiveTab(tabs.find(t => t.id !== id).id);
      }
    }
  };

  // Update tabs when selectedClient changes
  useMemo(() => {
    setTabs(tabs.map(tab => ({
      ...tab,
      component: tab.id === 'homepage' ? <Homepage selectedClient={selectedClient} setSelectedId={setSelectedId} filteredClients={filteredClients} openTab={openTab} /> : tab.component
    })));
  }, [selectedClient, filteredClients]);

  const contentBackground = activeTab === 'homepage' ? '#F4EFE7' : '#BDDDBD';

  const handleMenuItemClick = (id, name, Component) => {
    setIsMenuOpen(false);
    openTab(id, name, Component);
  };

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
          <button
            className="menu-item"
            onClick={() => handleMenuItemClick('homepage', 'Homepage', Homepage)}
          >
            Homepage
          </button>
          <button
            className="menu-item"
            onClick={() => handleMenuItemClick('forms', 'Forms', Forms)}
          >
            Forms
          </button>
          <button
            className="menu-item"
            onClick={() => handleMenuItemClick('accounts', 'Accounts', Accounts)}
          >
            Accounts
          </button>
          <button
            className="menu-item"
            onClick={() => handleMenuItemClick('client-profile', 'Client Profile', ClientProfile)}
          >
            Client Profile
          </button>
          <button
            className="menu-item"
            onClick={() => handleMenuItemClick('interaction', 'Client Interaction', InteractionPage)}
          >
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
            {tab.closable && <button onClick={(e) => {e.stopPropagation(); closeTab(tab.id);}}>x</button>}
          </div>
        ))}
      </nav>

      {/* content */}
      <div className="content" style={{ background: contentBackground }}>
        {tabs.find((tab) => tab.id === activeTab)?.component}
      </div>
    </div>
  );
}

export default App;
