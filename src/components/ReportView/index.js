import React, { useMemo, useContext } from 'react';
import { Button, EmptyState } from 'nr1';
import DataContext from '../../context/data';
import { scoreToColor, percentageToStatus } from '../../utils';
import { STATUSES } from '../../constants';
import rules from '../../rules';
import MaturityElementList from '../MaturityElementList';

export default function ReportView(props) {
  return useMemo(() => {
    console.log('props', props);

    const { history, selected } = props;
    const selectedHistory = history[selected];
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

    return (
      <>
        <MaturityElementList elements={scoredCollection} />
      </>
    );
  }, [props]);
}
