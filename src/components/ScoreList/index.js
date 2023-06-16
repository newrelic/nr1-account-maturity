import React from 'react';
import PropTypes from 'prop-types';
import { Tooltip } from 'nr1';
import Score from '../Score';
import { STATUSES } from '../../constants';

const ScoreList = ({ idxBase, scores = [] }) => {
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
};

ScoreList.propTypes = {
  idxBase: PropTypes.number,
  scores: PropTypes.arrayOf(
    PropTypes.shape({
      name: PropTypes.string,
      status: PropTypes.oneOf(Object.values(STATUSES)),
      score: PropTypes.string,
    })
  ),
};

export default ScoreList;
