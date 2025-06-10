import React, { useContext, useMemo } from 'react';
import { SegmentedControl, SegmentedControlItem } from 'nr1';

import DataContext from '../../../src/context/data';

export default function ViewSegmentSelector() {
  const {
    viewSegment,
    viewGroupBy,
    viewConfigs,
    setDataState,
    selectedView
  } = useContext(DataContext);

  const viewConfig = (viewConfigs || []).find(vc => vc.id === selectedView?.id);

  return useMemo(() => {
    return (
      <div>
        <SegmentedControl
          value={viewSegment}
          onChange={(evt, viewSegment) => setDataState({ viewSegment })}
        >
          <SegmentedControlItem
            label="List"
            // disabled={viewGroupBy === 'capability'}
            value="list"
            iconType={SegmentedControlItem.ICON_TYPE.INTERFACE__VIEW__LIST_VIEW}
          />

          <SegmentedControlItem
            label="Navigator"
            value="navigator"
            iconType={
              SegmentedControlItem.ICON_TYPE
                .HARDWARE_AND_SOFTWARE__KUBERNETES__K8S_SERVICE
            }
          />

          <SegmentedControlItem
            label="Summary"
            value="summary"
            iconType={
              SegmentedControlItem.ICON_TYPE.INTERFACE__OPERATIONS__GROUP
            }
          />

          <SegmentedControlItem
            label="Trends"
            value="trends"
            disabled={!viewConfig}
            iconType={
              SegmentedControlItem.ICON_TYPE.DATAVIZ__DATAVIZ__LINE_CHART
            }
          />
        </SegmentedControl>
        &nbsp;&nbsp;&nbsp;
        <SegmentedControl
          style={{ float: 'right', marginRight: '10px' }}
          value={viewGroupBy}
          onChange={(evt, value) => {
            if (value === 'capability' && viewSegment === 'list') {
              setDataState({ viewSegment: 'summary' });
            }
            setDataState({ viewGroupBy: value });
          }}
        >
          <SegmentedControlItem
            label="Account"
            value="account"
            iconType={SegmentedControlItem.ICON_TYPE.PROFILES__USERS__USER}
          />

          <SegmentedControlItem
            label="Capability"
            value="capability"
            iconType={
              SegmentedControlItem.ICON_TYPE
                .HARDWARE_AND_SOFTWARE__SOFTWARE__BROWSER
            }
          />
        </SegmentedControl>
      </div>
    );
  }, [viewGroupBy, viewSegment]);
}
