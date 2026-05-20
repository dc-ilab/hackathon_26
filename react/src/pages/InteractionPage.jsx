import { useState } from 'react';
import { useEffect } from 'react';


function InteractionPage({ selectedClient, saveInteractionDocument, submitInteractionDocument, draft, interactionDraft}) {
  
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

  
  useEffect(() => {
      if (!draft && !interactionDraft) return;

      const data = draft || interactionDraft;

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
  }, [draft, interactionDraft]);


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


  const handleSaveDocument = () => {
    saveInteractionDocument({
      clientId: selectedClient.id,
      clientName: selectedClient.name,

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
  };

  console.log(saveInteractionDocument);

  return (
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
            className={`grouping-arrow ${
              isGroupingOpen ? 'open' : ''
            }`}
          >
            ▼
          </span>
        </div>

        {/* CONTENT */}
        {isGroupingOpen && (
          <div className="interaction-form-grouping-content">
            <div className="interaction-section section-1">
            <div className="section-row">
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

          {/* Section 2: Recent Interaction Notes and Financial Goals */}
          <div className="interaction-section section-2">
            <div className="section-row">
              {/* Recent Interaction Notes */}
              <div className="module module--recent-notes card">
                <h2 className="module__title">Recent Interaction Notes</h2>
                <div className="module__content">
                  <div className="notes-timeline">
                    <div className="note-item">
                      <div className="note-date">2026-04-15</div>
                      <div className="note-content">
                        <p>Discussed retirement planning options. Client interested in 401k rollover.</p>
                      </div>
                    </div>
                    <div className="note-item">
                      <div className="note-date">2026-03-22</div>
                      <div className="note-content">
                        <p>Reviewed investment portfolio performance. Suggested diversification.</p>
                      </div>
                    </div>
                    <div className="note-item">
                      <div className="note-date">2026-02-10</div>
                      <div className="note-content">
                        <p>Updated contact information and discussed mortgage refinancing options.</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Financial Goals */}
              <div className="module module--goals card">
                <h2 className="module__title">Financial Goals</h2>
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
            </div>
          </div>
          </div>
        )}

      </div>

      {/* Section 3: Interaction Preparation Notes + Questions + Banker Notes */}
      <div className="interaction-form-input-grouping">
        <div className="interaction-section section-3">
          {/* Interaction Preparation Notes */}
          <div className="module module--prep-notes card">
            <h2 className="module__title">Interaction Preparation Notes</h2>
            <div className="module__content">
              <textarea
                className="notes-textarea"
                placeholder="Add preparation notes for this interaction..."
                rows="6"
              ></textarea>
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
                    <label className="question-label">What are your sources of income?</label>

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
                      <input
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
                  <p className="muted helper-text">
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

          {/* Action Buttons */}
          <div className="interaction-actions">
            
            <button onClick={handleSaveDocument}>Save Draft</button>

            <button className="btn" onClick={submitInteractionDocument}>Submit</button>
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