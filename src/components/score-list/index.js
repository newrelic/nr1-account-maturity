import React from 'react';
import PropTypes from 'prop-types';
import { Tooltip } from 'nr1';
import Score from '../score';
import { STATUSES } from '../../constants';

const ScoreList = ({ scores = [] }) => {
  return (
    <div className="scores-list">
      {scores.map((score, i) => (
        <Tooltip key={i} text={`${score.name}: ${score.score}`}>
          <Score
            {...score}
            onClick={() => console.info(`ScoreListclicked ${i}`)}
          />
        </Tooltip>
      ))}
    </div>
  );
};

ScoreList.propTypes = {
  scores: PropTypes.arrayOf(
    PropTypes.shape({
      name: PropTypes.string,
      status: PropTypes.oneOf(Object.values(STATUSES)),
      score: PropTypes.string,
    })
  ),
};

export default ScoreList;
