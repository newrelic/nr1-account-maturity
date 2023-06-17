import React, { useContext } from 'react';
import {
  Button,
  EmptyState,
  Layout,
  LayoutItem,
  CollapsibleLayoutItem,
  HeadingText,
} from 'nr1';

import DataContext from '../../context/data';
import MaturityElementList from '../MaturityElementList';
import SortBy from '../SortBy';
import ReportList from '../ReportList';
import CreateReport from '../CreateReport';
import ReportView from '../ReportView';

export default function AccountMaturity() {
  const { fetchingData, errorMsg, view, setDataState } =
    useContext(DataContext);

  const renderView = () => {
    switch (view.page) {
      case 'ReportList': {
        return <ReportList {...(view.props || {})} />;
      }
      case 'CreateReport': {
        return <CreateReport {...(view.props || {})} />;
      }
      case 'EditReport': {
        return <CreateReport {...(view.props || {})} />;
      }
      case 'ReportView': {
        return <ReportView {...(view.props || {})} />;
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

  const renderTopRight = () => {
    switch (view.page) {
      case 'ReportList': {
        return (
          <Button
            style={{ marginRight: '10px' }}
            type={Button.TYPE.PRIMARY}
            sizeType={Button.SIZE_TYPE.SMALL}
            onClick={() =>
              setDataState({
                view: { page: 'CreateReport', title: 'Create Report' },
              })
            }
          >
            Create Report
          </Button>
        );
      }
      case 'ReportView':
      case 'CreateReport': {
        return (
          <Button
            style={{ marginRight: '10px' }}
            sizeType={Button.SIZE_TYPE.SMALL}
            iconType={
              Button.ICON_TYPE.INTERFACE__ARROW__ARROW_LEFT__V_ALTERNATE
            }
            onClick={() =>
              setDataState({
                view: { page: 'ReportList', title: 'Report List' },
              })
            }
          >
            Back
          </Button>
        );
      }
      case 'MaturityAccountScores': {
        return <SortBy />;
      }
      default: {
        return '';
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
              <div
                style={{
                  paddingTop: '15px',
                  paddingBottom: '15px',
                  paddingLeft: '10px',
                  backgroundColor: 'white',
                }}
              >
                <div style={{ paddingBottom: '30px' }}>
                  <div style={{ float: 'left' }}>
                    <HeadingText type={HeadingText.TYPE.HEADING_3}>
                      {view?.title || view?.page || 'Account Maturity Scores'}
                    </HeadingText>
                  </div>
                  <div style={{ float: 'right' }}>{renderTopRight()}</div>
                </div>
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
