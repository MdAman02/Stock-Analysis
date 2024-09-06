exports.scripSchema = {
  properties: {
    symbol: {
      type: 'string', required: true,
    },
    year: {
      type: 'number', required: true,
    },
    quarterly: {
      type: 'boolean',
      default: false,
    },
    quarter: { type: 'string', required: false, },
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
    equity: { type: 'number', required: true },
    currentLiability: { type: 'number', required: true },
    nonCurrentLiability: { type: 'number', required: true },
    totalLiability: { type: 'number', required: true },
    longTermLoan: { type: 'number', required: true },
    shortTermLoan: { type: 'number', required: true },
    currentLongTermLoan: { type: 'number', required: true },
    nav: { type: 'number',required: false }
  },
}

exports.basicIncomeExpSchema = {
  properties: {
    revenue: { type: 'number', required: true },
    grossProfit: { type: 'number', required: true },
    operatingProfit: { type: 'number', required: true },
    profitBeforeTax: { type: 'number', required: true },
    financeCost: { type: 'number', required: true, default: 0 },
    netProfit: { type: 'number', required: true },
    eps: { type: 'number', required: false }
  }
}

exports.basicCashFlowSchema = {
  properties: {
    opCashFlow: { type: 'number', required: true },
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
