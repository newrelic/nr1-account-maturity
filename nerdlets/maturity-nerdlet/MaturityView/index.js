import React, { useContext, useMemo } from 'react';
import { Spinner } from 'nr1';
import DataContext from '../../../src/context/data';
import ListView from '../ListView';
import rules from '../../../src/rules';
import { percentageToStatus } from '../../../src/utils';
import { STATUSES } from '../../../src/constants';
import Navigator from '../Navigator';
import Summary from '../Summary';
import SaveView from '../SaveView';
import TrendView from '../TrendView';

export default function MaturityView(props) {
  const {
    viewGroupBy,
    runningReport,
    tempAllData,
    viewSegment,
    view,
    selectedView,
    selectedReport,
  } = useContext(DataContext);

  console.log(viewSegment, selectedView, tempAllData);

  let selectedData = null;

  // if (selectedView.id === 'allData') {
  selectedData = { ...tempAllData };
  // }

  const { accountSummaries } = selectedData;

  let scoredCollection = [];

  if (viewGroupBy === 'account') {
    scoredCollection = (accountSummaries || []).map((a) => {
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
  } else if (viewGroupBy === 'capability') {
    scoredCollection = Object.keys(rules)
      .filter((product) =>
        accountSummaries.find(
          (a) => a[product] !== null && a[product] !== undefined
        )
      )
      .map((product) => {
        const elementScores = [];
        let totalScore = 0;

        accountSummaries.forEach((account) => {
          const value = account[product];
          totalScore += value;

          console.log(account);

          if (value !== undefined && value !== null) {
            const payload = {
              name: account.name,
              id: account.id,
              status: percentageToStatus(value),
              score: `${Math.round(value)}%`,
              entities: account[`${product}.entities`],
              entitiesPassing: account[`${product}.entitiesPassing`],
              scoring: account[`${product}.scoring`],
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
          elementListLabel: 'Capability',
          elementScores,
        };

        payload.rollUpStatus = percentageToStatus(payload.rollUpScore);

        return payload;
      });
  }

  return useMemo(() => {
    if (runningReport) {
      return (
        <>
          <div
            style={{
              textAlign: 'center',
              paddingBottom: '10px',
              paddingTop: '10px',
            }}
          >
            Generating View
          </div>
          <Spinner />
        </>
      );
    }


    const renderSegment = (data, scoredCollection) => {
      // eslint-disable-next-line prettier/prettier
      switch (viewSegment) {
        case 'list': {
          return <ListView {...data} scoredCollection={scoredCollection} />;
        }
        case 'navigator': {
          return <Navigator {...data} scoredCollection={scoredCollection} />;
        }
        case 'summary': {
          return <Summary {...data} scoredCollection={scoredCollection} />;
        }
        case 'trends': {
          return <TrendView {...data} />;
        }
        default: {
          return 'Unknown Segment View';
        }
      }
    };

    return (
      <div style={{ paddingTop: '10px' }}>
        <SaveView />
        {renderSegment(selectedData, scoredCollection)}
      </div>
    );
  }, [
    props,
    view,
    history,
    runningReport,
    selectedView,
    viewSegment,
    selectedData,
    scoredCollection,
    viewSegment,
    selectedReport,
  ]);
}
