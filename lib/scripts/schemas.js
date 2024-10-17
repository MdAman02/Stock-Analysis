const prompt = require('prompt');

exports.scripSchema = {
  properties: {
    symbol: {
      type: 'string', required: true,
    },
    year: {
      type: 'number', required: true,
    },
    halfYearly: {
      type: 'boolean',
      default: false,
    },
    quarterly: {
      type: 'boolean',
      default: false,
      ask: function() {
        const halfYearly = prompt.history('halfYearly').value;
        return !halfYearly;
      }
    },
    quarter: {
      type: 'string',
      required: true,
      ask: function() {
        const quarterly = prompt.history('quarterly') && prompt.history('quarterly').value;
        return quarterly;
      }
    },
    numericMultiple: {
      description: 'Amount base',
      default: 1000000,
      type: 'number',
      required: true,
    },
  }
};

exports.basicFinPosSchema = {
  properties: {
    ppe: { type: 'number', required: true },
    inProgressCapWork: { type: 'number',required: false },
    nonCurrentAsset: { type: 'number', required: true },
    currentAsset: { type: 'number', required: true },
    cashAndEquivalent: {
      type: 'number',
      required: false,
    },
    totalAsset: { type: 'number', required: true },
    totalEquity: { type: 'number', required: true },
    currentLiability: { type: 'number', required: true },
    nonCurrentLiability: { type: 'number', required: true },
    totalLiability: {
      type: 'number',
      description: 'Total Liability(Calculated if passed)',
      before: function(value) {
        if (value) return value;
        const total = +(prompt.history('currentLiability').value) + (+prompt.history('nonCurrentLiability').value);
        return total;
      }
    },
    longTermLoan: { type: 'number', required: true, default: 0 },
    shortTermLoan: { type: 'number', required: true, default: 0 },
    currentLongTermLoan: { type: 'number', required: true, default: 0 },
    capitalEmployed: { type: 'number', required: false },
    capitalInvested: { type: 'number', required: false },
    nav: { type: 'number', description: 'NAV: Not Considered Amount Multiplier', required: false },
    totalShares: { type: 'number', description: 'Number of Total Shares', required: false },
  },
}

exports.basicIncomeExpSchema = {
  properties: {
    revenue: { type: 'number', required: true },
    grossProfit: { type: 'number', required: true },
    operatingProfit: { type: 'number', description: 'Operating Profit: Before Finance Cost and Other Income', required: true },
    profitBeforeTax: { type: 'number', required: true },
    financeCost: { type: 'number', required: true, default: 0 },
    netProfit: { type: 'number', required: true },
    eps: { type: 'number', description: 'EPS - (Diluted)', required: false },
    costofDA: { type: 'number', description: 'Depreciation and Amortization', required: false },
    dividend: { type: 'number', required: false },
  }
}

exports.basicCashFlowSchema = {
  properties: {
    opCashFlow: { type: 'number', description: 'Operating Cash Flow(Before Interest and Tax)' , required: true },
    netOpCashFlow: { type: 'number', required: true },
    capex: { type: 'number', required: true },
    nocfps: { type: 'number', required: false }
  }
}

exports.reportSegmentMap = {
  FINANCIAL_POSITION: this.basicFinPosSchema,
  INCOME_EXPENSE: this.basicIncomeExpSchema,
  CASH_FLOW: this.basicCashFlowSchema,
}
