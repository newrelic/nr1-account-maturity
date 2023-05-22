import React, { useContext, useEffect } from 'react';
import {
  Grid,
  GridItem,
  Spinner,
  Stack,
  StackItem,
  EmptyState,
  Layout,
  LayoutItem,
  CollapsibleLayoutItem,
} from 'nr1';

import DataContext from '../../context/data';
import AccountTiles from '../AccountTiles';

export default function AccountMaturity() {
  const { fetchingData, errorMsg } = useContext(DataContext);

  return (
    <div>
      {fetchingData && (
        <EmptyState title="Fetching data..." type={EmptyState.TYPE.LOADING} />
      )}

      {errorMsg && <EmptyState title={errorMsg} />}

      {!fetchingData && !errorMsg && (
        <>
          <Layout fullHeight>
            <LayoutItem>
              <div
                style={{
                  paddingTop: '25px',
                  paddingBottom: '25px',
                  paddingLeft: '10px',
                  backgroundColor: 'white',
                }}
              >
                <AccountTiles />
              </div>
            </LayoutItem>

            <CollapsibleLayoutItem
              // collapsed={!detailsOpen}
              collapsed={true}
              triggerType={CollapsibleLayoutItem.TRIGGER_TYPE.CUSTOM}
              type={LayoutItem.TYPE.SPLIT_RIGHT}
            >
              <div style={{ paddingTop: '25px' }}>
                another pane
                {/* <DetailsPane height={tableHeight} /> */}
              </div>
            </CollapsibleLayoutItem>
          </Layout>
        </>
      )}
    </div>
  );
}
