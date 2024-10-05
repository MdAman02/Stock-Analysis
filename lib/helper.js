exports.getFinReportSegmentName = (year, halfYearly, quarter) => {
  if (!halfYearly && !quarter)
    return String(year);
  return quarter ? `${year}-${quarter}` : `${year}-H1`;
}

exports.getWeightedAverage = (values, weights) => {
  const total = values.reduce((sum, value, index) => sum + value * weights[index], 0);
  return total/weights.reduce((sum, w) => sum + w, 0);
}

exports.roundTo = (num, precision = 2) => {
  const factor = Math.pow(10, precision);
  return Math.round(Number(num)*factor) / factor;
}

exports.getLabel = field =>
  field
  .replace(/[A-Z]+/g, v => ` ${v}`)
  .replace(/[.]+/g, () => ' ')
  .replace(/\b[a-z]/gi, v => v.toUpperCase());
