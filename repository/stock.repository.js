const fs = require('fs');
const { scripTimeline, checkData } = require('../domain/helpers');

const cache = {};

exports.getCurrentScripData = async scrip => {
  if (cache[scrip]) return cache[scrip];

  const scripData = JSON.parse(fs.readFileSync(`./data/${scrip}.json`));
  cache[scrip] = scripData;
  return scripData;
}

/**
 * 
 * @param {string} scrip 
 * @param {scripTimeline} scripTimeLine 
 */
exports.getEquity = async (scrip, scripTimeLine) => {
  const scripData = await this.getCurrentScripData(scrip);
  const specificTimeData = scripData.financialData[scripTimeLine.getFinReportSegmentName()];

  const { FINANCIAL_POSITION = {} } = specificTimeData;
  const { totalEquity } = FINANCIAL_POSITION;

  checkData(scripTimeLine, { totalEquity });

  return totalEquity;
}

/**
 * 
 * @param {string} scrip 
 * @param {scripTimeline} scripTimeLine 
 */
exports.getTotalAsset = async (scrip, scripTimeLine) => {
  const scripData = await this.getCurrentScripData(scrip);
  const specificTimeData = scripData.financialData[scripTimeLine.getFinReportSegmentName()];

  const { FINANCIAL_POSITION = {} } = specificTimeData;
  const { totalAsset } = FINANCIAL_POSITION;

  checkData(scripTimeLine, { totalAsset });

  return totalAsset;
}

/**
 * 
 * @param {string} scrip 
 * @param {scripTimeline} scripTimeLine 
 */
exports.getTotalLiability = async (scrip, scripTimeLine) => {
  const scripData = await this.getCurrentScripData(scrip);
  const specificTimeData = scripData.financialData[scripTimeLine.getFinReportSegmentName()];

  const { FINANCIAL_POSITION = {} } = specificTimeData;
  const { totalLiability } = FINANCIAL_POSITION;

  checkData(scripTimeLine, { totalLiability });

  return totalLiability;
}

/**
 * 
 * @param {string} scrip 
 * @param {scripTimeline} scripTimeLine 
 */
exports.getCurrentAsset = async (scrip, scripTimeLine) => {
  const scripData = await this.getCurrentScripData(scrip);
  const specificTimeData = scripData.financialData[scripTimeLine.getFinReportSegmentName()];

  const { FINANCIAL_POSITION = {} } = specificTimeData;
  const { currentAsset } = FINANCIAL_POSITION;

  checkData(scripTimeLine, { currentAsset });

  return Number(currentAsset);
}

/**
 * 
 * @param {string} scrip 
 * @param {scripTimeline} scripTimeLine 
 */
exports.getCurrentLiability = async (scrip, scripTimeLine) => {
  const scripData = await this.getCurrentScripData(scrip);
  const specificTimeData = scripData.financialData[scripTimeLine.getFinReportSegmentName()];

  const { FINANCIAL_POSITION = {} } = specificTimeData;
  const { currentLiability } = FINANCIAL_POSITION;

  checkData(scripTimeLine, { currentLiability });

  return Number(currentLiability);
}

/**
 * 
 * @param {string} scrip 
 * @param {scripTimeline} scripTimeLine 
 */
exports.getNonCurrentAsset = async (scrip, scripTimeLine) => {
  const scripData = await this.getCurrentScripData(scrip);
  const specificTimeData = scripData.financialData[scripTimeLine.getFinReportSegmentName()];

  const { FINANCIAL_POSITION = {} } = specificTimeData;
  const { nonCurrentAsset } = FINANCIAL_POSITION;

  checkData(scripTimeLine, { nonCurrentAsset });

  return Number(nonCurrentAsset);
}

/**
 * 
 * @param {string} scrip 
 * @param {scripTimeline} scripTimeLine 
 */
exports.getNonCurrentLiability = async (scrip, scripTimeLine) => {
  const scripData = await this.getCurrentScripData(scrip);
  const specificTimeData = scripData.financialData[scripTimeLine.getFinReportSegmentName()];

  const { FINANCIAL_POSITION = {} } = specificTimeData;
  const { nonCurrentLiability } = FINANCIAL_POSITION;

  checkData(scripTimeLine, { nonCurrentLiability });

  return Number(nonCurrentLiability);
}

/**
 * 
 * @param {string} scrip 
 * @param {scripTimeline} scripTimeLine 
 */
exports.getRevenue = async (scrip, scripTimeLine) => {
  const scripData = await this.getCurrentScripData(scrip);
  const specificTimeData = scripData.financialData[scripTimeLine.getFinReportSegmentName()];

  const { INCOME_EXPENSE = {} } = specificTimeData;
  const { revenue } = INCOME_EXPENSE;

  checkData(scripTimeLine, { revenue });

  return revenue;
}

/**
 * 
 * @param {string} scrip 
 * @param {scripTimeline} scripTimeLine 
 */
exports.getNetProfit = async (scrip, scripTimeLine) => {
  const scripData = await this.getCurrentScripData(scrip);
  const specificTimeData = scripData.financialData[scripTimeLine.getFinReportSegmentName()];

  const { INCOME_EXPENSE = {} } = specificTimeData;
  const { netProfit } = INCOME_EXPENSE;

  checkData(scripTimeLine, { netProfit });

  return netProfit;
}

/**
 * 
 * @param {string} scrip 
 * @param {scripTimeline} scripTimeLine 
 */
exports.getOperatingProfit = async (scrip, scripTimeLine) => {
  const scripData = await this.getCurrentScripData(scrip);
  const specificTimeData = scripData.financialData[scripTimeLine.getFinReportSegmentName()];

  const { INCOME_EXPENSE = {} } = specificTimeData;
  const { operatingProfit } = INCOME_EXPENSE;

  checkData(scripTimeLine, { operatingProfit });

  return operatingProfit;
}

/**
 * 
 * @param {string} scrip 
 * @param {scripTimeline} scripTimeLine 
 */
exports.getEps = async (scrip, scripTimeLine) => {
  const scripData = await this.getCurrentScripData(scrip);
  const specificTimeData = scripData.financialData[scripTimeLine.getFinReportSegmentName()];

  const { INCOME_EXPENSE = {} } = specificTimeData;
  const { eps } = INCOME_EXPENSE;

  checkData(scripTimeLine, { eps });

  return eps;
}

/**
 * 
 * @param {string} scrip 
 * @param {scripTimeline} scripTimeLine 
 */
exports.getOperatingCashFlow = async (scrip, scripTimeLine) => {
  const scripData = await this.getCurrentScripData(scrip);
  const specificTimeData = scripData.financialData[scripTimeLine.getFinReportSegmentName()];

  const { CASH_FLOW = {} } = specificTimeData;
  const { opCashFlow } = CASH_FLOW;

  checkData(scripTimeLine, { opCashFlow });

  return opCashFlow;
}

/**
 * 
 * @param {string} scrip 
 * @param {scripTimeline} scripTimeLine 
 */
exports.getNetOperatingCashFlow = async (scrip, scripTimeLine) => {
  const scripData = await this.getCurrentScripData(scrip);
  const specificTimeData = scripData.financialData[scripTimeLine.getFinReportSegmentName()];

  const { CASH_FLOW = {} } = specificTimeData;
  const { netOpCashFlow } = CASH_FLOW;

  checkData(scripTimeLine, { netOpCashFlow });

  return netOpCashFlow;
}

/**
 * 
 * @param {string} scrip 
 * @param {scripTimeline} scripTimeLine 
 */
exports.getNocFps = async (scrip, scripTimeLine) => {
  const scripData = await this.getCurrentScripData(scrip);
  const specificTimeData = scripData.financialData[scripTimeLine.getFinReportSegmentName()];

  const { CASH_FLOW = {} } = specificTimeData;
  const { nocfps } = CASH_FLOW;

  checkData(scripTimeLine, { nocfps });

  return nocfps;
}

/**
 * 
 * @param {string} scrip 
 * @param {scripTimeline} scripTimeLine 
 */
exports.getCashAndEquivalent = async (scrip, scripTimeLine) => {
  const scripData = await this.getCurrentScripData(scrip);
  const specificTimeData = scripData.financialData[scripTimeLine.getFinReportSegmentName()];

  const { FINANCIAL_POSITION = {} } = specificTimeData;
  const { cashAndEquivalent } = FINANCIAL_POSITION;

  checkData(scripTimeLine, { cashAndEquivalent });

  return Number(cashAndEquivalent);
}
