import React, { useMemo, useContext } from 'react';
import { navigation, HeadingText } from 'nr1';
import DataContext from '../../../src/context/data';
import ScoreBar from '../ScoreBar';
import SummaryCard from './card';

export default function Summary(props) {
  const { scoredCollection } = props;
  const { viewGroupBy, selectedView, selectedReport } = useContext(DataContext);

  return useMemo(() => {
    if (!scoredCollection || scoredCollection.length === 0) {
      return 'No results';
    }

    const sortedCollection = sortByRollUpStatusAndScore(scoredCollection);

    return (
      <>
        <ScoreBar
          {...props}
          data={sortedCollection}
          viewGroupBy={viewGroupBy}
          selectedReport={selectedReport}
        />

        <div className="score-card-list" style={{ paddingTop: '10px' }}>
          {sortedCollection.map((collection, i) => {
            const { title, subtitle, rollUpScore } = collection;

            return (
              <React.Fragment key={i}>
                <div
                  className="score-card"
                  style={{ cursor: 'pointer' }}
                  onClick={
                    viewGroupBy === 'account'
                      ? () =>
                          /* eslint-disable */
                          navigation.openStackedNerdlet({
                            id: 'account-details-nerdlet',
                            urlState: {
                              accountName: title,
                              accountId: subtitle,
                              accountPercentage: rollUpScore,
                              accountSummary: (
                                props.accountSummaries || []
                              ).find(a => a.id === parseInt(subtitle)),
                            },
                          })
                      : () =>
                          navigation.openStackedNerdlet({
                            id: 'capability-details-nerdlet',
                            urlState: {
                              ...collection,
                            },
                          })
                    /* eslint-enable */
                  }
                >
                  <div>
                    <HeadingText
                      className="title"
                      type={HeadingText.TYPE.HEADING_3}
                    >
                      {title}
                    </HeadingText>
                    <div className="subtitle">{subtitle}</div>
                  </div>

                  <SummaryCard {...collection} groupBy={viewGroupBy} />
                </div>
              </React.Fragment>
            );
          })}
        </div>
      </>
    );
  }, [scoredCollection, viewGroupBy, selectedView]);
}

function sortByRollUpStatusAndScore(arr) {
  const statusPriority = {
    critical: 1,
    warning: 2,
    success: 3
  };

  return arr.sort((a, b) => {
    // Compare by rollUpStatus first
    const statusDifference =
      statusPriority[a.rollUpStatus] - statusPriority[b.rollUpStatus];
    if (statusDifference !== 0) return statusDifference;

    // If rollUpStatus is the same, compare by rollUpScore
    return a.rollUpScore - b.rollUpScore; // Ascending order
  });
}
