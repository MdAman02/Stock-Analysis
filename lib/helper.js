exports.getFinReportSegmentName = (year, halfYearly, quarter) => {
  if (!halfYearly && !quarter)
    return String(year);
  return quarter ? `${year}-${quarter}` : `${year}-H1`;
}

exports.getWeightedAverage = (values, weights) => {
  const total = values.reduce((sum, value, index) => sum + value * weights[index], 0);
  return total/weights.reduce((sum, w) => sum + w, 0);
}
