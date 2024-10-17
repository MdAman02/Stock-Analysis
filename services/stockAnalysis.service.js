const { transform } = require('async');
const { financialAnalysis } = require('../domain/formula');
const { scripTimeline } = require('../domain/helpers');
const stockRepository = require('../repository/stock.repository');

// Finance Data
// Equity, totalAsset, opProfit, netProfit, eps, cashFlow, netOpCashFlow, nocfps

// Honesty
// capexRatio
// ppeTurnOver
// Dividend Payout
// CashFlow to Income

// Profitability
// Margins
// FreeCash Flow

// Mangement Efficiency
// RoE, RoCE
// Debt to Equity
// Growths

// Valuation
// Approx Data From Current Quarter
// 5 year projection
// P/E, P/CF
// free Cash Flow

exports.getFutureValuation = async (scrip, timeline, marketData) => {
  let { fromYear, upcomingYear, considerHalfYearly, availableQuarter } = timeline;
  fromYear = Number(fromYear), upcomingYear = Number(upcomingYear);
  const { marketPrice } = marketData;

  const years = Number(upcomingYear) - Number(fromYear);

  const availableFinancialData = await stockRepository.getCurrentScripData(scrip);

  const scripAnalysis = new financialAnalysis(availableFinancialData);

  const ratioPerYear = async function(ratioFunc) {
    return transform(
      new Array(years).fill(0),
      {},
      async (acc, v, i) => {
        const data = await ratioFunc(fromYear+i);
        acc[fromYear+i] = data;
      }
    );
  }

  // Valuation
  // Approx Data of Upcoming Year
  const approxNetProfit = scripAnalysis.getAnnualizedApproxNetProfit(upcomingYear, considerHalfYearly, availableQuarter)
  const approxOpProfit = scripAnalysis.getAnnualizedApproxOperatingProfit(upcomingYear, considerHalfYearly, availableQuarter)
  const approxEps = scripAnalysis.getAnnualizedApproxEps(upcomingYear, considerHalfYearly, availableQuarter)
  epsPerYear[upcomingYear] = approxEps;
  netProfitPerYear[upcomingYear] = approxNetProfit;
  operatingProfitPerYear[upcomingYear] = approxOpProfit;

  const fcfPerYear = await ratioPerYear(year => scripAnalysis.getFreeCashFlow(year));
  const fcfCAGR =
    scripAnalysis.getCAGR(fcfPerYear[fromYear], fcfPerYear[Number(upcomingYear) - 1], years);
  const PE = (Number(marketPrice)/approxEps).toFixed(3);

  return {
    current: {
      approxNetProfit,
      approxOpProfit,
      approxEps,
      fcfCAGR,
      PE
    },
  }
}

exports.getScripAnalytics = async (scrip, timeline) => {
  let { fromYear, upcomingYear } = timeline;
  fromYear = Number(fromYear), upcomingYear = Number(upcomingYear);

  const years = Number(upcomingYear) - Number(fromYear);

  const availableFinancialData = await stockRepository.getCurrentScripData(scrip);

  const scripAnalysis = new financialAnalysis(availableFinancialData);

  const dataPerYear = async function(getData) {
    return transform(
      new Array(years).fill(0),
      {},
      async (acc, v, i) => {
        const data = await getData(fromYear+i);
        acc[fromYear+i] = data;
      }
    );
  }

  const ratioPerYear = async function(ratioFunc) {
    return transform(
      new Array(years).fill(0),
      {},
      async (acc, v, i) => {
        const data = await ratioFunc(fromYear+i);
        acc[fromYear+i] = data;
      }
    );
  }

  const growthPerYear = async function(growthFunc) {
    return transform(
      new Array(years-1).fill(0),
      {},
      async (acc, v, i) => {
        const data = await growthFunc(fromYear+i+1, fromYear+i);
        acc[fromYear+i+1] = data;
      }
    );
  }

  // Data
  const revenuePerYear = await dataPerYear(year => stockRepository.getRevenue(scrip, new scripTimeline(year)));
  const operatingProfitPerYear = await dataPerYear(year => stockRepository.getOperatingProfit(scrip, new scripTimeline(year)));
  const netProfitPerYear = await dataPerYear(year => stockRepository.getNetProfit(scrip, new scripTimeline(year)));
  const epsPerYear = await dataPerYear(year => stockRepository.getEps(scrip, new scripTimeline(year)));
  const equityPerYear = await dataPerYear(year => stockRepository.getEquity(scrip, new scripTimeline(year)));
  const currentNetAssetPerYear = await dataPerYear(async year =>
    Number(await stockRepository.getCurrentAsset(scrip, new scripTimeline(year)))
    - Number(await stockRepository.getCurrentLiability(scrip, new scripTimeline(year)))
  );
  const cashAndEquivalentPerYear = await dataPerYear(async year => stockRepository.getCashAndEquivalent(scrip, new scripTimeline(year)));
  const nonCurrentNetAssetPerYear = await dataPerYear(async year =>
    Number(await stockRepository.getNonCurrentAsset(scrip, new scripTimeline(year)))
    - Number(await stockRepository.getNonCurrentLiability(scrip, new scripTimeline(year)))
  );
  const totalLiabilityPerYear = await dataPerYear(year => stockRepository.getTotalLiability(scrip, new scripTimeline(year)));
  const totalAssetPerYear = await dataPerYear(year => stockRepository.getTotalAsset(scrip, new scripTimeline(year)));
  const operatingCashFlowPerYear = await dataPerYear(year => stockRepository.getOperatingCashFlow(scrip, new scripTimeline(year)));
  const netOperatingCashFlowPerYear = await dataPerYear(year => stockRepository.getNetOperatingCashFlow(scrip, new scripTimeline(year)));
  const nocFpsPerYear = await dataPerYear(year => stockRepository.getNocFps(scrip, new scripTimeline(year)));

  // Honesty Ratios
  // ToDo: Dividend Payout
  const capexRatioPerYear = await ratioPerYear(year => scripAnalysis.getCapexRatio(year));
  const ppeTurnoverPerYear = await ratioPerYear(year => scripAnalysis.getPpeTurnover(year));
  
  // Profitability
  const grossProfitMarginsPerYear = await ratioPerYear(year => scripAnalysis.getGrossProfitMargin(year));
  const operatingProfitMarginsPerYear =
    await ratioPerYear(year => scripAnalysis.getOperatingProfitMargin(year));
  const netProfitMarginsPerYear = await ratioPerYear(year => scripAnalysis.getNetProfitMargin(year));
  
  // Management Efficiency
  const roePerYear = await ratioPerYear(year => scripAnalysis.getRoE(year));
  const rocePerYear = await ratioPerYear(year => scripAnalysis.getRoCE(year));
  const assetTurnoverPerYear = await ratioPerYear(year => scripAnalysis.getAssetTurnover(year));
  const debtToEquityPerYear = await ratioPerYear(year => scripAnalysis.getDebtToEquity(year));
  
  // Growth as Percentage
  const revenueGrowthPerYear = await growthPerYear((year1, year2) => scripAnalysis.getRevenueGrowth(year1, year2));
  const operatingProfitGrowthPerYear = await growthPerYear((year1, year2) => scripAnalysis.getOpProfitGrowth(year1, year2));
  const netProfitGrowthPerYear = await growthPerYear(
    (year1, year2) => scripAnalysis.getNetProfitGrowth(year1, year2)
  );
  const netOpCFGrowthPerYear = await growthPerYear(
    (year1, year2) => scripAnalysis.getNetOperatingCFGrowth(year1, year2)
  );
  
  const netProfitCAGR = scripAnalysis.getNetProfitCAGR(Number(upcomingYear) - 1, fromYear);
  const operatingProfitCAGR = scripAnalysis.getOperatingProfitCAGR(Number(upcomingYear) - 1, fromYear);
  const revenueCAGR = scripAnalysis.getRevenueCAGR(Number(upcomingYear) - 1, fromYear);
  const equityCAGR = scripAnalysis.getEquityCAGR(Number(upcomingYear) - 1, fromYear);

  const fcfPerYear = await ratioPerYear(year => scripAnalysis.getFreeCashFlow(year));
  const fcfCAGR =
    scripAnalysis.getCAGR(fcfPerYear[fromYear], fcfPerYear[Number(upcomingYear) - 1], years);

  return {
    current: {
      netProfitCAGR,
      operatingProfitCAGR,
      revenueCAGR,
      fcfCAGR,
      equityCAGR,
    },
    revenuePerYear,
    operatingProfitPerYear,
    netProfitPerYear,
    epsPerYear,
    equityPerYear,
    currentNetAssetPerYear,
    cashAndEquivalentPerYear,
    nonCurrentNetAssetPerYear,
    totalLiabilityPerYear,
    totalAssetPerYear,
    operatingCashFlowPerYear,
    netOperatingCashFlowPerYear,
    nocFpsPerYear,
    capexRatioPerYear,
    ppeTurnoverPerYear,
    grossProfitMarginsPerYear,
    operatingProfitMarginsPerYear,
    netProfitMarginsPerYear,
    roePerYear,
    rocePerYear,
    assetTurnoverPerYear,
    debtToEquityPerYear,
    revenueGrowthPerYear,
    operatingProfitGrowthPerYear,
    netProfitGrowthPerYear,
    netOpCFGrowthPerYear,
    fcfPerYear,
  }
};
