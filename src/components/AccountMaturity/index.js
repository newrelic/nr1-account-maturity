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

export default function AccountMaturity() {
  const { fetchingAccountData, errorMsg } = useContext(DataContext);

  return (
    <div>
      <Stack
        style={{ marginTop: '10px' }}
        directionType={Stack.DIRECTION_TYPE.VERTICAL}
        fullHeight
        fullWidth
      >
        {fetchingAccountData && (
          <StackItem grow>
            {/* <StackItem grow style={{ width: usableWidth }}> */}
            <EmptyState
              title="Fetching data..."
              type={EmptyState.TYPE.LOADING}
            />
          </StackItem>
        )}
        {errorMsg && (
          <StackItem grow>
            {/* <StackItem grow style={{ width: usableWidth }}> */}
            <EmptyState title={errorMsg} />
          </StackItem>
        )}

        {!fetchingAccountData && !errorMsg && (
          <>
            {/* <SearchBox /> */}

            {/* <OpenAiConfiguration />
            <QueryModal />
            <Indexes />
            <Help /> */}
          </>
        )}
      </Stack>

      <Layout fullHeight>
        <LayoutItem>
          <div style={{ paddingTop: '25px' }}>
            something
            {/* <QueryTable height={tableHeight} width={width} /> */}
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
    </div>
  );
}
