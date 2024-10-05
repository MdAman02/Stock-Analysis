const service = require('./services/stockAnalysis.service');

async function test() {
  const input = {
    scrip: 'bxpharma',
    timeline: {
      fromYear: '2019',
      upcomingYear: '2024',
      considerHalfYearly: false,
      availableQuarter: 'Q3'
    },
    marketData: { marketPrice: 73 }
  };

  const res = await service.getScripAnalytics(
    input.scrip,
    input.timeline,
    input.marketData
  );

  console.log(res);
}

test();
