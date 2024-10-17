const _ = require('underscore');
const stockAnalysisService = require('../services/stockAnalysis.service');
const { getLabel } = require('../lib/helper');

exports.getScripAnalytics = async () => {
  const scrip = 'heidelbcem';
  const timeline = {
    fromYear: '2021',
    upcomingYear: '2024'
  };

  const analytics = await stockAnalysisService.getScripAnalytics(scrip, timeline);
  console.log(analytics);

  const {
    current,
    ...data
  } = analytics;

  const highlightRows = [
    'Highlight',
    ...Object.keys(current).map(key => {
      return [getLabel(key), Number(current[key]*100).toFixed()+'%'].join(',')
    }),
    '', '', ''
  ];

  const columnHeaders = Object.keys(data.netProfitPerYear).sort();
  const getDataList = data => columnHeaders.map(year => _.isNumber(data[year]) ? Number(data[year]).toFixed(2) : '');
  const getRowHeader = key => {
    const reg = /(\w+)PerYear/i;
    return getLabel(key.match(reg)[1]);
  };
  
  const dataRows = Object.keys(data)
  .map(category => {
    const dataList = getDataList(data[category]);
    dataList.unshift(getRowHeader(category));
    return dataList.join(',');
  })
  
  columnHeaders.unshift(scrip.toUpperCase());
  const firstRow = columnHeaders.join(',');
  dataRows.unshift(firstRow);

  const csvString = [ ...highlightRows, ...dataRows ].join('\t\n');
  require('fs').writeFileSync(
    `./results/${scrip}_stat_${timeline.fromYear}-${timeline.upcomingYear}.csv`,
    csvString
  );
}

this.getScripAnalytics();
