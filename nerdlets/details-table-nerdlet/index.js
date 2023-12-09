// eslint-disable-next-line eslint-comments/disable-enable-pair
/* eslint-disable prettier/prettier */
import React, { useState, useContext } from 'react';
import {
  Button,
  NerdletStateContext,
  navigation,
  Table,
  TableHeader,
  TableHeaderCell,
  TableRow,
  TableRowCell,
} from 'nr1';
import rules from '../../src/rules';
import csvDownload from 'json-to-csv-export';

export default function ExtendedDetailsTable(props) {
  const { limit, noMeta, hideDownload } = props;
  const nerdletContext = useContext(NerdletStateContext);
  const {
    allEntities = props?.allEntities,
    categoryName = props?.categoryName,
  } = nerdletContext;

  const [column, setColumn] = useState(0);
  const [sortingType, setSortingType] = useState(
    TableHeaderCell.SORTING_TYPE.NONE
  );

  const ruleSet = rules[categoryName];

  const onClickTableHeaderCell = (nextColumn, { nextSortingType }) => {
    if (nextColumn === column) {
      setSortingType(nextSortingType);
    } else {
      setSortingType(nextSortingType);
      setColumn(nextColumn);
    }
  };

  let tagMetaHeaders = [];
  if (!noMeta) {
    tagMetaHeaders = (ruleSet?.tagMeta || []).map((t) => ({
      key: t.name,
      value: ({ item }) => item[t.key],
    }));
  }

  const headers = [
    { key: 'Name', value: ({ item }) => item.name },
    ...tagMetaHeaders,
  ];

  let tempHeaders = [];

  ruleSet.scores.forEach((s) => {
    if (
      s.name !== 'name' &&
      !(ruleSet?.tagMeta || []).some((t) => t.key === s.name)
    ) {
      allEntities.forEach((i) => {
        if (i[s.name] === undefined) {
          i[s.name] = true;
        }
      });
      tempHeaders.push(s.name);
    }
  });

  tempHeaders = [...new Set(tempHeaders)];

  tempHeaders.forEach((header) => {
    headers.push({
      key: header,
      value: ({ item }) => (item[header] === false ? false : true),
    });
  });

  return (
    <div
      style={{ paddingTop: '15px', paddingLeft: '15px', paddingRight: '10px' }}
    >
      {!hideDownload && (
        <div style={{ marginBottom: '35px' }}>
          <div style={{ float: 'left', paddingLeft: '2px' }}>
            <span style={{ fontSize: '24px', fontWeight: 600 }}>
              {ruleSet?.long || 'Extended'} Info
            </span>
          </div>
          <div style={{ float: 'right', paddingRight: '17px' }}>
            <Button
              iconType={Button.ICON_TYPE.INTERFACE__OPERATIONS__DOWNLOAD}
              onClick={() =>
                csvDownload({
                  data: allEntities,
                  filename: `${new Date().getTime()}-${categoryName}-export.csv`,
                  delimiter: ',',
                })
              }
              type={Button.TYPE.PRIMARY}
              sizeType={Button.SIZE_TYPE.SMALL}
            >
              Download CSV
            </Button>
          </div>
        </div>
      )}
      <Table items={limit ? allEntities.slice(0, limit) : allEntities}>
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
              {tagMetaHeaders.map((h) => (
                <TableRowCell key={h.key}>{h.value({ item })}</TableRowCell>
              ))}
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
    </div>
  );
}
