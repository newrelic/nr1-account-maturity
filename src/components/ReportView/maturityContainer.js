import React, { useMemo } from 'react';
import MaturityElementList from '../MaturityElementList';
import { percentageToStatus } from '../../utils';
import { STATUSES } from '../../constants';
import rules from '../../rules';
import HistorySelector from './historySelector';

export default function MaturityContainer(props) {
  const {
    history,
    selected,
    selectedAccountId,
    entitySearchQuery,
    isUserDefault,
  } = props;

  const selectedHistory = history.find(
    (h) => h.document.runAt === selected
  ) || [selected];

  const { accountSummaries } = selectedHistory?.document || {};
  const scoredCollection = (accountSummaries || []).map((a) => {
    const elementScores = [];

    Object.keys(rules).forEach((key) => {
      const value = a[key];

      if (value !== undefined && value !== null) {
        const payload = {
          name: key,
          status: percentageToStatus(value),
          score: `${Math.round(value)}%`,
        };

        elementScores.push(payload);
      }
    });

    const payload = {
      title: a.name,
      subtitle: a.id,
      rollUpScore: Math.round((a.totalScore / a.maxScore) * 100),
      rollUpStatus: STATUSES.UNKNOWN,
      elementListLabel: 'Products',
      elementScores,
    };

    payload.rollUpStatus = percentageToStatus(payload.rollUpScore);

    return payload;
  });

  return useMemo(() => {
    return (
      <>
        <HistorySelector
          history={history}
          accountId={selectedAccountId}
          isUserDefault={isUserDefault}
        />
        <MaturityElementList
          entitySearchQuery={entitySearchQuery}
          elements={scoredCollection}
          historyId={selectedHistory.id}
          selectedAccountId={selectedAccountId}
          isUserDefault={isUserDefault}
        />
      </>
    );
  }, [history, selected]);
}
