const _ = require('underscore');
const { getWeightedAverage } = require('./lib/helper');

const t = [
  '2023', '2023-H1', '2024-Q2', '2023-Q1', '2023-Q2',
]

const o = {
 '2023': 'dsada'
};

const v = [2, 5, 3];
const w = [2, 1, 1];

let f = ['2024', '2023-Q1', '2023-H1'];
f = f.filter(key => {
  const r = key.search(new RegExp(`([0-9]{4}$|.+H1)`, 'gi'))
  console.log(r);
  return r !== -1;
});

console.log(f);
