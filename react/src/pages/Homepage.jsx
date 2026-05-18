import { useState } from 'react';
import Accounts from './Accounts';
import InteractionPage from './InteractionPage';

const formatCurrency = (value) =>
  new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(value);

// Pie chart component for account distribution (copied from Accounts.jsx)
function PieChart({ accounts }) {
  const width = 200;
  const height = 200;
  const radius = 80;
  const centerX = width / 2;
  const centerY = height / 2;

  const total = accounts.reduce((sum, account) => sum + Math.abs(account.balance), 0);
  let currentAngle = -Math.PI / 2; // Start from top

  const colors = ['#71B48D', '#BDDDBD', '#404E7C', '#db8c4f', '#eeceb6'];

  const [hoverSlice, setHoverSlice] = useState(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  const handleMouseEnter = (account, event) => {
    setHoverSlice(account);
    setMousePosition({ x: event.clientX, y: event.clientY });
  };

  const handleMouseLeave = () => {
    setHoverSlice(null);
  };

  const handleMouseMove = (event) => {
    if (hoverSlice) {
      setMousePosition({ x: event.clientX, y: event.clientY });
    }
  };

  return (
    <div className="pie-chart-container" onMouseMove={handleMouseMove}>
      <svg viewBox={`0 0 ${width} ${height}`} width="100%" height="100%">
        {accounts.map((account, index) => {
          const percentage = Math.abs(account.balance) / total;
          const angle = percentage * 2 * Math.PI;
          const startAngle = currentAngle;
          const endAngle = currentAngle + angle;

          const x1 = centerX + radius * Math.cos(startAngle);
          const y1 = centerY + radius * Math.sin(startAngle);
          const x2 = centerX + radius * Math.cos(endAngle);
          const y2 = centerY + radius * Math.sin(endAngle);

          const largeArcFlag = angle > Math.PI ? 1 : 0;

          const pathData = [
            `M ${centerX} ${centerY}`,
            `L ${x1} ${y1}`,
            `A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2}`,
            'Z'
          ].join(' ');

          currentAngle = endAngle;

          return (
            <path
              key={account.type}
              d={pathData}
              fill={colors[index]}
              stroke="#fff"
              strokeWidth="2"
              onMouseEnter={(event) => handleMouseEnter(account, event)}
              onMouseLeave={handleMouseLeave}
              style={{ cursor: 'pointer' }}
            />
          );
        })}
      </svg>

      {hoverSlice && (
        <div
          className="pie-tooltip"
          style={{
            position: 'fixed',
            left: mousePosition.x + 10,
            top: mousePosition.y - 10,
            pointerEvents: 'none',
            zIndex: 1000,
          }}
        >
          <div className="pie-tooltip-content">
            <div className="pie-tooltip-title">{hoverSlice.type} Account</div>
            <div className="pie-tooltip-value">{formatCurrency(hoverSlice.balance)}</div>
          </div>
        </div>
      )}
    </div>
  );
}

function Homepage({ selectedClient, setSelectedId, filteredClients, openTab }) {
  return (
    <>
      {/* Client selector dropdown
      {filteredClients.length > 1 && (
        <div className="client-selector">
          <label>Viewing client: </label>
          <select
            value={selectedClient.id}
            onChange={(e) => setSelectedId(e.target.value)}
          >
            {filteredClients.map((client) => (
              <option key={client.id} value={client.id}>
                {client.name}
              </option>
            ))}
          </select>
        </div>
      )} */}

      {/* dashboard */}
      <main className="dashboard">
        {/* insights */}
        <section className="module module--insights card">
          <h2 className="module__title">Insights</h2>
          <div className="module__content split">
            <div className="subcard">
              <h3 className="subcard__title">Client Summary</h3>
              <p className="muted">
                {selectedClient.name} is a {selectedClient.relationship} of PNC, {selectedClient.clientSummary.toLowerCase()}
              </p>

              <h3 className="subcard__title">Possible Opportunities</h3>
              <ul className="list">
                {selectedClient.opportunities.map((opp, i) => (
                  <li key={i}>{opp}</li>
                ))}
              </ul>
            </div>

            <div className="subcard">
              <h3 className="subcard__title">Client Goals</h3>
              <ul className="list">
                {selectedClient.clientGoals.map((goal, i) => (
                  <li key={i} className={goal.completed ? 'completed' : ''}>
                    {goal.goal}
                  </li>
                ))}
              </ul>

              <div className="notes">
                <div className="notes__label">Client Notes</div>
                <select className="select">
                  <option>Last submitted note</option>
                  <option>Note 2</option>
                  <option>Note 3</option>
                </select>
              </div>
            </div>
          </div>
        </section>

        {/* forms */}
        <section className="module module--forms card">
          <h2 className="module__title">Forms</h2>

          <div className="formPanel">
            <h3 className="formPanel__title">Client Interaction</h3>
            <p className="muted">
              Client appointment coming up? Start interaction form to see client insights +
              previous interaction summaries.
            </p>
            <div className="formPanel__actions">
              <button className="btn btn--ghost" aria-label="Call">
                ☎
              </button>
              <button className="btn" onClick={() => openTab('interaction', 'Client Interaction', InteractionPage)}>Start</button>
            </div>
          </div>

          <button className="accordion">
            <span>Service Request</span>
            <span className="chev" aria-hidden="true">▾</span>
          </button>
          <div className="accordionPanel muted">
            Placeholder content for service request module.
          </div>

          <button className="accordion">
            <span>Sales Request</span>
            <span className="chev" aria-hidden="true">▾</span>
          </button>
          <div className="accordionPanel muted">
            Placeholder content for sales request module.
          </div>
        </section>

        {/* net worth */}
        <section className="module module--networth card">
          <div className="bigMoney">{formatCurrency(selectedClient.netWorth)}</div>
          <div className="module__subtitle">Total Net Worth</div>
          <div className="muted">Assets</div>

          <div className="iconRow" aria-hidden="true">
            <div className="iconBox"></div>
            <div className="iconBox"></div>
            <div className="iconBox"></div>
          </div>
        </section>

        {/* accounts & chart */}
        <section className="module module--accounts card">
          <h2 className="module__title accounts-link" onClick={() => openTab('accounts', 'Accounts', Accounts)}>
            Accounts
          </h2>

          <div className="module__content accountsLayout">
            <PieChart accounts={selectedClient.accounts} />

            <div className="table">
              <div className="row headerRow">
                <div>Type</div><div>Balance</div>
              </div>
              {selectedClient.accounts.map((account, i) => (
                <div key={i} className="row">
                  <div className="account-name">
                    <div
                      className="account-indicator"
                      style={{ backgroundColor: ['#71B48D', '#BDDDBD', '#404E7C', '#db8c4f', '#eeceb6'][i] }}
                    ></div>
                    {account.type}
                  </div>
                  <div>{formatCurrency(account.balance)}</div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>
    </>
  );
}

export default Homepage;