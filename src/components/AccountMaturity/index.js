import React, { useContext } from 'react';
import { EmptyState, Layout, LayoutItem, CollapsibleLayoutItem } from 'nr1';

import DataContext from '../../context/data';
import MaturityElementList from '../MaturityElementList';
import ReportList from '../ReportList';
import CreateView from '../CreateView';
import ReportView from '../ReportView';
import ViewSelector from '../ViewSelector';
import HistorySelector from '../ReportView/historySelector';

export default function AccountMaturity() {
  const { fetchingData, errorMsg, view, selectedAccountId } =
    useContext(DataContext);

  const renderView = () => {
    switch (view.page) {
      case 'ReportList': {
        return <ReportList {...(view.props || {})} />;
      }
      case 'CreateView': {
        return <CreateView {...(view.props || {})} />;
      }
      case 'CreateDefaultView': {
        return <CreateView {...(view.props || {})} />;
      }
      case 'EditDefaultView': {
        return <CreateView {...(view.props || {})} />;
      }
      case 'EditView': {
        return <CreateView {...(view.props || {})} />;
      }
      case 'DefaultView': {
        return (
          <ReportView
            {...(view.props || {})}
            selectedAccountId={selectedAccountId}
          />
        );
      }
      case 'ReportView': {
        return (
          <ReportView
            {...(view.props || {})}
            selectedAccountId={selectedAccountId}
          />
        );
      }
      case 'MaturityAccountScores': {
        return (
          <MaturityElementList
            // elements={scoredCollection}
            {...(view.props || {})}
          />
        );
      }
      default: {
        return 'Unknown View';
      }
    }
  };

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
              {(view.page === 'ReportView' || view.page === 'DefaultView') && (
                <div
                  style={{
                    paddingBottom: '10px',
                    paddingTop: '10px',
                    paddingLeft: '5px',
                    marginBottom: '25px',
                  }}
                >
                  <div style={{ float: 'left' }}>
                    <ViewSelector view={view} />
                  </div>
                  <div style={{ float: 'right' }}>
                    <HistorySelector accountId={selectedAccountId} />
                  </div>
                </div>
              )}
              <div
                style={{
                  paddingBottom: '15px',
                  paddingLeft: '10px',
                  backgroundColor: 'white',
                }}
              >
                <div>{renderView()}</div>
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
