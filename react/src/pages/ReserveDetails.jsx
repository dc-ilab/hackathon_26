import { useState } from 'react';
import { getTransactionTypeMeta } from '../utils';

const buildMonthlyTotals = (transactions) => {

  const monthLabels = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  // Anchor the 6-month window to the most recent spend transaction
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
 
// Find full month from spend data
  const fullMonth = [...monthEntries]
    .reverse()
    .find((entry) => entry.txCount >= 6 && entry.income > 0 && entry.expense > 0)
    || [...monthEntries].reverse().find((entry) => entry.hasData && entry.income > 0 && entry.expense > 0)
    || [...monthEntries].reverse().find((entry) => entry.hasData)
    || { income: 6500, expense: 4200, order: 0 };


  // Fill missing months with mock data; leave real months untouched
  return months.map((m, i) => {
    const key = `${m.year}-${String(m.index + 1).padStart(2, '0')}`;
    const entry = totals[key];
    if (entry.hasData) {
      return { month: entry.month, income: entry.income, expense: entry.expense };
    }

    // Deterministic slight variation around the last full month
    const distance = fullMonth.order - i;
    const incomeFactor = 1 + ((distance % 3) - 1) * 0.035;
    const expenseFactor = 1 + (((distance + 1) % 3) - 1) * 0.04;
 
    return {
      month: entry.month,
      income: Math.round(Math.max(0, fullMonth.income * incomeFactor)),
      expense: Math.round(Math.max(0, fullMonth.expense * expenseFactor)),
    };
  });
};

const formatCurrency = (value) =>
  new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(value);

// Transform client reserveTransactions to match expected transaction format
const getReserveTransactions = (reserveTransactions) => {
  return reserveTransactions || [];
};

function ReserveDetails({ selectedClient }) {
  const reserveTransactions = getReserveTransactions(selectedClient.reserveTransactions);
  const monthlySpendData = buildMonthlyTotals(reserveTransactions);
  const [selectedDate, setSelectedDate] = useState(null);
  const [calendarMonth, setCalendarMonth] = useState(new Date(2026, 3, 1));
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

  const reserveAccount = selectedClient.accounts.find((account) => account.type === 'Reserve');
  console.log("Reserve Account:", reserveAccount);
  const isJointAccount =
    reserveAccount?.isJoint === 'Y' ||
    reserveAccount?.isJoint === true ||
    String(reserveAccount?.isJoint).toLowerCase() === 'y';
  const highestMonthlyValue = Math.max(...monthlySpendData.flatMap((item) => [item.income, item.expense]));
  const totalExpense = monthlySpendData.reduce((sum, item) => sum + item.expense, 0);
  const totalIncome = monthlySpendData.reduce((sum, item) => sum + item.income, 0);
  const averageExpense = Math.round(totalExpense / monthlySpendData.length);
  const selectedTransactions = selectedDate
    ? reserveTransactions.filter((item) => item.date === selectedDate)
    : [];

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMonth, setSelectedMonth] = useState('');
  const [selectedYear, setSelectedYear] = useState('');
  const [selectedTransactionType, setSelectedTransactionType] = useState('');

  const transactionTypes = [...new Set(
    reserveTransactions
      .map((tx) => String(tx.transaction_type || tx.type || '').toLowerCase())
      .filter(Boolean)
  )];

  const filteredTransactions = reserveTransactions.filter((tx) => {
    const txType = String(tx.transaction_type || tx.type || '').toLowerCase();
    const matchesType = selectedTransactionType ? txType === selectedTransactionType : true;
    const matchesSearch =
      tx.description.toLowerCase().includes(searchTerm.toLowerCase());

    const [month, , year] = tx.date.split('/');

    const matchesMonth = selectedMonth
      ? parseInt(month, 10) === parseInt(selectedMonth, 10)
      : true;

    const matchesYear = selectedYear
      ? year === selectedYear
      : true;

    return matchesSearch && matchesMonth && matchesYear && matchesType;
  });
  const displayedTransactions = showAllTransactions
    ? filteredTransactions
    : filteredTransactions.slice(0, 10);

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

  const getCustomerName = (customerId) => {
    if (customerId === selectedClient.customer_id) {
      return selectedClient.name;
    }

    const relationship = selectedClient.relationships?.find(
      (rel) => rel.id === customerId
    );

    return relationship ? relationship.relation : customerId;
  };

  if (!reserveAccount) {
    return <div className="spend-details-page">No Reserve account data available.</div>;
  }

  return (
    <div className="background-card">
      <div className="spend-details-page">
        <div className="spend-header">
          <div>
            <p className="eyebrow">Reserve Account</p>
            <h1>Reserve account insights</h1>
            <p className="muted">A snapshot of your spending trends, cash flow, and recent activity for the Reserve account.</p>
          </div>
          <div className="spend-balance-card">
            <span className="spend-balance-label">Current Balance</span>
            <span className="spend-balance-value">{formatCurrency(reserveAccount.balance)}</span>
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

            <section className="spend-graph-card">
              <div className="section-header">
                <div>
                  <h2>Income vs Expense</h2>
                  <span className="muted">Monthly performance for the last six months.</span>
                </div>
                <div className="chart-legend">
                  <span className="legend-item"><span className="legend-swatch income" />Income</span>
                  <span className="legend-item"><span className="legend-swatch expense" />Expense</span>
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
                    {monthlySpendData.map((item) => (
                      <div key={item.month} className="chart-column">
                        <div className="bar-group">
                          <div
                            className="bar income"
                            style={{ height: `${(item.income / highestMonthlyValue) * 100}%` }}
                            title={`Income: ${formatCurrency(item.income)}`}
                          >
                            <span className="bar-tooltip">{formatCurrency(item.income)}</span>
                          </div>
                          <div
                            className="bar expense"
                            style={{ height: `${(item.expense / highestMonthlyValue) * 100}%` }}
                            title={`Expense: ${formatCurrency(item.expense)}`}
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
                          <th>Name</th>
                          <th>Amount</th>
                           {isJointAccount && <th>Customer</th>}
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
                            
{isJointAccount && (
  <td className="transaction-customer">
    {getCustomerName(item.customer_id)}
  </td>
)}

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
              <div className="transaction-section-header">
                <div>
                  <h2>Transactions</h2>
                  <p className="muted">Transaction type filters and recent Reserve activity.</p>
                </div>
                <div className="transaction-type-filters">
                  {transactionTypes.map((type) => {
                    const typeMeta = getTransactionTypeMeta(type, type);
                    const isActive = selectedTransactionType === type;
                    return (
                      <button
                        key={type}
                        type="button"
                        className={`transaction-filter-btn ${isActive ? 'active' : ''}`}
                        onClick={() => setSelectedTransactionType(isActive ? '' : type)}
                      >
                        {typeMeta.label}
                      </button>
                    );
                  })}
                </div>
              </div>
              <div className="transaction-controls">
                {/*  Search */}
                <input
                  type="text"
                  placeholder="Search transactions..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="transaction-search"
                />

                {/*  Month filter */}
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

                {/*  Year filter */}
                <select
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(e.target.value)}
                >
                  <option value="">All Years</option>
                  {[...new Set(reserveTransactions.map(tx => tx.date.split('/')[2]))].map(
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
                    <th className="transaction-type-column">Type</th>
                    <th>Date</th>
                    <th>Description</th>
                    <th>Category</th>
                    <th>Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {displayedTransactions.map((item, index) => {
                    const isPositive = item.type === 'income';
                    const typeMeta = getTransactionTypeMeta(item.transaction_type, item.type);
                    return (
                      <tr key={index} className={typeMeta.className}>
                        <td>
                          <abbr
                            className={`transaction-type-badge ${typeMeta.className}`}
                            title={typeMeta.label}
                            aria-label={typeMeta.label}
                          >
                            {typeMeta.abbr}
                          </abbr>
                        </td>
                        <td>{item.date}</td>
                        <td>{item.description}</td>
                        <td>{item.category || '—'}</td>
                        <td className={`transaction-amount ${isPositive ? 'positive' : 'expense'}`}>
                          {isPositive ? '+' : '-'}{formatCurrency(item.amount)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              {filteredTransactions.length > 10 && (
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

export default ReserveDetails;
