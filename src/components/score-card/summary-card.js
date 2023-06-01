import React, { useMemo } from 'react';
import PropTypes from 'prop-types';
import { HeadingText } from 'nr1';
import { ProgressBar } from '@newrelic/nr-labs-components';
import { STATUSES } from '../../constants';
import ScoreList from '../score-list';

const SummaryCard = ({
  elementScores,
  rollUpStatus,
  rollUpScore,
  maxScore,
  elementListLabel,
}) => {
  return useMemo(() => {
    const elementSliceIndex =
      elementScores.length > 8
        ? Math.round(elementScores.length / 2)
        : elementScores.length;

    return (
      <>
        <HeadingText type={HeadingText.TYPE.HEADING_6}>
          Maturity Score
        </HeadingText>

        <div className="score-label">
          <span className={rollUpStatus}>{rollUpScore}</span>
          <span>/{maxScore}</span>
        </div>

        <ProgressBar
          height="25px"
          value={rollUpScore}
          max={maxScore}
          status={rollUpStatus}
        />

        <HeadingText
          style={{ marginTop: '24px', marginBottom: '4px' }}
          type={HeadingText.TYPE.HEADING_6}
        >
          {elementListLabel} ({elementScores.length})
        </HeadingText>

        <div className="elements">
          <ScoreList
            idxBase={0}
            scores={elementScores.slice(0, elementSliceIndex)}
          />
          <ScoreList
            idxBase={elementSliceIndex}
            scores={elementScores.slice(elementSliceIndex)}
          />
        </div>
      </>
    );
  }, [rollUpScore, maxScore, rollUpStatus, elementListLabel, elementScores]);
};

SummaryCard.PropTypes = {
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
};

export default SummaryCard;
