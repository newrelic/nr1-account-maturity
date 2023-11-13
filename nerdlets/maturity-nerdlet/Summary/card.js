import React, { useMemo } from 'react';
import { HeadingText } from 'nr1';
import { ProgressBar } from '@newrelic/nr-labs-components';
import ScoreList from './scoreList';

export default function SummaryCard({
  // groupBy,
  elementScores,
  rollUpStatus,
  rollUpScore,
  maxScore = 100,
  elementListLabel,
}) {
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
}
