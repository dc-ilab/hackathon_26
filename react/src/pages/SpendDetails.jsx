import { useState } from 'react';

const buildMonthlyTotals = (transactions) => {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];

  const totals = {};

  transactions.forEach((tx) => {
    // Parse date format YYYY-MM-DD
    const dateParts = tx.date.split('-');
    const monthIndex = parseInt(dateParts[1], 10) - 1;
    const label = months[monthIndex] || months[months.length - 1];

    if (!totals[label]) {
      totals[label] = { month: label, income: 0, expense: 0 };
    }

    if (tx.type === 'deposit') {
      totals[label].income += tx.amount;
    } else {
      totals[label].expense += tx.amount;
    }
  });

  // Fill missing months with mock data
  return months.map((month, i) =>
    totals[month] || {
      month,
      income: 9000 + i * 300,
      expense: 6500 + i * 250,
    }
  );
};

const formatCurrency = (value) =>
  new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(value);

// Transform client spendTransactions to match expected transaction format
const getSpendTransactions = (spendTransactions) => {
  return spendTransactions || [];
};

function SpendDetails({ selectedClient }) {
  const spendTransactions = getSpendTransactions(selectedClient.spendTransactions);
  const monthlySpendData = buildMonthlyTotals(spendTransactions);
  const [selectedDate, setSelectedDate] = useState(null);
  const [calendarMonth, setCalendarMonth] = useState(new Date(2026, 3, 1));
  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const daysInMonth = new Date(calendarMonth.getFullYear(), calendarMonth.getMonth() + 1, 0).getDate();
  const firstDayOfWeek = new Date(calendarMonth.getFullYear(), calendarMonth.getMonth(), 1).getDay();
  const calendarCells = Array.from({ length: 42 }, (_, index) => index - firstDayOfWeek + 1);
  const currentMonthLabel = `${monthNames[calendarMonth.getMonth()]} ${calendarMonth.getFullYear()}`;
  const today = new Date();
  const isTodayDate = (dateNumber) =>
    dateNumber === today.getDate() &&
    calendarMonth.getMonth() === today.getMonth() &&
    calendarMonth.getFullYear() === today.getFullYear();

  const spendAccount = selectedClient.accounts.find((account) => account.type === 'Spend');
  const highestMonthlyValue = Math.max(...monthlySpendData.flatMap((item) => [item.income, item.expense]));
  const totalExpense = monthlySpendData.reduce((sum, item) => sum + item.expense, 0);
  const totalIncome = monthlySpendData.reduce((sum, item) => sum + item.income, 0);
  const averageExpense = Math.round(totalExpense / monthlySpendData.length);
  const selectedTransactions = selectedDate
    ? spendTransactions.filter((item) => item.date === selectedDate)
    : [];

  const handleDateClick = (dateNumber) => {
    if (dateNumber < 1 || dateNumber > daysInMonth) return;
    const monthString = String(calendarMonth.getMonth() + 1).padStart(2, '0');
    const dateString = `${monthString}/${String(dateNumber).padStart(2, '0')}/${calendarMonth.getFullYear()}`;
    setSelectedDate(dateString);
  };

  const handlePrevMonth = () => {
    setSelectedDate(null);
    setCalendarMonth((prev) => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
  };

  const handleToday = () => {
    const now = new Date();
    setSelectedDate(null);
    setCalendarMonth(new Date(now.getFullYear(), now.getMonth(), 1));
  };

  if (!spendAccount) {
    return <div className="spend-details-page">No Spend account data available.</div>;
  }

  return (
    <div className="spend-details-page">
      <div className="spend-header">
        <div>
          <p className="eyebrow">Spend Account</p>
          <h1>Spend account insights</h1>
          <p className="muted">A snapshot of your spending trends, cash flow, and recent activity for the Spend account.</p>
        </div>
        <div className="spend-balance-card">
          <span className="spend-balance-label">Current Balance</span>
          <span className="spend-balance-value">{formatCurrency(spendAccount.balance)}</span>
          <span className="spend-balance-note">Account is healthy and operating within budget.</span>
        </div>
      </div>

      <div className="spend-main-grid">
        <div className="spend-left-column">
          <section className="spend-insights-card">
            <div className="section-header">
              <div>
                <h2>Account Insights</h2>
                <p className="muted">Overview of spending habits and account cash flow.</p>
              </div>
            </div>
            <p>
              Over the last six months, this account has averaged <strong>{formatCurrency(averageExpense)}</strong> in expenses per month while receiving an average income of <strong>{formatCurrency(Math.round(totalIncome / monthlySpendData.length))}</strong>.
              Most spending was on food, transport, and subscriptions, with income comfortably covering expenses each month.
            </p>
            <div className="insight-stat-row">
              <div>
                <span className="insight-label">Total income</span>
                <strong>{formatCurrency(totalIncome)}</strong>
              </div>
              <div>
                <span className="insight-label">Total expense</span>
                <strong>{formatCurrency(totalExpense)}</strong>
              </div>
            </div>
          </section>

          {/* <section className="spend-graph-card">
            <div className="section-header">
              <h2>Income vs Expense</h2>
              <span className="muted">Monthly performance for the last six months.</span>
            </div>
            <div className="spend-bar-chart">
              <div className="chart-axis-labels">
                {[8000, 6000, 4000, 2000, 0].map((value) => (
                  <span key={value} className="axis-label">{formatCurrency(value)}</span>
                ))}
              </div>
              <div className="chart-grid">
                {monthlySpendData.map((item) => (
                  <div key={item.month} className="chart-column">
                    <div className="bar-stack">
                      <div
                        className="bar-column expense"
                        style={{ height: `${(item.expense / highestMonthlyValue) * 100}%` }}
                        title={`Expense ${formatCurrency(item.expense)}`}
                      />
                      <div
                        className="bar-column income"
                        style={{ height: `${(item.income / highestMonthlyValue) * 100}%` }}
                        title={`Income ${formatCurrency(item.income)}`}
                      />
                    </div>
                    <div className="chart-label">{item.month}</div>
                  </div>
                ))}
              </div>
            </div>
          </section> */}
        </div> 

        <aside className="spend-calendar-card">
          <div className="calendar-card">
            <div className="calendar-header">
              <div className="calendar-header-top">
                <button className="calendar-nav-button" onClick={handlePrevMonth} type="button">
                  ←
                </button>
                <div>
                  <p className="eyebrow">Calendar</p>
                  <h2>{currentMonthLabel}</h2>
                </div>
              </div>
              <button className="calendar-action" onClick={handleToday} type="button">Today</button>
            </div>
            <div className="calendar-grid">
              {dayNames.map((day) => (
                <div key={day} className="calendar-day-label">{day}</div>
              ))}
              {calendarCells.map((dateNumber, index) => {
                const isValidDate = dateNumber > 0 && dateNumber <= daysInMonth;
                const isCurrent = isValidDate && isTodayDate(dateNumber);
                const dateString = isValidDate ? `${String(calendarMonth.getMonth() + 1).padStart(2, '0')}/${String(dateNumber).padStart(2, '0')}/${calendarMonth.getFullYear()}` : null;
                return (
                  <div
                    key={index}
                    className={`calendar-cell ${isCurrent ? 'today' : ''} ${isValidDate ? 'clickable' : 'inactive'} ${selectedDate === dateString ? 'selected' : ''}`}
                    onClick={() => isValidDate && handleDateClick(dateNumber)}
                    role={isValidDate ? 'button' : undefined}
                    tabIndex={isValidDate ? 0 : -1}
                    onKeyDown={(event) => {
                      if (event.key === 'Enter' && isValidDate) {
                        handleDateClick(dateNumber);
                      }
                    }}
                  >
                    {isValidDate ? dateNumber : ''}
                  </div>
                );
              })}
            </div>
            <div className="calendar-footer">
              {/* <div className="calendar-note">Upcoming payments and spend reminders are highlighted here.</div> */}
            </div>
            {selectedDate && (
              <div className="calendar-transactions-section">
                <div className="section-header">
                  <div>
                    <h3>Transactions on {selectedDate}</h3>
                    <p className="muted">Showing activity for the selected calendar date.</p>
                  </div>
                </div>
                {selectedTransactions.length > 0 ? (
                  <table className="calendar-transaction-table">
                    <thead>
                      <tr>
                        <th>Date</th>
                        <th>Name of Institution</th>
                        <th>Amount</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedTransactions.map((item, index) => (
                        <tr key={index}>
                          <td>{item.date}</td>
                          <td>{item.description}</td>
                          <td className={`transaction-amount ${item.type === 'income' ? 'positive' : 'expense'}`}>
                            {item.type === 'income' ? '+' : '-'}{formatCurrency(item.amount)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <p className="muted">No transactions found for this date.</p>
                )}
              </div>
            )}
          </div>
        </aside>
        <section className="spend-transactions-card">
            <div className="section-header">
              <div>
                <h2>Transactions</h2>
                <p className="muted">All recent transactions for your Spend account.</p>
              </div>
            </div>
            <table className="transaction-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Name of Institution</th>
                  <th>Amount</th>
                </tr>
              </thead>
              <tbody>
                {spendTransactions.map((item, index) => {
                  const isPositive = item.type === 'income';
                  return (
                    <tr key={index}>
                      <td>{item.date}</td>
                      <td>{item.description}</td>
                      <td className={`transaction-amount ${isPositive ? 'positive' : 'expense'}`}>
                        {isPositive ? '+' : '-'}{formatCurrency(item.amount)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </section>
      </div>
    </div>
  );
}

export default SpendDetails;
