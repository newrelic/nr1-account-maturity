import React, { useState } from 'react';
import {
  navigation,
  Table,
  TableHeader,
  TableHeaderCell,
  TableRow,
  TableRowCell,
} from 'nr1';

export default function EntityTable(props) {
  const {
    entities,
    entitiesPassing,
    totalEntities,
    accountId,
    accountName,
    categoryName,
  } = props;
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

  const headers = [{ key: 'Name', value: ({ item }) => item.name }];

  const items = [];

  let tempHeaders = [];
  Object.keys(entities).forEach((guid) => {
    const value = entities[guid];
    items.push({ guid, ...value });

    Object.keys(value).forEach((rule) => {
      if (rule !== 'name') {
        tempHeaders.push(rule);
      }
    });
  });

  tempHeaders = [...new Set(tempHeaders)];

  tempHeaders.forEach((header) => {
    headers.push({
      key: header,
      value: ({ item }) => (item[header] === false ? false : true),
    });
  });

  return (
    <div style={{ paddingTop: '15px' }}>
      <Table items={items.length > 5 ? items.slice(0, 5) : items}>
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
            <TableRow actions={[]}>
              <TableRowCell
                onClick={() => navigation.openStackedEntity(item.guid)}
              >
                {item.name}
              </TableRowCell>
              {tempHeaders.map((header) => {
                return (
                  <TableRowCell key={header}>
                    {item[header] === false ? '❌' : '✅'}
                  </TableRowCell>
                );
              })}
            </TableRow>
          );
        }}
      </Table>
      {totalEntities > 1 && (
        <>
          <div style={{ paddingLeft: '20px', paddingTop: '10px' }}>
            <a
              onClick={() =>
                navigation.openStackedNerdlet({
                  id: 'details-table-nerdlet',
                  urlState: {
                    categoryName,
                    accountId,
                    accountName,
                    entities,
                    entitiesPassing,
                  },
                })
              }
            >
              {totalEntities === 1
                ? 'View all entity data'
                : `View all ${totalEntities} entities`}{' '}
            </a>
          </div>
        </>
      )}
    </div>
  );
}
