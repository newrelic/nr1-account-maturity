import React, { useContext, useMemo, useState } from 'react';
import rules from '../../rules';
import DataContext from '../../context/data';
import {
  navigation,
  Tooltip,
  Table,
  TableHeader,
  TableHeaderCell,
  TableRow,
  TableRowCell,
} from 'nr1';
import { percentageToStatus, scoreToColor } from '../../utils';
import { ProgressBar } from '@newrelic/nr-labs-components';

export default function ScoreTable() {
  const [column, setColumn] = useState(0);
  const [sortingType, setSortingType] = useState(
    TableHeaderCell.SORTING_TYPE.NONE
  );
  const { view, reportHistory, userViewHistory, selectedAccountId } =
    useContext(DataContext);
  const history =
    view?.page === 'DefaultView'
      ? userViewHistory
      : reportHistory.filter((r) => r.document.reportId === view?.props?.id);

  const selected = view?.props?.selected || view?.props?.document?.selected;
  const historyDoc = history.find((h) => h.document.runAt === selected);

  const onClickTableHeaderCell = (nextColumn, { nextSortingType }) => {
    if (nextColumn === column) {
      setSortingType(nextSortingType);
    } else {
      setSortingType(nextSortingType);
      setColumn(nextColumn);
    }
  };

  return useMemo(() => {
    if (!historyDoc) {
      return <div>Unable to find history selection.</div>;
    }

    const productHeaders = Object.keys(rules)
      .filter((product) =>
        historyDoc.document.accountSummaries.find((s) => s[product])
      )
      .map((product) => ({ name: product, value: (a) => a[product] }));

    const headers = [
      {
        name: 'Account',
        // do this to make handling sub values and csv export a touch easier
        value: (a) => `${a.name} :: ${a.id}`,
      },
      {
        name: 'Account Score',
        value: (a) => a.scorePercentage,
      },
      ...productHeaders,
    ];

    const rowData = historyDoc.document.accountSummaries.map((a) => {
      const row = {};

      headers.forEach((h) => {
        row[h.name] = h.value(a);
      });

      return row;
    });

    return (
      <div style={{ paddingTop: '10px' }}>
        <Table items={rowData} multivalue>
          <TableHeader>
            <TableHeaderCell
              value={({ item }) => item['Account']}
              sortable
              sortingType={
                column === 0 ? sortingType : TableHeaderCell.SORTING_TYPE.NONE
              }
              onClick={(event, data) => onClickTableHeaderCell(0, data)}
            >
              Account
            </TableHeaderCell>
            <TableHeaderCell
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
                    borderLeft: `5px solid ${scoreToColor(item['Account Score']).color
                      // eslint-disable-next-line
                      }`,
                  }}
                  //
                  onClick={() =>
                    navigation.openStackedNerdlet({
                      id: 'score-details-nerdlet',
                      urlState: {
                        isUserDefault: view?.page === 'DefaultView',
                        accountName: accountSplit[0],
                        accountId: parseInt(accountSplit[1]),
                        accountPercentage: item['Account Score'],
                        historyId: historyDoc.id,
                        selectedAccountId,
                        entitySearchQuery:
                          historyDoc.document?.entitySearchQuery,
                      },
                    })
                  }
                >
                  {accountSplit[0]}
                </TableRowCell>
                <TableRowCell
                  style={{
                    fontWeight: 'bold',
                    fontSize: '15px',
                    color: scoreToColor(item['Account Score']).color,
                  }}
                >
                  {/* {item['Account Score']} */}

                  <Tooltip
                    text={
                      item['Account Score'] ? item['Account Score'] : undefined
                    }
                  >
                    <div style={{ width: '100px' }}>
                      <ProgressBar
                        height="25px"
                        value={item['Account Score']}
                        max={100}
                        status={percentageToStatus(item['Account Score'])}
                      />
                    </div>
                  </Tooltip>
                </TableRowCell>
                {productHeaders.map((h) => (
                  <TableRowCell
                    key={h.name}
                    style={{
                      fontWeight: 'bold',
                      fontSize: '15px',
                      color: scoreToColor(item[h.name]).color,
                    }}
                  >
                    {item[h.name] !== undefined && item[h.name] !== null ? (
                      <Tooltip text={item[h.name].toFixed(2)}>
                        {Math.round(item[h.name])}
                      </Tooltip>
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
  }, [view, selected, column, sortingType]);
}
