/* eslint-disable */
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
import { defaultActions } from '../AccountMaturity';

export default function ViewList() {
  const {
    view,
    viewConfigs,
    search,
    setDataState,
    runView,
    loadHistoricalResult,
    selectedAccountId,
    userSettings,
    toggleFavoriteView,
    email,
    loadedDefaultView,
    selectedReport,
    selectedView,
  } = useContext(DataContext);
  const [column, setColumn] = useState(0);
  const [sortingType, setSortingType] = useState(
    TableHeaderCell.SORTING_TYPE.NONE,
  );
  const favorites = userSettings?.favorites || [];

  useEffect(() => {
    nerdlet.setConfig({
      actionControls: true,
      actionControlButtons: [...defaultActions(setDataState)],
    });

    const defaultViewConfig = viewConfigs.find(
      (vc) => vc.id === userSettings?.defaultViewId,
    );

    if (loadedDefaultView === false && defaultViewConfig) {
      setDataState({ loadedDefaultView: true });
      const viewConfig = defaultViewConfig;

      if (viewConfig?.id === `allData+${email}`) {
        runView(
          { id: `allData+${email}`, name: 'All data' },
          null,
          false,
          true,
        );
      } else {
        runView(
          {
            name: viewConfig.document.name,
            account: selectedAccountId,
          },
          { ...viewConfig },
          false,
          true,
        );
      }
    }
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
        let onClickHandler;

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
              true,
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
            true,
          );
        } else {
          runView(
            {
              name: item.document.name,
              account: selectedAccountId,
            },
            { ...item },
            false,
            true,
          );
        }
      },
    },
    {
      label: 'Edit',
      onClick: (evt, { item }) => {
        console.log(item);
        const documentId =
          item.id === 'allData+undefined'
            ? `allData+${email}`
            : item.document.id;

        if (documentId === `allData+${email}`) {
          Toast.showToast({
            title: 'All Data is a reserved view and cannot be edited',
            type: Toast.TYPE.NORMAL,
          });
        } else {
          setDataState({
            selectedReport: item,
            view: { page: 'EditView' },
            prevView: view,
            prevSelectedReport: selectedReport,
            prevSelectedView: selectedView,
          });
        }
      },
    },
    {
      label: 'Delete',
      type: TableRow.ACTION_TYPE.DESTRUCTIVE,
      onClick: (evt, { item }) => {
        const documentId =
          item.id === 'allData+undefined'
            ? `allData+${email}`
            : item.document.id;

        if (documentId === `allData+${email}`) {
          Toast.showToast({
            title: 'All Data is a reserved view and cannot be deleted',
            type: Toast.TYPE.NORMAL,
          });
        } else {
          setDataState({ deleteViewModalOpen: item });
        }
      },
    },
  ];

  const filteredConfigs = viewConfigs
    .filter((c) =>
      (c?.document?.name || '')
        .toLowerCase()
        .includes((search || '').toLowerCase()),
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

                {headers.map((header) => {
                  if (header.key === 'View') {
                    const previousResult = item?.history?.[0];
                    const SEVEN_DAYS_MS = 3 * 24 * 60 * 60 * 1000;
                    const runAtTimestamp = previousResult?.document?.runAt
                      ? new Date(previousResult.document.runAt).getTime()
                      : null;
                    const isOlderThanSevenDays =
                      (runAtTimestamp !== null &&
                        Date.now() - runAtTimestamp > SEVEN_DAYS_MS) ||
                      item.document.owner === 'etantry+demotron@newrelic.com';

                    let onClickHandler;

                    if (previousResult && !isOlderThanSevenDays) {
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
                          true,
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
