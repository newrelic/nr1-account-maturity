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
  groupBy,
}) {
  return useMemo(() => {
    if (elements.length === 0) return <div />;

    switch (view) {
      case 'navigator':
        return (
          <div className="score-card-list" style={{ paddingTop: '10px' }}>
            {elements.map((score, idx) => (
              <ScoreCard
                groupBy={groupBy}
                key={idx}
                {...score}
                isUserDefault={isUserDefault}
                entitySearchQuery={entitySearchQuery}
                historyId={historyId}
                selectedAccountId={selectedAccountId}
                view={view}
              />
            ))}
          </div>
        );
      case 'table':
        return <ScoreTable groupBy={groupBy} />;
      case 'charts':
        return <ScoreCharts groupBy={groupBy} />;
      case 'summary':
        return (
          <div className="score-card-list" style={{ paddingTop: '10px' }}>
            {elements.map((score, idx) => (
              <ScoreCard
                groupBy={groupBy}
                key={idx}
                {...score}
                isUserDefault={isUserDefault}
                entitySearchQuery={entitySearchQuery}
                historyId={historyId}
                selectedAccountId={selectedAccountId}
                view={view}
              />
            ))}
          </div>
        );
    }
  }, [elements, view, isUserDefault]);
}
