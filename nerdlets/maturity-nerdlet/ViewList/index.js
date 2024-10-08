import React, { useState, useContext, useMemo, useEffect } from 'react';
import {
  nerdlet,
  Table,
  TableHeader,
  TableHeaderCell,
  TableRow,
  TableRowCell,
  FavoriteTableRowCell,
  Toast,
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
    userSettings,
    toggleFavoriteView,
    email,
  } = useContext(DataContext);
  const [column, setColumn] = useState(0);
  const [sortingType, setSortingType] = useState(
    TableHeaderCell.SORTING_TYPE.NONE
  );
  const favorites = userSettings?.favorites || [];

  useEffect(() => {
    nerdlet.setConfig({
      actionControls: false,
    });
  }, []);

  const onClickTableHeaderCell = (nextColumn, { nextSortingType }) => {
    if (nextColumn === column) {
      setSortingType(nextSortingType);
    } else {
      setSortingType(nextSortingType);
      setColumn(nextColumn);
    }
  };

  const headers = [
    {
      key: 'View',
      value: ({ item }) => {
        let name = item.document?.name;
        if (userSettings?.defaultViewId === item?.id) {
          name = `${name} (default)`;
        }

        return name;
      },
    },
    {
      key: 'Description',
      value: ({ item }) => item.document?.description,
      onClick: ({ item }) => {
        const previousResult = item?.history?.[0];
        let onClickHandler = undefined;

        if (previousResult) {
          onClickHandler = () => loadHistoricalResult(item, previousResult);
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

        return onClickHandler;
      },
    },
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
    {
      key: 'Created by',
      value: ({ item }) =>
        item?.id === `allData+${email}` ? email : item.document?.owner,
    },
  ];

  const actions = [
    {
      label: 'Run',
      onClick: (evt, { item }) => {
        if (item.id === `allData+${email}`) {
          runView(
            { id: `allData+${email}`, name: 'All data' },
            null,
            false,
            true
          );
        } else {
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
      },
    },
    {
      label: 'Edit',
      onClick: (evt, { item }) => {
        const documentId =
          item.id === 'allData+undefined' ? `allData+${email}` : documentId;

        if (documentId === `allData+${email}`) {
          Toast.showToast({
            title: 'This view cannot be edited',
            type: Toast.TYPE.NORMAL,
          });
        } else {
          setDataState({ selectedReport: item, view: { page: 'EditView' } });
        }
      },
    },
    {
      label: 'Delete',
      type: TableRow.ACTION_TYPE.DESTRUCTIVE,
      onClick: (evt, { item }) => {
        const documentId =
          item.id === 'allData+undefined' ? `allData+${email}` : documentId;

        if (documentId === `allData+${email}`) {
          Toast.showToast({
            title: 'This view cannot be deleted',
            type: Toast.TYPE.NORMAL,
          });
        } else {
          setDataState({ deleteViewModalOpen: item });
        }
      },
    },
  ];

  const filteredConfigs = viewConfigs
    .filter(c =>
      (c?.document?.name || '')
        .toLowerCase()
        .includes((search || '').toLowerCase())
    )
    .sort((a, b) => favorites.includes(b.id) - favorites.includes(a.id));

  return useMemo(() => {
    return (
      <div>
        <Table items={filteredConfigs}>
          <TableHeader>
            <TableHeaderCell width="56px" />

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
                <FavoriteTableRowCell
                  style={{
                    color: favorites.includes(item.id) ? '#F0B400' : undefined,
                  }}
                  onChange={() => toggleFavoriteView(item.id)}
                  checked={favorites.includes(item.id)}
                />

                {headers.map(header => {
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
                    <TableRowCell
                      key={header}
                      onClick={
                        header.onClick ? header.onClick({ item }) : undefined
                      }
                    >
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
  }, [viewConfigs, search, column, sortingType, JSON.stringify(favorites)]);
}
