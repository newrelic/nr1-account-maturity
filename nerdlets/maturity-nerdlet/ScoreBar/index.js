import React, { useContext, useMemo } from 'react';
import { Button, Icon } from 'nr1';
import { ProgressBar } from '@newrelic/nr-labs-components';
import { percentageToStatus, scoreToColor } from '../../../src/utils';
import csvDownload from 'json-to-csv-export';
import HistorySelector from '../HistorySelector';
import DataContext from '../../../src/context/data';

export default function ScoreBar(props) {
  const { selectedReport, selectedAccountId, runView } = useContext(
    DataContext
  );
  const status = percentageToStatus(props?.totalPercentage);
  const scoreColor = scoreToColor(props?.totalPercentage);

  // copy data to avoid manipulating original obj
  const data = JSON.parse(JSON.stringify(props?.data || [])).map(d => {
    if ((d?.Account || '').includes(' :: ')) {
      const accountSplit = d.Account.split(' :: ');
      d.accountName = accountSplit[0];
      d.accountId = accountSplit[1];
    }

    if (d.elementScores) {
      d.elementScores.forEach(s => {
        d[s.name] = parseFloat(s.score);
      });
    }
    if (d.title) {
      d[props.viewGroupBy === 'capability' ? 'capability' : 'accountName'] =
        d.title;
      delete d.title;
    }

    if (d.subtitle) {
      d.accountId = d.subtitle;
      delete d.subtitle;
    }

    delete d.elementListLabel;
    delete d.elementScores;

    return d;
  });

  return useMemo(() => {
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
            <td
              style={{
                width: '160px',
                paddingLeft: '0px',
                paddingRight: '5px',
              }}
            >
              <ProgressBar
                height="12px"
                value={props?.totalPercentage}
                max={100}
                status={status}
              />
            </td>
            <td
              style={{ paddingLeft: '0px', cursor: 'pointer' }}
              onClick={() =>
                runView(
                  {
                    name: selectedReport.document.name,
                    account: selectedAccountId,
                  },
                  { ...selectedReport },
                  false,
                  true
                )
              }
            >
              <Icon type={Icon.TYPE.INTERFACE__OPERATIONS__REFRESH} />
            </td>

            <td style={{ textAlign: 'right' }}>
              {data && data.length > 0 && (
                <>
                  <Button
                    style={{ float: 'right' }}
                    iconType={Button.ICON_TYPE.INTERFACE__OPERATIONS__DOWNLOAD}
                    onClick={() =>
                      csvDownload({
                        data: data,
                        filename: `${new Date().getTime()}-${props.viewGroupBy ||
                          'account'}-summary-export.csv`,
                        delimiter: ',',
                      })
                    }
                    type={Button.TYPE.PRIMARY}
                    sizeType={Button.SIZE_TYPE.SMALL}
                  >
                    Download CSV
                  </Button>
                </>
              )}

              <HistorySelector />
            </td>
          </tr>
        </table>
      </>
    );
  }, [selectedAccountId, selectedReport, props]);
}
