import React, { useContext } from 'react';
import {
  PlatformStateContext,
  NerdletStateContext,
  AutoSizer,
  Select,
  SelectItem,
} from 'nr1';
import { ProvideData } from '../../src/context/data';
import { scoreToColor } from '../../src/utils';
import { useSetState } from '@mantine/hooks';
import DetailsTable from './DetailTable';

export default function ProductDetailsNerdlet() {
  const platformContext = useContext(PlatformStateContext);
  const nerdletContext = useContext(NerdletStateContext);
  const { rollUpScore, title } = nerdletContext;

  const statusColor = scoreToColor(rollUpScore)?.color;
  const percentageDiff = 100 - rollUpScore;
  const [dataState, setDataState] = useSetState({
    sortBy: 'Lowest score',
  });

  const updateSortBy = sortBy => {
    setDataState({ sortBy });
  };

  console.log(nerdletContext);

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
                  width: width * (rollUpScore / 100) - 10,
                }}
              ></div>
              <div
                style={{
                  display: 'inline-block',
                  borderTop: '10px solid #cccccc',
                  width: width * (percentageDiff / 100) - 10,
                }}
              ></div>
              <table style={{ width: '100%' }}>
                <tr>
                  <td>
                    <div style={{ paddingTop: '10px' }}>
                      <span style={{ fontWeight: 'bold', fontSize: '18px' }}>
                        {title} |
                      </span>{' '}
                      <span style={{ fontSize: '16px' }}>Overall score: </span>
                      <span
                        style={{
                          fontWeight: 'bold',
                          fontSize: '16px',
                          color: statusColor,
                        }}
                      >
                        {Math.round(rollUpScore)}%
                      </span>
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
              <br /> <br />
              <hr />
              <DetailsTable {...nerdletContext} sortBy={dataState.sortBy} />
            </div>
          )}
        </AutoSizer>
      </ProvideData>
    </div>
  );
}
