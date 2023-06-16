import { sortSummaries } from '../components/SortBy';
import { STATUSES } from '../constants';

export const chunk = (arr, size) =>
  Array.from({ length: Math.ceil(arr.length / size) }, (v, i) =>
    arr.slice(i * size, i * size + size)
  );

export const percentageToStatus = (value) => {
  if (value !== null && value !== undefined) {
    if (value <= 50) {
      return STATUSES.CRITICAL;
    } else if (value < 80 && value > 50) {
      return STATUSES.WARNING;
    } else if (value >= 80) {
      return STATUSES.SUCCESS;
    }
  }

  return STATUSES.UNKNOWN;
};

export const generateAccountSummary = (accounts, sortBy) => {
  const accountSummaries = [];

  accounts.forEach((account) => {
    const { name, id, scores } = account;
    const summary = { name, id, totalScore: 0, maxScore: 0 };

    Object.keys(scores).forEach((key) => {
      const { overallScore, maxScore } = scores[key];
      summary[key] = (overallScore / maxScore) * 100;
      summary.maxScore += 100;
      summary.totalScore += summary[key];
    });

    accountSummaries.push(summary);
  });

  return sortSummaries(accountSummaries, sortBy);
};
