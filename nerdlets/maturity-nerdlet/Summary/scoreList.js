import React from 'react';
import { Tooltip } from 'nr1';
import Score from './score';

export default function ScoreList({ idxBase, scores = [] }) {
  return (
    <div className="scores-list">
      {scores.map((score, i) => (
        <Tooltip key={i} text={`${score.name}: ${score.score}`}>
          <Score
            id={i + idxBase}
            {...score}
            onClick={() => console.info(`ScoreListclicked ${i + idxBase}`)}
          />
        </Tooltip>
      ))}
    </div>
  );
}
