import { useMemo } from 'react';
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
  const width = 500;
  const height = 200;
  const padding = 40;
  const graphWidth = width - padding * 2;
  const graphHeight = height - padding * 2;

  // Find min and max values across all account types
  const allValues = data.map(d => d.balance);
  const minValue = Math.min(...allValues);
  const maxValue = Math.max(...allValues);
  const range = maxValue - minValue || 1;

  // Normalize values to fit in graph
  const normalizeY = (value) => {
    return graphHeight - ((value - minValue) / range) * graphHeight;
  };

  const colors = ['#71B48D', '#BDDDBD', '#404E7C'];
  const accountTypes = data.map(d => d.type);

  // Generate points for each account type (simplified - using provided data as points)
  const points = data.map((d, i) => ({
    type: d.type,
    balance: d.balance,
    color: colors[i % colors.length]
  }));

  // Create path string for line
  const pointsPerType = Math.ceil(data.length / 3);
  const generatePath = (typeIndex) => {
    const relevantPoints = points.filter((_, i) => Math.floor(i / 3) === typeIndex || i % 3 === typeIndex);
    if (relevantPoints.length < 2) return '';
    
    let pathString = `M ${padding + (typeIndex * graphWidth / 3)} ${padding + normalizeY(relevantPoints[0].balance)}`;
    for (let i = 1; i < relevantPoints.length; i++) {
      const x = padding + ((typeIndex + i) * graphWidth / Math.max(relevantPoints.length, 4));
      const y = padding + normalizeY(relevantPoints[i].balance);
      pathString += ` L ${x} ${y}`;
    }
    return pathString;
  };

  return (
    <svg viewBox={`0 0 ${width} ${height}`} width={width} height={height} style={{ border: '1px solid #e0e0e0', borderRadius: '8px' }}>
      {/* Grid lines */}
      {[0, 1, 2, 3, 4].map(i => (
        <line
          key={`grid-h-${i}`}
          x1={padding}
          y1={padding + (graphHeight / 4) * i}
          x2={width - padding}
          y2={padding + (graphHeight / 4) * i}
          stroke="#f0f0f0"
          strokeWidth="1"
        />
      ))}
      
      {/* Axes */}
      <line x1={padding} y1={padding} x2={padding} y2={height - padding} stroke="#999" strokeWidth="2" />
      <line x1={padding} y1={height - padding} x2={width - padding} y2={height - padding} stroke="#999" strokeWidth="2" />

      {/* Lines for each account type */}
      {points.map((point, i) => {
        const x = padding + (i / (data.length - 1 || 1)) * graphWidth;
        const y = padding + normalizeY(point.balance);
        return (
          <circle
            key={`point-${i}`}
            cx={x}
            cy={y}
            r="4"
            fill={point.color}
            stroke="white"
            strokeWidth="2"
          />
        );
      })}

      {/* Y-axis labels */}
      <text x={padding - 5} y={padding + 5} textAnchor="end" fontSize="12" fill="#666">
        ${(maxValue / 1000).toFixed(0)}k
      </text>
      <text x={padding - 5} y={height - padding + 5} textAnchor="end" fontSize="12" fill="#666">
        $0
      </text>

      {/* X-axis labels */}
      <text x={padding} y={height - padding + 20} textAnchor="middle" fontSize="12" fill="#666">
        Mar
      </text>
      <text x={width - padding} y={height - padding + 20} textAnchor="middle" fontSize="12" fill="#666">
        Apr
      </text>
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

  return (
    <div className="accounts-page">
      {/* Breadcrumb Navigation */}
      <nav className="breadcrumb">
        <Link to="/">Homepage</Link>
        <span>&gt;</span>
        <span>Accounts</span>
      </nav>

      {/* Client Information Section */}
      <section className="accounts-client-header">
        <div className="accounts-client-left">
          {/* Avatar */}
          <div className="accounts-avatar">
            {selectedClient.name
              .split(' ')
              .map((n) => n[0])
              .join('')}
          </div>

          {/* Client Info */}
          <div className="accounts-client-info">
            <h1>{selectedClient.name}</h1>
            <p className="pronouns-badge">she/her</p>

            {/* Primary Info Grid */}
            <div className="accounts-info-grid-primary">
              <div className="info-item">
                <label>Marital Status</label>
                <span>{selectedClient.maritalStatus}</span>
              </div>
              <div className="info-item">
                <label>Location</label>
                <span>{selectedClient.location}</span>
              </div>
              <div className="info-item">
                <label>Housing Status</label>
                <span>{selectedClient.housingStatus}</span>
              </div>
            </div>

            {/* Secondary Info */}
            <div className="accounts-info-secondary">
              <span>Age: {selectedClient.age} yrs</span>
              <span>Time with PNC: {selectedClient.timeWithBank}</span>
              <span>Employment: {selectedClient.employment}</span>
            </div>
          </div>
        </div>

        {/* Client Profile Button */}
        <div className="accounts-client-right">
          <button className="btn-client-profile">Client profile →</button>
        </div>
      </section>

      {/* Overview Insight Section */}
      <section className="overview-insight-section">
        <h2>Overview Insight</h2>
        <p className="insight-description">
          This chart displays the trends across your accounts, showing how your balance fluctuates throughout the month based on typical spending and deposits.
        </p>

        <div className="chart-wrapper">
          <LineChart data={selectedClient.accounts} />
        </div>

        {/* Legend */}
        <div className="chart-legend">
          {selectedClient.accounts.map((account, i) => (
            <div key={account.type} className="legend-item">
              <div
                className="legend-color"
                style={{ backgroundColor: ['#71B48D', '#BDDDBD', '#404E7C'][i] }}
              ></div>
              <span>{account.type} Account</span>
            </div>
          ))}
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
