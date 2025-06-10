import React from 'react';
import { StatusIcon } from '@newrelic/nr-labs-components';

const Score = ({ name, status, score, onClick }) => {
  return (
    <div
      className="score"
      style={{
        ...(onClick ? { cursor: 'pointer' } : {})
      }}
      onClick={onClick}
    >
      <StatusIcon title={`Score: ${score}`} status={status} />
      <span className="name">{name}</span>
    </div>
  );
};

export default Score;
