import React, { useMemo, useState } from 'react';
import MaturityElementList from '../MaturityElementList';
import { percentageToStatus } from '../../utils';
import { STATUSES } from '../../constants';
import rules from '../../rules';
import { SegmentedControl, SegmentedControlItem } from 'nr1';

export default function MaturityContainer(props) {
  const {
    history,
    selected,
    selectedAccountId,
    entitySearchQuery,
    isUserDefault,
  } = props;
  const [view, setView] = useState('summary');

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
        <SegmentedControl
          type={SegmentedControl.TYPE.ICONS_ONLY}
          value={view}
          onChange={(evt, value) => setView(value)}
        >
          <SegmentedControlItem
            label="Summary"
            value="summary"
            iconType={
              SegmentedControlItem.ICON_TYPE
                .HARDWARE_AND_SOFTWARE__SOFTWARE__CONTROL_CENTER
            }
          />
          <SegmentedControlItem
            label="Scores"
            value="charts"
            iconType={
              SegmentedControlItem.ICON_TYPE.DATAVIZ__DATAVIZ__LINE_CHART
            }
          />
          <SegmentedControlItem
            label="Table"
            value="table"
            iconType={SegmentedControlItem.ICON_TYPE.INTERFACE__VIEW__LIST_VIEW}
          />
        </SegmentedControl>

        <MaturityElementList
          view={view}
          entitySearchQuery={entitySearchQuery}
          elements={scoredCollection}
          historyId={selectedHistory.id}
          selectedAccountId={selectedAccountId}
          isUserDefault={isUserDefault}
        />
      </>
    );
  }, [history, selected, view]);
}
