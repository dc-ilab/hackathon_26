import { useState } from 'react';

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

// Line chart component for Auto Loan trajectory
function AutoLoanLineChart({ data }) {
  const width = 560;
  const height = 350;
  const padding = 40;
  const graphWidth = width - padding * 2;
  const graphHeight = height - padding * 2;

  const values = data.map((row) => row.balance);
  const maxValueRaw = Math.max(...values);
  const minValueRaw = Math.min(...values);

  const rawRange = Math.max(maxValueRaw - minValueRaw, 1);
  const paddedRange = rawRange * 1.4;
  const centerValue = (maxValueRaw + minValueRaw) / 2;
  const maxValue = centerValue + paddedRange / 2;
  const minValue = centerValue - paddedRange / 2;
  const range = maxValue - minValue || 1;

  const xStep = data.length > 1 ? graphWidth / (data.length - 1) : 0;

  const getPoint = (index, value) => ({
    x: padding + index * xStep,
    y: padding + normalizeY(value),
  });

  const normalizeY = (value) => graphHeight - ((value - minValue) / range) * graphHeight;

  const [hoverPoint, setHoverPoint] = useState(null);

  const getPath = () =>
    data
      .map((row, index) => {
        const { x, y } = getPoint(index, row.balance);
        return `${index === 0 ? 'M' : 'L'} ${x} ${y}`;
      })
      .join(' ');

  const tickCount = 6;
  const tickValues = Array.from({ length: tickCount }, (_, i) => maxValue - (range / (tickCount - 1)) * i);

  return (
    <svg id="auto-loan-line-chart" viewBox={`0 0 ${width} ${height}`} width="100%" height="100%">
      {tickValues.map((value, i) => {
        const y = padding + normalizeY(value);
        return (
          <g key={`y-tick-${i}`}>
            <line
              x1={padding}
              y1={y}
              x2={width - padding}
              y2={y}
              stroke={Math.abs(tickValues[i]) < range / 100 ? "rgb(153,153,153)" : "#f0f0f0"}
              strokeWidth={Math.abs(tickValues[i]) < range / 100 ? "2" : "1"}
            />
            <text x={padding - 10} y={y + 4} textAnchor="end" fontSize="12" fill="#666">
              {Math.abs(value) < 1
                ? "$0"
                : `$${Math.round(value / 1000)}k`
              }
            </text>
          </g>
        );
      })}

      <line
        x1={padding}
        y1={padding}
        x2={padding}
        y2={height - padding}
        stroke="#999"
        strokeWidth="2"
      />

      <path
        d={getPath()}
        fill="none"
        stroke="#db8c4f"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {data.map((row, index) => {
        const { x, y } = getPoint(index, row.balance);
        return (
          <circle
            key={`point-${index}`}
            cx={x}
            cy={y}
            r="6"
            fill="#db8c4f"
            stroke="#fff"
            strokeWidth="2"
            onMouseEnter={() =>
              setHoverPoint({
                x,
                y,
                month: row.month,
                value: row.balance,
              })
            }
            onMouseLeave={() => setHoverPoint(null)}
          />
        );
      })}

      {data.map((row, index) => (
        <text
          key={`x-label-${row.month}`}
          x={padding + index * xStep}
          y={height - padding + 20}
          textAnchor="middle"
          fontSize="12"
          fill="#666"
        >
          {row.month}
        </text>
      ))}

      {hoverPoint ? (
        (() => {
          const tooltipWidth = 140;
          const tooltipHeight = 48;
          const tooltipX = Math.min(
            Math.max(hoverPoint.x + 10, padding + 10),
            width - padding - tooltipWidth
          );
          const tooltipY = Math.max(
            Math.min(hoverPoint.y - tooltipHeight / 2, height - padding - tooltipHeight),
            padding + 10
          );
          return (
            <g pointerEvents="none" className="chart-tooltip">
              <rect
                x={tooltipX}
                y={tooltipY}
                width={tooltipWidth}
                height={tooltipHeight}
                rx={10}
                ry={10}
                fill="#251F47"
                opacity="0.95"
              />
              <text
                x={tooltipX + 10}
                y={tooltipY + 18}
                fill="#fff"
                fontSize="12"
                fontWeight="700"
              >
                Loan Balance
              </text>
              <text
                x={tooltipX + 10}
                y={tooltipY + 34}
                fill="#fff"
                fontSize="12"
              >
                {hoverPoint.month}: {formatCurrency(hoverPoint.value)}
              </text>
            </g>
          );
        })()
      ) : null}
    </svg>
  );
}

const getTransactionTypeMeta = (transactionType, fallbackType) => {
  const rawType = String(transactionType || fallbackType || '').toLowerCase();
  if (rawType.includes('withdrawal')) {
    return { abbr: 'W', label: 'Withdrawal', className: 'transaction-type-withdraw' };
  }
  if (rawType.includes('transfer')) {
    return { abbr: 'T', label: 'Transfer', className: 'transaction-type-transfer' };
  }
  if (rawType.includes('deposit')) {
    return { abbr: 'D', label: 'Deposit', className: 'transaction-type-deposit' };
  }
  if (rawType.includes('charge')) {
    return { abbr: 'C', label: 'Charge', className: 'transaction-type-charge' };
  }
  if (rawType.includes('payment')) {
    return { abbr: 'P', label: 'Payment', className: 'transaction-type-payment' };
  }
  if (rawType.includes('interest')) {
    return { abbr: 'I', label: 'Interest', className: 'transaction-type-interest' };
  }
  if (rawType.includes('loan')) {
    return { abbr: 'L', label: 'Loan', className: 'transaction-type-loan' };
  }
  return {
    abbr: fallbackType === 'income' ? 'D' : 'C',
    label: fallbackType === 'income' ? 'Deposit' : 'Charge',
    className: 'transaction-type-default',
  };
};

// Transform client autoLoanTransactions to match expected transaction format
const getAutoLoanTransactions = (autoLoanTransactions) => {
  return autoLoanTransactions || [];
};

function AutoLoanDetails({ selectedClient }) {
  const autoLoanTransactions = getAutoLoanTransactions(selectedClient.autoLoanTransactions);
  const monthlyAutoLoanData = buildMonthlyTotals(autoLoanTransactions);
  
  const autoLoanAccount = selectedClient.accounts.find((account) => account.type === 'Auto Loan');
  
  const autoLoanTrajectory = [
    { month: 'Nov', balance: autoLoanAccount ? autoLoanAccount.balance * 1.20 : 0 },
    { month: 'Dec', balance: autoLoanAccount ? autoLoanAccount.balance * 1.15 : 0 },
    { month: 'Jan', balance: autoLoanAccount ? autoLoanAccount.balance * 1.10 : 0 },
    { month: 'Feb', balance: autoLoanAccount ? autoLoanAccount.balance * 1.05 : 0 },
    { month: 'Mar', balance: autoLoanAccount ? autoLoanAccount.balance * 1.02 : 0 },
    { month: 'Apr', balance: autoLoanAccount ? autoLoanAccount.balance : 0 },
  ];
  
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  
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

  const highestMonthlyValue = Math.max(...monthlyAutoLoanData.flatMap((item) => [item.income, item.expense]));
  const totalExpense = monthlyAutoLoanData.reduce((sum, item) => sum + item.expense, 0);
  const totalIncome = monthlyAutoLoanData.reduce((sum, item) => sum + item.income, 0);
  const averageExpense = Math.round(totalExpense / monthlyAutoLoanData.length);

  // Auto Loan specific calculations
  const paymentTransactions = autoLoanTransactions.filter((tx) => {
    const txType = String(tx.transaction_type || '').toLowerCase();
    return txType.includes('payment');
  });

  const interestTransactions = autoLoanTransactions.filter((tx) => {
    const txType = String(tx.transaction_type || '').toLowerCase();
    return txType.includes('interest');
  });

  const threeMonthsAgo = new Date();
  threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);

  const last3MonthPayments = paymentTransactions.filter((tx) => {
    const [m, d, y] = tx.date.split('/');
    const txDate = new Date(parseInt(y, 10), parseInt(m, 10) - 1, parseInt(d, 10));
    return txDate >= threeMonthsAgo;
  });

  const last3MonthInterest = interestTransactions.filter((tx) => {
    const [m, d, y] = tx.date.split('/');
    const txDate = new Date(parseInt(y, 10), parseInt(m, 10) - 1, parseInt(d, 10));
    return txDate >= threeMonthsAgo;
  });

  const totalAmountPaid = paymentTransactions.reduce((sum, tx) => sum + tx.amount, 0);
  const totalInterestAdded = interestTransactions.reduce((sum, tx) => sum + tx.amount, 0);
  const avg3MonthPayment = last3MonthPayments.length > 0
    ? Math.round(last3MonthPayments.reduce((sum, tx) => sum + tx.amount, 0) / last3MonthPayments.length)
    : 0;
  const last3MonthInterestTotal = last3MonthInterest.reduce((sum, tx) => sum + tx.amount, 0);

  // Estimate interest rate (simplified: annual rate based on balance decline vs interest accrual)
  const estimatedAnnualRate = autoLoanAccount && last3MonthInterestTotal > 0 && autoLoanAccount.balance > 0
    ? ((last3MonthInterestTotal * 4) / autoLoanAccount.balance * 100).toFixed(2)
    : 4.5;

  // Estimate payoff time (months)
  const estimatedPayoffMonths = avg3MonthPayment > 0 && autoLoanAccount
    ? Math.ceil(autoLoanAccount.balance / avg3MonthPayment)
    : 0;
  
  const selectedTransactions = startDate && !endDate
    ? autoLoanTransactions.filter((item) => item.date === startDate)
    : startDate && endDate
    ? autoLoanTransactions.filter((item) => {
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

        // CASE 1: no start → set start
        if (!startDate) {
          setStartDate(dateString);
          setEndDate(null);
          return;
        }

        // CASE 2: start exists but no end → set range
        if (startDate && !endDate) {
          if (new Date(dateString) < new Date(startDate)) {
            // swap if second click is earlier
            setEndDate(startDate);
            setStartDate(dateString);
          } else {
            setEndDate(dateString);
          }
          return;
        }

        // CASE 3: reset range
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
    const [searchTerm, setSearchTerm] = useState('');
  const [selectedMonth, setSelectedMonth] = useState('');
  const [selectedYear, setSelectedYear] = useState('');
  const [selectedTransactionType, setSelectedTransactionType] = useState('');

  const transactionTypes = [...new Set(
    autoLoanTransactions
      .map((tx) => String(tx.transaction_type || tx.type || '').toLowerCase())
      .filter(Boolean)
  )];

  const filteredTransactions = autoLoanTransactions.filter((tx) => {
    const txType = String(tx.transaction_type || tx.type || '').toLowerCase();
    const matchesType = selectedTransactionType
      ? txType === selectedTransactionType
      : true;

    // Search filter
    const matchesSearch =
      tx.description.toLowerCase().includes(searchTerm.toLowerCase());

    // Date parsing
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
    if (!autoLoanAccount) {
        return <div className="spend-details-page">No Auto Loan account data available.</div>;
    }

    return (
        <div className="background-card">
        <div className="spend-details-page">
            <div className="spend-header">
            <div className='spend-header-info'>
                <p className="eyebrow">Loan Account</p>
                <h1>Auto Loan Overview</h1>
            </div>
            <div className="loan-balance-card">
                <span className="spend-balance-label">Current Balance</span>
                <span className="spend-balance-value">{formatCurrency(autoLoanAccount.balance)}</span>
            </div>
            </div>

            <div className="spend-main-grid">
              <div className="spend-left-column">
                <section className="spend-insights-card">
                  <div className="section-header">
                      <div>
                      <h2>Loan Insights</h2>
                      </div>
                  </div>
                  <p>
                      Auto loan has an estimated annual interest rate of <strong>{estimatedAnnualRate}%</strong>. Over the last 3 months, you've averaged <strong>{formatCurrency(avg3MonthPayment)}</strong> in monthly payments, with <strong>{formatCurrency(Math.abs(last3MonthInterestTotal))}</strong> in interest accrued. At your current payment rate, your loan should be paid off in approximately <strong>{Math.abs(estimatedPayoffMonths)} months</strong>.
                  </p>
                  <div className="loan-insight-stat-row">
                      <div>
                      <span className="insight-label">Total Amount Paid</span>
                      <strong>{formatCurrency(totalAmountPaid)}</strong>
                      </div>
                      <div>
                      <span className="insight-label">Total Interest Added</span>
                      <strong>+{formatCurrency(Math.abs(totalInterestAdded))}</strong>
                      </div>
                      <div>
                      <span className="insight-label">Estimated Payoff Time</span>
                      <strong>{Math.abs(estimatedPayoffMonths)} months</strong>
                      </div>
                  </div>
                </section>

                <section className="spend-graph-card">
                  <div className="auto-loan-section-header">
                    <div>
                      <h2>Loan Balance Trajectory</h2>
                      <p className="muted">Auto Loan balance trajectory over the last six months.</p>
                    </div>
                  </div>
                  <div className="auto-loan-chart-wrapper">
                        <AutoLoanLineChart data={autoLoanTrajectory} />
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
                      {/* <div className="calendar-note">Upcoming payments and spend reminders are highlighted here.</div> */}
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
                                  {item.type === 'income' ? '+' : '-'}{formatCurrency(Math.abs(item.amount))}
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
                <div className="transaction-section-header">
                    <div>
                    <h2>Transactions Table</h2>
                    <p className='muted'>Transaction Type Filter</p>
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
                            onClick={() =>
                              setSelectedTransactionType(
                                isActive ? '' : type
                              )
                            }
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
        placeholder="Search by institution..."
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
        {[...new Set(autoLoanTransactions.map(tx => tx.date.split('/')[2]))].map(
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
                            {formatCurrency(item.amount)}
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

export default AutoLoanDetails;
