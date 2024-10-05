// Data GET
// REQUIREMENTS: 
// income statement schema
// cash flow schema
// 
const prompt = require('prompt');
const fs = require('fs');
const { scripSchema, reportSegmentMap } = require('./schemas');
const { getFinReportSegmentName } = require('../helper');


const getReportSegInp = async () => {
  return prompt.get({ properties: {
    reportPart: { type: 'string', enum: [...Object.keys(reportSegmentMap), 'save'], description: `Accepted values: ${Object.keys(reportSegmentMap).join(',')} or save` }
  } });
}

exports.getFinData = async () => {
  prompt.start();
  const {
    symbol,
    year,
    halfYearly,
    quarter,
    numericMultiple,
  } = await prompt.get(scripSchema);

  const files = fs.readdirSync('./data');
  const relevantFile = files.find(name => String(name).includes(symbol));

  let stockData;
  if (relevantFile)
    stockData = JSON.parse(fs.readFileSync(`./data/${relevantFile}`));
  else stockData = { symbol, financialData: {} };


  const finReportField = getFinReportSegmentName(year, halfYearly, quarter);
  const finData = stockData.financialData[finReportField] || {};
  
  // Balance or Income or Cash Flow
  let { reportPart } = await getReportSegInp();
  while(reportPart != 'save') {
    if (finData[reportPart]?.numericMultiple)
      console.warn(`Using numeric multiple: ${finData[reportPart].numericMultiple} from existing data`)

    const res = await prompt.get(reportSegmentMap[reportPart]);
    finData[reportPart] = {
      ...(finData[reportPart]),
      ...res,
      numericMultiple: finData[reportPart]?.numericMultiple || numericMultiple,
    };
    ({ reportPart } = await getReportSegInp())
  }
  stockData.financialData[finReportField] = finData;
  fs.writeFileSync(`./data/${symbol}.json`, JSON.stringify(stockData));
  await prompt.stop();
};

this.getFinData();
