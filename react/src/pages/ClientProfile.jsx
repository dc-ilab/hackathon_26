import { useState } from 'react';
import { useEffect } from 'react';
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

const normalizeDateForInput = (value) => {
  if (!value) return '';
  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) return value;
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return '';
  return parsed.toISOString().slice(0, 10);
}

function ClientProfile({ selectedClient, openTab, clientGoals, setClientGoals, setSelectedId, filteredClients, handleClientChange}) {
  const goals = clientGoals[selectedClient.id] || [];

const relatedClients =
  selectedClient.relationships?.map((rel) => {
    const client = filteredClients.find(c => c.id === rel.id);
    return client ? { ...client, relation: rel.relation } : null;
  }).filter(Boolean) || [];

  const [showGoalForm, setShowGoalForm] = useState(false);
  const [editingIndex, setEditingIndex] = useState(null);
  const [goalForm, setGoalForm] = useState({
    description: '',
    startDate: '',
    date: '',
    isSavingsGoal: true,
    startAmount: '0',
    targetAmount: '10000',
  });

const [isEditingContact, setIsEditingContact] = useState(false);
const [contactDraft, setContactDraft] = useState({
    name: selectedClient.name || '',
    age: selectedClient.age || '',
    maritalStatus: selectedClient.maritalStatus || '',
    location: selectedClient.location || '',
    housingStatus: selectedClient.housingStatus || '',
    phoneNumber: selectedClient.phoneNumber || '',
    email: selectedClient.email || '',
    employment: selectedClient.employment || '',

  });
  useEffect(() => {
  setContactDraft({
    name: selectedClient.name || '',
    age: selectedClient.age || '',
    maritalStatus: selectedClient.maritalStatus || '',
    location: selectedClient.location || '',
    housingStatus: selectedClient.housingStatus || '',
    phoneNumber: selectedClient.phoneNumber || '',
    email: selectedClient.email || '',
    employment: selectedClient.employment || '',
  });
}, [selectedClient]);


  const handleFormChange = (field, value) => {
    setGoalForm((prev) => ({ ...prev, [field]: value }));
  };

  const startEditGoal = (index) => {
    const goal = goals[index];
    setGoalForm({
      description: goal.description,
      startDate: normalizeDateForInput(goal.startDate),
      date: normalizeDateForInput(goal.date),
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
    const normalizedStartDate = normalizeDateForInput(goalForm.startDate) || new Date().toISOString().slice(0, 10);
    const normalizedDate = normalizeDateForInput(goalForm.date);
    const goalData = {
      description: goalForm.description.trim(),
      startDate: normalizedStartDate,
      date: normalizedDate,
      isSavingsGoal: goalForm.isSavingsGoal,
      targetAmount: goalForm.isSavingsGoal ? targetAmount : null,
      currentAmount: goalForm.isSavingsGoal ? startAmount : null,
      completed: goalForm.isSavingsGoal ? startAmount >= targetAmount : false,
    };

    if (editingIndex !== null) {
      setClientGoals((prev) => ({
  ...prev,
  [selectedClient.id]: prev[selectedClient.id].map((goal, i) =>
    i === editingIndex ? goalData : goal
  ),
}));

      setEditingIndex(null);
    } else {
      setClientGoals((prev) => ({
  ...prev,
  [selectedClient.id]: [
    ...(prev[selectedClient.id] || []),
    goalData
  ],
}));
    }

    setShowGoalForm(false);
    setGoalForm({
      description: '',
      startDate: '',
      date: '',
      isSavingsGoal: true,
      startAmount: '0',
      targetAmount: '10000',
    });
  };

  const toggleCompletion = (index) => {
    setClientGoals((prev) => ({
      ...prev,
      [selectedClient.id]: prev[selectedClient.id].map((goal, i) =>
        i === index
          ? { ...goal, completed: !goal.completed }
          : goal
      ),
    }));
  };

  const deleteGoal = (index) => {
    setClientGoals((prev) => ({
      ...prev,
      [selectedClient.id]: prev[selectedClient.id].filter(
        (_, i) => i !== index
      ),
    }));
  };
  const getAccountNameFromId = (accountId) => {
    if (!accountId) return null;

    const account = selectedClient.accounts.find(
      (acct) => acct.account_id === accountId
    );

    return account?.type || null;
  };
  return (
    <div className="background-card">
      <div className="client-profile-top">
        <div className="module module--goals-top card">
          <div className="goals-header-row">
            <h2 className="module__title">Client Goals</h2>
            <button className="new-goal-btn" onClick={() => {
              const nextState = !showGoalForm;
              setShowGoalForm(nextState);
              setEditingIndex(null);
              if (nextState) {
                setGoalForm({
                  description: '',
                  startDate: '',
                  date: '',
                  isSavingsGoal: true,
                  startAmount: '0',
                  targetAmount: '10000',
                });
              }
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
                    Start date
                    <input
                      type="date"
                      value={goalForm.startDate}
                      onChange={(e) => handleFormChange('startDate', e.target.value)}
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
                          {goal.linkedAccount && (
                            <div className="goal-linked-account">
                              <strong>Linked to: {getAccountNameFromId(goal.linkedAccount)} Account</strong>
                            </div>
                          )}

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
                <span className="value">{formatCurrency(selectedClient.totalLiabilities)}</span>
              </div>
              <div className="detail-item">
                <span>PNC Total Rewards:</span>
                <span className="value">{selectedClient.totalRewardsStatus}</span>
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
          <div className="module-header">
            <h2 className="module__title">Contact Information</h2>

            {!isEditingContact ? (
              <button
                className="edit-btn"
                onClick={() => setIsEditingContact(true)}
              >
                ✎
              </button>
            ) : (
              <div className="edit-actions">
                <button
                  className="btn cancel"
                  onClick={() => {
                    setIsEditingContact(false);
                    setContactDraft({
                      name: selectedClient.name || '',
                      phoneNumber: selectedClient.phoneNumber || '',
                      email: selectedClient.email || '',
                      age: selectedClient.age || '',
                      maritalStatus: selectedClient.maritalStatus || '',
                      location: selectedClient.location || '',
                      housingStatus: selectedClient.housingStatus || '',
                      employment: selectedClient.employment || '',
                    });
                  }}
                >
                  Cancel
                </button>

                <button
                  className="btn save"
                  onClick={() => {
                    //  Update client locally
                    selectedClient.name = contactDraft.name;
                    selectedClient.phoneNumber = contactDraft.phoneNumber;
                    selectedClient.email = contactDraft.email;
                    selectedClient.age = contactDraft.age;
                    selectedClient.maritalStatus = contactDraft.maritalStatus;
                    selectedClient.location = contactDraft.location;
                    selectedClient.housingStatus = contactDraft.housingStatus;
                    selectedClient.employment = contactDraft.employment;

                    setIsEditingContact(false);
                  }}
                >
                  Save
                </button>
              </div>
            )}
          </div>
          <div className="module__content">
            <div className="contact-grid">
              <div className="contact-item">
                <span>Name:</span>
                {isEditingContact ? (
                    <input
                      type="text"
                      value={contactDraft.name}
                      onChange={(e) =>
                        setContactDraft({
                          ...contactDraft,
                          name: e.target.value,
                        })
                      }
                    />
                  ) : (
                    <span>{selectedClient.name || 'N/A'}</span>
                  )}
              </div>
              <div className="contact-item">
                <span>Age:</span>
                {isEditingContact ? (
                    <input
                      type="text"
                      value={contactDraft.age}
                      onChange={(e) =>
                        setContactDraft({
                          ...contactDraft,
                          age: e.target.value,
                        })
                      }
                    />
                  ) : (
                    <span>{selectedClient.age || 'N/A'} yrs</span>
                  )}
              </div>
              <div className="contact-item">
                <span>Marital Status:</span>
                {isEditingContact ? (
                    <input
                      type="text"
                      value={contactDraft.maritalStatus}
                      onChange={(e) =>
                        setContactDraft({
                          ...contactDraft,
                          maritalStatus: e.target.value,
                        })
                      }
                    />
                  ) : (
                    <span>{selectedClient.maritalStatus || 'N/A'}</span>
                  )}
              </div>
              <div className="contact-item">
                <span>Location:</span>
                {isEditingContact ? (
                    <input
                      type="text"
                      value={contactDraft.location}
                      onChange={(e) =>
                        setContactDraft({
                          ...contactDraft,
                          location: e.target.value,
                        })
                      }
                    />
                  ) : (
                    <span>{selectedClient.location || 'N/A'}</span>
                  )}
              </div>
              <div className="contact-item">
                <span>Housing Status:</span>
                {isEditingContact ? (
                    <input
                      type="text"
                      value={contactDraft.housingStatus}
                      onChange={(e) =>
                        setContactDraft({
                          ...contactDraft,
                          housingStatus: e.target.value,
                        })
                      }
                    />
                  ) : (
                    <span>{selectedClient.housingStatus || 'N/A'}</span>
                  )}
              </div>
              <div className="contact-item">
                <span>Phone:</span>
                {isEditingContact ? (
                    <input
                      type="text"
                      value={contactDraft.phoneNumber}
                      onChange={(e) =>
                        setContactDraft({
                          ...contactDraft,
                          phoneNumber: e.target.value,
                        })
                      }
                    />
                  ) : (
                    <span>{selectedClient.phoneNumber || 'N/A'}</span>
                  )}
              </div>
              <div className="contact-item">
                <span>Email:</span>
                {isEditingContact ? (
                    <input
                      type="text"
                      value={contactDraft.email}
                      onChange={(e) =>
                        setContactDraft({
                          ...contactDraft,
                          email: e.target.value,
                        })
                      }
                    />
                  ) : (
                    <span>{selectedClient.email || 'N/A'}</span>
                  )}
              </div>
              <div className="contact-item">
                <span>Do Not Call:</span>
                {isEditingContact ? (
                    <input
                      type="text"
                      value={contactDraft.doNotCall}
                      onChange={(e) =>
                        setContactDraft({
                          ...contactDraft,
                          doNotCall: e.target.value,
                        })
                      }
                    />
                  ) : (
                    <span className="value">{selectedClient.doNotCall ? 'Yes' : 'No'}</span>
                  )}
              </div>
              <div className="contact-item">
                <span>Employment:</span>
                {isEditingContact ? (
                    <input
                      type="text"
                      value={contactDraft.employment}
                      onChange={(e) =>
                        setContactDraft({
                          ...contactDraft,
                          employment: e.target.value,
                        })
                      }
                    />
                  ) : (
                    <span>{selectedClient.employment || 'N/A'}</span>
                  )}
              </div>
            </div>
          </div>
        </div>

        {/* Relationships */}
        <div className="module module--relationships card">
          <h2 id="relationships-title" className="module__title">PNC Relationships</h2>
          <div className="module__content">
            <div className="relationships-container">
              {relatedClients.length > 0 ? (
                relatedClients.map((client) => (
                  <div
                    key={client.id}
                    className="relationship-card"
                    onClick={() => handleClientChange(client)}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleClientChange(client);
                    }}
                  >
                    <div className="related-avatar" aria-hidden="true"></div>
                    <div className="relationship-name">
                      {client.name}
                    </div>

                    <div className="relationship-type">
                      {client.relation}
                    </div>
                  </div>
                ))
              ) : (
                <p className="muted">No related clients found.</p>
              )}
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

        {/* Opportunities 
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
        */}
      </div>
    </div>
  );
}

export default ClientProfile;