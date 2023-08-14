import React, { useMemo } from 'react';
import ScoreCard from '../ScoreCard';
import ScoreCharts from '../ScoreCharts';
import ScoreTable from '../ScoreTable';

export default function MaturityElementList({
  entitySearchQuery = '',
  selectedAccountId = 0,
  historyId = '',
  elements = [],
  isUserDefault,
  view,
}) {
  return useMemo(() => {
    if (elements.length === 0) return <div />;

    switch (view) {
      case 'table':
        return <ScoreTable />;
      case 'charts':
        return <ScoreCharts />;
      case 'summary':
        return (
          <div className="score-card-list" style={{ paddingTop: '10px' }}>
            {elements.map((score, idx) => (
              <ScoreCard
                key={idx}
                {...score}
                isUserDefault={isUserDefault}
                entitySearchQuery={entitySearchQuery}
                historyId={historyId}
                selectedAccountId={selectedAccountId}
              />
            ))}
          </div>
        );
    }
  }, [elements, view, isUserDefault]);
}
