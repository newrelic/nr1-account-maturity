import React, { useContext } from 'react';
import {
  EmptyState,
  Layout,
  LayoutItem,
  HeadingText,
  BlockText,
  Icon,
  navigation
} from 'nr1';
import DataContext from '../../../src/context/data';
import CreateView from '../CreateView';
import MaturityView from '../MaturityView';
import Loading from '../Loading';
import ViewSegmentSelector from '../ViewSegmentSelector';
import ViewSelector from '../ViewSelector';
import ViewList from '../ViewList';
import SearchBar from '../SearchBar';
import DeleteView from '../DeleteView';
import DeleteSnapshot from '../DeleteSnapshot';
import Help from '../HelpModal';
import Welcome from '../Welcome';

export const defaultActions = setDataState => {
  return [
    {
      label: 'Launch old version',
      type: 'secondary',
      hint: 'Launch the old version',
      iconType: Icon.TYPE.INTERFACE__OPERATIONS__EXTERNAL_LINK,
      onClick: () => navigation.openNerdlet({ id: 'old-maturity-nerdlet' })
    },
    {
      label: 'Help',
      type: 'secondary',
      hint: '',
      iconType: Icon.TYPE.INTERFACE__INFO__HELP,
      onClick: () => setDataState({ helpModalOpen: true })
    }
  ];
};

export default function AccountMaturity(props) {
  const { fetchingData, errorMsg, view, selectedAccountId } = useContext(
    DataContext
  );

  const renderView = page => {
    // eslint-disable-next-line prettier/prettier
    switch (page) {
      case 'Loading': {
        return <Loading {...(view.props || {})} />;
      }
      case 'unavailable-account': {
        return (
          <div style={{ paddingRight: '20px', paddingTop: '15px' }}>
            <div className="empty-state">
              <HeadingText className="empty-state-header">
                Account Maturity is not enabled
              </HeadingText>
              <BlockText className="empty-state-desc">
                Account Maturity has not been enabled for this account.
              </BlockText>
              <BlockText className="empty-state-desc">
                To enable, please contact your NR Admin, or confirm that the
                Account Maturity was subscribed or published to the correct
                accounts.
              </BlockText>
            </div>
          </div>
        );
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
      <Welcome />
      <Help />
      <DeleteView />
      <DeleteSnapshot />

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
                    backgroundColor: 'white'
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
                  backgroundColor: 'white'
                }}
              >
                <div>{renderView(view.page)}</div>
              </div>
            </LayoutItem>
          </Layout>
        </>
      )}
    </div>
  );
}
