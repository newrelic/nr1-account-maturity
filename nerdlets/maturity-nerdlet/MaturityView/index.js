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

export default function MaturityView(props) {
  // const { selected, selectedAccountId, document, isUserDefault } = props;
  const {
    viewGroupBy,
    runningReport,
    tempAllData,
    viewSegment,
    view,
    selectedView,
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

    // const history = isUserDefault
    //   ? userViewHistory
    //   : reportHistory.filter(
    //       (
    //         h //eslint-disable-line
    //       ) => h.document.reportId === (view?.id || view?.props?.id) //eslint-disable-line
    //     ); //eslint-disable-line

    // if (history.length === 0) {
    //   return (
    //     <div style={{ textAlign: 'center', paddingTop: '15px' }}>
    //       No history for this view. Click &apos;Run&apos; to generate this view.
    //       <br />
    //       {/* <br />
    //       <Button sizeType={Button.SIZE_TYPE.SMALL}>Run View</Button> */}
    //     </div>
    //   );
    // }

    const renderSegment = (data, scoredCollection) => {
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
    viewSegment,
  ]);
}
