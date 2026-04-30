import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { clients } from './data/clients';

const formatCurrency = (value) =>
  new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(value);

// Simple donut chart component
function DonutChart({ data }) {
  const total = data.reduce((sum, d) => sum + d.balance, 0);
  let currentAngle = -90;
  const segments = data.map((d) => {
    const percentage = (d.balance / total) * 100;
    const angle = (percentage / 100) * 360;
    const startAngle = currentAngle;
    const endAngle = currentAngle + angle;
    currentAngle = endAngle;
    return { ...d, percentage, startAngle, endAngle };
  });

  const colors = ['#71B48D', '#BDDDBD', '#404E7C'];
  const radius = 60;
  const innerRadius = 40;

  const createPath = (startAngle, endAngle, radius) => {
    const startRad = (startAngle * Math.PI) / 180;
    const endRad = (endAngle * Math.PI) / 180;
    const x1 = Math.cos(startRad) * radius;
    const y1 = Math.sin(startRad) * radius;
    const x2 = Math.cos(endRad) * radius;
    const y2 = Math.sin(endRad) * radius;
    const largeArc = angle > 180 ? 1 : 0;
    return `M ${x1} ${y1} A ${radius} ${radius} 0 ${largeArc} 1 ${x2} ${y2}`;
  };

  return (
    <svg viewBox="-100 -100 200 200" width={180} height={180}>
      {segments.map((seg, i) => {
        const angle = seg.endAngle - seg.startAngle;
        const startRad = (seg.startAngle * Math.PI) / 180;
        const endRad = (seg.endAngle * Math.PI) / 180;
        const x1 = Math.cos(startRad) * radius;
        const y1 = Math.sin(startRad) * radius;
        const x2 = Math.cos(endRad) * radius;
        const y2 = Math.sin(endRad) * radius;
        const largeArc = angle > 180 ? 1 : 0;
        const x1Inner = Math.cos(startRad) * innerRadius;
        const y1Inner = Math.sin(startRad) * innerRadius;
        const x2Inner = Math.cos(endRad) * innerRadius;
        const y2Inner = Math.sin(endRad) * innerRadius;
        const path = `M ${x1} ${y1} A ${radius} ${radius} 0 ${largeArc} 1 ${x2} ${y2} L ${x2Inner} ${y2Inner} A ${innerRadius} ${innerRadius} 0 ${largeArc} 0 ${x1Inner} ${y1Inner} Z`;
        return (
          <path
            key={i}
            d={path}
            fill={colors[i]}
            stroke="none"
          />
        );
      })}
    </svg>
  );
}

function App() {
  const [search, setSearch] = useState('');
  const [selectedId, setSelectedId] = useState(clients[0].id);
  const [activeTab, setActiveTab] = useState('Accounts');

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

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="sidebar-header">
          <div>
            <p className="eyebrow">Branch Banker View</p>
            <h1>Clients</h1>
          </div>
          <div className="sidebar-summary">
            <p>{filteredClients.length}</p>
            <small>clients</small>
          </div>
        </div>

        <div className="search-box">
          <input
            type="search"
            placeholder="Search clients"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
        </div>

        <div className="client-list">
          {filteredClients.map((client) => (
            <button
              key={client.id}
              className={`client-card ${client.id === selectedClient.id ? 'active' : ''}`}
              onClick={() => setSelectedId(client.id)}
            >
              <div>
                <strong>{client.name}</strong>
                <span>{client.employment}</span>
              </div>
              <div className="client-meta">
                <small>{client.id}</small>
                <small>{client.age} yrs</small>
              </div>
            </button>
          ))}
        </div>
      </aside>

      <main className="details-panel">
        <section className="client-header">
          <div className="client-header-left">
            <div className="client-avatar">
              {selectedClient.name
                .split(' ')
                .map((n) => n[0])
                .join('')}
            </div>
            <div className="client-info">
              <h2>{selectedClient.name}</h2>
              <p className="client-subtitle">she/her · {selectedClient.relationship}</p>
              <div className="client-details-grid">
                <div>
                  <small>Age</small>
                  <span>{selectedClient.age} yrs</span>
                </div>
                <div>
                  <small>Marital Status</small>
                  <span>{selectedClient.maritalStatus}</span>
                </div>
                <div>
                  <small>Location</small>
                  <span>{selectedClient.location}</span>
                </div>
                <div>
                  <small>Housing Status</small>
                  <span>{selectedClient.housingStatus}</span>
                </div>
                <div>
                  <small>Time with PNC</small>
                  <span>{selectedClient.timeWithBank}</span>
                </div>
                <div>
                  <small>Employment</small>
                  <span>{selectedClient.employment}</span>
                </div>
              </div>
            </div>
          </div>
          <div className="client-header-right">
            <button className="btn-profile">Client profile →</button>
          </div>
        </section>

        <div className="tabs">
          {['Coverages', 'Accounts'].map((tab) => (
            <button
              key={tab}
              className={`tab ${tab === activeTab ? 'active' : ''}`}
              onClick={() => setActiveTab(tab)}
            >
              {tab}
            </button>
          ))}
        </div>

        <section className="recent-activity">
          <h3>Recent Activity</h3>
          <div className="activity-timeline">
            {selectedClient.recentActivity.map((activity, i) => (
              <div key={i} className="activity-dot"></div>
            ))}
          </div>
        </section>

        <div className="main-grid">
          <article className="card insights-card">
            <header>
              <h3>Insights</h3>
            </header>
            <div className="insights-content">
              <div className="insight-section">
                <h4>Client Summary</h4>
                <p>{selectedClient.clientSummary}</p>
              </div>
              <div className="insight-section">
                <h4>Possible Opportunities</h4>
                <ul className="opportunity-list">
                  {selectedClient.opportunities.map((opp, i) => (
                    <li key={i}>{opp}</li>
                  ))}
                </ul>
              </div>
            </div>
          </article>

          <article className="card goals-card">
            <header>
              <h3>Client Goals</h3>
            </header>
            <div className="goals-list">
              {selectedClient.clientGoals.map((goal, i) => (
                <label key={i} className="goal-item">
                  <input
                    type="checkbox"
                    checked={goal.completed}
                    readOnly
                  />
                  <span className={goal.completed ? 'completed' : ''}>{goal.goal}</span>
                </label>
              ))}
            </div>
          </article>
        </div>

        <div className="main-grid">
          <article className="card net-worth-card">
            <header>
              <h3>Total Net Worth</h3>
            </header>
            <div className="net-worth-content">
              <div className="net-worth-amount">{formatCurrency(selectedClient.netWorth)}</div>
              <div className="asset-info">
                <span>Assets</span>
              </div>
            </div>
          </article>

          <article className="card accounts-card">
            <header>
              <h3>
                <Link to="/accounts" className="header-link">
                      Accounts
                </Link>
              </h3>
            </header>
            <div className="accounts-content">
              <div className="chart-container">
                <DonutChart data={selectedClient.accounts} />
              </div>
              <div className="accounts-list">
                {selectedClient.accounts.map((account) => (
                  <div key={account.type} className="account-row">
                    <span>{account.type}</span>
                    <span>{formatCurrency(account.balance)}</span>
                  </div>
                ))}
              </div>
            </div>
          </article>
        </div>

        <article className="card forms-card">
          <header>
            <h3>Forms</h3>
          </header>
          <div className="forms-grid">
            {selectedClient.interactions.map((interaction, i) => (
              <div key={i} className="form-item">
                <h4>{interaction.type}</h4>
                <p>Client appointment coming up? Plan interactions here to stay engaged!</p>
                <div className="form-buttons">
                  <button className="btn-form">No</button>
                  <button className="btn-form">Yes</button>
                </div>
              </div>
            ))}
          </div>
        </article>

        <article className="card notes-card">
          <header>
            <h3>Relationship Notes</h3>
            <small>Last submitted note</small>
          </header>
          <p>{selectedClient.notes}</p>
        </article>
      </main>
    </div>
  );
}

export default App;
