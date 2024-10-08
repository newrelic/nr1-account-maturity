import React, { useMemo, useState } from 'react';
import MaturityElementList from '../MaturityElementList';
import { flattenJSON, percentageToStatus } from '../../utils';
import { STATUSES } from '../../constants';
import rules from '../../rules';
import { SegmentedControl, SegmentedControlItem } from 'nr1';
import CsvDownloadButton from 'react-json-to-csv';

export default function MaturityContainer(props) {
  const {
    history,
    selected,
    selectedAccountId,
    entitySearchQuery,
    isUserDefault,
  } = props;
  const [view, setView] = useState('summary');
  const [groupBy, setGroupBy] = useState('account');

  const selectedHistory = history.find(h => h.document.runAt === selected) || [
    selected,
  ];

  const { accountSummaries } = selectedHistory?.document || {};

  let scoredCollection = [];

  if (groupBy === 'account') {
    scoredCollection = (accountSummaries || []).map(a => {
      const elementScores = [];

      Object.keys(rules).forEach(key => {
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
        elementListLabel: 'Capabilities',
        elementScores,
      };

      payload.rollUpStatus = percentageToStatus(payload.rollUpScore);

      return payload;
    });
  } else if (groupBy === 'product') {
    scoredCollection = Object.keys(rules)
      .filter(product =>
        accountSummaries.find(
          a => a[product] !== null && a[product] !== undefined
        )
      )
      .map(product => {
        const elementScores = [];
        let totalScore = 0;

        accountSummaries.forEach(account => {
          const value = account[product];
          totalScore += value;

          if (value !== undefined && value !== null) {
            const payload = {
              name: account.name,
              id: account.id,
              status: percentageToStatus(value),
              score: `${Math.round(value)}%`,
            };

            elementScores.push(payload);
          }
        });

        const payload = {
          title: product,
          // subtitle: account.id,
          rollUpScore: Math.round(
            (totalScore / (accountSummaries.length * 100)) * 100
          ),
          rollUpStatus: STATUSES.UNKNOWN,
          elementListLabel: 'Capabilities',
          elementScores,
        };

        payload.rollUpStatus = percentageToStatus(payload.rollUpScore);

        return payload;
      });
  }

  return useMemo(() => {
    const jsonCsvData = (selectedHistory?.document?.accountSummaries || []).map(
      a => {
        let accountData = {
          id: a.id,
          name: a.name,
        };

        Object.keys(rules).forEach(product => {
          const scoring = a[`${product}.scoring`];

          if (scoring) {
            const flatScoring = flattenJSON(scoring);
            accountData = { ...accountData, ...flatScoring };
          }
        });

        return accountData;
      }
    );

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
            label="Navigator"
            value="navigator"
            iconType={
              SegmentedControlItem.ICON_TYPE
                .HARDWARE_AND_SOFTWARE__KUBERNETES__K8S_SERVICE
            }
          />

          <SegmentedControlItem
            label="Scores"
            value="charts"
            iconType={
              SegmentedControlItem.ICON_TYPE.DATAVIZ__DATAVIZ__LINE_CHART
            }
          />
          {groupBy === 'account' && (
            <SegmentedControlItem
              label="Table"
              value="table"
              iconType={
                SegmentedControlItem.ICON_TYPE.INTERFACE__VIEW__LIST_VIEW
              }
            />
          )}
        </SegmentedControl>
        &nbsp;&nbsp;&nbsp;
        <SegmentedControl
          style={{ float: 'right', marginRight: '10px' }}
          value={groupBy}
          onChange={(evt, value) => {
            if (value === 'product' && view === 'table') {
              setView('summary');
            }

            setGroupBy(value);
          }}
        >
          <SegmentedControlItem
            label="Account"
            value="account"
            iconType={SegmentedControlItem.ICON_TYPE.PROFILES__USERS__USER}
          />

          <SegmentedControlItem
            label="Product"
            value="product"
            iconType={
              SegmentedControlItem.ICON_TYPE
                .HARDWARE_AND_SOFTWARE__SOFTWARE__BROWSER
            }
          />
        </SegmentedControl>
        <br /> <br />
        <CsvDownloadButton
          data={jsonCsvData}
          delimiter=","
          filename={`${new Date().getTime()}-account-export.csv`}
        />
        <MaturityElementList
          groupBy={groupBy}
          view={view}
          entitySearchQuery={entitySearchQuery}
          elements={scoredCollection}
          historyId={selectedHistory.id}
          selectedAccountId={selectedAccountId}
          isUserDefault={isUserDefault}
        />
      </>
    );
  }, [history, selected, view, groupBy]);
}
