const _ = require('underscore');
const { DataNotPresentError } = require("./domainError");
const { getFinReportSegmentName, getWeightedAverage } = require('../lib/helper');

// exports.basicFinPosSchema = {
//   properties: {
//     ppe: { type: 'number', required: true },
//     inProgressCapWork: { type: 'number',required: false },
//     currentAsset: { type: 'number', required: true },
//     nonCurrentAsset: { type: 'number', required: true },
//     totalAsset: { type: 'number', required: true },
//     totalEquity: { type: 'number', required: true },
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
  constructor(scripData) {
    this.#financialData = scripData.financialData;
  }

  #getData(year, halfYearly, quarter) {
    const data = this.#financialData[getFinReportSegmentName(year, halfYearly, quarter)];
    if (_.isEmpty(data))
      throw new DataNotPresentError();
    return data;
  }

  #checkData(data) {
    const nullKeys = Object.keys(data).filter(key => data[key]);
    if (!nullKeys.length)
      throw new DataNotPresentError(nullKeys);
  }

  getRoE(year, halfYearly, quarter) {
    const { FINANCIAL_POSITION = {} , INCOME_EXPENSE = {} } = this.#getData(year, halfYearly, quarter);
    const { totalEquity } = FINANCIAL_POSITION;
    const { netProfit } = INCOME_EXPENSE;
    this.#checkData({ totalEquity, netProfit });

    return (netProfit/totalEquity).toFixed(2);
  }

  getRoCE(year, halfYearly, quarter) {
    const { FINANCIAL_POSITION = {} , INCOME_EXPENSE = {} } = this.#getData(year, halfYearly, quarter);
    const { totalAsset, currentLiability } = FINANCIAL_POSITION;
    const { profitBeforeTax, financeCost } = INCOME_EXPENSE;

    this.#checkData({ totalAsset, currentLiability, profitBeforeTax, financeCost });

    return ((profitBeforeTax + financeCost)/(totalAsset - currentLiability)).toFixed(2);
  }

  getPpeTurnover(year, halfYearly, quarter) {
    const { FINANCIAL_POSITION = {} , INCOME_EXPENSE = {} } = this.#getData(year, halfYearly, quarter);
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

  getGrossProfitMargin(year, halfYearly, quarter) {
    const { INCOME_EXPENSE = {} } = this.#getData(year, halfYearly, quarter);
    const { revenue, grossProfit, operatingProfit, netProfit } = INCOME_EXPENSE;

    this.#checkData({ grossProfit, revenue });

    return (grossProfit/revenue).toFixed(2);
  }

  getOperatingProfitMargin(year, halfYearly, quarter) {
    const { INCOME_EXPENSE = {} } = this.#getData(year, halfYearly, quarter);
    const { revenue, operatingProfit } = INCOME_EXPENSE;

    this.#checkData({ operatingProfit, revenue });

    return (operatingProfit/revenue).toFixed(2);
  }

  getNetProfitMargin(year, halfYearly, quarter) {
    const { INCOME_EXPENSE = {} } = this.#getData(year, halfYearly, quarter);
    const { revenue, netProfit } = INCOME_EXPENSE;

    this.#checkData({ netProfit, revenue });

    return (netProfit/revenue).toFixed(2);
  }

  getDebtToEquity(year, halfYearly, quarter) {
    const { FINANCIAL_POSITION = {} } = this.#getData(year, halfYearly, quarter);
    const { totalEquity, longTermLoan, shortTermLoan, currentLongTermLoan } = FINANCIAL_POSITION;

    this.#checkData({ totalEquity, longTermLoan, shortTermLoan, currentLongTermLoan });

    return ((longTermLoan + shortTermLoan + currentLongTermLoan)/totalEquity).toFixed(2);
  }

  getAnnualizedApproxEps(year, halfYearly, quarter) {
    // ToDo: generalize
    let inputTimeLineData;
    const relevantData = _.chain(this.#financialData)
      .pick((value, key) => {
        const currentYear = key.substring(0, 4);
        const pattern = halfYearly ? 'H1' : quarter;
        if (currentYear >= year) {
          if (key === `${year}-${pattern}`)
            inputTimeLineData = value;
          return false;
        }
        return key.search(new RegExp(`[0-9]{4}$|.+-${pattern}$`)) !== -1;
      })
      .value();
    
    if (!Object.keys(relevantData).length || !inputTimeLineData)
      return;

    const listOfRelevantEps = _(relevantData).map((value, key) => {
      const { INCOME_EXPENSE: { eps } } = value;
      return {
        eps,
        timeline: key
      };
    })

    const epsRatios = _.chain(listOfRelevantEps)
      .groupBy(data => data.timeline.substring(0, 4))
      .sort((value, key) => key)
      .map(yearlyData => {
        const year = yearlyData[0].timeline.substring(0, 4);
        const annualEps = yearlyData.find(d => d.timeline.length === 4).eps;
        const nonAnnualEps = yearlyData.find(d => d.timeline.length > 4).eps;
        return Number(annualEps)/Number(nonAnnualEps);
      })
      .reverse()
      .value();

    // Give 50% more weight to latest 40% data
    const weightedAverage = getWeightedAverage(
      epsRatios,
      epsRatios.map((v, i) => (epsRatios.length*40/100) >= i ? 1.5 : 1)
    )

    const givenEps = inputTimeLineData.INCOME_EXPENSE.eps;
    const approxAnnualizedEps = Number(givenEps) * weightedAverage;
    return +approxAnnualizedEps.toFixed(4);
  }

  getPE(marketPrice, year) {
    const { INCOME_EXPENSE = {} } = this.#getData(year);
    const { eps } = INCOME_EXPENSE;

    this.#checkData({ eps });

    return (marketPrice/eps).toFixed(3);
  }

  // getPriceToCashFlow(marketPrice, year, halfYearly, quarter) {
    
  // }
};