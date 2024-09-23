const fs = require('fs');
const { scripTimeline, checkData } = require('../domain/helpers');

const cache = {};

exports.getCurrentScripData = async scrip => {
  if (cache[scrip]) return cache[scrip];

  const scripData = fs.readFileSync(`./data/${scrip}.json`);
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
  const specificTimeData = scripData[scripTimeLine.getFinReportSegmentName()];

  const { FINANCIAL_POSITION = {} } = specificTimeData;
  const { totalEquity } = FINANCIAL_POSITION;

  checkData({ totalEquity });

  return totalEquity;
}

/**
 * 
 * @param {string} scrip 
 * @param {scripTimeline} scripTimeLine 
 */
exports.getTotalAsset = async (scrip, scripTimeLine) => {
  const scripData = await this.getCurrentScripData(scrip);
  const specificTimeData = scripData[scripTimeLine.getFinReportSegmentName()];

  const { FINANCIAL_POSITION = {} } = specificTimeData;
  const { totalAsset } = FINANCIAL_POSITION;

  checkData({ totalAsset });

  return totalAsset;
}


/**
 * 
 * @param {string} scrip 
 * @param {scripTimeline} scripTimeLine 
 */
exports.getNetProfit = async (scrip, scripTimeLine) => {
  const scripData = await this.getCurrentScripData(scrip);
  const specificTimeData = scripData[scripTimeLine.getFinReportSegmentName()];

  const { INCOME_EXPENSE = {} } = specificTimeData;
  const { netProfit } = INCOME_EXPENSE;

  checkData({ netProfit });

  return netProfit;
}

/**
 * 
 * @param {string} scrip 
 * @param {scripTimeline} scripTimeLine 
 */
exports.getOperatingProfit = async (scrip, scripTimeLine) => {
  const scripData = await this.getCurrentScripData(scrip);
  const specificTimeData = scripData[scripTimeLine.getFinReportSegmentName()];

  const { INCOME_EXPENSE = {} } = specificTimeData;
  const { operatingProfit } = INCOME_EXPENSE;

  checkData({ operatingProfit });

  return operatingProfit;
}

/**
 * 
 * @param {string} scrip 
 * @param {scripTimeline} scripTimeLine 
 */
exports.getEps = async (scrip, scripTimeLine) => {
  const scripData = await this.getCurrentScripData(scrip);
  const specificTimeData = scripData[scripTimeLine.getFinReportSegmentName()];

  const { INCOME_EXPENSE = {} } = specificTimeData;
  const { eps } = INCOME_EXPENSE;

  checkData({ eps });

  return eps;
}

/**
 * 
 * @param {string} scrip 
 * @param {scripTimeline} scripTimeLine 
 */
exports.getOperatingCashFlow = async (scrip, scripTimeLine) => {
  const scripData = await this.getCurrentScripData(scrip);
  const specificTimeData = scripData[scripTimeLine.getFinReportSegmentName()];

  const { CASH_FLOW = {} } = specificTimeData;
  const { opCashFlow } = CASH_FLOW;

  checkData({ opCashFlow });

  return opCashFlow;
}

/**
 * 
 * @param {string} scrip 
 * @param {scripTimeline} scripTimeLine 
 */
exports.getNetOperatingCashFlow = async (scrip, scripTimeLine) => {
  const scripData = await this.getCurrentScripData(scrip);
  const specificTimeData = scripData[scripTimeLine.getFinReportSegmentName()];

  const { CASH_FLOW = {} } = specificTimeData;
  const { netOpCashFlow } = CASH_FLOW;

  checkData({ netOpCashFlow });

  return netOpCashFlow;
}

/**
 * 
 * @param {string} scrip 
 * @param {scripTimeline} scripTimeLine 
 */
exports.getNocFps = async (scrip, scripTimeLine) => {
  const scripData = await this.getCurrentScripData(scrip);
  const specificTimeData = scripData[scripTimeLine.getFinReportSegmentName()];

  const { CASH_FLOW = {} } = specificTimeData;
  const { nocfps } = CASH_FLOW;

  checkData({ nocfps });

  return nocfps;
}
