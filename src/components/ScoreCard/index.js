import React, { useMemo } from 'react';
import PropTypes from 'prop-types';
import { HeadingText, navigation } from 'nr1';
import SummaryCard from './summary-card';
import NavigatorCard from './navigator-card';
import { STATUSES, DISPLAY_MODES } from '../../constants';

const ScoreCard = ({
  selectedAccountId,
  historyId,
  title,
  subtitle,
  rollUpScore = 0,
  maxScore = 100,
  rollUpStatus,
  elementListLabel,
  elementScores,
  displayMode = DISPLAY_MODES.SUMMARY,
}) => {
  return useMemo(() => {
    return (
      <div className={`score-card ${displayMode}`}>
        <div
          style={{ cursor: 'pointer' }}
          onClick={() =>
            navigation.openStackedNerdlet({
              id: 'score-details-nerdlet',
              urlState: {
                accountName: title,
                accountId: subtitle,
                accountPercentage: rollUpScore,
                historyId,
                selectedAccountId,
              },
            })
          }
        >
          <HeadingText className="title" type={HeadingText.TYPE.HEADING_3}>
            {title}
          </HeadingText>
          <div className="subtitle">{subtitle}</div>
        </div>

        {displayMode === DISPLAY_MODES.SUMMARY && (
          <SummaryCard
            rollUpScore={rollUpScore}
            maxScore={maxScore}
            rollUpStatus={rollUpStatus}
            elementListLabel={elementListLabel}
            elementScores={elementScores}
          />
        )}

        {displayMode === DISPLAY_MODES.NAVIGATOR && (
          <NavigatorCard elementScores={elementScores} />
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
    displayMode,
  ]);
};

ScoreCard.propTypes = {
  title: PropTypes.string,
  subtitle: PropTypes.string,
  /* the roll up score label */
  rollUpScore: PropTypes.number,
  /* the total possible score */
  maxScore: PropTypes.number,
  /* the overall status taking into account the scores for each element */
  rollUpStatus: PropTypes.oneOf(Object.values(STATUSES)),
  /* the title assigned to the list of scored elements */
  elementListLabel: PropTypes.string,
  /* the individual scored elements that contribute to the aggregate score */
  elementScores: PropTypes.arrayOf(
    PropTypes.shape({
      name: PropTypes.string,
      status: PropTypes.oneOf(Object.values(STATUSES)),
      score: PropTypes.string,
    })
  ),
  displayMode: PropTypes.oneOf(Object.values(DISPLAY_MODES)),
};

export default ScoreCard;
