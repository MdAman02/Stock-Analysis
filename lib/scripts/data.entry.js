// Data GET
// REQUIREMENTS: 
// income statement schema
// cash flow schema
// 
const prompt = require('prompt');
const fs = require('fs');
const { scripSchema, reportSegmentMap } = require('./schemas');
const { getFinReportSegmentName } = require('../helper');
const { mapSeries } = require('async');


const getReportSegInp = async () => {
  return prompt.get({ properties: {
    reportPart: { type: 'string', enum: [...Object.keys(reportSegmentMap), 'save'], description: `Accepted values: ${Object.keys(reportSegmentMap).join(',')} or save` }
  } });
}

exports.fillSpecificData = async () => {
  const { symbol } = await prompt.get({ properties: { symbol: {
    type: 'string', required: true,
  }}});

  let { reportPart } = await getReportSegInp();
  const inputItems = [];
  while(1) {
    const { item } = await prompt.get({ properties: {
      item: { type: 'string', description: `Financial Report entry or init` }
    }});
    if (item === 'init') break;
    inputItems.push(item);
  }

  const files = fs.readdirSync('./data');
  const relevantFile = files.find(name => String(name).includes(symbol));

  let stockData;
  if (relevantFile)
    stockData = JSON.parse(fs.readFileSync(`./data/${relevantFile}`));
  else stockData = { symbol, financialData: {} };


  const availableDataTimelines = Object.keys(stockData.financialData);
  await mapSeries(availableDataTimelines, async timeline => {
    console.log(`Data Entry For ${symbol} for the year: ${timeline}`);
    const finData = stockData.financialData[timeline] || {};

    const res = await prompt.get(inputItems.reduce((schema, item) => {
      schema.properties[item] = { type: 'number', required: true };
      return schema;
    }, { properties: {} }));

    finData[reportPart] = {
      ...(finData[reportPart]),
      ...res,
    };
  });
  fs.writeFileSync(`./data/${symbol}.json`, JSON.stringify(stockData));
  console.info('Done');
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


  const finReportTimeline = getFinReportSegmentName(year, halfYearly, quarter);
  const finData = stockData.financialData[finReportTimeline] || {};
  
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
  stockData.financialData[finReportTimeline] = finData;
  fs.writeFileSync(`./data/${symbol}.json`, JSON.stringify(stockData));
  await prompt.stop();
};

// this.getFinData();
this.fillSpecificData();
