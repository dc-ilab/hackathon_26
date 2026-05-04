function InteractionPage({ selectedClient }) {
  return (
    <div className="interaction-page">
      {/* Section 1: Insights and Accounts Overviews */}
      <div className="interaction-section section-1">
        <div className="section-row">
          {/* Insights Overview */}
          <div className="module module--insights card">
            <h2 className="module__title">Insights</h2>
            <div className="module__content">
              <div className="insight-item">
                <h3>Client Summary</h3>
                <p className="muted">
                  {selectedClient.name} is a {selectedClient.relationship} of PNC, {selectedClient.clientSummary.toLowerCase()}
                </p>
              </div>
              <div className="insight-item">
                <h3>Possible Opportunities</h3>
                <ul className="opportunities-list">
                  {selectedClient.opportunities.map((opp, index) => (
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
                {selectedClient.accounts.map((account, index) => (
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
            </div>
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

      {/* Section 3: Interaction Preparation Notes + Questions + Banker Notes */}
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
            <div className="prep-actions">
              <button className="btn btn--secondary">Save Draft</button>
              <button className="btn">Finalize Prep</button>
            </div>
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
                      <button className="btn btn--toggle">Yes</button>
                      <button className="btn btn--toggle btn--secondary">No</button>
                    </div>
                    <input
                      type="text"
                      className="input-small"
                      placeholder="Additional details..."
                    />
                  </div>
                </div>
                <div className="question-block">
                  <label className="question-label">Do you borrow money?</label>
                  <div className="question-inputs">
                    <div className="question-buttons">
                      <button className="btn btn--toggle">Yes</button>
                      <button className="btn btn--toggle btn--secondary">No</button>
                    </div>
                    <input
                      type="text"
                      className="input-small"
                      placeholder="Additional details..."
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
                      <button className="btn btn--toggle">Yes</button>
                      <button className="btn btn--toggle btn--secondary">No</button>
                    </div>
                    <input
                      type="text"
                      className="input-small"
                      placeholder="Additional details..."
                    />
                  </div>
                </div>
                <div className="question-block">
                  <label className="question-label">What are your sources of income?</label>
                  <input
                    type="text"
                    className="input-text"
                    placeholder="Enter sources of income..."
                  />
                </div>
              </div>

              {/* Row 3 */}
              <div className="question-row">
                <div className="question-block">
                  <label className="question-label">What are you currently saving?</label>
                  <input
                    type="text"
                    className="input-text"
                    placeholder="Enter savings goals..."
                  />
                </div>
                <div className="question-block">
                  <label className="question-label">How do you typically make purchases?</label>
                  <input
                    type="text"
                    className="input-text"
                    placeholder="Enter purchase methods..."
                  />
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
                placeholder="Add banker notes..."
                rows="8"
                ></textarea>
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
                placeholder="Add PNC notes..."
                rows="8"
                ></textarea>
            </div>
            </div>

            </div>

        {/* Action Buttons */}
        <div className="interaction-actions">
          <button className="btn btn--secondary">Save Draft</button>
          <button className="btn">Submit</button>
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