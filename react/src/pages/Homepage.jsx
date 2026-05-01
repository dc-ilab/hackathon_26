import { useState } from 'react';
import { Link } from 'react-router-dom';
import { clients } from '../data/clients';
import Accounts from './Accounts';

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

function Homepage({ selectedClient, setSelectedId, filteredClients, openTab }) {
  return (
    <>
      {/* Client selector dropdown */}
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
      )}

      {/* recent activity */}
      <section className="activity card">
        <div className="activity__title">Recent Activity</div>
        <div className="timeline">
          {selectedClient.recentActivity.map((_, i) => (
            <div
              key={i}
              className="tick"
              title={i === 0 ? '4/2' : undefined}
            ></div>
          ))}
          <div className="callout">Appointment scheduled</div>
        </div>
      </section>

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
              <button className="btn">Start</button>
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
          <h2 className="module__title" onClick={() => openTab('accounts', 'Accounts', Accounts)}>
            Accounts
          </h2>

          <div className="module__content accountsLayout">
            <DonutChart />

            <div className="table">
              <div className="row headerRow">
                <div>Type</div><div>AcCount</div>
              </div>
              {selectedClient.accounts.map((account, i) => (
                <div key={i} className="row">
                  <div>{account.type}</div>
                  <div>xxx{String(i + 1).padStart(4, '0')}</div>
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