export const clients = [
  {
    id: 'C-1034',
    name: 'Jane Smith',
    title: '',
    age: 26,
    employment: 'Office Worker',
    maritalStatus: 'Single',
    housingStatus: 'Mortgage',
    phoneNumber: '(412) 555-0198',
    email: 'jane.smith@pnc.com',
    doNotCall: false,
    timeWithBank: '3 yrs 4 mths',
    location: 'Pittsburgh, PA',
    relationship: 'Premium Business',
    branch: 'Lincoln Ave.',
    city: 'Austin, TX',
    totalAssets: 45584,
    netWorth: 45584,
    liquidity: 10234,
    creditScore: 795,
    riskLevel: 'Low',
    lastVisit: '2026-04-18',
    alerts: ['Review mortgage refinance options', 'Update account beneficiaries'],
    accounts: [
      { type: 'Spend', balance: 12500, percentage: 27.4 },
      { type: 'Reserve', balance: 18200, percentage: 39.9 },
      { type: 'Growth', balance: 14884, percentage: 32.7 },
      { type: 'Auto Loan', balance: -15000, percentage: null, interestRate: 4.5 },
      { type: 'Home Equity Line of Credit', balance: -25000, percentage: null, interestRate: 5.2 }
    ],
    campaignReferrals: [
      { type: 'Credit Card Offer', description: 'PNC Cash Rewards Visa Signature Card - Earn 3% cash back on dining and U.S. supermarkets.', eligible: true },
      { type: 'Investment Promotion', description: 'Open a new brokerage account and get $100 bonus.', eligible: true },
      { type: 'Mortgage Refinance', description: 'Refinance your mortgage at a lower rate. Current rates starting at 6.5%.', eligible: true }
    ],
    clientGoals: [
      {
        goal: 'Finish Mortgage Payments',
        description: 'Pay off remaining mortgage balance',
        date: '2025-12-31',
        targetAmount: 200000,
        currentAmount: 200000,
        completed: true,
      },
      {
        goal: 'Build emergency fund',
        description: 'Save $10,000 for unexpected expenses',
        date: '2026-12-31',
        targetAmount: 10000,
        currentAmount: 6700,
        completed: false,
      },
      { goal: 'Diversify portfolio', completed: false },
    ],
    recentActivity: [
      { date: '2026-04-24', type: 'deposit', amount: 5000 },
      { date: '2026-04-20', type: 'withdrawal', amount: 2500 },
      { date: '2026-04-15', type: 'transfer', amount: 1200 },
      { date: '2026-04-10', type: 'deposit', amount: 8000 }
    ],
    clientSummary: 'Long-term customer with strong credit profile and consistent savings behavior.',
    opportunities: ['Consolidate debt', 'Increase emergency fund', 'Review investment strategy'],
    interactions: [
      { type: 'Client Interaction', action: null },
      { type: 'Service Request', action: null },
      { type: 'Sales Request', action: null }
    ],
    notes: 'Prefers digital consultations. Discuss portfolio reallocation in next meeting.'
  },
  {
    id: 'C-2062',
    name: 'Noah Patel',
    title: 'Dr.',
    age: 34,
    employment: 'Software Engineer',
    maritalStatus: 'Married',
    housingStatus: 'Homeowner',
    phoneNumber: '(312) 555-0172',
    email: 'noah.patel@pnc.com',
    doNotCall: false,
    timeWithBank: '5 yrs 2 mths',
    location: 'Chicago, IL',
    relationship: 'Wealth Planning',
    branch: 'Willow Creek',
    city: 'Chicago, IL',
    totalAssets: 934500,
    netWorth: 450000,
    liquidity: 184300,
    creditScore: 772,
    riskLevel: 'Moderate',
    lastVisit: '2026-04-10',
    alerts: ['Schedule annual review', 'Confirm estate plan documents'],
    appointments: {
      past: [
        { date: '2026-03-09', title: 'Estate planning review', notes: 'Confirmed beneficiary updates.' },
        { date: '2026-02-21', title: 'Investment allocation check-in', notes: 'Discussed tax-efficient growth.' },
      ],
      upcoming: [
        { date: '2026-05-28', title: 'Retirement income planning', notes: 'Discuss annuity and IRA options.' },
        { date: '2026-07-10', title: 'Estate planning follow-up', notes: 'Review trust documents.' },
      ],
    },
    accounts: [
      { type: 'Spend', balance: 180000, percentage: 19.2 },
      { type: 'Reserve', balance: 310000, percentage: 33.2 },
      { type: 'Growth', balance: 444500, percentage: 47.6 },
      { type: 'Auto Loan', balance: -20000, percentage: null, interestRate: 3.9 },
      { type: 'Home Equity Line of Credit', balance: -50000, percentage: null, interestRate: 4.8 }
    ],
    campaignReferrals: [
      { type: 'Premium Credit Card', description: 'PNC Premium Rewards Card - Earn 5% cash back on travel and dining.', eligible: true },
      { type: 'Wealth Management', description: 'Schedule a free consultation for personalized wealth planning.', eligible: true },
      { type: 'Business Loan', description: 'Low-interest business loans for expansion. Rates starting at 5.0%.', eligible: false }
    ],
    accounts: [
      { type: 'Spend', balance: 180000, percentage: 19.2 },
      { type: 'Reserve', balance: 310000, percentage: 33.2 },
      { type: 'Growth', balance: 444500, percentage: 47.6 }
    ],
    clientGoals: [
      { goal: 'Plan for retirement', completed: false },
      { goal: 'Save for children education', completed: true },
      { goal: 'Build passive income', completed: false }
    ],
    recentActivity: [
      { date: '2026-04-23', type: 'deposit', amount: 15000 },
      { date: '2026-04-19', type: 'transfer', amount: 25000 },
      { date: '2026-04-15', type: 'investment', amount: 50000 }
    ],
    clientSummary: 'High net-worth individual interested in tax-efficient investing and estate planning.',
    opportunities: ['Tax planning', 'College savings plan', 'Wealth transfer strategy'],
    interactions: [
      { type: 'Client Interaction', action: null },
      { type: 'Service Request', action: null }
    ],
    notes: 'Client is interested in sustainable investment proposals and cross-branch lending solutions.'
  },
  {
    id: 'C-3101',
    name: 'Mia Chen',
    title: '',
    age: 29,
    employment: 'Marketing Manager',
    maritalStatus: 'Single',
    housingStatus: 'Renting',
    phoneNumber: '(206) 555-0124',
    email: 'mia.chen@pnc.com',
    doNotCall: false,
    timeWithBank: '2 yrs 1 month',
    location: 'Seattle, WA',
    relationship: 'Retail Banking',
    branch: 'South Harbor',
    city: 'Seattle, WA',
    totalAssets: 192700,
    netWorth: 85000,
    liquidity: 53000,
    creditScore: 715,
    riskLevel: 'Low',
    lastVisit: '2026-04-20',
    alerts: ['Offer home equity line of credit', 'Review auto loan refinance'],
    appointments: {
      past: [
        { date: '2026-04-05', title: 'Auto refinance review', notes: 'Discussed lower payment options.' },
      ],
      upcoming: [
        { date: '2026-05-16', title: 'Homebuying planning session', notes: 'Review down payment strategy.' },
      ],
    },
    accounts: [
      { type: 'Spend', balance: 28000, percentage: 14.5 },
      { type: 'Reserve', balance: 82700, percentage: 42.9 },
      { type: 'Growth', balance: 82000, percentage: 42.6 },
      { type: 'Auto Loan', balance: -12000, percentage: null, interestRate: 4.2 }
    ],
    campaignReferrals: [
      { type: 'Credit Card Offer', description: 'PNC Everyday Credit Card - No annual fee and rewards on everyday purchases.', eligible: true },
      { type: 'Home Equity Loan', description: 'Turn your home equity into cash with competitive rates.', eligible: true }
    ],
    clientGoals: [
      { goal: 'Save for home down payment', completed: false },
      { goal: 'Build emergency fund', completed: true },
      { goal: 'Reduce credit card debt', completed: false }
    ],
    recentActivity: [
      { date: '2026-04-25', type: 'deposit', amount: 3500 },
      { date: '2026-04-20', type: 'payment', amount: 1200 }
    ],
    clientSummary: 'Growing customer base with increasing financial engagement and savings goals.',
    opportunities: ['First-time homebuyer program', 'Debt consolidation', 'Investment guidance'],
    interactions: [
      { type: 'Client Interaction', action: null },
      { type: 'Service Request', action: null }
    ],
    notes: 'Client wants simpler savings automation and quicker access to financial advice.'
  },
  {
    id: 'C-4238',
    name: 'Ethan Carter',
    title: 'Mr.',
    age: 48,
    employment: 'CEO',
    maritalStatus: 'Married',
    housingStatus: 'Homeowner',
    phoneNumber: '(646) 555-0143',
    email: 'ethan.carter@pnc.com',
    doNotCall: false,
    timeWithBank: '12 yrs 6 mths',
    location: 'New York, NY',
    relationship: 'Corporate',
    branch: 'Downtown',
    city: 'New York, NY',
    totalAssets: 2860000,
    netWorth: 1200000,
    liquidity: 415000,
    creditScore: 805,
    riskLevel: 'Low',
    lastVisit: '2026-04-12',
    alerts: ['Review commercial line of credit', 'Update signatory authority'],
    appointments: {
      past: [
        { date: '2026-04-02', title: 'Treasury services review', notes: 'Discussed cash management.' },
      ],
      upcoming: [
        { date: '2026-06-01', title: 'International banking strategy', notes: 'Evaluate FX hedging options.' },
      ],
    },
    accounts: [
      { type: 'Spend', balance: 580000, percentage: 20.3 },
      { type: 'Reserve', balance: 920000, percentage: 32.2 },
      { type: 'Growth', balance: 1360000, percentage: 47.5 },
      { type: 'Business Loan', balance: -100000, percentage: null, interestRate: 4.0 },
      { type: 'Home Equity Line of Credit', balance: -150000, percentage: null, interestRate: 4.5 }
    ],
    campaignReferrals: [
      { type: 'Corporate Credit Card', description: 'PNC Business Credit Card - Earn rewards on business expenses.', eligible: true },
      { type: 'Commercial Loan', description: 'Flexible commercial loans for business growth.', eligible: true },
      { type: 'Investment Services', description: 'Access to advanced investment tools and research.', eligible: true }
    ],
    accounts: [
      { type: 'Spend', balance: 580000, percentage: 20.3 },
      { type: 'Reserve', balance: 920000, percentage: 32.2 },
      { type: 'Growth', balance: 1360000, percentage: 47.5 }
    ],
    clientGoals: [
      { goal: 'Expand business funding', completed: true },
      { goal: 'Succession planning', completed: false },
      { goal: 'International expansion', completed: false }
    ],
    recentActivity: [
      { date: '2026-04-24', type: 'deposit', amount: 250000 },
      { date: '2026-04-20', type: 'withdrawal', amount: 100000 }
    ],
    clientSummary: 'Executive-level client with sophisticated financial needs and large transaction volumes.',
    opportunities: ['Merchant services', 'Executive benefits', 'International banking'],
    interactions: [
      { type: 'Client Interaction', action: null },
      { type: 'Service Request', action: null }
    ],
    notes: 'Focus on liquidity management and treasury services for the upcoming quarter.'
  },
  {
    id: 'C-5370',
    name: 'Sophia Bennett',
    title: 'Ms.',
    age: 55,
    employment: 'Retired',
    maritalStatus: 'Married',
    housingStatus: 'Homeowner',
    phoneNumber: '(305) 555-0199',
    email: 'sophia.bennett@pnc.com',
    doNotCall: true,
    timeWithBank: '18 yrs',
    location: 'Miami, FL',
    relationship: 'Private Client',
    branch: 'Maple Ridge',
    city: 'Miami, FL',
    totalAssets: 1248000,
    netWorth: 980000,
    liquidity: 214000,
    creditScore: 780,
    riskLevel: 'Moderate',
    lastVisit: '2026-04-16',
    alerts: ['Revisit trust allocations', 'Confirm charitable giving schedule'],
    appointments: {
      past: [
        { date: '2026-03-28', title: 'Charitable giving review', notes: 'Planned donation schedule.' },
      ],
      upcoming: [
        { date: '2026-05-22', title: 'Retirement income check-in', notes: 'Discuss distribution options.' },
      ],
    },
    accounts: [
      { type: 'Spend', balance: 165000, percentage: 13.2 },
      { type: 'Reserve', balance: 520000, percentage: 41.7 },
      { type: 'Growth', balance: 563000, percentage: 45.1 },
      { type: 'Mortgage', balance: -400000, percentage: null, interestRate: 3.5 }
    ],
    campaignReferrals: [
      { type: 'Retirement Planning', description: 'Comprehensive retirement planning services.', eligible: true },
      { type: 'Charitable Giving', description: 'Tax-efficient charitable giving strategies.', eligible: true }
    ],
    accounts: [
      { type: 'Spend', balance: 165000, percentage: 13.2 },
      { type: 'Reserve', balance: 520000, percentage: 41.7 },
      { type: 'Growth', balance: 563000, percentage: 45.1 }
    ],
    clientGoals: [
      { goal: 'Maximize retirement income', completed: true },
      { goal: 'Plan charitable giving', completed: false },
      { goal: 'Leave legacy to family', completed: false }
    ],
    recentActivity: [
      { date: '2026-04-24', type: 'dividend', amount: 18000 },
      { date: '2026-04-19', type: 'withdrawal', amount: 5000 }
    ],
    clientSummary: 'Seasoned investor focused on income generation and wealth preservation strategies.',
    opportunities: ['Charitable planning', 'Tax-loss harvesting', 'Distribution planning'],
    interactions: [
      { type: 'Client Interaction', action: null },
      { type: 'Service Request', action: null }
    ],
    notes: 'Client values concierge service and is considering a fixed-income ladder strategy.'
  }
];
