import React, { useState, useContext, useMemo } from 'react';

import {
  Table,
  TableHeader,
  TableHeaderCell,
  TableRow,
  TableRowCell,
} from 'nr1';

import DataContext from '../../../src/context/data';

export default function ViewList() {
  const { viewConfigs, search, setDataState } = useContext(DataContext);
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
    { key: 'Last run', value: ({ item }) => item.document?.name },
    { key: 'Last score', value: ({ item }) => item.document?.name },
    { key: 'Last % score change', value: ({ item }) => item.document?.name },
    { key: 'Created by', value: ({ item }) => item.document?.name },
  ];

  const actions = [
    {
      label: 'Edit',
      onClick: (evt, { item, index }) => {
        alert(
          `Show details:\nItem: ${index}\n${JSON.stringify(item, null, 2)}`
        );
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
