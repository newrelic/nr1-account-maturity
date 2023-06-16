import React from 'react';
import PropTypes from 'prop-types';

import { StatusIcon } from '@newrelic/nr-labs-components';
import { STATUSES } from '../../constants';

const Score = ({ name, status, score, onClick }) => {
  return (
    <div
      className="score"
      style={{
        ...(onClick ? { cursor: 'pointer' } : {}),
      }}
      onClick={onClick}
    >
      <StatusIcon title={`Score: ${score}`} status={status} />
      <span className="name">{name}</span>
    </div>
  );
};

Score.propTypes = {
  id: PropTypes.string,
  name: PropTypes.string,
  status: PropTypes.oneOf(Object.values(STATUSES)),
  score: PropTypes.string,
  onClick: PropTypes.func,
};

export default Score;
