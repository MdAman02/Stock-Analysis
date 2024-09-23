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

  getCapexRatio(year, halfYearly, quarter) {
    const { CASH_FLOW = {} , INCOME_EXPENSE = {} } = this.#getData(year, halfYearly, quarter);
    const { capex } = CASH_FLOW;
    const { netProfit } = INCOME_EXPENSE;
    this.#checkData({ revenue, ppe });

    return (netProfit / capex).toFixed(3);
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

  getOpProfitGrowth(year1, year2) {
    const { INCOME_EXPENSE: INCOME_EXPENSE1 = {} } = this.#getData(year1);
    const { INCOME_EXPENSE: INCOME_EXPENSE2 = {} } = this.#getData(year2);
    const { operatingProfit: opProfit1 } = INCOME_EXPENSE1;
    const { operatingProfit: opProfit2 } = INCOME_EXPENSE2;

    this.#checkData({ opProfit1, opProfit2 });

    return ((opProfit1 - opProfit2)/opProfit1).toFixed(2);
  }

  getNetOperatingCFGrowth(year1, year2) {
    const { CASH_FLOW: CASH_FLOW1 = {} } = this.#getData(year1);
    const { CASH_FLOW: CASH_FLOW2 = {} } = this.#getData(year2);
    const { netOpCashFlow: netOpCashFlow1 } = CASH_FLOW1;
    const { netOpCashFlow: netOpCashFlow2 } = CASH_FLOW2;

    this.#checkData({ netOpCashFlow1, netOpCashFlow2 });

    return ((netOpCashFlow1 - netOpCashFlow2)/netOpCashFlow1).toFixed(2);
  }

  getGrossProfitMargin(year, halfYearly, quarter) {
    const { INCOME_EXPENSE = {} } = this.#getData(year, halfYearly, quarter);
    const { revenue, grossProfit } = INCOME_EXPENSE;

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

  #getAnnualizedApproxData(year, halfYearly, quarter, dataPointGetter) {
    // Filter Relevant data and pick current data separately based on which the approximation
    // should be done
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
      throw new DataNotPresentError()

    const listOfRelevantDatapoint = _(relevantData).map((value, key) => {
      return {
        dataPoint: dataPointGetter(value),
        timeline: key
      };
    })

    const annualToNonAnnualDataRatios = _.chain(listOfRelevantDatapoint)
      .groupBy(data => data.timeline.substring(0, 4))
      .sort((value, key) => key)
      .map(yearlyData => {
        const year = yearlyData[0].timeline.substring(0, 4);
        const annualData = yearlyData.find(d => d.timeline.length === 4).dataPoint;
        const nonAnnualData = yearlyData.find(d => d.timeline.length > 4).dataPoint;
        return Number(annualData)/Number(nonAnnualData);
      })
      .reverse()
      .value();

    // Give 50% more weight to latest 40% data
    const weightedAverage = getWeightedAverage(
      annualToNonAnnualDataRatios,
      annualToNonAnnualDataRatios.map((v, i) => (annualToNonAnnualDataRatios.length*40/100) >= i ? 1.5 : 1)
    )

    const baseDataPoint = dataPointGetter(inputTimeLineData);
    const approxAnnualizedDataPoint = Number(baseDataPoint) * weightedAverage;
    return +approxAnnualizedDataPoint.toFixed(4);
  };
  
  getAnnualizedApproxEps(year, halfYearly, quarter) {
    return this.#getAnnualizedApproxData(
      year,
      halfYearly,
      quarter,
      financialData => financialData.INCOME_EXPENSE.eps
    )
  }

  getAnnualizedApproxNetProfit(year, halfYearly, quarter) {
    return this.#getAnnualizedApproxData(
      year,
      halfYearly,
      quarter,
      financialData => financialData.INCOME_EXPENSE.netProfit
    )
  }

  getAnnualizedApproxOperatingProfit(year, halfYearly, quarter) {
    return this.#getAnnualizedApproxData(
      year,
      halfYearly,
      quarter,
      financialData => financialData.INCOME_EXPENSE.operatingProfit
    )
  }

  getCAGR(beginningValue, endingValue, years) {
    return Math.pow(Number(endingValue)/Number(beginningValue), 1/Number(years)) - 1;
  }

  getNetProfitCAGR(year1, year2) {
    const { INCOME_EXPENSE: INCOME_EXPENSE1 = {} } = this.#getData(year1);
    const { INCOME_EXPENSE: INCOME_EXPENSE2 = {} } = this.#getData(year2);
    const { netProfit: netProfit1 } = INCOME_EXPENSE1;
    const { netProfit: netProfit2 } = INCOME_EXPENSE2;

    this.#checkData({ netProfit1, netProfit2 });

    return this.getCAGR(netProfit2, netProfit1, Number(year1) - Number(year2) + 1);
  }

  getOperatingProfitCAGR(year1, year2) {
    const { INCOME_EXPENSE: INCOME_EXPENSE1 = {} } = this.#getData(year1);
    const { INCOME_EXPENSE: INCOME_EXPENSE2 = {} } = this.#getData(year2);
    const { operatingProfit: operatingProfit1 } = INCOME_EXPENSE1;
    const { operatingProfit: operatingProfit2 } = INCOME_EXPENSE2;

    this.#checkData({ operatingProfit1, operatingProfit2 });

    return this.getCAGR(operatingProfit2, operatingProfit1, Number(year1) - Number(year2) + 1);
  }

  getRevenueCAGR(year1, year2) {
    const { INCOME_EXPENSE: INCOME_EXPENSE1 = {} } = this.#getData(year1);
    const { INCOME_EXPENSE: INCOME_EXPENSE2 = {} } = this.#getData(year2);
    const { revenue: revenue1 } = INCOME_EXPENSE1;
    const { revenue: revenue2 } = INCOME_EXPENSE2;

    this.#checkData({ revenue1, revenue2 });

    return this.getCAGR(revenue2, revenue1, Number(year1) - Number(year2) + 1);
  }

  getPE(marketPrice, year) {
    const { INCOME_EXPENSE = {} } = this.#getData(year);
    const { eps } = INCOME_EXPENSE;

    this.#checkData({ eps });

    return (marketPrice/eps).toFixed(3);
  }

  // Market Price to Operating Cash Flow Ratio (From CF Statement)
  getPriceToCashFlow(marketPrice, year, halfYearly, quarter) {
    const { CASH_FLOW = {}, FINANCIAL_POSITION = {} } = this.#getData(year, halfYearly, quarter);
    const { opCashFlow } = CASH_FLOW;
    const { totalShares } = FINANCIAL_POSITION;

    this.#checkData({ opCashFlow, totalShares });

    const operatingCashFlowPerShare = Number(opCashFlow)/Number(totalShares);
    return (Number(marketPrice) / operatingCashFlowPerShare).toFixed(3);
  }

  getFreeCashFlow(year, halfYearly, quarter) {
    const { CASH_FLOW = {} } = this.#getData(year, halfYearly, quarter);
    const { opCashFlow, capex } = CASH_FLOW;

    this.#checkData({ opCashFlow, capex });

    const freeCashFlow = Number(opCashFlow) - Number(capex);
    return freeCashFlow;
  }

  getPriceToFreeCashFlow(marketPrice, year, halfYearly, quarter) {
    const { FINANCIAL_POSITION = {} } = this.#getData(year, halfYearly, quarter);
    const { totalShares } = FINANCIAL_POSITION;

    this.#checkData({ totalShares })

    const fcf = this.getFreeCashFlow(year, halfYearly, quarter);
    const fcfPerShare = Number(fcf/totalShares);
    return (marketPrice/fcfPerShare).toFixed(3);
  }
};
