import { useMemo, useState } from 'react';

const formatCurrency = (value) =>
  new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(value);

const buildMonthlyTotals = (transactions) => {
  const monthLabels = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  let anchor = new Date();
  if (transactions.length > 0) {
    const dates = transactions.map((tx) => {
      const [m, d, y] = tx.date.split('/');
      return new Date(parseInt(y, 10), parseInt(m, 10) - 1, parseInt(d, 10));
    });
    anchor = new Date(Math.max(...dates));
  }

  const months = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date(anchor.getFullYear(), anchor.getMonth() - i, 1);
    months.push({ index: d.getMonth(), year: d.getFullYear(), label: monthLabels[d.getMonth()] });
  }

  const totals = {};
  months.forEach((m) => {
    const key = `${m.year}-${String(m.index + 1).padStart(2, '0')}`;
    totals[key] = { month: m.label, income: 0, expense: 0, hasData: false, txCount: 0 };
  });

  transactions.forEach((tx) => {
    const [month, , year] = tx.date.split('/');
    const monthIndex = parseInt(month, 10) - 1;
    const yearNumber = parseInt(year, 10);
    const match = months.find((m) => m.index === monthIndex && m.year === yearNumber);
    if (!match) return;

    const key = `${match.year}-${String(match.index + 1).padStart(2, '0')}`;
    totals[key].hasData = true;
    totals[key].txCount += 1;

    if (tx.type === 'income') {
      totals[key].income += tx.amount;
    } else {
      totals[key].expense += tx.amount;
    }
  });

  const monthEntries = months.map((m, i) => {
    const key = `${m.year}-${String(m.index + 1).padStart(2, '0')}`;
    return { ...m, order: i, key, ...totals[key] };
  });

  const fullMonth = [...monthEntries]
    .reverse()
    .find((entry) => entry.txCount >= 6 && entry.income > 0 && entry.expense > 0)
    || [...monthEntries].reverse().find((entry) => entry.hasData && entry.income > 0 && entry.expense > 0)
    || [...monthEntries].reverse().find((entry) => entry.hasData)
    || { income: 3500, expense: 2900, order: 0 };

  return months.map((m, i) => {
    const key = `${m.year}-${String(m.index + 1).padStart(2, '0')}`;
    const entry = totals[key];
    if (entry.hasData) {
      return { month: entry.month, income: entry.income, expense: entry.expense };
    }

    const distance = fullMonth.order - i;
    const incomeFactor = 1 + ((distance % 3) - 1) * 0.04;
    const expenseFactor = 1 + (((distance + 1) % 3) - 1) * 0.045;

    return {
      month: entry.month,
      income: Math.round(Math.max(0, fullMonth.income * incomeFactor)),
      expense: Math.round(Math.max(0, fullMonth.expense * expenseFactor)),
    };
  });
};

const getCreditTransactions = (transactions) => {
  if (!transactions) return [];
  return transactions.filter((tx) => {
    const type = String(tx.account_type || tx.account_category || '').toLowerCase();
    const transactionType = String(tx.transaction_type || '').toLowerCase();
    const description = String(tx.description || '').toLowerCase();
    return type.includes('credit') || transactionType.includes('charge') || transactionType.includes('payment') || description.includes('credit');
  });
};

function CreditDetails({ selectedClient }) {
  const creditAccount = selectedClient.accounts.find(
    (account) => /credit/i.test(account.type || '') || /credit/i.test(account.category || '')
  );

  const creditTransactions = useMemo(
    () => getCreditTransactions(selectedClient.creditTransactions || selectedClient.transactions || []),
    [selectedClient.creditTransactions, selectedClient.transactions]
  );

  const monthlyCreditData = buildMonthlyTotals(creditTransactions);
  const highestMonthlyValue = Math.max(...monthlyCreditData.flatMap((item) => [item.income, item.expense]));
  const totalSpent = monthlyCreditData.reduce((sum, item) => sum + item.expense, 0);
  const totalPayments = monthlyCreditData.reduce((sum, item) => sum + item.income, 0);
  const averageExpense = Math.round(totalSpent / monthlyCreditData.length);

  const [searchTerm, setSearchTerm] = useState('');
  const filteredTransactions = creditTransactions.filter((tx) =>
    tx.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    tx.category?.toLowerCase().includes(searchTerm.toLowerCase())
  );
  const displayedTransactions = filteredTransactions.slice(0, 12);

  // Calendar state and helpers (copied from SpendDetails for identical look/behavior)
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [calendarMonth, setCalendarMonth] = useState(new Date());
  const [showAllTransactions, setShowAllTransactions] = useState(false);
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

  const selectedTransactions = startDate && !endDate
    ? creditTransactions.filter((item) => item.date === startDate)
    : startDate && endDate
    ? creditTransactions.filter((item) => {
        const itemDate = new Date(item.date);
        return (
          itemDate >= new Date(startDate) &&
          itemDate <= new Date(endDate)
        );
      })
    : [];

  const handleDateClick = (dateNumber) => {
    if (dateNumber < 1 || dateNumber > daysInMonth) return;

    const monthString = String(calendarMonth.getMonth() + 1).padStart(2, '0');
    const dateString = `${monthString}/${String(dateNumber).padStart(2, '0')}/${calendarMonth.getFullYear()}`;

    if (startDate && !endDate && startDate === dateString) {
        setStartDate(null);
        setEndDate(null);
        return;
      }

        if (!startDate) {
          setStartDate(dateString);
          setEndDate(null);
          return;
        }

        if (startDate && !endDate) {
          if (new Date(dateString) < new Date(startDate)) {
            setEndDate(startDate);
            setStartDate(dateString);
          } else {
            setEndDate(dateString);
          }
          return;
        }

        setStartDate(dateString);
        setEndDate(null);
      };

  const handlePrevMonth = () => {
    setStartDate(null);
    setEndDate(null);
    setCalendarMonth((prev) => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
  };

  const handleToday = () => {
    const now = new Date();
    setStartDate(null);
    setEndDate(null);
    setCalendarMonth(new Date(now.getFullYear(), now.getMonth(), 1));
  };
  const [selectedMonth, setSelectedMonth] = useState('');
  const [selectedYear, setSelectedYear] = useState('');
  const filteredForTable = creditTransactions.filter((tx) => {
    const matchesSearch =
      tx.description.toLowerCase().includes(searchTerm.toLowerCase());

    const [month, , year] = tx.date.split('/');

    const matchesMonth = selectedMonth
      ? parseInt(month, 10) === parseInt(selectedMonth, 10)
      : true;

    const matchesYear = selectedYear
      ? year === selectedYear
      : true;

    return matchesSearch && matchesMonth && matchesYear;
  });
  const displayedForTable = showAllTransactions
    ? filteredForTable
    : filteredForTable.slice(0, 10);

  const lastPayment = creditTransactions
    .filter((tx) => tx.type === 'income' || /payment/i.test(tx.transaction_type || tx.description || ''))
    .sort((a, b) => new Date(b.date) - new Date(a.date))[0];

  const availableCredit = creditAccount?.availableCredit != null
    ? creditAccount.availableCredit
    : creditAccount?.creditLimit != null
      ? creditAccount.creditLimit - Math.abs(creditAccount.balance || 0)
      : null;
  const minPayment = creditAccount?.balance ? Math.round(Math.max(0, Math.abs(creditAccount.balance) * 0.03)) : null;
  const dueDate = creditAccount?.maturityDate || creditAccount?.lastActivityDate || 'N/A';

  if (!creditAccount) {
    return <div className="spend-details-page">No Credit account data available.</div>;
  }

  return (
    <div className="background-card">
      <div className="spend-details-page">
        <div className="spend-header">
          <div>
            <p className="eyebrow">Credit Account</p>
            <h1>Credit card insights</h1>
            <p className="muted">Review your card balance, payment profile, and recent activity in one place.</p>
          </div>
          <div className="spend-balance-card">
            <span className="spend-balance-label">Current Balance</span>
            <span className="spend-balance-value">{formatCurrency(creditAccount.balance)}</span>
            <span className="spend-balance-note">{creditAccount.type} • {creditAccount.interestRate ? `${creditAccount.interestRate}% APR` : 'Rate unavailable'}</span>
          </div>
        </div>

        <div className="spend-main-grid">
          <div className="spend-left-column">
            <section className="spend-insights-card">
              <div className="section-header">
                <div>
                  <h2>Credit snapshot</h2>
                  <p className="muted">Your most recent statement activity and payment health summary.</p>
                </div>
              </div>
              <div className="insight-stat-row">
                <div>
                  <span className="insight-label">Available credit</span>
                  <strong>{availableCredit != null ? formatCurrency(availableCredit) : 'N/A'}</strong>
                </div>
                <div>
                  <span className="insight-label">Suggested min payment</span>
                  <strong>{minPayment != null ? formatCurrency(minPayment) : 'N/A'}</strong>
                </div>
              </div>
              <div className="insight-stat-row">
                <div>
                  <span className="insight-label">Last payment</span>
                  <strong>{lastPayment ? `${formatCurrency(lastPayment.amount)} on ${lastPayment.date}` : 'No payment data'}</strong>
                </div>
                <div>
                  <span className="insight-label">Statement due</span>
                  <strong>{dueDate}</strong>
                </div>
              </div>
              <p>
                Your credit card is being managed with regular payments and a stable balance trend. Keep payments on schedule, and consider reducing the balance to improve utilization.
              </p>
            </section>

            <section className="spend-graph-card">
              <div className="section-header">
                <div>
                  <h2>Monthly card activity</h2>
                  <span className="muted">6-month view of charges vs payments.</span>
                </div>
              </div>
              <div className="spend-bar-chart">
                <div className="chart-y-axis">
                  {(() => {
                    const steps = 5;
                    const labels = [];
                    for (let i = steps; i >= 0; i--) {
                      labels.push(Math.round((highestMonthlyValue / steps) * i));
                    }
                    return labels.map((value) => (
                      <span key={value} className="axis-label">{formatCurrency(value)}</span>
                    ));
                  })()}
                </div>
                <div className="chart-area">
                  <div className="chart-grid-lines">
                    {[0, 1, 2, 3, 4, 5].map((i) => (
                      <div key={i} className="grid-line" />
                    ))}
                  </div>
                  <div className="chart-bars">
                    {monthlyCreditData.map((item) => (
                      <div key={item.month} className="chart-column">
                        <div className="bar-group">
                          <div
                            className="bar income"
                            style={{ height: `${(item.income / highestMonthlyValue) * 100}%` }}
                            title={`Payments: ${formatCurrency(item.income)}`}
                          >
                            <span className="bar-tooltip">{formatCurrency(item.income)}</span>
                          </div>
                          <div
                            className="bar expense"
                            style={{ height: `${(item.expense / highestMonthlyValue) * 100}%` }}
                            title={`Charges: ${formatCurrency(item.expense)}`}
                          >
                            <span className="bar-tooltip">{formatCurrency(item.expense)}</span>
                          </div>
                        </div>
                        <div className="chart-label">{item.month}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </section>

            <section className="spend-transactions-card">
              <div className="section-header">
                <div>
                  <h2>Recent credit activity</h2>
                  <p className="muted">Filter by merchant or category.</p>
                </div>
                <div>
                  <input
                    type="text"
                    placeholder="Search transactions"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="transaction-search-input"
                  />
                </div>
              </div>
              <div className="table-responsive">
                <table className="accounts-table">
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>Description</th>
                      <th>Category</th>
                      <th>Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    {displayedTransactions.map((tx) => (
                      <tr key={`${tx.transaction_id || tx.date}-${tx.description}`}>
                        <td>{tx.date}</td>
                        <td>{tx.description}</td>
                        <td>{tx.category || tx.transaction_type}</td>
                        <td className={tx.type === 'income' ? 'text-positive' : 'text-negative'}>
                          {tx.type === 'income' ? '+' : '-'}{formatCurrency(tx.amount)}
                        </td>
                      </tr>
                    ))}
                    {displayedTransactions.length === 0 && (
                      <tr>
                        <td colSpan="4">No credit transactions found.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </section>
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
                      className={`
                        calendar-cell ${isCurrent ? 'today' : ''} 
                        ${isValidDate ? 'clickable' : 'inactive'} 
                        ${startDate === dateString || endDate === dateString ? 'selected' : ''}
                        ${startDate && endDate && dateString &&
                          new Date(dateString) > new Date(startDate) &&
                          new Date(dateString) < new Date(endDate)
                            ? 'range'
                            : ''
                        }
                      `}
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
              </div>
              {startDate && (
                <div className="calendar-transactions-section">
                  <div className="section-header">
                    <div>
                      <h3>
                        {startDate && !endDate
                          ? `Transactions on ${startDate}`
                          : startDate && endDate
                          ? `Transactions from ${startDate} to ${endDate}`
                          : ''}
                      </h3>
                      <p className="muted">Showing activity for the selected calendar date.</p>
                    </div>
                  </div>
                  {selectedTransactions.length > 0 ? (
                    <table className="calendar-transaction-table">
                      <thead>
                        <tr>
                          <th>Date</th>
                          <th>Name</th>
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
                  <h2>Transactions Table</h2>
                  <p className="muted">All recent transactions for your Credit account.</p>
                </div>
              </div>
              <div className="transaction-controls">
                <input
                  type="text"
                  placeholder="Search by merchant..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="transaction-search"
                />

                <select
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(e.target.value)}
                >
                  <option value="">All Months</option>
                  {monthNames.map((m, i) => (
                    <option key={i} value={i + 1}>
                      {m}
                    </option>
                  ))}
                </select>

                <select
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(e.target.value)}
                >
                  <option value="">All Years</option>
                  {[...new Set(creditTransactions.map(tx => tx.date.split('/')[2]))].map(
                    (year) => (
                      <option key={year} value={year}>
                        {year}
                      </option>
                    )
                  )}
                </select>

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
                  {displayedForTable.map((item, index) => {
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
              {filteredForTable.length > 10 && (
                <button 
                  className="btn show-more-button" 
                  onClick={() => setShowAllTransactions(!showAllTransactions)}
                  type="button"
                >
                  {showAllTransactions ? 'Show Less' : `Show More`}
                </button>
              )}
            </section>
        </div>
      </div>
    </div>
  );
}

export default CreditDetails;
