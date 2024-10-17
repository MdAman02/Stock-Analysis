const _ = require('underscore');
const { DataNotPresentError } = require("./domainError");
const { getFinReportSegmentName, getWeightedAverage, roundTo } = require('../lib/helper');
const { scripTimeline } = require('./helpers');

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
  #currentTotalShares;
  constructor(scripData) {
    this.#financialData = scripData.financialData;
    this.#currentTotalShares = scripData.totalShares;
  }

  #getData(year, halfYearly, quarter) {
    const data = this.#financialData[getFinReportSegmentName(year, halfYearly, quarter)];
    if (_.isEmpty(data))
      throw new DataNotPresentError(new scripTimeline(year, halfYearly, quarter));
    return data;
  }

  #checkData(timeline, data) {
    const nullKeys = Object.keys(data).filter(key => data[key]);
    if (!nullKeys.length)
      throw new DataNotPresentError(timeline, nullKeys);
  }

  getRoE(year, halfYearly, quarter) {
    const { FINANCIAL_POSITION = {} , INCOME_EXPENSE = {} } = this.#getData(year, halfYearly, quarter);
    const { totalEquity } = FINANCIAL_POSITION;
    const { netProfit } = INCOME_EXPENSE;
    this.#checkData(new scripTimeline(year, halfYearly, quarter), { totalEquity, netProfit });

    return roundTo(netProfit/totalEquity);
  }

  getRoCE(year, halfYearly, quarter) {
    const { FINANCIAL_POSITION = {} , INCOME_EXPENSE = {} } = this.#getData(year, halfYearly, quarter);
    const { totalAsset, currentLiability } = FINANCIAL_POSITION;
    const { profitBeforeTax, financeCost } = INCOME_EXPENSE;

    this.#checkData(new scripTimeline(year, halfYearly, quarter), { totalAsset, currentLiability, profitBeforeTax, financeCost });

    return roundTo((profitBeforeTax + financeCost)/(totalAsset - currentLiability));
  }

  getPpeTurnover(year, halfYearly, quarter) {
    const { FINANCIAL_POSITION = {} , INCOME_EXPENSE = {} } = this.#getData(year, halfYearly, quarter);
    const { ppe } = FINANCIAL_POSITION;
    const { revenue } = INCOME_EXPENSE;
    this.#checkData(new scripTimeline(year, halfYearly, quarter), { revenue, ppe });

    return roundTo(revenue/ppe);
  }

  getCapexRatio(year, halfYearly, quarter) {
    const { CASH_FLOW = {} , INCOME_EXPENSE = {} } = this.#getData(year, halfYearly, quarter);
    const { capex } = CASH_FLOW;
    const { netProfit } = INCOME_EXPENSE;
    this.#checkData(new scripTimeline(year, halfYearly, quarter), { netProfit, capex });

    return roundTo(capex / netProfit);
  }

  getAssetTurnover(year, halfYearly, quarter) {
    const { FINANCIAL_POSITION = {} , INCOME_EXPENSE = {} } = this.#getData(year, halfYearly, quarter);
    const { totalAsset } = FINANCIAL_POSITION;
    const { revenue } = INCOME_EXPENSE;
    this.#checkData(new scripTimeline(year, halfYearly, quarter), { revenue, totalAsset });

    return roundTo(revenue / totalAsset);
  }

  getDividendPayoutRatio(year, halfYearly, quarter) {
    const { INCOME_EXPENSE = {} } = this.#getData(year, halfYearly, quarter);
    const { dividend, eps } = INCOME_EXPENSE;
    this.#checkData(new scripTimeline(year, halfYearly, quarter), { dividend, eps });

    return roundTo(dividend / eps);
  }

  getEquityGrowth(year1, year2) {
    const { FINANCIAL_POSITION: FINANCIAL_POSITION1 = {} } = this.#getData(year1);
    const { FINANCIAL_POSITION: FINANCIAL_POSITION2 = {} } = this.#getData(year2);
    const { totalEquity: totalEquity1 } = FINANCIAL_POSITION1;
    const { totalEquity: totalEquity2 } = FINANCIAL_POSITION2;

    this.#checkData(new scripTimeline(year1), { totalEquity: totalEquity1 });
    this.#checkData(new scripTimeline(year2), { totalEquity: totalEquity2 });

    return roundTo((totalEquity1 - totalEquity2)/totalEquity2);
  }

  getRevenueGrowth(year1, year2) {
    const { INCOME_EXPENSE: INCOME_EXPENSE1 = {} } = this.#getData(year1);
    const { INCOME_EXPENSE: INCOME_EXPENSE2 = {} } = this.#getData(year2);
    const { revenue: revenue1 } = INCOME_EXPENSE1;
    const { revenue: revenue2 } = INCOME_EXPENSE2;

    this.#checkData(new scripTimeline(year1), { revenue: revenue1 });
    this.#checkData(new scripTimeline(year2), { revenue: revenue2 });

    return roundTo((revenue1 - revenue2)/revenue2);
  }

  getNetProfitGrowth(year1, year2) {
    const { INCOME_EXPENSE: INCOME_EXPENSE1 = {} } = this.#getData(year1);
    const { INCOME_EXPENSE: INCOME_EXPENSE2 = {} } = this.#getData(year2);
    const { netProfit: netProfit1 } = INCOME_EXPENSE1;
    const { netProfit: netProfit2 } = INCOME_EXPENSE2;

    this.#checkData(new scripTimeline(year1), { netProfit: netProfit1 });
    this.#checkData(new scripTimeline(year2), { netProfit: netProfit2 });

    return roundTo(((netProfit1 - netProfit2)/netProfit2));
  }

  getOpProfitGrowth(year1, year2) {
    const { INCOME_EXPENSE: INCOME_EXPENSE1 = {} } = this.#getData(year1);
    const { INCOME_EXPENSE: INCOME_EXPENSE2 = {} } = this.#getData(year2);
    const { operatingProfit: opProfit1 } = INCOME_EXPENSE1;
    const { operatingProfit: opProfit2 } = INCOME_EXPENSE2;

    this.#checkData(new scripTimeline(year1), { operatingProfit: opProfit1 });
    this.#checkData(new scripTimeline(year2), { operatingProfit: opProfit2 });

    return roundTo((opProfit1 - opProfit2)/opProfit2);
  }

  getNetOperatingCFGrowth(year1, year2) {
    const { CASH_FLOW: CASH_FLOW1 = {} } = this.#getData(year1);
    const { CASH_FLOW: CASH_FLOW2 = {} } = this.#getData(year2);
    const { netOpCashFlow: netOpCashFlow1 } = CASH_FLOW1;
    const { netOpCashFlow: netOpCashFlow2 } = CASH_FLOW2;

    this.#checkData(new scripTimeline(year1), { netOpCashFlow: netOpCashFlow1 });
    this.#checkData(new scripTimeline(year2), { netOpCashFlow: netOpCashFlow2 });

    return roundTo((netOpCashFlow1 - netOpCashFlow2)/netOpCashFlow2);
  }

  getGrossProfitMargin(year, halfYearly, quarter) {
    const { INCOME_EXPENSE = {} } = this.#getData(year, halfYearly, quarter);
    const { revenue, grossProfit } = INCOME_EXPENSE;

    this.#checkData(new scripTimeline(year, halfYearly, quarter), { grossProfit, revenue });

    return roundTo(grossProfit/revenue);
  }

  getOperatingProfitMargin(year, halfYearly, quarter) {
    const { INCOME_EXPENSE = {} } = this.#getData(year, halfYearly, quarter);
    const { revenue, operatingProfit } = INCOME_EXPENSE;

    this.#checkData(new scripTimeline(year, halfYearly, quarter), { operatingProfit, revenue });

    return roundTo(operatingProfit/revenue);
  }

  getNetProfitMargin(year, halfYearly, quarter) {
    const { INCOME_EXPENSE = {} } = this.#getData(year, halfYearly, quarter);
    const { revenue, netProfit } = INCOME_EXPENSE;

    this.#checkData(new scripTimeline(year, halfYearly, quarter), { netProfit, revenue });

    return roundTo(netProfit/revenue);
  }

  getDebtToEquity(year, halfYearly, quarter) {
    const { FINANCIAL_POSITION = {} } = this.#getData(year, halfYearly, quarter);
    const { totalEquity, longTermLoan, shortTermLoan, currentLongTermLoan } = FINANCIAL_POSITION;

    this.#checkData(new scripTimeline(year, halfYearly, quarter), { totalEquity, longTermLoan, shortTermLoan, currentLongTermLoan });

    return roundTo((longTermLoan + shortTermLoan + currentLongTermLoan)/totalEquity);
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
    
    if (!Object.keys(relevantData).length < 3 || !inputTimeLineData)
      throw new DataNotPresentError(new scripTimeline(year, halfYearly, quarter))

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
    return roundTo(approxAnnualizedDataPoint);
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
    return roundTo(
      Math.pow(Number(endingValue)/Number(beginningValue), 1/Number(years)) - 1
    );
  }

  getNetProfitCAGR(year1, year2) {
    const { INCOME_EXPENSE: INCOME_EXPENSE1 = {} } = this.#getData(year1);
    const { INCOME_EXPENSE: INCOME_EXPENSE2 = {} } = this.#getData(year2);
    const { netProfit: netProfit1 } = INCOME_EXPENSE1;
    const { netProfit: netProfit2 } = INCOME_EXPENSE2;

    this.#checkData(new scripTimeline(year1), { netProfit: netProfit1 });
    this.#checkData(new scripTimeline(year2), { netProfit: netProfit2 });

    return this.getCAGR(netProfit2, netProfit1, Number(year1) - Number(year2));
  }

  getOperatingProfitCAGR(year1, year2) {
    const { INCOME_EXPENSE: INCOME_EXPENSE1 = {} } = this.#getData(year1);
    const { INCOME_EXPENSE: INCOME_EXPENSE2 = {} } = this.#getData(year2);
    const { operatingProfit: operatingProfit1 } = INCOME_EXPENSE1;
    const { operatingProfit: operatingProfit2 } = INCOME_EXPENSE2;

    this.#checkData(new scripTimeline(year1), { operatingProfit: operatingProfit1 });
    this.#checkData(new scripTimeline(year2), { operatingProfit: operatingProfit2 });

    return this.getCAGR(operatingProfit2, operatingProfit1, Number(year1) - Number(year2));
  }

  getRevenueCAGR(year1, year2) {
    const { INCOME_EXPENSE: INCOME_EXPENSE1 = {} } = this.#getData(year1);
    const { INCOME_EXPENSE: INCOME_EXPENSE2 = {} } = this.#getData(year2);
    const { revenue: revenue1 } = INCOME_EXPENSE1;
    const { revenue: revenue2 } = INCOME_EXPENSE2;

    this.#checkData(new scripTimeline(year1), { revenue: revenue1 });
    this.#checkData(new scripTimeline(year2), { revenue: revenue2 });

    return this.getCAGR(revenue2, revenue1, Number(year1) - Number(year2));
  }

  getEquityCAGR(year1, year2) {
    const { FINANCIAL_POSITION: FINANCIAL_POSITION1 = {} } = this.#getData(year1);
    const { FINANCIAL_POSITION: FINANCIAL_POSITION2 = {} } = this.#getData(year2);
    const { totalEquity: totalEquity1 } = FINANCIAL_POSITION1;
    const { totalEquity: totalEquity2 } = FINANCIAL_POSITION2;

    this.#checkData(new scripTimeline(year1), { totalEquity: totalEquity1 });
    this.#checkData(new scripTimeline(year2), { totalEquity: totalEquity2 });

    return this.getCAGR(totalEquity2, totalEquity1, Number(year1) - Number(year2));
  }

  getPE(marketPrice, year) {
    const { INCOME_EXPENSE = {} } = this.#getData(year);
    const { eps } = INCOME_EXPENSE;

    this.#checkData(new scripTimeline(year), { eps });

    return roundTo(marketPrice/eps);
  }

  // Market Price to Operating Cash Flow Ratio (From CF Statement)
  getPriceToCashFlow(marketPrice, year, halfYearly, quarter) {
    const { CASH_FLOW = {}, FINANCIAL_POSITION = {} } = this.#getData(year, halfYearly, quarter);
    const { opCashFlow } = CASH_FLOW;
    const { totalShares = this.#currentTotalShares } = FINANCIAL_POSITION;

    this.#checkData(new scripTimeline(year, halfYearly, quarter), { opCashFlow, totalShares });

    const operatingCashFlowPerShare = Number(opCashFlow)/Number(totalShares);
    return roundTo(Number(marketPrice) / operatingCashFlowPerShare);
  }

  getFreeCashFlow(year, halfYearly, quarter) {
    const { CASH_FLOW = {} } = this.#getData(year, halfYearly, quarter);
    const { opCashFlow, capex } = CASH_FLOW;

    this.#checkData(new scripTimeline(year, halfYearly, quarter), { opCashFlow, capex });

    const freeCashFlow = Number(opCashFlow) - Number(capex);
    return roundTo(freeCashFlow);
  }

  getPriceToFreeCashFlow(marketPrice, year, halfYearly, quarter) {
    const { FINANCIAL_POSITION = {} } = this.#getData(year, halfYearly, quarter);
    const { totalShares = this.#currentTotalShares } = FINANCIAL_POSITION;

    this.#checkData(new scripTimeline(year, halfYearly, quarter), { totalShares })

    const fcf = this.getFreeCashFlow(year, halfYearly, quarter);
    const fcfPerShare = Number(fcf/totalShares);
    return roundTo(marketPrice/fcfPerShare);
  }
};
