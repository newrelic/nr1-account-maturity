import React, { useContext, useEffect } from 'react';
import {
  PlatformStateContext,
  NerdletStateContext,
  AutoSizer,
  AccountStorageQuery,
} from 'nr1';
import { ProvideData } from '../../context/data';
import { scoreToColor } from '../../utils';
import { useSetState } from '@mantine/hooks';
import { ACCOUNT_USER_HISTORY_COLLECTION } from '../../constants';
import ScoreDetailsTable from '../ScoreDetailTable';

export default function ScoreDetailRoot() {
  const platformContext = useContext(PlatformStateContext);
  const nerdletContext = useContext(NerdletStateContext);
  const {
    accountName,
    accountId,
    selectedAccountId,
    historyId,
    accountPercentage,
    entitySearchQuery,
  } = nerdletContext;
  const statusColor = scoreToColor(accountPercentage).color;
  const percentageDiff = 100 - accountPercentage;
  const [dataState, setDataState] = useSetState({
    fetchingHistory: true,
    historyDocument: null,
    selectedDocument: null,
  });

  useEffect(() => {
    fetchHistory();
  }, [historyId]);

  const fetchHistory = () => {
    AccountStorageQuery.query({
      accountId: selectedAccountId,
      collection: ACCOUNT_USER_HISTORY_COLLECTION,
      documentId: historyId,
    }).then(({ data }) =>
      setDataState({
        fetchingHistory: false,
        historyDocument: data,
        selectedDocument: (data?.accountSummaries || []).find(
          (a) => a.id === accountId
        ),
      })
    );
  };

  return (
    <div>
      <ProvideData
        platformContext={platformContext}
        nerdletContext={nerdletContext}
      >
        <AutoSizer>
          {({ width }) => (
            <div
              style={{
                backgroundColor: 'white',
                width: width - 20,
                marginTop: 10,
                marginLeft: 10,
                marginRight: 10,
              }}
            >
              <div
                style={{
                  display: 'inline-block',
                  borderTop: `10px solid ${statusColor}`,
                  width: width * (accountPercentage / 100) - 10,
                }}
              ></div>
              <div
                style={{
                  display: 'inline-block',
                  borderTop: '10px solid #cccccc',
                  width: width * (percentageDiff / 100) - 10,
                }}
              ></div>
              <div style={{ paddingLeft: '20px', paddingTop: '18px' }}>
                <div>
                  <span style={{ fontWeight: 'bold', fontSize: '18px' }}>
                    {accountName} |
                  </span>{' '}
                  <span style={{ fontSize: '18px' }}>Overall score: </span>
                  <span
                    style={{
                      fontWeight: 'bold',
                      fontSize: '18px',
                      color: statusColor,
                    }}
                  >
                    {accountPercentage}%
                  </span>
                </div>
                <div>
                  <span style={{ fontSize: '14px' }}>{accountId}</span>
                </div>
                {entitySearchQuery && (
                  <div style={{ paddingTop: '10px' }}>
                    <span style={{ fontSize: '12px', fontWeight: 'bold' }}>
                      Entity Search Query:
                    </span>
                    <span style={{ fontSize: '12px' }}>
                      &nbsp;{entitySearchQuery}
                    </span>
                  </div>
                )}
              </div>
              <br /> <br />
              <hr />
              <ScoreDetailsTable
                selectedDocument={dataState.selectedDocument}
              />
            </div>
          )}
        </AutoSizer>
      </ProvideData>
    </div>
  );
}
