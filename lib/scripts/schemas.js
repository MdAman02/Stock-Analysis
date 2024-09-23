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
        const quarterly = prompt.history('quarterly').value;
        return quarterly;
      }
    },
    numericMultiple: {
      description: 'Amount base',
      default: 1000000,
      type: 'number',
      required: true,
    }
  }
};

exports.basicFinPosSchema = {
  properties: {
    ppe: { type: 'number', required: true },
    inProgressCapWork: { type: 'number',required: false },
    currentAsset: { type: 'number', required: true },
    nonCurrentAsset: { type: 'number', required: true },
    totalAsset: { type: 'number', required: true },
    totalEquity: { type: 'number', required: true },
    currentLiability: { type: 'number', required: true },
    nonCurrentLiability: { type: 'number', required: true },
    totalLiability: { type: 'number', required: true },
    longTermLoan: { type: 'number', required: true },
    shortTermLoan: { type: 'number', required: true },
    currentLongTermLoan: { type: 'number', required: true },
    depreciation: { type: 'number', required: false },
    capitalEmployed: { type: 'number', required: false },
    capitalInvested: { type: 'number', required: false },
    nav: { type: 'number', description: 'NAV: Not Considered Amount Multiplier', required: false },
    totalShares: { type: 'number', description: 'Number of Total Shares', required: true },
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
    eps: { type: 'number', required: false },
    dividend: { type: 'number', required: false },
  }
}

exports.basicCashFlowSchema = {
  properties: {
    opCashFlow: { type: 'number', description: 'Cash Flow Before Interest and Tax' , required: true },
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
