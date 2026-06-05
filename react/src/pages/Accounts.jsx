import { useMemo, useState } from 'react';
import SpendDetails from './SpendDetails';
import AutoLoanDetails from './AutoLoanDetails';
import ReserveDetails from './ReserveDetails';
import GrowthDetails from './GrowthDetails';
import CreditDetails from './CreditDetails';
import { getAssetsAndLiabilities, getVisibleSlices, ASSET_COLORS, LIABILITY_COLORS } from '../utils';

const formatCurrency = (value) =>
  new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 2,
  }).format(value);

const formatDate = (value) => {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat('en-US').format(date);
};

const parseMonthDate = (dateString) => {
  if (!dateString) return null;
  const parsed = new Date(dateString);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
};

const getLastNMonths = (count, endDate) => {
  const months = [];
  const current = new Date(endDate.getFullYear(), endDate.getMonth(), 1);

  for (let i = count - 1; i >= 0; i -= 1) {
    const date = new Date(current.getFullYear(), current.getMonth() - i, 1);
    months.push({
      key: `${date.getFullYear()}-${date.getMonth() + 1}`,
      label: new Intl.DateTimeFormat('en-US', { month: 'short' }).format(date),
      date,
    });
  }

  return months;
};

const getAccountHistoryFromTransactions = (accounts, transactions, months) => {
  const monthMap = {};

  transactions.forEach((tx) => {
    const date = parseMonthDate(tx.date || tx.transaction_date);
    if (!date) return;

    const monthKey = `${date.getFullYear()}-${date.getMonth() + 1}`;
    const accountKey = tx.account_id ?? tx.account_type;
    if (!accountKey) return;

    const current = monthMap[accountKey]?.[monthKey];
    if (!current || date > current.date) {
      monthMap[accountKey] = {
        ...(monthMap[accountKey] || {}),
        [monthKey]: { date, balance: Number(tx.acct_balance ?? tx.account_balance ?? 0) },
      };
    }
  });

  return accounts.map((account) => {
    const accountKey = account.account_id ?? account.type;
    const monthlyBalances = [];
    let lastBalance = Number(account.balance ?? 0);

    months.forEach((month) => {
      const monthEntry = monthMap[accountKey]?.[month.key];
      if (monthEntry) {
        lastBalance = monthEntry.balance;
      }
      monthlyBalances.push(lastBalance);
    });

    return {
      accountType: account.type,
      values: monthlyBalances,
      color: (account.category?.toLowerCase() === 'liability' ? LIABILITY_COLORS : ASSET_COLORS)[0],
    };
  });
};

// Line chart component for Overview Insight
function LineChart({ data, series }) {
  if (!data || !data.length || !series || !series.length) {
    return null;
  }

  const width = 560;
  const height = 450;
  const padding = 40;
  const graphWidth = width - padding * 2;
  const graphHeight = height - padding * 2;

  
  const values = data.flatMap((row) =>
    series.map((seriesItem) => row[seriesItem.key] ?? 0)
  );


  const OUTLIER_THRESHOLD = 100000;

  const hasOutlier = values.some(v => Math.abs(v) > OUTLIER_THRESHOLD);


  const transformValue = (value) => {
    if (!hasOutlier) return value;

    if (value < -OUTLIER_THRESHOLD) {
      return -OUTLIER_THRESHOLD - Math.log10(Math.abs(value)) * 4000;
    }

    if (value > OUTLIER_THRESHOLD) {
      return OUTLIER_THRESHOLD + Math.log10(value) * 4000;
    }

    return value;
  };


  const transformedValues = values.map(transformValue);

  const maxValueRaw = Math.max(...transformedValues);
  const minValueRaw = Math.min(...transformedValues);


  const maxValue = Math.max(maxValueRaw * 1.2, 0);
  const minValue = Math.min(minValueRaw, 0);
  const range = maxValue - minValue || 1;
  const isCompressedRange = range < 50000; // tweak if needed

  const normalizeY = (value) => {
    const v = transformValue(value);
    return graphHeight - ((v - minValue) / range) * graphHeight;
  };


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

  
let filteredTickValues;

if (hasOutlier) {
  filteredTickValues = [
    maxValue,
    maxValue * 0.5,
    0,
    minValue
  ];
} else {
  const tickCount = 6;

  const raw = Array.from(
    { length: tickCount },
    (_, i) => maxValue - (range / (tickCount - 1)) * i
  );

  filteredTickValues = [];
  let lastY = null;

  for (let value of raw) {
    const y = padding + normalizeY(value);

    if (lastY === null || Math.abs(y - lastY) > 30) {
      filteredTickValues.push(value);
      lastY = y;
    }
  }
}

  
  return (
    <svg id="accounts-line-chart" viewBox={`0 0 ${width} ${height}`} width="100%" height="100%">
            
      
      {filteredTickValues.map((value, i) => {
        const y = padding + normalizeY(value);

        return (
          <g key={`y-tick-${i}`}>
            <line
              x1={padding}
              y1={y}
              x2={width - padding}
              y2={y}
              stroke={Math.abs(value) < range / 100 ? "#999" : "#f0f0f0"}
              strokeWidth={Math.abs(value) < range / 100 ? "2" : "1"}
            />
            <text
              x={padding - 10}
              y={y + 4}
              textAnchor="end"
              fontSize="12"
              fill="#666"
            >
              {Math.abs(value) < 1000
                ? `$${Math.round(value)}`
                : `$${Math.round(value / 1000)}k`}
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
          key={`x-label-${row.month}-${index}`}
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

  // Get visible slice angles with minimum size
  const sliceAngles = getVisibleSlices(filteredAccounts, total);

  let currentAngle = -Math.PI / 2; // Start from top

  const colors =
  type === 'liability'
    ? LIABILITY_COLORS
    : ASSET_COLORS;

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
          const angle = sliceAngles[index] || 0;

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
              fill={colors[index % colors.length]}
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
  let _ai = 0, _li = 0; // asset and liability color indices
  const overviewColors = orderedAccounts.map((acc) => {
    const isAsset = acc.category ? acc.category.toLowerCase() === 'asset' : acc.balance > 0;
    if(isAsset) {
      const color = ASSET_COLORS[_ai % ASSET_COLORS.length];
      _ai++;
      return color;
    }
    const color = LIABILITY_COLORS[_li % LIABILITY_COLORS.length];
    _li++;
    return color; 
  });

  
const OUTLIER_THRESHOLD = 200000;  //for now, not showing outlier accounts on line chart to avoid compression - can add toggle later

const visibleAccounts = orderedAccounts.filter(
  (account) => Math.abs(account.balance) <= OUTLIER_THRESHOLD
);

const lineSeries = visibleAccounts.map((account) => {
  const index = orderedAccounts.findIndex(a => a.type === account.type);

  return {
    key: account.type,
    color: overviewColors[index],
  };
});


  const totalLiabilities = liabilityAccounts.reduce((sum, acc) => sum + Math.abs(acc.balance),0);
  const totalAssets = assetAccounts.reduce((sum, acc) => sum + Math.abs(acc.balance),0);

  const accountHistory = useMemo(() => {
    const transactions = selectedClient.transactions || [];
    const accounts = selectedClient.accounts || [];
    const parsedTransactions = transactions
      .map((tx) => ({
        ...tx,
        date: parseMonthDate(tx.date || tx.transaction_date),
      }))
      .filter((tx) => tx.date);

    const latestDate = parsedTransactions.reduce(
      (latest, tx) => (tx.date > latest ? tx.date : latest),
      new Date()
    );

    const months = getLastNMonths(6, latestDate);
    const accountHistories = getAccountHistoryFromTransactions(accounts, parsedTransactions, months);

    const data = months.map((month, monthIndex) => {
      const row = { month: month.label };
      accountHistories.forEach((accountHistoryEntry) => {
        row[accountHistoryEntry.accountType] = accountHistoryEntry.values[monthIndex];
      });
      return row;
    });

    return data;
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
        return { id: 'loan-account', title: 'Loan', component: AutoLoanDetails };
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
                <LineChart data={accountHistory} series={lineSeries} />
              </div>

              <div className="chart-legend">
                
                {visibleAccounts.map((account) => {
                  const i = orderedAccounts.findIndex(a => a.type === account.type);

                  return (
                    <div key={account.type} className="legend-item">
                      <div
                        className="legend-color"
                        style={{ backgroundColor: overviewColors[i] }}
                      ></div>
                      <span>{account.type}</span>
                    </div>
                  );
                })}

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
                          <td>{totalAssets > 0
                            ? 
                            `${(
                              (Math.abs(account.balance) / totalAssets) * 100
                            ).toFixed(1)}%
                            `
                            : '-'}</td>
                          <td>
                            {lastActivity.type === 'deposit' && '+'}
                            {lastActivity.type === 'withdrawal' && '-'}
                            {lastActivity.type !== 'deposit' && lastActivity.type !== 'withdrawal' && ''}
                            {formatCurrency(account.lastActivityAmount)} ({formatDate(lastActivity.date)})
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
                              style={{ backgroundColor: ['#db8c4f', '#eeceb6', '#edeea4', '#e3e64a'][i] }}
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
                          {formatCurrency(account.lastActivityAmount)} ({formatDate(lastActivity.date)})
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
