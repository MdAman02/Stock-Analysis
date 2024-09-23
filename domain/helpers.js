const _ = require('underscore');
const { getFinReportSegmentName } = require("../lib/helper");
const { DataNotPresentError } = require("./domainError");

exports.getData = (financialData, year, halfYearly, quarter) => {
  const data = financialData[getFinReportSegmentName(year, halfYearly, quarter)];
  if (_.isEmpty(data))
    throw new DataNotPresentError();
  return data;
}
  
exports.checkData = data => {
  const nullKeys = Object.keys(data).filter(key => data[key]);
  if (!nullKeys.length)
    throw new DataNotPresentError(nullKeys);
}

exports.scripTimeline = class {
  year;
  halfYearly;
  quarter;

  constructor(year, halfYearly, quarter) {
    this.year = year;
    this.halfYearly = halfYearly;
    this.quarter = quarter;
  }

  getFinReportSegmentName() {
    return getFinReportSegmentName(this.year, this.halfYearly, this.quarter);
  }
}
