const _ = require('underscore');
const { DataNotPresentError } = require("./domainError");

// exports.basicFinPosSchema = {
//   properties: {
//     ppe: { type: 'number', required: true },
//     inProgressCapWork: { type: 'number',required: false },
//     currentAsset: { type: 'number', required: true },
//     nonCurrentAsset: { type: 'number', required: true },
//     totalAsset: { type: 'number', required: true },
//     equity: { type: 'number', required: true },
//     currentLiability: { type: 'number', required: true },
//     nonCurrentLiability: { type: 'number', required: true },
//     totalLiability: { type: 'number', required: true },
//     longTermLoan: { type: 'number', required: true },
//     shortTermLoan: { type: 'number', required: true },
//     currentLongTermLoan: { type: 'number', required: true },
//     nav: { type: 'number',required: false }
//   },
// }

// exports.basicIncomeExpSchema = {
//   properties: {
//     revenue: { type: 'number', required: true },
//     grossProfit: { type: 'number', required: true },
//     operatingProfit: { type: 'number', required: true },
//     profitBeforeTax: { type: 'number', required: true },
//     financeCost: { type: 'number', required: true },
//     netProfit: { type: 'number', required: true },
//     eps: { type: 'number', required: false }
//   }
// }

// exports.basicCashFlowSchema = {
//   properties: {
//     opCashFlow: { type: 'number', required: true },
//     netOpCashFlow: { type: 'number', required: true },
//     capex: { type: 'number', required: true },
//     nocfps: { type: 'number', required: false }
//   }
// }

exports.financialAnalysis = class {
  #financialData;
  constructor(financialData) {
    this.#financialData = financialData;
  }

  #getData(year, quarter) {
    const data = this.#financialData[(quarter ? `${year}_${String(quarter).toUpperCase()}` : `${year}`)];
    if (_.isEmpty(data))
      throw new DataNotPresentError();
    return data;
  }

  #checkData(data) {
    const nullKeys = Object.keys(data).filter(key => data[key]);
    if (!nullKeys.length)
      throw new DataNotPresentError(nullKeys);
  }

  getRoE(year, quarter) {
    const { FINANCIAL_POSITION = {} , INCOME_EXPENSE = {} } = this.#getData(year, quarter);
    const { equity } = FINANCIAL_POSITION;
    const { netProfit } = INCOME_EXPENSE;
    this.#checkData({ equity, netProfit });

    return (netProfit/equity).toFixed(2);
  }

  getRoCE(year, quarter) {
    const { FINANCIAL_POSITION = {} , INCOME_EXPENSE = {} } = this.#getData(year, quarter);
    const { totalAsset, currentLiability } = FINANCIAL_POSITION;
    const { profitBeforeTax, financeCost } = INCOME_EXPENSE;

    this.#checkData({ totalAsset, currentLiability, profitBeforeTax, financeCost });

    return ((profitBeforeTax + financeCost)/(totalAsset - currentLiability)).toFixed(2);
  }

  getPpeTurnover(year, quarter) {
    const { FINANCIAL_POSITION = {} , INCOME_EXPENSE = {} } = this.#getData(year, quarter);
    const { ppe } = FINANCIAL_POSITION;
    const { revenue } = INCOME_EXPENSE;
    this.#checkData({ revenue, ppe });

    return (revenue/ppe).toFixed(2);
  }

  getRevenueGrowth(year1, year2) {
    const { INCOME_EXPENSE: INCOME_EXPENSE1 = {} } = this.#getData(year1);
    const { INCOME_EXPENSE: INCOME_EXPENSE2 = {} } = this.#getData(year2);
    const { revenue: revenue1 } = INCOME_EXPENSE1;
    const { revenue: revenue2 } = INCOME_EXPENSE2;

    this.#checkData({ revenue1, revenue2 });

    return ((revenue1 - revenue2)/revenue1).toFixed(2);
  }

  getNetProfitGrowth(year1, year2) {
    const { INCOME_EXPENSE: INCOME_EXPENSE1 = {} } = this.#getData(year1);
    const { INCOME_EXPENSE: INCOME_EXPENSE2 = {} } = this.#getData(year2);
    const { netProfit: netProfit1 } = INCOME_EXPENSE1;
    const { netProfit: netProfit2 } = INCOME_EXPENSE2;

    this.#checkData({ netProfit1, netProfit2 });

    return ((netProfit1 - netProfit2)/netProfit1).toFixed(2);
  }

  getGrossProfitMargin(year, quarter) {
    const { INCOME_EXPENSE = {} } = this.#getData(year, quarter);
    const { revenue, grossProfit, operatingProfit, netProfit } = INCOME_EXPENSE;

    this.#checkData({ grossProfit, revenue });

    return (grossProfit/revenue).toFixed();
  }

  getOperatingProfitMargin(year, quarter) {
    const { INCOME_EXPENSE = {} } = this.#getData(year, quarter);
    const { revenue, operatingProfit } = INCOME_EXPENSE;

    this.#checkData({ operatingProfit, revenue });

    return (operatingProfit/revenue).toFixed();
  }

  getNetProfitMargin(year, quarter) {
    const { INCOME_EXPENSE = {} } = this.#getData(year, quarter);
    const { revenue, netProfit } = INCOME_EXPENSE;

    this.#checkData({ netProfit, revenue });

    return (netProfit/revenue).toFixed();
  }

};