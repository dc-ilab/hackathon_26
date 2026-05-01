import { useMemo, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { clients } from '../data/clients';

const formatCurrency = (value) =>
  new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(value);

// Line chart component for Overview Insight
function LineChart({ data }) {
  const width = 560;
  const height = 280;
  const padding = 40;
  const graphWidth = width - padding * 2;
  const graphHeight = height - padding * 2;

  const values = data.flatMap((row) => [row.Spend, row.Reserve, row.Growth]);
  const minValue = Math.min(...values);
  const maxValue = Math.max(...values);
  const range = maxValue - minValue || 1;

  const normalizeY = (value) => graphHeight - ((value - minValue) / range) * graphHeight;

  const series = [
    { key: 'Spend', color: '#71B48D' },
    { key: 'Reserve', color: '#BDDDBD' },
    { key: 'Growth', color: '#404E7C' },
  ];

  const xStep = data.length > 1 ? graphWidth / (data.length - 1) : 0;

  const getPoint = (index, value) => ({
    x: padding + index * xStep,
    y: padding + normalizeY(value),
  });

  const [hoverPoint, setHoverPoint] = useState(null);

  const getPath = (key) =>
    data
      .map((row, index) => {
        const { x, y } = getPoint(index, row[key]);
        return `${index === 0 ? 'M' : 'L'} ${x} ${y}`;
      })
      .join(' ');

  const tickCount = 5;
  const tickValues = Array.from({ length: tickCount }, (_, i) =>
    Math.round((maxValue - (range / (tickCount - 1)) * i) / 1000)
  );

  return (
    <svg viewBox={`0 0 ${width} ${height}`} width="100%" height="100%">
      {tickValues.map((value, i) => {
        const y = padding + (graphHeight / (tickCount - 1)) * i;
        return (
          <g key={`y-tick-${i}`}>
            <line
              x1={padding}
              y1={y}
              x2={width - padding}
              y2={y}
              stroke="#f0f0f0"
              strokeWidth="1"
            />
            <text x={padding - 10} y={y + 4} textAnchor="end" fontSize="12" fill="#666">
              ${value}k
            </text>
          </g>
        );
      })}

      <line x1={padding} y1={padding} x2={padding} y2={height - padding} stroke="#999" strokeWidth="2" />
      <line x1={padding} y1={height - padding} x2={width - padding} y2={height - padding} stroke="#999" strokeWidth="2" />

      {series.map((seriesItem) => (
        <path
          key={seriesItem.key}
          d={getPath(seriesItem.key)}
          fill="none"
          stroke={seriesItem.color}
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      ))}

      {data.map((row, index) =>
        series.map((seriesItem) => {
          const { x, y } = getPoint(index, row[seriesItem.key]);
          return (
            <circle
              key={`${seriesItem.key}-${index}`}
              cx={x}
              cy={y}
              r="6"
              fill={seriesItem.color}
              stroke="#fff"
              strokeWidth="2"
              onMouseEnter={() =>
                setHoverPoint({
                  x,
                  y,
                  month: row.month,
                  account: seriesItem.key,
                  value: row[seriesItem.key],
                })
              }
              onMouseLeave={() => setHoverPoint(null)}
            />
          );
        })
      )}

      {data.map((row, index) => (
        <text
          key={`x-label-${row.month}`}
          x={padding + index * xStep}
          y={height - padding + 20}
          textAnchor="middle"
          fontSize="12"
          fill="#666"
        >
          {row.month}
        </text>
      ))}

      {hoverPoint ? (
        (() => {
          const tooltipWidth = 120;
          const tooltipHeight = 48;
          const tooltipX = Math.min(
            Math.max(hoverPoint.x + 10, padding + 10),
            width - padding - tooltipWidth
          );
          const tooltipY = Math.max(
            Math.min(hoverPoint.y - tooltipHeight / 2, height - padding - tooltipHeight),
            padding + 10
          );
          return (
            <g pointerEvents="none" className="chart-tooltip">
              <rect
                x={tooltipX}
                y={tooltipY}
                width={tooltipWidth}
                height={tooltipHeight}
                rx={10}
                ry={10}
                fill="#251F47"
                opacity="0.95"
              />
              <text
                x={tooltipX + 10}
                y={tooltipY + 18}
                fill="#fff"
                fontSize="12"
                fontWeight="700"
              >
                {hoverPoint.account}
              </text>
              <text
                x={tooltipX + 10}
                y={tooltipY + 34}
                fill="#fff"
                fontSize="12"
              >
                {hoverPoint.month}: {formatCurrency(hoverPoint.value)}
              </text>
            </g>
          );
        })()
      ) : null}
    </svg>
  );
}

function Accounts() {
  const [searchParams] = useSearchParams();
  const clientId = searchParams.get('clientId');

  const selectedClient = useMemo(() => {
    if (clientId) {
      return clients.find(c => c.id === clientId) || clients[0];
    }
    return clients[0];
  }, [clientId]);

  const accountHistory = useMemo(() => {
    const spend = selectedClient.accounts.find((account) => account.type === 'Spend')?.balance || 0;
    const reserve = selectedClient.accounts.find((account) => account.type === 'Reserve')?.balance || 0;
    const growth = selectedClient.accounts.find((account) => account.type === 'Growth')?.balance || 0;

    const factors = [
      { month: 'Nov', Spend: 0.78, Reserve: 0.74, Growth: 0.66 },
      { month: 'Dec', Spend: 0.82, Reserve: 0.78, Growth: 0.70 },
      { month: 'Jan', Spend: 0.86, Reserve: 0.82, Growth: 0.74 },
      { month: 'Feb', Spend: 0.90, Reserve: 0.86, Growth: 0.78 },
      { month: 'Mar', Spend: 0.94, Reserve: 0.90, Growth: 0.84 },
      { month: 'Apr', Spend: 1, Reserve: 1, Growth: 1 },
    ];

    return factors.map((factor) => ({
      month: factor.month,
      Spend: Math.round(spend * factor.Spend),
      Reserve: Math.round(reserve * factor.Reserve),
      Growth: Math.round(growth * factor.Growth),
    }));
  }, [selectedClient]);

  return (
    <div className="accounts-page">
      {/* Breadcrumb Navigation */}
      <nav className="breadcrumb">
        <Link to="/">Homepage</Link>
        <span>&gt;</span>
        <span>Accounts</span>
      </nav>

      {/* Client Information Section */}
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
          <Link to="/client" className="btn">
            Client profile <span aria-hidden="true">↗</span>
          </Link>
        </div>
      </header>

      {/* Overview Insight Section */}
      <section className="overview-insight-section">
        <h2>Overview Insight</h2>
        <p className="insight-description">
          This chart displays the trends across your accounts, showing how each account's balance changed over the last six months.
        </p>

        <div className="overview-grid">
          <article className="overview-summary-card">
            <h3>Account totals</h3>
            <div className="overview-summary-list">
              {selectedClient.accounts.map((account, i) => (
                <div key={account.type} className="overview-summary-item">
                  <div>
                    <div className="summary-label">{account.type} Account</div>
                    <div className="summary-value">{formatCurrency(account.balance)}</div>
                  </div>
                  <div className="summary-pill" style={{ backgroundColor: ['#71B48D', '#BDDDBD', '#404E7C'][i] }} />
                </div>
              ))}
            </div>
            <p className="overview-summary-note">
              The graph shows monthly balances for each account type over the last six months, using sample totals for Spend, Reserve, and Growth accounts.
            </p>
          </article>

          <article className="overview-chart-card">
            <div className="chart-wrapper">
              <LineChart data={accountHistory} />
            </div>

            <div className="chart-legend">
              {['Spend', 'Reserve', 'Growth'].map((type, i) => (
                <div key={type} className="legend-item">
                  <div
                    className="legend-color"
                    style={{ backgroundColor: ['#71B48D', '#BDDDBD', '#404E7C'][i] }}
                  ></div>
                  <span>{type} Account</span>
                </div>
              ))}
            </div>
          </article>
        </div>
      </section>

      {/* Accounts Breakdown Section */}
      <section className="accounts-breakdown-section">
        <h2>Accounts Breakdown</h2>
        <div className="accounts-breakdown-grid">
          {selectedClient.accounts.map((account, i) => (
            <div key={account.type} className="breakdown-card">
              <div
                className="breakdown-indicator"
                style={{ backgroundColor: ['#71B48D', '#BDDDBD', '#404E7C'][i] }}
              ></div>
              <h3>{account.type} Account</h3>
              <p className="breakdown-balance">{formatCurrency(account.balance)}</p>
              <p className="breakdown-percentage">{account.percentage}% of total</p>
            </div>
          ))}
        </div>
      </section>

      {/* Account Information Section */}
      <section className="account-information-section">
        <h2>Account Information</h2>
        <table className="accounts-table">
          <thead>
            <tr>
              <th>Account Type</th>
              <th>Balance</th>
              <th>Percentage</th>
              <th>Last Transaction</th>
            </tr>
          </thead>
          <tbody>
            {selectedClient.accounts.map((account, i) => {
              const lastActivity = selectedClient.recentActivity[i] || selectedClient.recentActivity[0];
              return (
                <tr key={account.type}>
                  <td>
                    <div className="account-name">
                      <div
                        className="account-indicator"
                        style={{ backgroundColor: ['#71B48D', '#BDDDBD', '#404E7C'][i] }}
                      ></div>
                      {account.type}
                    </div>
                  </td>
                  <td>{formatCurrency(account.balance)}</td>
                  <td>{account.percentage}%</td>
                  <td>
                    {lastActivity.type === 'deposit' && '+'}
                    {lastActivity.type === 'withdrawal' && '-'}
                    {lastActivity.type !== 'deposit' && lastActivity.type !== 'withdrawal' && ''}
                    {formatCurrency(lastActivity.amount)} ({lastActivity.date})
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </section>

      {/* Back to Client Button */}
      <div className="accounts-footer">
        <Link to="/" className="btn-back">← Back to Client</Link>
      </div>
    </div>
  );
}

export default Accounts
