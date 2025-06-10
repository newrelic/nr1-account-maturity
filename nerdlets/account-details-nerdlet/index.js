import React, { useContext } from 'react';
import {
  PlatformStateContext,
  NerdletStateContext,
  AutoSizer,
  Select,
  SelectItem
} from 'nr1';
import { ProvideData } from '../../src/context/data';
import { scoreToColor } from '../../src/utils';
import { useSetState } from '@mantine/hooks';
import DetailsTable from './DetailTable';

export default function AccountDetailsNerdlet() {
  const platformContext = useContext(PlatformStateContext);
  const nerdletContext = useContext(NerdletStateContext);
  const {
    accountName,
    accountId,
    accountSummary,
    accountPercentage
  } = nerdletContext;
  const statusColor = scoreToColor(accountPercentage)?.color;
  const percentageDiff = 100 - accountPercentage;
  const [dataState, setDataState] = useSetState({
    fetchingHistory: true,
    historyDocument: null,
    selectedDocument: null,
    sortBy: 'Lowest score'
  });

  const updateSortBy = sortBy => {
    setDataState({ sortBy });
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
                marginRight: 10
              }}
            >
              <div
                style={{
                  display: 'inline-block',
                  borderTop: `10px solid ${statusColor}`,
                  width: width * (accountPercentage / 100) - 10
                }}
              />
              <div
                style={{
                  display: 'inline-block',
                  borderTop: '10px solid #cccccc',
                  width: width * (percentageDiff / 100) - 10
                }}
              />
              <table style={{ width: '100%' }}>
                <tr>
                  <td>
                    <div style={{ paddingTop: '10px' }}>
                      <span style={{ fontWeight: 'bold', fontSize: '18px' }}>
                        {accountName} |
                      </span>{' '}
                      <span style={{ fontSize: '16px' }}>Overall score: </span>
                      <span
                        style={{
                          fontWeight: 'bold',
                          fontSize: '16px',
                          color: statusColor
                        }}
                      >
                        {Math.round(accountPercentage)}%
                      </span>
                    </div>
                    <div>
                      <span style={{ fontSize: '14px' }}>{accountId}</span>
                    </div>
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <Select
                      value={dataState.sortBy}
                      label="Sort by"
                      labelInline
                      onChange={(evt, value) => updateSortBy(value)}
                    >
                      <SelectItem value="Lowest score">Lowest score</SelectItem>
                      <SelectItem value="Highest score">
                        Highest score
                      </SelectItem>
                    </Select>
                  </td>
                </tr>
              </table>
              {/* <div style={{ paddingLeft: '20px', paddingTop: '18px' }}>
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
              </div> */}
              <br /> <br />
              <hr />
              <DetailsTable
                accountSummary={accountSummary}
                sortBy={dataState.sortBy}
              />
            </div>
          )}
        </AutoSizer>
      </ProvideData>
    </div>
  );
}
