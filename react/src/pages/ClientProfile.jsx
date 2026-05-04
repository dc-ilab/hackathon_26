import { clients } from '../data/clients';

const formatCurrency = (value) =>
  new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(value);

function ClientProfile({ selectedClient }) {
  return (
    <div className="client-profile-page">
      {/* Client Summary */}
      <div className="module module--summary card">
        <h2 className="module__title">Client Summary</h2>
        <div className="module__content">
          <div className="summary-details">
            <div className="detail-item">
              <span>Total Net Worth:</span>
              <span className="value">{formatCurrency(selectedClient.netWorth)}</span>
            </div>
            <div className="detail-item">
              <span>Total Assets:</span>
              <span className="value">{formatCurrency(selectedClient.assets)}</span>
            </div>
            <div className="detail-item">
              <span>Total Liabilities:</span>
              <span className="value">{formatCurrency(selectedClient.liabilities)}</span>
            </div>
            <div className="detail-item">
              <span>Relationship:</span>
              <span className="value">{selectedClient.relationship}</span>
            </div>
            <div className="detail-item">
              <span>Time with Bank:</span>
              <span className="value">{selectedClient.timeWithBank}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Contact Information */}
      <div className="module module--contact card">
        <h2 className="module__title">Contact Information</h2>
        <div className="module__content">
          <div className="contact-grid">
            <div className="contact-item">
              <span>Name:</span>
              <span className="value">{selectedClient.name}</span>
            </div>
            <div className="contact-item">
              <span>Age:</span>
              <span className="value">{selectedClient.age} yrs</span>
            </div>
            <div className="contact-item">
              <span>Marital Status:</span>
              <span className="value">{selectedClient.maritalStatus}</span>
            </div>
            <div className="contact-item">
              <span>Location:</span>
              <span className="value">{selectedClient.location}</span>
            </div>
            <div className="contact-item">
              <span>Housing Status:</span>
              <span className="value">{selectedClient.housingStatus}</span>
            </div>
            <div className="contact-item">
              <span>Employment:</span>
              <span className="value">{selectedClient.employment}</span>
            </div>
            <div className="contact-item">
              <span>Pronouns:</span>
              <span className="value">{selectedClient.pronouns || 'she/her'}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Account Overview */}
      <div className="module module--accounts-overview card">
        <h2 className="module__title">Account Overview</h2>
        <div className="module__content">
          <div className="accounts-overview-grid">
            {selectedClient.accounts.map((account, index) => (
              <div key={index} className="account-overview-card">
                <h3>{account.type}</h3>
                <div className="account-balance">{formatCurrency(account.balance)}</div>
                <div className="account-percentage">{account.percentage}% of total</div>
                <div
                  className="account-indicator"
                  style={{ backgroundColor: account.color }}
                ></div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="module module--recent-activity card">
        <h2 className="module__title">Recent Activity</h2>
        <div className="module__content">
          <ul className="activity-list">
            {selectedClient.recentActivity.map((activity, index) => (
              <li key={index} className="activity-item">
                <span className="activity-date">{activity.date}</span>
                <span className="activity-type">{activity.type}</span>
                <span className="activity-amount">{formatCurrency(activity.amount)}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Client Goals */}
      <div className="module module--goals card">
        <h2 className="module__title">Client Goals</h2>
        <div className="module__content">
          <ul className="goals-list">
            {selectedClient.clientGoals.map((goal, index) => (
              <li key={index} className={`goal-item ${goal.completed ? 'completed' : ''}`}>
                {goal.goal}
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Opportunities */}
      <div className="module module--opportunities card">
        <h2 className="module__title">Opportunities</h2>
        <div className="module__content">
          <ul className="opportunities-list">
            {selectedClient.opportunities.map((opp, index) => (
              <li key={index} className="opportunity-item">
                {opp}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

export default ClientProfile;