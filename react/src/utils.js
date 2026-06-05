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