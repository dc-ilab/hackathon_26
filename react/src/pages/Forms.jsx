import InteractionPage from './InteractionPage';

function Forms({ selectedClient, openTab }) {
  return (
    <div className="forms-page">
      {/* Client Interaction Form */}
      <div className="module module--interaction card">
        <h2 className="module__title">Client Interaction</h2>
        <div className="module__content">
          <div className="form-details">
            <div className="detail-item">
              <span>Client:</span>
              <span className="value">{selectedClient.name}</span>
            </div>
            <div className="detail-item">
              <span>Appointment Date:</span>
              <span className="value">May 15, 2026</span>
            </div>
            <div className="detail-item">
              <span>Purpose:</span>
              <span className="value">Review financial goals</span>
            </div>
          </div>
          <div className="form-actions">
            <button className="btn btn--ghost" aria-label="Call">
              ☎ Call Client
            </button>
            <button className="btn" onClick={() => openTab('interaction', 'Client Interaction', InteractionPage)}>Start Interaction</button>
          </div>
        </div>
      </div>

      {/* Service Request Form */}
      <div className="module module--service card">
        <h2 className="module__title">Service Request</h2>
        <div className="module__content">
          <form className="form">
            <div className="form-group">
              <label htmlFor="service-type">Service Type:</label>
              <select id="service-type">
                <option>Select a service...</option>
                <option>Account Opening</option>
                <option>Loan Application</option>
                <option>Credit Card Request</option>
                <option>Wire Transfer</option>
                <option>Check Deposit</option>
                <option>Other</option>
              </select>
            </div>
            <div className="form-group">
              <label htmlFor="priority">Priority:</label>
              <select id="priority">
                <option>Normal</option>
                <option>High</option>
                <option>Urgent</option>
              </select>
            </div>
            <div className="form-group">
              <label htmlFor="description">Description:</label>
              <textarea id="description" placeholder="Describe the service request in detail..."></textarea>
            </div>
            <div className="form-group">
              <label htmlFor="attachments">Attachments:</label>
              <input id="attachments" type="file" multiple />
            </div>
            <button type="submit" className="btn">Submit Request</button>
          </form>
        </div>
      </div>

      {/* Sales Request Form */}
      <div className="module module--sales card">
        <h2 className="module__title">Sales Request</h2>
        <div className="module__content">
          <form className="form">
            <div className="form-group">
              <label htmlFor="product">Product:</label>
              <select id="product">
                <option>Select a product...</option>
                <option>Investment Account</option>
                <option>Wealth Management</option>
                <option>Insurance Products</option>
                <option>Retirement Planning</option>
                <option>Mortgage Services</option>
                <option>Other</option>
              </select>
            </div>
            <div className="form-group">
              <label htmlFor="amount">Estimated Amount:</label>
              <input id="amount" type="number" placeholder="Enter amount..." />
            </div>
            <div className="form-group">
              <label htmlFor="timeline">Timeline:</label>
              <select id="timeline">
                <option>Immediate</option>
                <option>Within 1 month</option>
                <option>Within 3 months</option>
                <option>Within 6 months</option>
                <option>Long term</option>
              </select>
            </div>
            <div className="form-group">
              <label htmlFor="sales-notes">Notes:</label>
              <textarea id="sales-notes" placeholder="Add sales notes and client requirements..."></textarea>
            </div>
            <button type="submit" className="btn">Submit Sales Request</button>
          </form>
        </div>
      </div>

      {/* General Inquiry Form */}
      <div className="module module--inquiry card">
        <h2 className="module__title">General Inquiry</h2>
        <div className="module__content">
          <form className="form">
            <div className="form-group">
              <label htmlFor="subject">Subject:</label>
              <input id="subject" type="text" placeholder="Enter subject..." />
            </div>
            <div className="form-group">
              <label htmlFor="category">Category:</label>
              <select id="category">
                <option>General</option>
                <option>Account Issues</option>
                <option>Technical Support</option>
                <option>Feedback</option>
                <option>Other</option>
              </select>
            </div>
            <div className="form-group">
              <label htmlFor="message">Message:</label>
              <textarea id="message" placeholder="Enter your message..."></textarea>
            </div>
            <div className="form-group">
              <label htmlFor="contact-method">Preferred Contact Method:</label>
              <select id="contact-method">
                <option>Email</option>
                <option>Phone</option>
                <option>In-person</option>
              </select>
            </div>
            <button type="submit" className="btn">Submit Inquiry</button>
          </form>
        </div>
      </div>

      {/* Form History */}
      <div className="module module--history card">
        <h2 className="module__title">Recent Form Submissions</h2>
        <div className="module__content">
          <ul className="history-list">
            <li className="history-item">
              <span className="history-date">2026-05-01</span>
              <span className="history-type">Service Request</span>
              <span className="history-status">Pending</span>
            </li>
            <li className="history-item">
              <span className="history-date">2026-04-28</span>
              <span className="history-type">Sales Request</span>
              <span className="history-status">Approved</span>
            </li>
            <li className="history-item">
              <span className="history-date">2026-04-25</span>
              <span className="history-type">General Inquiry</span>
              <span className="history-status">Resolved</span>
            </li>
            <li className="history-item">
              <span className="history-date">2026-04-20</span>
              <span className="history-type">Client Interaction</span>
              <span className="history-status">Completed</span>
            </li>
          </ul>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="module module--actions card">
        <h2 className="module__title">Quick Actions</h2>
        <div className="module__content">
          <div className="quick-actions-grid">
            <button className="quick-action-btn">Schedule Meeting</button>
            <button className="quick-action-btn">Send Email</button>
            <button className="quick-action-btn">Create Task</button>
            <button className="quick-action-btn">View Documents</button>
            <button className="quick-action-btn">Update Profile</button>
            <button className="quick-action-btn">Generate Report</button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Forms;
