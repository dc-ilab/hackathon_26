import { useMemo, useState } from 'react';
import SpendDetails from './SpendDetails';
import AutoLoanDetails from './AutoLoanDetails';
import ReserveDetails from './ReserveDetails';
import GrowthDetails from './GrowthDetails';
import CreditDetails from './CreditDetails';
import { getAssetsAndLiabilities } from '../utils';

const formatCurrency = (value) =>
  new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(value);

const formatDate = (value) => {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat('en-US').format(date);
};

// Line chart component for Overview Insight
function LineChart({ data }) {
  const width = 560;
  const height = 450;
  const padding = 40;
  const graphWidth = width - padding * 2;
  const graphHeight = height - padding * 2;
  const hasAutoLoan = data.some(row => Math.abs(row.AutoLoan) > 0);
  const hasHELOC = data.some(row => Math.abs(row.HELOC) > 0);


  const values = data.flatMap((row) => [
    row.Spend, 
    row.Reserve, 
    row.Growth,
    row.AutoLoan,
    row.HELOC,
  ]);
  const maxValueRaw = Math.max(...values);
  const minValueRaw = Math.min(...values);

  // padding space
  const maxValue = Math.max(maxValueRaw * 1.5, 0);
  const minValue = Math.min(minValueRaw * 1.0, 0);
  const range = maxValue - minValue || 1;

  const series = [
    { key: 'Spend', color: '#71B48D' },
    { key: 'Reserve', color: '#BDDDBD' },
    { key: 'Growth', color: '#404E7C' },
    ...(hasAutoLoan ? [{ key: 'AutoLoan', color: '#db8c4f' }] : []),
    ...(hasHELOC ? [{ key: 'HELOC', color: '#eeceb6' }] : []),
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

  const tickCount = 6;
  const tickValues = Array.from({ length: tickCount }, (_, i) => maxValue - (range / (tickCount - 1)) * i);
  const zeroIndex = tickValues.findIndex(v => Math.abs(v) < range / 100);
  // Force 0 into ticks if missing
  if (!tickValues.some(v => Math.abs(v) < 1)) {
    tickValues.push(0);
  }
  const normalizeY = (value) => graphHeight - ((value - minValue) / range) * graphHeight;
  const zeroY = padding + normalizeY(0);

  return (
    <svg id="accounts-line-chart" viewBox={`0 0 ${width} ${height}`} width="100%" height="100%">
      {tickValues.map((value, i) => { const y = padding + normalizeY(value);
        return (
          <g key={`y-tick-${i}`}>
            <line
              x1={padding}
              y1={y}
              x2={width - padding}
              y2={y}
              stroke={Math.abs(tickValues[i]) < range / 100 ? "rgb(153,153,153)" : "#f0f0f0"}
              strokeWidth={Math.abs(tickValues[i]) < range / 100 ? "2" : "1"}
            />
            <text x={padding - 10} y={y + 4} textAnchor="end" fontSize="12" fill="#666">
              {Math.abs(value) < 1
                ? "$0"
                : `$${Math.round(value / 1000)}k`
                }
            </text>
          </g>
        );
      })}

      <line id='y-axis-line'
        x1={padding} 
        y1={padding} 
        x2={padding} 
        y2={height - padding} 
        stroke="#999" 
        strokeWidth="2" 
      />

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

// Pie chart component for account distribution
function PieChart({ accounts, type = 'asset'}) {
  const width = 200;
  const height = 200;
  const radius = 80;
  const centerX = width / 2;
  const centerY = height / 2;

  const normalizedAccounts = accounts.map(acc => ({
    ...acc,
    normalizedBalance:
      type === 'liability'
        ? Math.abs(acc.balance)
        : acc.balance
  }));

  const total = accounts.reduce(
    (sum, account) => sum + Math.abs(account.balance),
    0
  );
  const filteredAccounts = accounts.filter(
  (acc) => Math.abs(acc.balance) > 0
);

if (!filteredAccounts.length) {
  return null;
}

  let currentAngle = -Math.PI / 2; // Start from top

  const colors =
  type === 'liability'
    ? ['#db8c4f', '#eeceb6']
    : ['#71B48D', '#BDDDBD', '#404E7C'];

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
      <svg id="pie-chart" viewBox={`0 0 ${width} ${height}`} width="100%" height="100%">
        {filteredAccounts.map((account, index) => {
          const percentage = total > 0 ? Math.abs(account.balance) / total: 0;
          const angle = isNaN(percentage) ? 0 : percentage * 2 * Math.PI;

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
            <div className="pie-tooltip-value">
              {type === 'liability'
                ? `-${formatCurrency(Math.abs(hoverSlice.balance))}`
                : formatCurrency(hoverSlice.balance)}
            </div>

          </div>
        </div>
      )}
    </div>
  );
}

function Accounts({ selectedClient, openTab, clients}) {
  const { assetAccounts, liabilityAccounts } = getAssetsAndLiabilities(selectedClient.accounts);
  const orderedAccounts = [...assetAccounts, ...liabilityAccounts];
  const assetColors = ['#bdddbd','#71B48D','#404E7C', '#4a3974'];
  const liabilityColors = ['#db8c4f', '#eeceb6', '#edeea4', '#e3e64a'];
  let _ai = 0, _li = 0; // asset and liability color indices
  const overviewColors = orderedAccounts.map((acc) => {
    const isAsset = acc.category ? acc.category.toLowerCase() === 'asset' : acc.balance > 0;
    if(isAsset) {
      const color = assetColors[_ai % assetColors.length];
      _ai++;
      return color;
    }
    const color = liabilityColors[_li % liabilityColors.length];
    _li++;
    return color; 
  });

  const totalLiabilities = liabilityAccounts.reduce((sum, acc) => sum + Math.abs(acc.balance),0);

  const accountHistory = useMemo(() => {
    const spend = selectedClient.accounts.find((account) => account.type === 'Spend')?.balance || 0;
    const reserve = selectedClient.accounts.find((account) => account.type === 'Reserve')?.balance || 0;
    const growth = selectedClient.accounts.find((account) => account.type === 'Growth')?.balance || 0;

    const autoLoan = selectedClient.accounts.find(a => a.type === 'Auto Loan')?.balance || 0;
    const heloc = selectedClient.accounts.find(a => a.type === 'Home Equity Line of Credit')?.balance || 0;


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
      
      AutoLoan: Math.round(autoLoan * factor.Spend),
      HELOC: Math.round(heloc * factor.Reserve),
    }));
  }, [selectedClient]);

  const accountDetailTarget = (accountType) => {
    if (/credit/i.test(accountType)) {
      return { id: 'credit-account', title: 'Credit', component: CreditDetails };
    }

    switch (accountType) {
      case 'Spend':
        return { id: 'spend-account', title: 'Spend', component: SpendDetails };
      case 'Reserve':
        return { id: 'reserve-account', title: 'Reserve', component: ReserveDetails };
      case 'Growth':
        return { id: 'growth-account', title: 'Growth', component: GrowthDetails };
      case 'Auto Loan':
        return { id: 'loan-account', title: 'Loan', component: LoanDetails };
      default:
        return null;
    }
  };


  return (
    <div className="background-card">
      <div className="accounts-page">
        {/* Overview Insight Section */}
        <section className="overview-insight-section">
          <h2>Accounts Overview</h2>
          <p className="insight-description">
            This chart displays the trends across accounts, showing how each account's balance changed over the last six months.
          </p>

          <div className="overview-grid">
            <article className="overview-summary-card">
              <h3>Account totals</h3>
              <div className="overview-summary-list">
                {orderedAccounts.map((account, i) => (
                  <div key={account.type} className="overview-summary-item">
                    <div>
                      <div className="summary-label">{account.type} Account</div>
                      <div className="summary-value">{formatCurrency(account.balance)}</div>
                    </div>
                    <div className="summary-pill" style={{ backgroundColor: overviewColors[i] }} />
                  </div>
                ))}
              </div>
              
            </article>

            <article className="overview-chart-card">
              <h3>Account Trajectories</h3>
              <div className="chart-wrapper">
                <LineChart data={accountHistory} />
              </div>

              <div className="chart-legend">
                {orderedAccounts.map((account, i) => (
                  <div key={account.type} className="legend-item">
                    <div
                      className="legend-color"
                      style={{ backgroundColor: overviewColors[i] }}
                    ></div>
                    <span>{account.type}</span>
                  </div>
                ))}
              </div>
            </article>
          </div>
        </section>

        <section className="accounts-breakdown-section">
          <h2>Accounts Breakdown</h2>

          {/* Asset section */}
          <div className="breakdown-group">
            <h3>Assets</h3>

            <div className="breakdown-grid">
              <div className="breakdown-chart">
                <PieChart accounts={assetAccounts} type="asset" />
              </div>

              <div className="breakdown-table">
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
                    {assetAccounts.map((account, i) => {
                      const lastActivity = selectedClient.recentActivity[i] ?? selectedClient.recentActivity[0];
                      const details = accountDetailTarget(account.type);
                      const isLinkable = Boolean(details);
                      return (
                        <tr key={account.type}>
                          
                          <td>
                            <div
                              className={`breakdown-account-name ${isLinkable ? 'account-link' : ''}`}
                              onClick={() => {
                                if (details) openTab(details.id, details.title, details.component);
                              }}
                              onKeyDown={(event) => {
                                if (details && (event.key === 'Enter' || event.key === ' ')) {
                                  openTab(details.id, details.title, details.component);
                                }
                              }}
                              role={isLinkable ? 'button' : undefined}
                              tabIndex={isLinkable ? 0 : undefined}
                            >
                            <div
                              className="account-indicator"
                              style={{ backgroundColor: ['#bdddbd','#71B48D','#404E7C', '#4a3974'][i%4] }}
                            ></div>
                            {account.type}
                            {account.isJoint === 'Y' && (<span className="joint-badge">Joint</span>)}
                          </div>
                          </td>
                          <td>{formatCurrency(account.balance)}</td>
                          <td>{account.percentage}%</td>
                          <td>
                            {lastActivity.type === 'deposit' && '+'}
                            {lastActivity.type === 'withdrawal' && '-'}
                            {lastActivity.type !== 'deposit' && lastActivity.type !== 'withdrawal' && ''}
                            {formatCurrency(lastActivity.amount)} ({formatDate(lastActivity.date)})
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* loans section */}
          {liabilityAccounts.length > 0 && (
          <div className="breakdown-group">
            <h3>Loans</h3>

          <div className="breakdown-grid">
            <div className="breakdown-chart">
              <PieChart
                accounts={liabilityAccounts}
                type="liability"
              />
            </div>

            <div className="breakdown-table">
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
                  {liabilityAccounts.map((account, i) => {
                    const lastActivity =
                      selectedClient.recentActivity[i] ??
                      selectedClient.recentActivity[0];
                    const details = accountDetailTarget(account.type);
                    const isLinkable = Boolean(details);
                    return (
                      <tr key={account.type}>
                        <td>
                          <div
                              className={`breakdown-account-name ${isLinkable ? 'account-link' : ''}`}
                              onClick={() => details && openTab(details.id, details.title, details.component)}
                              onKeyDown={(event) => {
                                if (details && (event.key === 'Enter' || event.key === ' ')) {
                                  openTab(details.id, details.title, details.component);
                                }
                              }}
                              role={isLinkable ? 'button' : undefined}
                              tabIndex={isLinkable ? 0 : undefined}
                            >
                            <div
                              className="account-indicator"
                              style={{ backgroundColor: [ '#db8c4f', '#eeceb6', '#905122', '#e3af87'][i] }}
                            ></div>
                            {account.type}
                          </div>
                        </td>
                        <td>
                          -{formatCurrency(Math.abs(account.balance))}
                        </td>
                        <td>
                          {totalLiabilities > 0
                            ? 
                            `${(
                              (Math.abs(account.balance) / totalLiabilities) * 100
                            ).toFixed(1)}%
                            `
                            : '-'}
                        </td>
                        <td>
                          {lastActivity.type === 'deposit' && '+'}
                          {lastActivity.type === 'withdrawal' && '-'}
                          {lastActivity.type !== 'deposit' && lastActivity.type !== 'withdrawal' && ''}
                          {formatCurrency(lastActivity.amount)} ({formatDate(lastActivity.date)})
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
          </div>
          )}
        </section>
      </div>
    </div>
  );
}

export default Accounts
