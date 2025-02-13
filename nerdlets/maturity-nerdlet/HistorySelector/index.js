import React, { useContext, useMemo } from 'react';
import { Select, SelectItem } from 'nr1';
import DataContext from '../../../src/context/data';

export default function HistorySelector() {
  const {
    viewConfigs,
    selectedView,
    loadHistoricalResult,
    selectedReport,
  } = useContext(DataContext);

  return useMemo(() => {
    const viewConfig = viewConfigs.find(vc => vc.id === selectedView.id);

    if ((viewConfig?.history || []).length === 0) {
      return <></>;
    }

    return (
      <div style={{ float: 'right' }}>
        <Select
          label="Show scores from"
          labelInline
          onChange={(evt, value) => {
            const result = (viewConfig.history || []).find(
              h => h.historyId === value
            );

            if (result) {
              loadHistoricalResult(selectedReport, result);
            }
          }}
          value={selectedView?.historyId}
        >
          {(viewConfig?.history || []).map(h => {
            return (
              <SelectItem key={h.historyId} value={h.historyId}>
                {new Date(h?.document?.runAt || 0).toLocaleString()}
              </SelectItem>
            );
          })}
        </Select>
        &nbsp;&nbsp;
      </div>
    );
  }, [viewConfigs, selectedView]);
}
