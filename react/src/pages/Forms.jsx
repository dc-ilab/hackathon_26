function Forms({ selectedClient }) {
  return (
    <div className="forms-page">
      <h1>Forms</h1>
      
      <div className="forms-container">
        {/* Client Interaction Form */}
        <section className="module module--form-section card">
          <h2 className="module__title">Client Interaction</h2>
          <div className="module__content">
            <p className="muted">
              Client appointment coming up? Start interaction form to see client insights +
              previous interaction summaries.
            </p>
            <div className="form-actions">
              <button className="btn btn--ghost" aria-label="Call">
                ☎ Call
              </button>
              <button className="btn">Start Interaction</button>
            </div>
          </div>
        </section>

        {/* Service Request Form */}
        <section className="module module--form-section card">
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
                  <option>Other</option>
                </select>
              </div>
              <div className="form-group">
                <label htmlFor="description">Description:</label>
                <textarea id="description" placeholder="Describe the service request..."></textarea>
              </div>
              <button type="submit" className="btn">Submit Request</button>
            </form>
          </div>
        </section>

        {/* Sales Request Form */}
        <section className="module module--form-section card">
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
                  <option>Other</option>
                </select>
              </div>
              <div className="form-group">
                <label htmlFor="sales-notes">Notes:</label>
                <textarea id="sales-notes" placeholder="Add sales notes..."></textarea>
              </div>
              <button type="submit" className="btn">Submit Sales Request</button>
            </form>
          </div>
        </section>

        {/* General Form */}
        <section className="module module--form-section card">
          <h2 className="module__title">General Form</h2>
          <div className="module__content">
            <form className="form">
              <div className="form-group">
                <label htmlFor="subject">Subject:</label>
                <input id="subject" type="text" placeholder="Enter subject..." />
              </div>
              <div className="form-group">
                <label htmlFor="message">Message:</label>
                <textarea id="message" placeholder="Enter your message..."></textarea>
              </div>
              <button type="submit" className="btn">Submit</button>
            </form>
          </div>
        </section>
      </div>
    </div>
  );
}

export default Forms;
