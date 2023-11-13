import React, { useContext } from 'react';
import { EmptyState, Layout, LayoutItem } from 'nr1';

import DataContext from '../../../src/context/data';
import CreateView from '../CreateView';
import MaturityView from '../MaturityView';
import Loading from '../Loading';
//
import ReportList from '../../../src/components/ReportList';
import ViewSegmentSelector from '../ViewSegmentSelector';
import ViewSelector from '../ViewSelector';

export default function AccountMaturity() {
  const { fetchingData, errorMsg, view, selectedAccountId } =
    useContext(DataContext);

  const renderView = () => {
    switch (view.page) {
      case 'Loading': {
        return <Loading {...(view.props || {})} />;
      }
      case 'MaturityView': {
        return (
          <MaturityView
            {...(view.props || {})}
            selectedAccountId={selectedAccountId}
          />
        );
      }
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
          <MaturityView
            {...(view.props || {})}
            selectedAccountId={selectedAccountId}
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
              {(view.page === 'MaturityView' ||
                view.page === 'DefaultView') && (
                <div
                  style={{
                    paddingBottom: '30px',
                    paddingTop: '5px',
                    paddingLeft: '5px',
                    marginBottom: '5px',
                    backgroundColor: 'white',
                  }}
                >
                  <div style={{ float: 'left' }}>
                    <ViewSegmentSelector />
                  </div>
                  <div style={{ float: 'right' }}>
                    <ViewSelector />
                  </div>
                </div>
              )}
              <div
                style={{
                  paddingBottom: '15px',
                  paddingLeft: '20px',
                  backgroundColor: 'white',
                }}
              >
                <div>{renderView()}</div>
              </div>
            </LayoutItem>
          </Layout>
        </>
      )}
    </div>
  );
}
