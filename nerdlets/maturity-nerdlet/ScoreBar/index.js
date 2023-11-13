import React from 'react';
import CsvDownloadButton from 'react-json-to-csv';
import { ProgressBar } from '@newrelic/nr-labs-components';
import { percentageToStatus, scoreToColor } from '../../../src/utils';

export default function ScoreBar(props) {
  const status = percentageToStatus(props?.totalPercentage);
  const scoreColor = scoreToColor(props?.totalPercentage);

  return (
    <>
      <table style={{ width: '100%' }}>
        <tr>
          <td style={{ width: '120px', paddingLeft: '0px' }}>
            <span style={{ fontSize: '16px', fontWeight: 600 }}>
              View Score
            </span>
          </td>
          <td style={{ width: '70px', borderLeft: '1px solid #E7E9EA' }}>
            <span style={{ fontSize: '16px', fontWeight: 600 }}>
              <span style={{ color: scoreColor?.color }}>
                {(props?.totalPercentage || 0).toFixed(0)}
              </span>
              /100
            </span>
          </td>
          <td style={{ width: '160px', paddingLeft: '0px' }}>
            <ProgressBar
              height="12px"
              value={props?.totalPercentage}
              max={100}
              status={status}
            />
          </td>
          <td style={{ textAlign: 'right' }}>
            <CsvDownloadButton
              data={{}}
              delimiter=","
              filename={`${new Date().getTime()}-account-export.csv`}
            />
          </td>
        </tr>
      </table>
    </>
  );

  // return useMemo(() => {
  //   return (
  //     <>
  //       <EmptyState
  //         title={`Analyzing Accounts & Capabilities ${value}%`}
  //         type={EmptyState.TYPE.LOADING}
  //       />
  //     </>
  //   );
  // }, [
  //   currentLoadingAccount,
  //   completedPercentage,
  //   completedPercentageTotal,
  //   accountTotal,
  //   completedAccountTotal,
  // ]);
}
