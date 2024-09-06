const fs = require('fs');

exports.getFinancialData = async (scrip, year, quarter) => {
  const data = fs.readFileSync(`./data/${scrip}.json`);
  return quarter
    ? data[`${year}_${String(quarter).toUpperCase()}`]
    : data[`${year}`];
}
