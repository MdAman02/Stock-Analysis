const getDataList = data => columnHeaders.map(year => data[year] || '');

const columnHeaders = [ '2019', '2020', '2021', '2022', '2023' ];
const data = {
    '2019': 336.3,
    '2020': 392.4,
    '2021': 497.8,
    '2022': 604.8,
    '2023': 604.2
  };

const r = getDataList(data);
console.log(r);
