export const clients = [
  {
    id: 'C-1034',
    name: 'Jane Smith',
    age: 26,
    employment: 'Office Worker',
    maritalStatus: 'Single',
    housingStatus: 'First Home',
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
      { type: 'Growth', balance: 14884, percentage: 32.7 }
    ],
    clientGoals: [
      { goal: 'Finish Mortgage Payments', completed: true },
      { goal: 'Diversify portfolio', completed: true },
      { goal: 'Build emergency fund', completed: false }
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
    age: 34,
    employment: 'Software Engineer',
    maritalStatus: 'Married',
    housingStatus: 'Own Home',
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
    age: 29,
    employment: 'Marketing Manager',
    maritalStatus: 'Single',
    housingStatus: 'Renting',
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
    accounts: [
      { type: 'Spend', balance: 28000, percentage: 14.5 },
      { type: 'Reserve', balance: 82700, percentage: 42.9 },
      { type: 'Growth', balance: 82000, percentage: 42.6 }
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
    age: 48,
    employment: 'CEO',
    maritalStatus: 'Married',
    housingStatus: 'Own Home',
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
    age: 55,
    employment: 'Retired',
    maritalStatus: 'Married',
    housingStatus: 'Own Home',
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
