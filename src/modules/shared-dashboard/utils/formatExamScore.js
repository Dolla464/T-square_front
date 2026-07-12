/**
 * Format exam score for display: 100.00 → 100, 75.5 → 75.5
 */
export function formatExamScore(value) {
  if (value == null || value === "") return "0";
  const num = Number(value);
  if (Number.isNaN(num)) return String(value);
  if (Number.isInteger(num) || num % 1 === 0) {
    return String(Math.round(num));
  }
  return String(parseFloat(num.toFixed(2)));
}

export function formatExamScorePair(score, total) {
  const formattedScore = formatExamScore(score);
  const formattedTotal =
    total != null && total !== "" ? formatExamScore(total) : null;
  return formattedTotal != null
    ? `${formattedScore} / ${formattedTotal}`
    : `${formattedScore} / N/A`;
}
