import React, { useMemo } from 'react';
import { HeadingText, navigation } from 'nr1';
import SummaryCard from './summary-card';
import NavigatorCard from './navigator-card';
import { DISPLAY_MODES } from '../../constants';

const ScoreCard = ({
  selectedAccountId,
  entitySearchQuery,
  historyId,
  title,
  subtitle,
  rollUpScore = 0,
  maxScore = 100,
  rollUpStatus,
  elementListLabel,
  elementScores,
  isUserDefault,
  view,
  groupBy,
}) => {
  return useMemo(() => {
    return (
      <div className={`score-card ${view}`}>
        <div
          style={{ cursor: 'pointer' }}
          onClick={
            groupBy === 'account'
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
          <HeadingText className="title" type={HeadingText.TYPE.HEADING_3}>
            {title}
          </HeadingText>
          <div className="subtitle">{subtitle}</div>
        </div>

        {view === DISPLAY_MODES.SUMMARY && (
          <SummaryCard
            rollUpScore={rollUpScore}
            maxScore={maxScore}
            rollUpStatus={rollUpStatus}
            elementListLabel={elementListLabel}
            elementScores={elementScores}
            groupBy={groupBy}
          />
        )}

        {view === DISPLAY_MODES.NAVIGATOR && (
          <NavigatorCard elementScores={elementScores} groupBy={groupBy} />
        )}
      </div>
    );
  }, [
    title,
    subtitle,
    rollUpScore,
    maxScore,
    rollUpStatus,
    elementListLabel,
    elementScores,
    view,
  ]);
};

export default ScoreCard;
