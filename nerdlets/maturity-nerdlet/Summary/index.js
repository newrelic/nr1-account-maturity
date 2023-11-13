import React, { useMemo, useContext } from 'react';
import { HeadingText } from 'nr1';
import DataContext from '../../../src/context/data';
import ScoreBar from '../ScoreBar';
import SummaryCard from './card';

export default function Summary(props) {
  const { scoredCollection } = props;
  const { viewGroupBy } = useContext(DataContext);

  return useMemo(() => {
    if (!scoredCollection || scoredCollection.length === 0) {
      return 'No results';
    }

    return (
      <>
        <ScoreBar {...props} />

        <div className="score-card-list" style={{ paddingTop: '10px' }}>
          {scoredCollection.map((collection, i) => {
            const { title, subtitle, rollUpScore } = collection;

            return (
              <React.Fragment key={i}>
                <div className={`score-card`}>
                  <div
                    style={{ cursor: 'pointer' }}
                    onClick={
                      viewGroupBy === 'account'
                        ? () =>
                            /* eslint-disable */
                            navigation.openStackedNerdlet({
                              id: 'score-details-nerdlet',
                              urlState: {
                                isUserDefault,
                                accountName: title,
                                accountId: subtitle,
                                accountPercentage: rollUpScore,
                                historyId,
                                selectedAccountId,
                                entitySearchQuery,
                              },
                            })
                        : undefined
                      /* eslint-enable */
                    }
                  >
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
  }, [scoredCollection, viewGroupBy]);
}
