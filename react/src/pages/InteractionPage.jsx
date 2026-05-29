import { useState } from 'react';
import { useEffect } from 'react';


function InteractionPage({ selectedClient, saveInteractionDocument, submitInteractionDocument, draft, interactionDraft, clientGoals, setClientGoals, filteredClients, handleClientChange, 
 closeTab,
  activeTab,
}) {
  
  const activeDraft = draft || interactionDraft;
  const [isGroupingOpen, setIsGroupingOpen] = useState(false);

  const [answers, setAnswers] = useState({
    tracksExpenses: { choice: '', details: '' },
    borrowsMoney: { choice: '', details: '' },
    retirementSaving: { choice: '', details: '' },
    incomeSources: [],
    currentSaving: { choice: '', details: '' },
    purchaseMethod: []
  });

  const [bankerNotes, setBankerNotes] = useState(activeDraft?.bankerNotes || '');
  const [pncNotes, setPncNotes] = useState('');
  const [incomeInput, setIncomeInput] = useState('');
  const [purchaseInput, setPurchaseInput] = useState('');
  const [isGoalUpdateOpen, setIsGoalUpdateOpen] = useState(false);
  const goals = clientGoals[selectedClient.id] || [];
  const [preparationNotes, setPreparationNotes] = useState('');

  
  const relatedClients =
  selectedClient.relationships?.map((rel) => {
    const client = filteredClients.find(c => c.id === rel.id);
    return client ? { ...client, relation: rel.relation } : null;
  }).filter(Boolean) || [];
  
  useEffect(() => {
      if (!draft && !interactionDraft) return;
      const data = draft || interactionDraft;
      setPreparationNotes(interactionDraft?.preparationNotes || '');



      setAnswers({
        tracksExpenses: {
          choice: data.questions?.tracksExpenses?.choice || '',
          details: data.questions?.tracksExpenses?.details || '',
        },
        borrowsMoney: {
          choice: data.questions?.borrowsMoney?.choice || '',
          details: data.questions?.borrowsMoney?.details || '',
        },
        retirementSaving: {
          choice: data.questions?.retirementSaving?.choice || '',
          details: data.questions?.retirementSaving?.details || '',
        },
        incomeSources: data.questions?.incomeSources || [],

        currentSaving: {
          choice: data.questions?.currentSaving?.choice || '',
          details: data.questions?.currentSaving?.details || '',
        },
        purchaseMethod: data.questions?.purchaseMethod || []
      });

      setBankerNotes(data.bankerNotes || '');
      setPncNotes(data.pncNotes || '');
  }, [draft, interactionDraft, preparationNotes ]);


  const handleAnswerChange = (field, key, value) => {
    setAnswers((prev) => ({
      ...prev,
      [field]: {
        ...prev[field],
        [key]: value,
      },
    }));
  };


  const handleListKeyDown = (field, value, setValue, e) => {
    if (e.key === 'Enter') {
      e.preventDefault();

      const trimmed = value.trim();
      if (!trimmed) return;

      setAnswers((prev) => ({
        ...prev,
        [field]: [...prev[field], trimmed],
      }));

      setValue('');
    }
  };

  const removeItem = (field, index) => {
    setAnswers((prev) => ({
      ...prev,
      [field]: prev[field].filter((_, i) => i !== index),
    }));
  };


  const handleSaveDocument = async () => {
  setIsSaving(true);

  try {
    await saveInteractionDocument({
      clientId: selectedClient.id,
      clientName: selectedClient.name,
      preparationNotes,
      questions: answers,
      bankerNotes,
      pncNotes,
      documentText: `
      Client: ${selectedClient.name}

      QUESTIONS
      Track Expenses: 
        ${answers.tracksExpenses.choice}
        ${answers.tracksExpenses.details}
      Borrow Money: 
        ${answers.borrowsMoney.choice}
        ${answers.borrowsMoney.details}
      Saving for Retirement: 
        ${answers.retirementSaving.choice}
        ${answers.retirementSaving.details}
      Income Sources:
        ${answers.incomeSources.join(', ')}
      Currently Saving: 
        ${answers.currentSaving.choice}
        ${answers.currentSaving.details}
      Purchase Methods: 
        ${answers.purchaseMethod.join(', ')}

      BANKER NOTES
      ${bankerNotes}

      PNC NOTES
      ${pncNotes}
      `,
    });

    // quick visual confirmation
    setTimeout(() => setIsSaving(false), 800);
  } catch (err) {
    console.error(err);
    setIsSaving(false);
  }
};
const handleSubmit = async () => {
  setIsSubmitting(true);
  setPreparationNotes('');

  try {
    await submitInteractionDocument();

    setIsSubmitting(false);
    setSubmitSuccess(true);

    setTimeout(() => {
      if (closeTab && activeTab) {
        closeTab(activeTab);
      }
    }, 900);

  } catch (err) {
    console.error(err);
    setIsSubmitting(false);
  }
};
  const toggleCompletion = (index) => {
    setClientGoals((prev) => ({
      ...prev,
      [selectedClient.id]: prev[selectedClient.id].map((goal, i) =>
        i === index ? { ...goal, completed: !goal.completed } : goal
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

  const [editingIndex, setEditingIndex] = useState(null);
  const [goalForm, setGoalForm] = useState({
    description: '',
    date: '',
    isSavingsGoal: true,
    startAmount: '0',
    targetAmount: '10000',
  });

  const startEditGoal = (index) => {
    const goal = goals[index];
    setShowGoalForm(true);

    setGoalForm({
      description: goal.description,
      date: goal.date,
      isSavingsGoal: goal.isSavingsGoal,
      startAmount: goal.currentAmount?.toString() || '0',
      targetAmount: goal.targetAmount?.toString() || '10000',
    });

    setEditingIndex(index);
  };

  const submitGoal = () => {
    if (!goalForm.description.trim() || !goalForm.date) return;

    const startAmount = Number(goalForm.startAmount || 0);
    const targetAmount = Number(goalForm.targetAmount || 0);

    const goalData = {
      description: goalForm.description,
      date: goalForm.date,
      startDate: new Date().toLocaleDateString(),
      isSavingsGoal: goalForm.isSavingsGoal,
      targetAmount: goalForm.isSavingsGoal ? targetAmount : null,
      currentAmount: goalForm.isSavingsGoal ? startAmount : null,
      completed: goalForm.isSavingsGoal
        ? startAmount >= targetAmount
        : false,
    };

    setClientGoals((prev) => ({
      ...prev,
      [selectedClient.id]:
        editingIndex !== null
          ? prev[selectedClient.id].map((g, i) =>
              i === editingIndex ? goalData : g
            )
          : [...(prev[selectedClient.id] || []), goalData],
    }));

    setEditingIndex(null);
    setGoalForm({
      description: '',
      date: '',
      isSavingsGoal: true,
      startAmount: '0',
      targetAmount: '10000',
    });
  };

  const activeGoal =
  editingIndex !== null
    ? {
        ...goals[editingIndex],
        description: goalForm.description,
        date: goalForm.date,
        currentAmount: Number(goalForm.startAmount || 0),
        targetAmount: Number(goalForm.targetAmount || 0),
      }
    : null;

  const [showGoalForm, setShowGoalForm] = useState(false);
  //button saving/submitting reaction states
  const [isSaving, setIsSaving] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  return (
    <div className="background-card">
      <div className="interaction-page">
        <div className="interaction-form-grouping">

          {/* HEADER */}
          <div
            className="interaction-form-grouping-header"
            onClick={() => setIsGroupingOpen((prev) => !prev)}
          >
            <h2 className="interaction-form-grouping-titles">Preparation Information</h2>
            {/* Arrow */}
            <span
              className={`grouping-arrow ${isGroupingOpen ? 'open' : ''}`}>
              🛆
            </span>
          </div>

          {/* CONTENT */}
          {isGroupingOpen && (
            <div className="interaction-form-grouping-content">
              <div className="interaction-section section-1">
              <div className="top-section-row">
                {/* Insights Overview */}
                <div className="module module--insights card">
                  <h2 className="module__title">Insights</h2>
                  <div className="module__content">
                    <div className="insight-item">
                      <h3>Client Summary</h3>
                      <p className="muted">
                        {selectedClient.name} is a {selectedClient.relationship || 'client'} of PNC, {String(selectedClient.clientSummary || '').toLowerCase()}
                      </p>
                    </div>
                    <div className="insight-item">
                      <h3>Possible Opportunities</h3>
                      <ul className="opportunities-list">
                        {(selectedClient.opportunities || []).map((opp, index) => (
                          <li key={index}>{opp}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>

                {/* Accounts Overview */}
                <div className="module module--accounts-overview card">
                  <h2 className="module__title">Accounts Overview</h2>
                  <div className="module__content">
                    <div className="accounts-grid">
                      {selectedClient.accounts.filter(account => account.percentage !== null).map((account, index) => (
                        <div key={index} className="account-card">
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
                    <div className="loans-section">
                      <h3>Loans & Credit</h3>
                      <div className="loans-grid">
                        {selectedClient.accounts.filter(account => account.percentage === null).map((account, index) => (
                          <div key={index} className="loan-card">
                            <h4>{account.type}</h4>
                            <div className="loan-balance">{formatCurrency(account.balance)}</div>
                            <div className="loan-rate">Interest Rate: {account.interestRate}%</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Campaign Referrals */}
            <div className="interaction-section section-campaigns">
              <div className="module module--campaigns card">
                <h2 className="module__title">Campaign Referrals</h2>
                <div className="module__content">
                  <ul className="campaigns-list">
                    {(selectedClient.campaignReferrals || []).map((campaign, index) => (
                      <li key={index} className={`campaign-item ${campaign.eligible ? 'eligible' : 'not-eligible'}`}>
                        <h3>{campaign.type}</h3>
                        <p>{campaign.description}</p>
                        <span className="eligibility">{campaign.eligible ? 'Eligible' : 'Not Eligible'}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>

            {/* Section 2: PNC Relationships and Financial Goals */}
            <div className="interaction-section section-2">
              <div className="section-row">
                {/* Related Accounts */}
                <div className="module module--recent-notes card">
                  <div className="module-header">
                    <h2 className="module__title">PNC Relationships</h2>
                  </div>

                  <div className="relationships-container">
                    {relatedClients.length > 0 ? (
                      relatedClients.map((client) => (
                        <div
                          key={client.id}
                          className="relationship-interaction-card"
                          onClick={() => handleClientChange(client)}
                          role="button"
                          tabIndex={0}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              handleClientChange(client);
                            }
                          }}
                        >
                          <div className="relationship-name">
                            {client.name}
                          </div>

                          <div className="relationship-type">
                            {client.relation}
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="goals-empty-state">
                        <p >No related clients found.</p>
                      </div>
                    )}
                  </div>
                </div>
                {/* Financial Goals */}
                <div className="module module--goals card">
                  <h2 className="module__title">Financial Goals</h2>
                  <div className="module__content">
                    {goals.length === 0 ? (
                      <div className="goals-empty-state">
                        <p>No client goals yet.</p>
                        <span>Add goals in the section below to get started.</span>
                      </div>
                    ) : (
                      <ul className="interaction-goals-grid">
                        {goals.map((goal, index) => {
                          const progressPercent =
                            goal.targetAmount && goal.currentAmount
                              ? Math.min(
                                  100,
                                  Math.round(
                                    (goal.currentAmount / goal.targetAmount) * 100
                                  )
                                )
                              : 0;

                          return (
                            <li key={index} className="interaction-goal-item">
                              <div className="interaction-goal-content">
                                <h3 className="goal-title">
                                  {goal.description || goal.goal}
                                </h3>

                                <div className="goal-type">
                                  {goal.targetAmount
                                    ? 'Savings goal'
                                    : 'Milestone goal'}
                                </div>

                                <div className="goal-dates-row">
                                  <span>Start: {goal.startDate || 'Today'}</span>
                                  <span>Due: {goal.date || 'TBD'}</span>
                                </div>

                                {goal.targetAmount && (
                                  <>
                                    <progress
                                      value={goal.currentAmount || 0}
                                      max={goal.targetAmount}
                                    />
                                    <div className="goal-progress-percentage">
                                      {progressPercent}%
                                    </div>
                                  </>
                                )}
                              </div>
                            </li>
                          );
                        })}
                      </ul>
                    )}
                  </div>
                </div>
              </div>
            </div>
            </div>
          )}

        </div>

        {/* Section 3: Interaction Preparation Notes + Questions + Banker Notes */}
          <div className="interaction-section section-3">
            {/* Interaction Preparation Notes */}
            <div className="module module--prep-notes card">
              <h2 className="module__title">Interaction Preparation Notes</h2>
              <div className="module__content">
                {/* <textarea
                  className="notes-textarea"
                  placeholder="Add preparation notes for this interaction..."
                  rows="6"
                ></textarea> */}
                <textarea
  value={preparationNotes}
  onChange={(e) => setPreparationNotes(e.target.value)}
  className="notes-textarea"
                  placeholder="Add preparation notes for this interaction..."
                  rows="6"
/>

              </div>
            </div>

            {/* Interaction Questions Module */}
            <div className="module module--interaction-questions card">
              <h2 className="module__title">Interaction Questions</h2>
              <div className="module__content">
                <div className="questions-grid">
                  {/* Row 1 */}
                  <div className="question-row">
                    <div className="question-block">
                      <label className="question-label">Do you track your expenses?</label>
                        <div className="question-inputs">
                          <div className="question-buttons">
                            <button
                              type="button"
                              className={`btn btn--toggle ${
                                answers.tracksExpenses.choice === 'Yes' ? 'active' : ''
                              }`}
                              onClick={() =>
                                handleAnswerChange('tracksExpenses', 'choice', 'Yes')
                              }
                            >
                              Yes
                            </button>

                            <button
                              type="button"
                              className={`btn btn--toggle btn--secondary ${
                                answers.tracksExpenses.choice === 'No' ? 'active' : ''
                              }`}
                              onClick={() =>
                                handleAnswerChange('tracksExpenses', 'choice', 'No')
                              }
                            >
                              No
                            </button>
                          </div>
                          <input
                            type="text"
                            className="input-small"
                            placeholder="Additional details..."
                            value={answers.tracksExpenses.details}
                            onChange={(e) =>
                              handleAnswerChange(
                                'tracksExpenses',
                                'details',
                                e.target.value
                              )
                            }
                          />
                        </div>
                    </div>
                    <div className="question-block">
                      <label className="question-label">Do you borrow money?</label>
                        <div className="question-inputs">
                          <div className="question-buttons">
                            <button
                              type="button"
                              className={`btn btn--toggle ${
                                answers.borrowsMoney.choice === 'Yes' ? 'active' : ''
                              }`}
                              onClick={() =>
                                handleAnswerChange('borrowsMoney', 'choice', 'Yes')
                              }
                            >
                              Yes
                            </button>

                            <button
                              type="button"
                              className={`btn btn--toggle btn--secondary ${
                                answers.borrowsMoney.choice === 'No' ? 'active' : ''
                              }`}
                              onClick={() =>
                                handleAnswerChange('borrowsMoney', 'choice', 'No')
                              }
                            >
                              No
                            </button>
                          </div>
                          <input
                            type="text"
                            className="input-small"
                            placeholder="Additional details..."
                            value={answers.borrowsMoney.details}
                            onChange={(e) =>
                              handleAnswerChange(
                                'borrowsMoney',
                                'details',
                                e.target.value
                              )
                            }
                          />
                        </div>
                    </div>
                  </div>

                  {/* Row 2 */}
                  <div className="question-row">
                    <div className="question-block">
                      <label className="question-label">Are you saving for retirement?</label>
                        <div className="question-inputs">
                          <div className="question-buttons">
                            <button
                              type="button"
                              className={`btn btn--toggle ${
                                answers.retirementSaving.choice === 'Yes' ? 'active' : ''
                              }`}
                              onClick={() =>
                                handleAnswerChange('retirementSaving', 'choice', 'Yes')
                              }
                            >
                              Yes
                            </button>

                            <button
                              type="button"
                              className={`btn btn--toggle btn--secondary ${
                                answers.retirementSaving.choice === 'No' ? 'active' : ''
                              }`}
                              onClick={() =>
                                handleAnswerChange('retirementSaving', 'choice', 'No')
                              }
                            >
                              No
                            </button>
                          </div>
                          <input
                            type="text"
                            className="input-small"
                            placeholder="Additional details..."
                            value={answers.retirementSaving.details}
                            onChange={(e) =>
                              handleAnswerChange(
                                'retirementSaving',
                                'details',
                                e.target.value
                              )
                            }
                          />
                        </div>
                    </div>
                    <div className="question-block">
                      <label id="income-source-label" className="question-label">What are your sources of income?</label>

                      <div className="tag-input-container">
                        {/* TAGS */}
                        <div className="tag-list">
                          {answers.incomeSources.map((item, index) => (
                            <span key={index} className="tag">
                              {item}
                              <button
                                type="button"
                                onClick={() => removeItem('incomeSources', index)}
                                className="tag-remove"
                              >
                                ×
                              </button>
                            </span>
                          ))}
                        </div>

                        {/* INPUT */}
                        <input id='income-source-input'
                          type="text"
                          value={incomeInput}
                          onChange={(e) => setIncomeInput(e.target.value)}
                          onKeyDown={(e) =>
                            handleListKeyDown(
                              'incomeSources',
                              incomeInput,
                              setIncomeInput,
                              e
                            )
                          }
                          placeholder="Type and press Enter..."
                          className="input-small"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Row 3 */}
                  <div className="question-row">
                    <div className="question-block">
                      <label className="question-label">What are you currently saving?</label>
                        <div className="question-inputs">
                          <input
                            type="text"
                            className="input-small"
                            placeholder="Additional details..."
                            value={answers.currentSaving.details}
                            onChange={(e) =>
                              handleAnswerChange(
                                'currentSaving',
                                'details',
                                e.target.value
                              )
                            }
                          />
                        </div>
                    </div>
                    <div className="question-block">
                      <label className="question-label">How do you typically make purchases?</label>
                      <div className="tag-input-container">
                        {/* TAGS */}
                        <div className="tag-list">
                          {answers.purchaseMethod.map((item, index) => (
                            <span key={index} className="tag">
                              {item}
                              <button
                                type="button"
                                onClick={() => removeItem('purchaseMethod', index)}
                                className="tag-remove"
                              >
                                ×
                              </button>
                            </span>
                          ))}
                        </div>

                        {/* INPUT */}
                        <input
                          type="text"
                          value={purchaseInput}
                          onChange={(e) => setPurchaseInput(e.target.value)}
                          onKeyDown={(e) =>
                            handleListKeyDown(
                              'purchaseMethod',
                              purchaseInput,
                              setPurchaseInput,
                              e
                            )
                          }
                          placeholder="Type and press Enter..."
                          className="input-small"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="section-row">

                {/* Banker Notes Module */}
                <div className="module module--banker-notes card">
                <h2 className="module__title">Banker Notes</h2>

                <div className="module__content">
                    <p className="muted helper-text-banker-notes">
                    Notes written in this section will only be shown to branch bankers, and saved under the client note page.
                    </p>

                    
                  <textarea
                  className="notes-textarea"
                  value={bankerNotes}
                    onChange={(e) => setBankerNotes(e.target.value)}
                    placeholder="Enter banker notes..."
                  />

                </div>
                </div>

                {/* PNC Notes Module */}
                <div className="module module--pnc-notes card">
                <h2 className="module__title">PNC Notes</h2>

                <div className="module__content">
                    <p className="muted helper-text">
                    Notes written in this section will be shared to teams across from PNC. Anything written in this section will also be saved to Banker Notes.
                    </p>

                    <textarea
                      className="notes-textarea"
                      value={pncNotes}
                      onChange={(e) => setPncNotes(e.target.value)}
                      placeholder="Enter PNC notes..."
                    />
                </div>
                </div>

            </div>

            {/* Goals */} 
            <div className="module module--interaction-goal-update-card card">
              {/* HEADER (CLICKABLE) */}
              <div
                className="module--interaction-goal-update"
                onClick={() =>
                  setIsGoalUpdateOpen((prev) => !prev)
                }
              >
                <h2 className='update-goals-title'>Update Client Goals...?</h2>
                <span
                  className={`goal-update-arrow ${isGoalUpdateOpen ? 'open' : ''}`}>
                  🛆
                </span>            
                
              </div>
              
              {/* CONTENT */}
              
              {isGoalUpdateOpen && (
                
                <div className="module__content">
                  <button
                    className="update-new-goal-btn"
                    onClick={(e) => {
                      e.stopPropagation(); 

                      setShowGoalForm(true);
                      setEditingIndex(null);

                      setGoalForm({
                        description: '',
                        date: '',
                        isSavingsGoal: true,
                        startAmount: '0',
                        targetAmount: '10000',
                      });
                    }}
                  >
                    New Goal
                  </button>
                  {showGoalForm && (
                  <section className="update-goal-form-panel">

                    <input
                      type="text"
                      placeholder="Goal description"
                      value={goalForm.description}
                      onChange={(e) =>
                        setGoalForm((prev) => ({
                          ...prev,
                          description: e.target.value,
                        }))
                      }
                    />

                    <input
                      type="date"
                      value={goalForm.date}
                      onChange={(e) =>
                        setGoalForm((prev) => ({
                          ...prev,
                          date: e.target.value,
                        }))
                      }
                    />

                    <input
                      type="number"
                      placeholder="Starting amount"
                      value={goalForm.startAmount}
                      onChange={(e) =>
                        setGoalForm((prev) => ({
                          ...prev,
                          startAmount: e.target.value,
                        }))
                      }
                    />

                    <input
                      type="number"
                      placeholder="Target amount"
                      value={goalForm.targetAmount}
                      onChange={(e) =>
                        setGoalForm((prev) => ({
                          ...prev,
                          targetAmount: e.target.value,
                        }))
                      }
                    />

                    <div className="goal-form-actions">

                      <button
                        className="goal-save-btn"
                        onClick={() => {
                          submitGoal();         
                          setShowGoalForm(false);
                        }}
                      >
                        Save Goal
                      </button>

                      <button
                        className="btn-ghost"
                        onClick={() => {
                          setShowGoalForm(false);
                        }}
                      >
                        Cancel
                      </button>

                    </div>

                  </section>
                  )}
                  {goals.length === 0 ? (
                  <div className="update-goals-empty-state">
                    <p>No goals to update.</p>
                    <span>Enter one by pressing the "New Goal" button.</span>
                  </div>
                  ) : (
                  <ul className="goals-list">
                    {goals.map((goal, index) => {
                      const isEditing = editingIndex === index;

                      const progressPercent =
                        goal.isSavingsGoal && goal.targetAmount
                          ? Math.min(
                              100,
                              Math.round(
                                (goal.currentAmount / goal.targetAmount) * 100
                              )
                            )
                          : 0;

                      return (
                        <li key={index} className={`goal-item ${goal.completed ? 'completed' : ''}`}>
                          <div className="goal-card-header">
                            <div className="goal-card-title">
                              <label className="goal-checkbox">
                                <input
                                  type="checkbox"
                                  checked={goal.completed}
                                  onChange={() => {
                                    setClientGoals((prev) => ({
                                      ...prev,
                                      [selectedClient.id]: prev[selectedClient.id].map((g, i) =>
                                        i === index
                                          ? { ...g, completed: !g.completed }
                                          : g
                                      ),
                                    }));
                                  }}
                                />
                              </label>
                              {/* TITLE*/}
                              {isEditing ? (
                                <input
                                  type="text"
                                  value={goalForm.description}
                                  onChange={(e) =>
                                    setGoalForm((prev) => ({
                                      ...prev,
                                      description: e.target.value,
                                    }))
                                  }
                                />
                              ) : (
                                <div className="goal-card-title-text">
                                  <h3>{goal.description}</h3>
                                  <div className="goal-meta-row">
                                    <span>{goal.isSavingsGoal ? 'Savings Goal' : 'Milestone Goal'}</span>
                                  </div>
                                  {isEditing ? (
                                    <input
                                      type="date"
                                      value={goalForm.date}
                                      onChange={(e) =>
                                        setGoalForm((prev) => ({
                                          ...prev,
                                          date: e.target.value,
                                        }))
                                      }
                                    />
                                  ) : (
                                    <div className="goal-dates">
                                      <span>Start: {goal.startDate || 'Today'}</span>
                                      <span>Due: {goal.date || 'TBD'}</span>
                                    </div>
                                  )}  
                                </div>
                              )}
                              <span className={`goal-status-tag ${goal.completed ? 'completed' : ''}`}>
                                {goal.completed ? 'Completed' : goal.isSavingsGoal ? `${progressPercent}%` : 'Pending'}
                              </span>
                              </div>
                              <div className="goal-card-actions">
                                {isEditing ? (
                                <button
                                  className="goal-save-btn"
                                  onClick={() => {
                                    const updatedGoal = {
                                      ...goal,
                                      description: goalForm.description,
                                      date: goalForm.date,
                                      currentAmount: Number(goalForm.startAmount),
                                      targetAmount: Number(goalForm.targetAmount),
                                    };

                                    setClientGoals((prev) => ({
                                      ...prev,
                                      [selectedClient.id]: prev[selectedClient.id].map((g, i) =>
                                        i === index ? updatedGoal : g
                                      ),
                                    }));

                                    setEditingIndex(null);
                                  }}
                                >
                                  Save
                                </button>
                              ) : (
                                <button
                                  className="goal-edit-btn"
                                  onClick={() => {
                                    setGoalForm({
                                      description: goal.description,
                                      date: goal.date,
                                      startAmount: goal.currentAmount?.toString() || '0',
                                      targetAmount: goal.targetAmount?.toString() || '10000',
                                      isSavingsGoal: goal.isSavingsGoal,
                                    });

                                    setEditingIndex(index);
                                  }}
                                >
                                  Edit
                                </button>
                              )}

                              {/* DELETE */}
                              <button
                                className="delete-goal-btn"
                                onClick={() => {
                                  setClientGoals((prev) => ({
                                    ...prev,
                                    [selectedClient.id]: prev[selectedClient.id].filter(
                                      (_, i) => i !== index
                                    ),
                                  }));
                                }}
                              >
                                ×
                              </button> 
                            </div>
                          </div>
                          {/* PROGRESS */}
                          {goal.isSavingsGoal && (
                            <div className="goal-progress-block">
                              {isEditing ? (
                                <>
                                  <input
                                    type="number"
                                    value={goalForm.startAmount}
                                    onChange={(e) =>
                                      setGoalForm((prev) => ({
                                        ...prev,
                                        startAmount: e.target.value,
                                      }))
                                    }
                                  />

                                  <input
                                    type="number"
                                    value={goalForm.targetAmount}
                                    onChange={(e) =>
                                      setGoalForm((prev) => ({
                                        ...prev,
                                        targetAmount: e.target.value,
                                      }))
                                    }
                                  />
                                </>
                              ) : (
                                <div className="goal-progress-block">
                                  <progress
                                    value={goal.currentAmount || 0}
                                    max={goal.targetAmount}
                                  />
                                  <div className="goal-progress-info">
                                  <span>{formatCurrency(goal.currentAmount)} saved</span>
                                    <span>of {formatCurrency(goal.targetAmount)}</span>
                                  </div>
                                </div>
                              )}
                            </div>
                          )}
                        </li>
                      );
                    })}
                  </ul>
                )}
                </div>
              )}
            </div>    


            {/* Action Buttons */}
            {/* <div className="interaction-actions"> 
              <button className="btn" onClick={handleSaveDocument}>Save Draft</button>
              <button className="btn" onClick={submitInteractionDocument}>Submit</button>
            </div> */}
            <div className="interaction-actions">
  <button 
    className={`btn ${isSaving ? 'loading' : ''}`} 
    onClick={handleSaveDocument}
    disabled={isSaving}
  >
    {isSaving ? 'Saving...' : 'Save Draft'}
  </button>

  <button 
    className={`btn ${isSubmitting ? 'loading' : ''} ${submitSuccess ? 'success' : ''}`} 
    onClick={handleSubmit}
    disabled={isSubmitting || submitSuccess}
  >
    {isSubmitting 
      ? 'Submitting...' 
      : submitSuccess 
      ? 'Submitted ✔' 
      : 'Submit'}
  </button>
  
{submitSuccess && (
  <div className="toast-success">
    Draft submitted successfully!
  </div>
)}

</div>
          </div>
      </div>
    </div>
    
  );
}

const formatCurrency = (value) =>
  new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(value);

export default InteractionPage;    