import React from 'react';
import PropTypes from 'prop-types';

import { StatusIcon } from '@newrelic/nr-labs-components';

const Signal = ({ name, status }) => {
  return (
    <div className="score">
      <StatusIcon status={status} />
      <span className="name">{name}</span>
    </div>
  );
};

Signal.propTypes = {
  name: PropTypes.string,
  status: PropTypes.oneOf(Object.values(StatusIcon.STATUSES)),
};

export default Signal;
