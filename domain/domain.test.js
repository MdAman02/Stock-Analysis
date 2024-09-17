const { financialAnalysis } = require("./formula")

// only eps valid for test
const testData = {
  financialData: {
    "2023": {
      "FINANCIAL_POSITION": {
        "ppe": 4535,
        "inProgressCapWork": 5435,
        "currentAsset": 5345,
        "nonCurrentAsset": 5435,
        "totalAsset": 5435,
        "equity": 5435,
        "currentLiability": 543,
        "nonCurrentLiability": 543,
        "totalLiability": 534,
        "longTermLoan": 5435,
        "shortTermLoan": 534,
        "currentLongTermLoan": 543,
        "nav": 534,
        "numericMultiple": 1000000
      },
      "INCOME_EXPENSE": {
        "revenue": 543,
        "grossProfit": 5435,
        "operatingProfit": 543,
        "netProfit": 543,
        "eps": 10,
        "numericMultiple": 1000000
      }
    },
    "2023-H1": {
      "FINANCIAL_POSITION": {},
      "INCOME_EXPENSE": {
        "eps": 4,
        "numericMultiple": 1000000
      }
    },
    "2022": {
      "INCOME_EXPENSE": {
        "eps": 9,
        "numericMultiple": 1000000
      }
    },
    "2022-H1": {
      "FINANCIAL_POSITION": {},
      "INCOME_EXPENSE": {
        "eps": 3,
        "numericMultiple": 1000000
      }
    },
    "2024-H1": {
      "INCOME_EXPENSE": {
        "eps": 6,
        "numericMultiple": 1000000
      }
    }
  },
  "symbol": "square"
}

let finAnalysis = new financialAnalysis({});

beforeAll(() => {
  finAnalysis = new financialAnalysis(testData);
})

describe('Calculate finance from historical ratio', () => {
  let initialApproxEpsRes = 16.2, year = '2024', halfYearly = true;
  test('should calculate eps correctly', () => {
    expect(finAnalysis.getAnnualizedApproxEps(year, halfYearly)).toBe(initialApproxEpsRes);
  });

  test('Should increase eps if nearest yearly/quarterly ratio increase', () => {
    testData.financialData['2023'].INCOME_EXPENSE.eps += 2;
    finAnalysis = new financialAnalysis(testData);
    expect(finAnalysis.getAnnualizedApproxEps(year, halfYearly)).toBeGreaterThan(initialApproxEpsRes);
  })
})
