import { sortSummaries } from '../components/SortBy';
import { STATUSES } from '../constants';
import rules from '../rules';

export const chunk = (arr, size) =>
  Array.from({ length: Math.ceil(arr.length / size) }, (v, i) =>
    arr.slice(i * size, i * size + size)
  );

export const scoreToColor = (value) => {
  if (value === null || value === undefined) {
    return { color: '#9ea5a9' };
  } else if (value >= 0 && value <= 50) {
    return { color: '#f5554b', fontColor: '#FAFBFB' };
  } else if (value >= 51 && value < 70) {
    return { color: '#f07a0e', fontColor: '#293338' };
  } else if (value >= 70 && value < 80) {
    return { color: '#ffd23d', fontColor: '#FAFBFB' };
  } else if (value >= 80) {
    return { color: '#01a76a', fontColor: '#FAFBFB' };
  }
};

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

export const generateAccountSummary = (accounts, sortBy, report) => {
  const accountSummaries = [];

  accounts.forEach((account) => {
    const { name, id, scores } = account;
    const summary = { name, id, totalScore: 0, maxScore: 0 };

    Object.keys(scores).forEach((key) => {
      if (
        report?.document?.allProducts ||
        (report?.document?.products || []).includes(key)
      ) {
        const { overallScore, maxScore, offendingEntities } = scores[key];

        (rules[key].scores || []).forEach((scoreKey) => {
          if (!summary[`${key}.scoring`]) {
            summary[`${key}.scoring`] = {};
          }

          summary[`${key}.scoring`][scoreKey.name] = scores[key][scoreKey.name];
        });

        summary[`${key}.entities`] = offendingEntities;

        if (overallScore !== null && maxScore !== null) {
          summary[key] = (overallScore / maxScore) * 100;
          summary[key] = isNaN(summary[key]) ? 0 : summary[key];
          summary.maxScore += 100;
          summary.totalScore += summary[key];
        }
      }
    });

    summary.scorePercentage = (summary.totalScore / summary.maxScore) * 100;

    summary.scorePercentage = isNaN(summary.scorePercentage)
      ? 0
      : summary.scorePercentage;

    accountSummaries.push(summary);
  });

  return sortSummaries(accountSummaries, sortBy);
};

export const flattenJSON = (obj = {}, res = {}, extraKey = '') => {
  for (let key in obj) {
    if (typeof obj[key] !== 'object') {
      res[extraKey + key] = obj[key];
    } else {
      flattenJSON(obj[key], res, `${extraKey}${key}.`);
    }
  }
  return res;
};
