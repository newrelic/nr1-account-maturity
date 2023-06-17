import React, { useMemo, useContext } from 'react';
import {
  Button,
  EmptyState,
  Table,
  TableHeader,
  TableHeaderCell,
  TableRow,
  TableRowCell,
} from 'nr1';
import DataContext from '../../context/data';

export default function ReportList() {
  const { checkUser, reportConfigs, deleteReportConfig, setDataState } =
    useContext(DataContext);

  console.log(reportConfigs);

  return useMemo(() => {
    if ((reportConfigs || []).length === 0) {
      return (
        <div style={{ textAlign: 'center' }}>
          <EmptyState
            iconType={EmptyState.ICON_TYPE.DOCUMENTS__DOCUMENTS__NOTES__A_EDIT}
            title="No reports configured"
            description="Create a report to get started."
            action={{
              label: 'Create Report',
              onClick: () =>
                setDataState({
                  view: { page: 'CreateReport', title: 'Create Report' },
                }),
            }}
          />
        </div>
      );
    }

    return (
      <>
        <Table items={reportConfigs}>
          <TableHeader>
            <TableHeaderCell value={({ item }) => item.document.name}>
              Name
            </TableHeaderCell>
            <TableHeaderCell value={({ item }) => item.document.owner?.name}>
              Owner
            </TableHeaderCell>
            <TableHeaderCell
              width="70px"
              value={({ item }) => item.document.accounts.length}
            >
              Accounts
            </TableHeaderCell>
            <TableHeaderCell
              value={({ item }) => item.document.latestScore}
              width="100px"
              alignmentType={TableRowCell.ALIGNMENT_TYPE.RIGHT}
            >
              Latest Score
            </TableHeaderCell>
            <TableHeaderCell
              alignmentType={TableRowCell.ALIGNMENT_TYPE.RIGHT}
              width="120px"
            />
          </TableHeader>

          {({ item }) => (
            <TableRow
              actions={[
                {
                  label: 'Delete',
                  type: TableRow.ACTION_TYPE.DESTRUCTIVE,
                  onClick: (evt, { item }) => {
                    if (checkUser(item.document.owner)) {
                      deleteReportConfig(item.id);
                    }
                  },
                },
              ]}
            >
              <TableRowCell>{item.document.name}</TableRowCell>
              <TableRowCell>{item.document.owner?.name} </TableRowCell>
              <TableRowCell>{item.document.accounts.length}</TableRowCell>
              <TableRowCell>{item.document?.latestScore}</TableRowCell>
              <TableRowCell style={{ textAlign: 'right' }}>
                <Button
                  type={Button.TYPE.PRIMARY}
                  sizeType={Button.SIZE_TYPE.SMALL}
                >
                  Run
                </Button>
                &nbsp; &nbsp;
                <Button
                  type={Button.TYPE.PRIMARY}
                  sizeType={Button.SIZE_TYPE.SMALL}
                >
                  Edit
                </Button>
              </TableRowCell>
            </TableRow>
          )}
        </Table>
      </>
    );
  }, [reportConfigs]);
}
