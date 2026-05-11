import { useState } from 'react';
import SpendDetails from './SpendDetails';

const formatCurrency = (value) => {
  if (value == null || value === '') return '-';
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(value);
}

const formatDate = (value) => {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat('en-US').format(date);
};

function ClientProfile({ selectedClient, openTab }) {
  const normalizeGoals = (goalList) =>
    goalList.map((goal) => {
      const isSavingsGoal = typeof goal.targetAmount === 'number' && goal.targetAmount > 0;
      return {
        ...goal,
        description: goal.description || goal.goal || 'Goal description',
        date: goal.date || goal.targetDate || '',
        targetAmount: isSavingsGoal ? goal.targetAmount : null,
        currentAmount:
          typeof goal.currentAmount === 'number'
            ? goal.currentAmount
            : isSavingsGoal
            ? 0
            : null,
        startDate: goal.startDate || '',
        isSavingsGoal,
        completed: !!goal.completed,
      };
    });

  const [goals, setGoals] = useState(() => normalizeGoals(selectedClient.clientGoals));
  const [showGoalForm, setShowGoalForm] = useState(false);
  const [editingIndex, setEditingIndex] = useState(null);
  const [goalForm, setGoalForm] = useState({
    description: '',
    date: '',
    isSavingsGoal: true,
    startAmount: '0',
    targetAmount: '10000',
  });

  const handleFormChange = (field, value) => {
    setGoalForm((prev) => ({ ...prev, [field]: value }));
  };

  const startEditGoal = (index) => {
    const goal = goals[index];
    setGoalForm({
      description: goal.description,
      date: goal.date,
      isSavingsGoal: goal.isSavingsGoal,
      startAmount: goal.currentAmount != null ? String(goal.currentAmount) : '0',
      targetAmount: goal.targetAmount != null ? String(goal.targetAmount) : '10000',
    });
    setEditingIndex(index);
    setShowGoalForm(true);
  };

  const submitGoal = () => {
    if (!goalForm.description.trim() || !goalForm.date) return;

    const startAmount = Number(goalForm.startAmount || 0);
    const targetAmount = Number(goalForm.targetAmount || 0);
    const goalData = {
      description: goalForm.description.trim(),
      date: goalForm.date,
      startDate: new Date().toLocaleDateString('en-US'),
      isSavingsGoal: goalForm.isSavingsGoal,
      targetAmount: goalForm.isSavingsGoal ? targetAmount : null,
      currentAmount: goalForm.isSavingsGoal ? startAmount : null,
      completed: goalForm.isSavingsGoal ? startAmount >= targetAmount : false,
    };

    if (editingIndex !== null) {
      setGoals((prev) => prev.map((goal, i) => (i === editingIndex ? goalData : goal)));
      setEditingIndex(null);
    } else {
      setGoals((prev) => [...prev, goalData]);
    }

    setShowGoalForm(false);
    setGoalForm({
      description: '',
      date: '',
      isSavingsGoal: true,
      startAmount: '0',
      targetAmount: '10000',
    });
  };

  const toggleCompletion = (index) => {
    setGoals((prev) =>
      prev.map((goal, i) =>
        i === index
          ? {
              ...goal,
              completed: !goal.completed,
            }
          : goal
      )
    );
  };

  const deleteGoal = (index) => {
    setGoals((prev) => prev.filter((_, i) => i !== index));
  };

  return (
    <>
      <div className="client-profile-top">
        <div className="module module--goals-top card">
          <div className="goals-header-row">
            <h2 className="module__title">Client Goals</h2>
            <button className="new-goal-btn" onClick={() => {
              setShowGoalForm((prev) => !prev);
              if (showGoalForm) setEditingIndex(null);
            }}>
              {showGoalForm ? 'Close' : 'New Goal'}
            </button>
          </div>
          <div className="module__content">
            {showGoalForm && (
              <section className="goal-form-panel">
                <div className="goal-form-row">
                  <label>
                    Goal description
                    <input
                      type="text"
                      value={goalForm.description}
                      placeholder="E.g. Save for vacation"
                      onChange={(e) => handleFormChange('description', e.target.value)}
                    />
                  </label>
                  <label>
                    Target date
                    <input
                      type="date"
                      value={goalForm.date}
                      onChange={(e) => handleFormChange('date', e.target.value)}
                    />
                  </label>
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      checked={goalForm.isSavingsGoal}
                      onChange={(e) => handleFormChange('isSavingsGoal', e.target.checked)}
                    />
                    Savings goal
                  </label>
                </div>

                {goalForm.isSavingsGoal && (
                  <div className="goal-form-row">
                    <label>
                      Starting amount
                      <input
                        type="number"
                        min="0"
                        value={goalForm.startAmount}
                        onChange={(e) => handleFormChange('startAmount', e.target.value)}
                      />
                    </label>
                    <label>
                      Target amount
                      <input
                        type="number"
                        min="0"
                        value={goalForm.targetAmount}
                        onChange={(e) => handleFormChange('targetAmount', e.target.value)}
                      />
                    </label>
                  </div>
                )}

                <div className="goal-form-actions">
                  <button className="goal-save-btn" onClick={submitGoal}>
                    {editingIndex !== null ? 'Save changes' : 'Save goal'}
                  </button>
                  <button className="btn-ghost" onClick={() => {
                    setShowGoalForm(false);
                    setEditingIndex(null);
                  }}>
                    Cancel
                  </button>
                </div>
              </section>
            )}

            <ul className="goals-list">
              {goals.map((goal, index) => {
                const progressPercent =
                  goal.isSavingsGoal && goal.targetAmount
                    ? Math.min(100, Math.round((goal.currentAmount / goal.targetAmount) * 100))
                    : 0;

                return (
                  <li key={index} className={`goal-item ${goal.completed ? 'completed' : ''}`}>
                    <div className="goal-card-header">
                      <div className="goal-card-title">
                        <label className="goal-checkbox">
                          <input
                            type="checkbox"
                            checked={goal.completed}
                            onChange={() => toggleCompletion(index)}
                          />
                        </label>
                        <div className="goal-card-title-text">
                          <h3>{goal.description}</h3>
                          <div className="goal-meta-row">
                            <span>{goal.isSavingsGoal ? 'Savings goal' : 'Milestone goal'}</span>
                          </div>
                          <p className="goal-dates">
                            <span>Start: {formatDate(goal.startDate) || 'Today'}</span>
                            <span>Due: {formatDate(goal.date) || 'TBD'}</span>
                          </p>
                        </div>
                        <span className={`goal-status-tag ${goal.completed ? 'completed' : ''}`}>
                          {goal.completed ? 'Completed' : goal.isSavingsGoal ? `${progressPercent}%` : 'Pending'}
                        </span>
                      </div>
                      <div className="goal-card-actions">
                        <button
                          className="delete-goal-btn"
                          onClick={() => deleteGoal(index)}
                          title="Delete goal"
                        >
                          ×
                        </button>
                        <button className="goal-edit-btn" onClick={() => startEditGoal(index)}>
                          Edit
                        </button>
                      </div>
                    </div>

                    {goal.isSavingsGoal ? (
                      <div className="goal-progress-block">
                        <progress value={goal.currentAmount} max={goal.targetAmount}></progress>
                        <div className="goal-progress-info">
                          <span>{formatCurrency(goal.currentAmount)} saved</span>
                          <span>of {formatCurrency(goal.targetAmount)}</span>
                        </div>
                      </div>
                    ) : null}
                  </li>
                );
              })}
            </ul>
          </div>
        </div>
      </div>

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
                <span className="value">{formatCurrency(selectedClient.totalAssets)}</span>
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
                <span>Title:</span>
                <span className="value">{selectedClient.title || ''}</span>
              </div>
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
                <span>Phone:</span>
                <span className="value">{selectedClient.phoneNumber || 'N/A'}</span>
              </div>
              <div className="contact-item">
                <span>Email:</span>
                <span className="value">{selectedClient.email || 'N/A'}</span>
              </div>
              <div className="contact-item">
                <span>Do Not Call:</span>
                <span className="value">{selectedClient.doNotCall ? 'Yes' : 'No'}</span>
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
                <li
                  key={index}
                  className="activity-item activity-link"
                  role="button"
                  tabIndex={0}
                  onClick={() => openTab?.('spend-account', 'Spend Account', SpendDetails)}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter' || event.key === ' ') {
                      openTab?.('spend-account', 'Spend Account', SpendDetails);
                    }
                  }}
                >
                  <span className="activity-date">{activity.date}</span>
                  <span className="activity-type">{activity.type}</span>
                  <span className="activity-amount">{formatCurrency(activity.amount)}</span>
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
    </>
  );
}

export default ClientProfile;