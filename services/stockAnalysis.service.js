const { financialAnalysis } = require('../domain/formula');
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

exports.getScripAnalytics = async (scrip, timeline, marketData) => {
  const { fromYear, upcomingYear, considerHalfYearly, availableQuarter } = timeline;
  const { marketPrice } = marketData;

  const years = Number(upcomingYear) - Number(fromYear);

  const availableFinancialData = await stockRepository.getCurrentScripData(scrip);

  const scripAnalysis = new financialAnalysis(availableFinancialData);

  const dataPerYear = function(getData) {
    return new Array(years)
      .reduce((agg, i) => {
        return {
          ...agg,
          [fromYear+i]: getData(scrip, fromYear+i)
        }
      }, {})
  }

  const ratioPerYear = function(ratioFunc) {
    return new Array(years)
      .reduce((agg, i) => {
        return {
          ...agg,
          [fromYear+i]: ratioFunc(fromYear+i)
        }
      }, {})
  }

  const growthPerYear = function(growthFunc) {
    return new Array(years)
      .reduce((agg, i) => {
        return {
          ...agg,
          [fromYear+i+1]: growthFunc(fromYear+i+1, fromYear+i)
        }
      }, {})
  }

  // Data
  const netProfitPerYear = dataPerYear(stockRepository.getNetProfit);
  const operatingProfitPerYear = dataPerYear(stockRepository.getOperatingProfit);
  const epsPerYear = dataPerYear(stockRepository.getEps);
  const equityPerYear = dataPerYear(stockRepository.getEquity);
  const totalAssetPerYear = dataPerYear(stockRepository.getTotalAsset);
  const operatingCashFlowPerYear = dataPerYear(stockRepository.getOperatingCashFlow);
  const netOperatingCashFlowPerYear = dataPerYear(stockRepository.getNetOperatingCashFlow);
  const nocFpsPerYear = dataPerYear(stockRepository.getNetProfit);

  // Honesty Ratios
  // ToDo: Dividend Payout
  const capexRatioPerYear = ratioPerYear(year => scripAnalysis.getCapexRatio(year));
  const ppeTurnoverPerYear = ratioPerYear(year => scripAnalysis.getPpeTurnover(year));
  
  // Profitability
  const grossProfitMarginsPerYear = ratioPerYear(year => scripAnalysis.getGrossProfitMargin(year));
  const operatingProfitMarginsPerYear =
    ratioPerYear(year => scripAnalysis.getOperatingProfitMargin(year));
  const netProfitMarginsPerYear = ratioPerYear(year => scripAnalysis.getNetProfitMargin(year));
  
  // Management Efficiency
  const roePerYear = ratioPerYear(year => scripAnalysis.getRoE(year));
  const rocePerYear = ratioPerYear(year => scripAnalysis.getRoCE(year));
  const debtToEquityPerYear = ratioPerYear(year => scripAnalysis.getDebtToEquity(year));
  
  // Growth as Percentage
  const revenueGrowth = growthPerYear((year1, year2) => scripAnalysis.getRevenueGrowth(year1, year2)*100);
  const operatingProfitGrowth = growthPerYear((year1, year2) => scripAnalysis.getOpProfitGrowth(year1, year2)*100);
  const netProfitGrowth = growthPerYear(
    (year1, year2) => scripAnalysis.getNetProfitGrowth(year1, year2)*100
  );
  const netOpCFGrowth = growthPerYear(
    (year1, year2) => scripAnalysis.getNetOperatingCFGrowth(year1, year2)*100
  );
  
  const netProfitCAGR = scripAnalysis.getNetProfitCAGR(Number(upcomingYear) - 1, fromYear);
  const operatingProfitCAGR = scripAnalysis.getOperatingProfitCAGR(Number(upcomingYear) - 1, fromYear);
  const revenueCAGR = scripAnalysis.getRevenueCAGR(Number(upcomingYear) - 1, fromYear);
  
  // Valuation
  // Approx Data of Upcoming Year
  const approxNetProfit = scripAnalysis.getAnnualizedApproxNetProfit(upcomingYear, considerHalfYearly, availableQuarter)
  const approxOpProfit = scripAnalysis.getAnnualizedApproxOperatingProfit(upcomingYear, considerHalfYearly, availableQuarter)
  const approxEps = scripAnalysis.getAnnualizedApproxEps(upcomingYear, considerHalfYearly, availableQuarter)
  epsPerYear[upcomingYear] = approxEps;
  netProfitPerYear[upcomingYear] = approxNetProfit;
  operatingProfitPerYear[upcomingYear] = approxOpProfit;

  const fcfPerYear = ratioPerYear(year => scripAnalysis.getFreeCashFlow(year));
  const fcfCAGR =
    scripAnalysis.getCAGR(fcfPerYear[fromYear], fcfPerYear[Number(upcomingYear) - 1], years);
  const PE = (Number(marketPrice)/approxEps).toFixed(3);
}
