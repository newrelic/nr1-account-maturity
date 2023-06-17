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
import { STATUSES } from '../../constants';
import rules from '../../rules';
import { percentageToStatus } from '../../utils';
import SortBy from '../SortBy';
import ReportList from '../ReportList';
import CreateReport from '../CreateReport';

export default function AccountMaturity() {
  const { fetchingData, errorMsg, accountSummaries, view, setDataState } =
    useContext(DataContext);

  const scoredCollection = (accountSummaries || []).map((a) => {
    const elementScores = [];

    Object.keys(rules).forEach((key) => {
      const value = a[key];

      if (value !== undefined && value !== null) {
        const payload = {
          name: key,
          status: percentageToStatus(value),
          score: `${Math.round(value)}%`,
        };

        elementScores.push(payload);
      }
    });

    const payload = {
      title: a.name,
      subtitle: a.id,
      rollUpScore: Math.round((a.totalScore / a.maxScore) * 100),
      rollUpStatus: STATUSES.UNKNOWN,
      elementListLabel: 'Products',
      elementScores,
    };

    payload.rollUpStatus = percentageToStatus(payload.rollUpScore);

    return payload;
  });

  const renderView = () => {
    switch (view.page) {
      case 'ReportList': {
        return <ReportList />;
      }
      case 'CreateReport': {
        return <CreateReport />;
      }
      case 'MaturityAccountScores': {
        return <MaturityElementList elements={scoredCollection} />;
      }
      default: {
        return 'Unknown View';
      }
    }
  };

  const renderTopRight = () => {
    switch (view.page) {
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
