import { useState,  useRef } from 'react';
import Accounts from './Accounts';
import InteractionPage from './InteractionPage';
import Forms from './Forms';
import SpendDetails from './SpendDetails';
import ReserveDetails from './ReserveDetails';
import GrowthDetails from './GrowthDetails';
import externalLinkIcon from '../assets/external-link-icon.png';


const formatCurrency = (value) =>
  new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(value);

// Pie chart component for account distribution (copied from Accounts.jsx)
function PieChart({ accounts }) {
  const containerRef = useRef(null);
  const width = 200;
  const height = 200;
  const gap = 6;
  const outerRadius = 85;   // liabilities
  const innerRadius = 55 - gap;  // assets outer edge
  const innerHoleRadius = 25; // center hole
  const centerX = width / 2;
  const centerY = height / 2;

  const assetAccounts = accounts.filter(acc => acc.balance > 0);
  const assetTotal = assetAccounts.reduce((sum, acc) => sum + acc.balance, 0);
  const safeAssetTotal = assetTotal || 1;

  const liabilityAccounts = accounts.filter(acc => acc.balance < 0);
  const liabilityTotal = liabilityAccounts.reduce((sum, acc) => sum + Math.abs(acc.balance), 0); 
  const safeLiabilityTotal = liabilityTotal || 1;

  const total = accounts.reduce((sum, account) => sum + Math.abs(account.balance), 0);
  let currentAngle = -Math.PI / 2; // Start from top

  const colors = ['#71B48D', '#BDDDBD', '#404E7C', '#db8c4f', '#eeceb6'];

  const [hoverSlice, setHoverSlice] = useState(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  const createArc = (startAngle, endAngle, outerR, innerR) => {
    const x1 = centerX + outerR * Math.cos(startAngle);
    const y1 = centerY + outerR * Math.sin(startAngle);
    const x2 = centerX + outerR * Math.cos(endAngle);
    const y2 = centerY + outerR * Math.sin(endAngle);

    const x3 = centerX + innerR * Math.cos(endAngle);
    const y3 = centerY + innerR * Math.sin(endAngle);
    const x4 = centerX + innerR * Math.cos(startAngle);
    const y4 = centerY + innerR * Math.sin(startAngle);

    const largeArcFlag = endAngle - startAngle > Math.PI ? 1 : 0;

    return `
      M ${x1} ${y1}
      A ${outerR} ${outerR} 0 ${largeArcFlag} 1 ${x2} ${y2}
      L ${x3} ${y3}
      A ${innerR} ${innerR} 0 ${largeArcFlag} 0 ${x4} ${y4}
      Z
    `;
  };

  const handleMouseEnter = (account, event) => {
    setHoverSlice(account);
    const rect = containerRef.current.getBoundingClientRect();
    setMousePosition({
      x: event.clientX - rect.left,
      y: event.clientY - rect.top,
    });
  };

  const handleMouseLeave = () => {
    setHoverSlice(null);
  };

  const handleMouseMove = (event) => {
    if (hoverSlice) {
      const rect = containerRef.current.getBoundingClientRect();
      setMousePosition({
        x: event.clientX - rect.left,
        y: event.clientY - rect.top,
      });
    }
  };

  const accountRoutes = {
    Spend: {
      id: 'spend-account',
      label: 'Spend Account',
      component: SpendDetails,
    },
    Reserve: {
      id: 'reserve-account',
      label: 'Reserve Account',
      component: ReserveDetails,
    },
    Growth: {
      id: 'growth-account',
      label: 'Growth Account',
      component: GrowthDetails,
    },
  };

  return (
  <div ref={containerRef} className="pie-chart-container" onMouseMove={handleMouseMove}>
    <svg viewBox={`0 0 ${width} ${height}`} width="100%" height="100%">
      {/* inner pie chart*/}
      let currentAngle = -Math.PI / 2;
      {liabilityAccounts.map((acc, i) => {
        const sliceAngle =
          (Math.abs(acc.balance) / (liabilityTotal || 1)) * 2 * Math.PI;

        const start = currentAngle;
        const end = currentAngle + sliceAngle;

        const path = createArc(start, end, innerRadius, innerHoleRadius);

        currentAngle = end;

        return (
          <path
            key={acc.type}
            d={path}
            fill={colors[(i + assetAccounts.length) % colors.length]}
            stroke="#ffffff89"
            strokeWidth="1.5"
            onMouseEnter={(e) => handleMouseEnter(acc, e)}
            onMouseLeave={handleMouseLeave}
          />
        );
      })}


      {/* outer pie chart */}
      currentAngle = -Math.PI / 2;
      {assetAccounts.map((acc, i) => {
        const sliceAngle =
          (Math.abs(acc.balance) / (assetTotal || 1)) * 2 * Math.PI;

        const start = currentAngle;
        const end = currentAngle + sliceAngle;

        const path = createArc(start, end, outerRadius, innerRadius +gap);

        currentAngle = end;

        return (
          <path
            key={acc.type}
            d={path}
            fill={colors[i % colors.length]}
            stroke="#ffffff89"
            strokeWidth="1.5"
            onMouseEnter={(e) => handleMouseEnter(acc, e)}
            onMouseLeave={handleMouseLeave}
          />
        );
      })}
      <circle
  cx={centerX}
  cy={centerY}
  r={innerHoleRadius}
  fill="#ffffff00"
/>

    </svg>

    {hoverSlice && (
      <div
        className="pie-tooltip"
        style={{
          position: 'absolute',
          left: mousePosition.x + 10,
          top: mousePosition.y - 10,
          pointerEvents: 'none',
          zIndex: 1000,
        }}
      >
        <div className="pie-tooltip-content">
            <div className="pie-tooltip-title">{hoverSlice.type} Account</div>
            <div className="pie-tooltip-value">
              {hoverSlice.type === 'liabilityAccount'
                ? `-${formatCurrency(Math.abs(hoverSlice.balance))}`
                : formatCurrency(hoverSlice.balance)}
            </div>
        </div>
        
      </div>
    )}
  </div>
);

}

function Homepage({ selectedClient, setSelectedId, filteredClients, openTab }) {
  return (
    <div className="background-card">

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
        <section className="module module--forms card with-link">
          <h2 className="module__title forms-link" onClick={() => openTab('forms', 'Forms', Forms)}>
            Forms
            <img src={externalLinkIcon} alt="" className="link-icon" />
          </h2>

          <div className="formPanel">
            <h3 className="formPanel__title">Client Interaction</h3>
            <p className="muted">
              Client appointment coming up? Start interaction form to see client insights +
              previous interaction summaries.
            </p>
            <div className="formPanel__actions">
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
          <h2 className="module__title insights">
            Balances
          </h2>
          
            <div className="networth-grid">
              <div className="networth-item">
                <div className="label">Accounts</div>
                <div className="value positive">
                  {formatCurrency(selectedClient.netWorth)}
                </div>
              </div>
              <div className="networth-item">
                <div className="label">Loans</div>
                <div className="value negative">
                  {formatCurrency(selectedClient.netWorth)}
                </div>
              </div>
            </div>
            <div className="networth-divider" />
            <div className="networth-total">
              <div className="label">Net Worth</div>
              <div className="total-value">
                {formatCurrency(selectedClient.netWorth)}
              </div>
              <div className="acc-loans">Accounts − Loans</div>
            </div>
        
        </section>

        {/* accounts & chart */}
        <section className="module module--accounts card with-link">
          <div className="accounts-homepage-header">
            <h2 className="module__title accounts-link" onClick={() => openTab('accounts', 'Accounts', Accounts)}>
              Accounts
              <img src={externalLinkIcon} alt="" className="link-icon" />
            </h2>
          </div>

          <div className="module__content accountsLayout">
            <PieChart accounts={selectedClient.accounts} />

            <div className="table">
              <div className="row headerRow">
                <div>Type</div><div>Balance</div>
              </div>
              {selectedClient.accounts.map((account, i) => (
                <div key={i} className="row">                  
                <div
                  className={`account-name ${
                  account.type === 'Spend' ||
                  account.type === 'Reserve' ||
                  account.type === 'Growth'
                    ? 'account-link'
                    : ''
                }`}

                onClick={() => {
                  if (account.type === 'Spend') {
                    openTab('spend-account', 'Spend Account', SpendDetails);
                  } else if (account.type === 'Reserve') {
                    openTab('reserve-account', 'Reserve Account', ReserveDetails);
                  } else if (account.type === 'Growth') {
                    openTab('growth-account', 'Growth Account', GrowthDetails);
                  }
                }}

                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    if (account.type === 'Spend') {
                      openTab('spend-account', 'Spend Account', SpendDetails);
                    } else if (account.type === 'Reserve') {
                      openTab('reserve-account', 'Reserve Account', ReserveDetails);
                    } else if (account.type === 'Growth') {
                      openTab('growth-account', 'Growth Account', GrowthDetails);
                    }
                  }
                }}

                role={
                  account.type === 'Spend' ||
                  account.type === 'Reserve' ||
                  account.type === 'Growth'
                    ? 'button'
                    : undefined
                }

                tabIndex={
                  account.type === 'Spend' ||
                  account.type === 'Reserve' ||
                  account.type === 'Growth'
                    ? 0
                    : undefined
                }

                >
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
    </div>
  );
}

export default Homepage;