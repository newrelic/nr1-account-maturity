import React from 'react';
import PropTypes from 'prop-types';

import { StatusIcon } from '@newrelic/nr-labs-components';
import { STATUSES } from '../../constants';

const Score = ({ name, status }) => {
  return (
    <div className="score">
      <StatusIcon status={status} />
      <span className="name">{name}</span>
    </div>
  );
};

Score.propTypes = {
  name: PropTypes.string,
  status: PropTypes.oneOf(Object.values(STATUSES)),
};

export default Score;
