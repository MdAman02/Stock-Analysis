// Data GET
// REQUIREMENTS: 
// income statement schema
// cash flow schema
// 
const prompt = require('prompt');
const fs = require('fs');
const { scripSchema, reportSegmentMap } = require('./schemas');


const getReportSegInp = async () => {
  return prompt.get({ properties: {
    report: { type: 'string', enum: [...Object.keys(reportSegmentMap), 'save'], description: `Accepted values: ${Object.keys(reportSegmentMap).join(',')} or save` }
  } });
}

exports.getFinData = async () => {
  prompt.start();
  const {
    symbol,
    year,
    quarterly,
    quarter,
    numericMultiple
  } = await prompt.get(scripSchema);

  const files = fs.readdirSync('./data');
  const relevantFile = files.find(name => String(name).includes(symbol));

  let stockData;
  if (relevantFile)
    stockData = JSON.parse(fs.readFileSync(`./data/${relevantFile}`));
  else stockData = { symbol };

  const dataPropertyName = quarterly ? `${String(year).toUpperCase()}_${String(quarter).toUpperCase()}` : year;
  const finData = stockData[dataPropertyName] || {};
  
  let { report } = await getReportSegInp();
  while(report != 'save') {
    const res = await prompt.get(reportSegmentMap[report]);
    finData[report] = { ...res, numericMultiple };
    ({ report } = await getReportSegInp())
  }
  stockData[dataPropertyName] = finData;
  fs.writeFileSync(`./data/${symbol}.json`, JSON.stringify(stockData));
  await prompt.stop();
};

this.getFinData();
