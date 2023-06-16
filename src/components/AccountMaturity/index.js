import React, { useContext } from 'react';
import {
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

export default function AccountMaturity() {
  const { fetchingData, errorMsg, accountSummaries } = useContext(DataContext);

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
                <div style={{ paddingBottom: '50px' }}>
                  <div style={{ float: 'left' }}>
                    <HeadingText type={HeadingText.TYPE.HEADING_3}>
                      Account Maturity Scores
                    </HeadingText>
                  </div>
                  <div style={{ float: 'right' }}>
                    <SortBy />
                  </div>
                </div>
                <div>
                  <MaturityElementList elements={scoredCollection} />
                </div>
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
