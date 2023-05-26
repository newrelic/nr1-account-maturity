import React from 'react';
import PropTypes from 'prop-types';

import Score from '../score';
import { StatusIcon } from '@newrelic/nr-labs-components';

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
      status: PropTypes.oneOf(Object.values(StatusIcon.STATUSES)),
    })
  ),
};

export default ScoreList;
