import React from 'react';
import PropTypes from 'prop-types';

import Score from '../score';
import { STATUSES } from '../../constants';

const ScoreList = ({ scores = [] }) => {
  return (
    <div className="scores-list">
      {scores.map((score, i) => (
        <Score key={i} {...score} />
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
