import React from 'react';
import PropTypes from 'prop-types';

import { StatusIcon } from '@newrelic/nr-labs-components';
import { STATUSES } from '../../constants';

const Score = ({ name, status, score }) => {
  return (
    <div className="score">
      <StatusIcon title={`Score: ${score}`} status={status} />
      <span title={`Score: ${score}`} className="name">
        {name}
      </span>
    </div>
  );
};

Score.propTypes = {
  name: PropTypes.string,
  status: PropTypes.oneOf(Object.values(STATUSES)),
  score: PropTypes.string,
};

export default Score;
