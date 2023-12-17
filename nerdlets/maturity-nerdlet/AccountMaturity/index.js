import React, { useContext } from 'react';
import { EmptyState, Layout, LayoutItem } from 'nr1';
import DataContext from '../../../src/context/data';
import CreateView from '../CreateView';
import MaturityView from '../MaturityView';
import Loading from '../Loading';
import ViewSegmentSelector from '../ViewSegmentSelector';
import ViewSelector from '../ViewSelector';
import ViewList from '../ViewList';
import SearchBar from '../SearchBar';
import DeleteView from '../DeleteView';

export default function AccountMaturity(props) {
  const { fetchingData, errorMsg, view, selectedAccountId } =
    useContext(DataContext);

  const renderView = () => {
    const page = view.page;
    // eslint-disable-next-line prettier/prettier
    switch (page) {
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
      case 'CreateView': {
        return <CreateView {...(view.props || {})} />;
      }
      case 'ViewList': {
        return <ViewList {...(view.props || {})} {...props} />;
      }
      case 'CreateDefaultView': {
        return <CreateView {...(view.props || {})} />;
      }
      case 'CreateNewView': {
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
      <DeleteView />
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
              {view.page === 'ViewList' && <SearchBar width={props?.width} />}

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
