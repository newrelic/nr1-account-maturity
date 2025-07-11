import React, { useContext, useMemo, useState } from 'react';
import {
  HeadingText,
  Table,
  TableHeader,
  TableHeaderCell,
  TableRow,
  TableRowCell,
  Button,
  Modal,
  navigation,
  Tooltip
} from 'nr1';
import ScoreBar from '../ScoreBar';
import rules from '../../../src/rules';
import { percentageToStatus, scoreToColor } from '../../../src/utils';
import { ProgressBar } from '@newrelic/nr-labs-components';
import DataContext from '../../../src/context/data';

export default function ListView(props) {
  const [column, setColumn] = useState(0);
  const [modal, setModal] = useState(null);
  const [sortingType, setSortingType] = useState(
    TableHeaderCell.SORTING_TYPE.NONE
  );
  const { selectedView, selectedReport, accounts } = useContext(DataContext);

  const onClickTableHeaderCell = (nextColumn, { nextSortingType }) => {
    if (nextColumn === column) {
      setSortingType(nextSortingType);
    } else {
      setSortingType(nextSortingType);
      setColumn(nextColumn);
    }
  };

  return useMemo(() => {
    if (!props.accountSummaries) {
      return <div>Unable to find history selection.</div>;
    }

    const productHeaders = Object.keys(rules)
      .filter(product => props.accountSummaries.find(s => s[product]))
      .map(product => ({ name: product, value: a => a[product] }));

    const headers = [
      {
        name: 'Account',
        // do this to make handling sub values and csv export a touch easier
        value: a => `${a.name} :: ${a.id}`
      },
      {
        name: 'Account Score',
        value: a => a.scorePercentage
      },
      ...productHeaders
    ];

    const rowData = props.accountSummaries.map(a => {
      const row = {};

      headers.forEach(h => {
        row[h.name] = h.value(a);
      });

      return row;
    });

    return (
      <div>
        <ScoreBar {...props} data={rowData} selectedReport={selectedReport} />

        <Modal hidden={!modal} onClose={() => setModal(null)}>
          <HeadingText type={HeadingText.TYPE.HEADING_3}>
            {modal?.Account.replace('::', '-')}
          </HeadingText>

          <HeadingText type={HeadingText.TYPE.HEADING_4}>
            {modal?.name}
          </HeadingText>

          <br />

          <div>
            {Object.keys(modal?.productSummary || {}).map(key => {
              const value = modal?.productSummary?.[key];

              return (
                <div key={key}>
                  <HeadingText type={HeadingText.TYPE.HEADING_5}>
                    {key}
                  </HeadingText>

                  {Object.keys(value || {}).map(subKey => {
                    return (
                      <div key={subKey}>
                        {subKey}: {value[subKey]}
                      </div>
                    );
                  })}
                  <br />
                </div>
              );
            })}
          </div>

          <Button onClick={() => setModal(null)}>Close</Button>
        </Modal>
        <Table items={rowData} multivalue>
          <TableHeader>
            <TableHeaderCell
              value={({ item }) => item.Account}
              sortable
              sortingType={
                column === 0 ? sortingType : TableHeaderCell.SORTING_TYPE.NONE
              }
              onClick={(event, data) => onClickTableHeaderCell(0, data)}
            >
              Account
            </TableHeaderCell>
            <TableHeaderCell
              // set at 120px as the progress bar is set to 100px, if lower than 120px then it may not show and just be ellipses
              width="120px"
              value={({ item }) => item['Account Score']}
              sortable
              sortingType={
                column === 1 ? sortingType : TableHeaderCell.SORTING_TYPE.NONE
              }
              onClick={(event, data) => onClickTableHeaderCell(1, data)}
            >
              Score
            </TableHeaderCell>
            {productHeaders.map((p, i) => (
              <TableHeaderCell
                key={p.name}
                value={({ item }) => item[p.name]}
                sortable
                alignmentType={TableHeaderCell.ALIGNMENT_TYPE.CENTER}
                sortingType={
                  column === i + 2
                    ? sortingType
                    : TableHeaderCell.SORTING_TYPE.NONE
                }
                onClick={(event, data) => onClickTableHeaderCell(i + 2, data)}
              >
                {p.name}
              </TableHeaderCell>
            ))}
          </TableHeader>

          {({ item }) => {
            const accountSplit = item.Account.split(' :: ');
            return (
              <TableRow>
                <TableRowCell
                  additionalValue={accountSplit[1]}
                  style={{
                    cursor: 'pointer',
                    // eslint-disable-next-line
                    borderLeft: `5px solid ${
                      scoreToColor(item['Account Score'])?.color
                      // eslint-disable-next-line
                    }`
                  }}
                  onClick={() =>
                    navigation.openStackedNerdlet({
                      id: 'account-details-nerdlet',
                      urlState: {
                        accountName: accountSplit[0],
                        accountId: parseInt(accountSplit[1]),
                        accountPercentage: item['Account Score'],
                        accountSummary: (props.accountSummaries || []).find(
                          a => a.id === parseInt(accountSplit[1])
                        )
                      }
                    })
                  }
                >
                  {accountSplit[0]}
                </TableRowCell>
                <TableRowCell
                  style={{
                    fontWeight: 'bold',
                    fontSize: '15px',
                    color: scoreToColor(item['Account Score'])?.color
                  }}
                >
                  {/* {item['Account Score']} */}

                  <Tooltip
                    text={
                      item['Account Score']
                        ? parseFloat(item['Account Score'] || 0).toFixed(2)
                        : undefined
                    }
                  >
                    <div style={{ width: '100px' }}>
                      <ProgressBar
                        height="15px"
                        value={item['Account Score'].toFixed(2)}
                        max={100}
                        status={percentageToStatus(item['Account Score'])}
                      />
                      {/* <span
                        style={{
                          color: percentageToStatus(item['Account Score']),
                          fontSize: '12px',
                          fontWeight: 800,
                        }}
                      >
                        {item['Account Score'].toFixed(0)}
                      </span> */}
                    </div>
                  </Tooltip>
                </TableRowCell>
                {productHeaders.map(h => (
                  <TableRowCell
                    key={h.name}
                    style={{
                      textAlign: 'center',
                      fontWeight: 'bold',
                      fontSize: '15px',
                      color: scoreToColor(item[h.name])?.color
                    }}
                  >
                    {item[h.name] !== undefined && item[h.name] !== null ? (
                      <div
                        style={{ cursor: 'pointer' }}
                        onClick={() => {
                          const fullSummary = props.accountSummaries.find(
                            a => a.id === parseInt(accountSplit[1])
                          );

                          const productSummary =
                            fullSummary?.[`${h.name}.scoring`];

                          setModal({
                            name: h.name,
                            ...item,
                            productSummary
                          });
                        }}
                      >
                        <Tooltip text={item[h.name].toFixed(2)}>
                          {Math.round(item[h.name])}
                        </Tooltip>
                      </div>
                    ) : (
                      item[h.name]
                    )}
                  </TableRowCell>
                ))}
              </TableRow>
            );
          }}
        </Table>
      </div>
    );
  }, [column, sortingType, modal, selectedView, accounts]);
}
