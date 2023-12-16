import React, { useState, useContext, useMemo } from 'react';

import {
  Table,
  TableHeader,
  TableHeaderCell,
  TableRow,
  TableRowCell,
} from 'nr1';

import DataContext from '../../../src/context/data';
import { calculatePercentageChange } from '../../../src/utils';

export default function ViewList() {
  const {
    viewConfigs,
    search,
    setDataState,
    runView,
    loadHistoricalResult,
    selectedAccountId,
  } = useContext(DataContext);
  const [column, setColumn] = useState(0);
  const [sortingType, setSortingType] = useState(
    TableHeaderCell.SORTING_TYPE.NONE
  );

  const onClickTableHeaderCell = (nextColumn, { nextSortingType }) => {
    if (nextColumn === column) {
      setSortingType(nextSortingType);
    } else {
      setSortingType(nextSortingType);
      setColumn(nextColumn);
    }
  };

  const headers = [
    { key: 'View', value: ({ item }) => item.document?.name },
    { key: 'Description', value: ({ item }) => item.document?.description },
    {
      key: 'Last run',
      value: ({ item }) => {
        const runAt = item?.history?.[0]?.document?.runAt;
        if (runAt) {
          return new Date(runAt).toLocaleString();
        } else {
          return '';
        }
      },
    },
    {
      key: 'Last score',
      value: ({ item }) =>
        Math.round(item?.history?.[0]?.document?.totalPercentage || 0),
    },
    {
      key: 'Last % score change',
      value: ({ item }) => {
        const latestScore = item?.history?.[0]?.document?.totalPercentage || 0;
        const previousSCore =
          item?.history?.[1]?.document?.totalPercentage || 0;

        if (latestScore && previousSCore) {
          const change = calculatePercentageChange(latestScore, previousSCore);
          return `${Math.round(change)}%`;
        } else {
          return '';
        }
      },
    },
    { key: 'Created by', value: ({ item }) => item.document?.owner },
  ];

  const actions = [
    {
      label: 'Run',
      onClick: (evt, { item }) => {
        runView(
          {
            name: item.document.name,
            account: selectedAccountId,
          },
          { ...item },
          false,
          true
        );
      },
    },
    {
      label: 'Edit',
      onClick: (evt, { item }) => {
        setDataState({ selectedReport: item, view: { page: 'EditView' } });
      },
    },
    {
      label: 'Delete',
      type: TableRow.ACTION_TYPE.DESTRUCTIVE,
      onClick: (evt, { item }) => setDataState({ deleteViewModalOpen: item }),
    },
  ];

  const filteredConfigs = viewConfigs.filter((c) =>
    c.document.name.toLowerCase().includes(search.toLowerCase())
  );

  return useMemo(() => {
    return (
      <div>
        <Table items={filteredConfigs}>
          <TableHeader>
            {headers.map((h, i) => (
              // eslint-disable-next-line react/jsx-key
              <TableHeaderCell
                {...h}
                sortable
                sortingType={
                  column === i ? sortingType : TableHeaderCell.SORTING_TYPE.NONE
                }
                onClick={(event, data) => onClickTableHeaderCell(i, data)}
              >
                {h.key}
              </TableHeaderCell>
            ))}
          </TableHeader>

          {({ item }) => {
            return (
              <TableRow actions={actions}>
                {headers.map((header) => {
                  if (header.key === 'View') {
                    const previousResult = item?.history?.[0];
                    let onClickHandler = undefined;

                    if (previousResult) {
                      onClickHandler = () =>
                        loadHistoricalResult(item, previousResult);
                    } else {
                      onClickHandler = () =>
                        runView(
                          {
                            name: item.document.name,
                            account: selectedAccountId,
                          },
                          { ...item },
                          false,
                          true
                        );
                    }

                    return (
                      <TableRowCell key={header.key} onClick={onClickHandler}>
                        {header.value({ item })}
                      </TableRowCell>
                    );
                  }

                  return (
                    <TableRowCell key={header}>
                      {header.value({ item })}
                    </TableRowCell>
                  );
                })}
              </TableRow>
            );
          }}
        </Table>
      </div>
    );
  }, [viewConfigs, search, column, sortingType]);
}
