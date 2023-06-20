import React, { useMemo } from 'react';
import PropTypes from 'prop-types';
import ScoreCard from '../ScoreCard';
import { STATUSES, DISPLAY_MODES } from '../../constants';

const MaturityElementList = ({
  selectedAccountId = 0,
  historyId = '',
  elements = [],
  displayMode = DISPLAY_MODES.SUMMARY,
}) => {
  return useMemo(() => {
    if (elements.length === 0) return <div />;

    switch (displayMode) {
      case DISPLAY_MODES.LIST:
      case DISPLAY_MODES.NAVIGATOR:
      default:
        return (
          <div className="score-card-list" style={{ paddingTop: '10px' }}>
            {elements.map((score, idx) => (
              <ScoreCard
                key={idx}
                {...score}
                historyId={historyId}
                selectedAccountId={selectedAccountId}
              />
            ))}
          </div>
        );
    }
  }, [elements, displayMode]);
};

MaturityElementList.propTypes = {
  elements: PropTypes.arrayOf(
    PropTypes.shape({
      title: PropTypes.string,
      subtitle: PropTypes.string,
      rollUpScore: PropTypes.number,
      maxScore: PropTypes.number,
      rollUpStatus: PropTypes.oneOf(Object.values(STATUSES)),
      elementListLabel: PropTypes.string,
      elementScores: PropTypes.arrayOf(
        PropTypes.shape({
          name: PropTypes.string,
          status: PropTypes.oneOf(Object.values(STATUSES)),
          title: PropTypes.string,
        })
      ),
      onClick: PropTypes.func,
    })
  ),
  displayMode: PropTypes.oneOf(Object.values(DISPLAY_MODES)),
};

export default MaturityElementList;