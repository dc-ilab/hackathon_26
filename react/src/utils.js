// Color palettes for charts
export const ASSET_COLORS = ['#bdddbd','#71B48D','#404E7C', '#4a3974'];
export const LIABILITY_COLORS = ['#db8c4f', '#eeceb6', '#edeea4', '#e3e64a'];

// Pie chart constants for minimum slice sizing
const FULL_CIRCLE = Math.PI * 2;
const CIRCLE_EPSILON = 0.0001;
const MIN_SLICE_ANGLE = 0.12;

// Calculate visible slice angles with minimum slice size
export const getVisibleSlices = (accounts, totalAmount) => {
  if (!accounts.length) return [];
  const target = FULL_CIRCLE - CIRCLE_EPSILON;

  if (accounts.length === 1) {
    return [target];
  }

  const fallbackAngle = target / accounts.length;
  const rawAngles = accounts.map((account) => {
    if(totalAmount <= 0) return fallbackAngle;
    return (Math.abs(account.balance || 0) / totalAmount) * target;
  });

  const adjustedAngles = rawAngles.map((angle) => Math.max(angle, MIN_SLICE_ANGLE));
  let adjustedSum = adjustedAngles.reduce((sum, angle) => sum + angle, 0);

  if (adjustedSum > target) {
    let remainingExcess = adjustedSum - target;
    let adjustableIndexes = adjustedAngles
      .map((angle, index) => ({angle, index}))
      .filter(({angle}) => angle > MIN_SLICE_ANGLE)
      .map(({index}) => index);

    while (remainingExcess > 0.000001 && adjustableIndexes.length > 0) {
      const reductionPerSlice = remainingExcess / adjustableIndexes.length;
      const nextAdjustable = [];

      adjustableIndexes.forEach((index) => {
        const reducible = adjustedAngles[index] - MIN_SLICE_ANGLE;
        const reduction = Math.min(reductionPerSlice, reducible);
        adjustedAngles[index] -= reduction;
        remainingExcess -= reduction;
        if (adjustedAngles[index] > MIN_SLICE_ANGLE + 0.000001) {
          nextAdjustable.push(index);
        }
      });
      adjustableIndexes = nextAdjustable;
    }
  }

  adjustedSum = adjustedAngles.reduce((sum, angle) => sum + angle, 0);
  if (adjustedSum < target) {
    const largestIndex = adjustedAngles.reduce(
      (currentMaxIndex, angle, index, arr) => angle > (arr[currentMaxIndex] ? index : currentMaxIndex), 0);
    adjustedAngles[largestIndex] += target - adjustedSum;
  }
  return adjustedAngles;
};

// Get color for an account based on its category
export const getAccountColors = (accounts) => {
  let assetIndex = 0;
  let liabilityIndex = 0;
  
  return accounts.map((account) => {
    const isAsset = account.category 
      ? account.category.toLowerCase() === 'asset' 
      : account.balance > 0;
    
    if (isAsset) {
      const color = ASSET_COLORS[assetIndex % ASSET_COLORS.length];
      assetIndex++;
      return color;
    }
    
    const color = LIABILITY_COLORS[liabilityIndex % LIABILITY_COLORS.length];
    liabilityIndex++;
    return color;
  });
};

//account sorting

export const sortAccountsByType = (accounts) => {
    const accountTypePriority = {
        'Spend': 1,
        'Reserve': 2,
        'Growth': 3,
    };

    //detemine asset or liability
    const isAsset = (account) => {
        if(account.category) {
            return account.category.toLowerCase() === 'asset';
        }
        //fallback to balance if category is missing
        return account.balance > 0;
    };

    const sortedAccounts = [...accounts].sort((a,b) => {
        const aIsAsset = isAsset(a);
        const bIsAsset = isAsset(b);

        // assets come before liabilities        
        if(aIsAsset !== bIsAsset) {
            return aIsAsset ? -1 : 1;
        }

        // within assets or liabilities, sort by category priority
        const aPriority = accountTypePriority[a.type] ?? 999;
        const bPriority = accountTypePriority[b.type] ?? 999;

        if (aPriority !== bPriority) {
            return aPriority - bPriority;
        }

        // if same priority, keep original orer
        return 0;
    });

    return sortedAccounts;
};

export const getTransactionTypeMeta = (transactionType, fallbackType) => {
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

// split accounts into assets and liabilities, both properly sorted
export const getAssetsAndLiabilities = (accounts) => {
    const sorted = sortAccountsByType(accounts);

    const assetAccounts = sorted.filter((account) => {
        if(account.category) {
            return account.category.toLowerCase() === 'asset';
        }
        return account.balance > 0;
    });

    const liabilityAccounts = sorted.filter((account) => {
        if(account.category) {
            return account.category.toLowerCase() === 'liability';
        }
        return account.balance <= 0;
    });

    return { assetAccounts, liabilityAccounts };
}