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
import { scoreToColor } from '../../utils';

export default function ReportList() {
  const dataCtx = useContext(DataContext);
  const {
    user,
    checkUser,
    runReport,
    reportHistory,
    runningReport,
    reportConfigs,
    deleteReportConfig,
    setDataState,
  } = dataCtx;

  const sortedReportConfigs = reportConfigs.map((r) => ({
    ...r,
    history: reportHistory.filter((h) => h.document.reportId === r.id),
  }));

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
        <Table items={sortedReportConfigs} multivalue>
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
              width="70px"
              value={({ item }) =>
                item.document?.allProducts
                  ? 100
                  : (item.document.products || []).length
              }
            >
              Products
            </TableHeaderCell>
            <TableHeaderCell
              value={({ item }) =>
                item?.history?.[0]?.document?.totalScorePercentage
              }
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

          {({ item }) => {
            const latestScore =
              item?.history?.[0]?.document?.totalScorePercentage;

            let rowClick = () =>
              setDataState({
                view: {
                  page: 'ReportView',
                  title: item.document.name,
                  subtitle: (
                    <div style={{ paddingBottom: '10px' }}>
                      <span style={{ fontSize: '12px', fontWeight: 'bold' }}>
                        Entity Search Query:
                      </span>
                      <span style={{ fontSize: '12px' }}>
                        &nbsp;{item.document?.entitySearchQuery || 'ALL'}
                      </span>
                    </div>
                  ),
                  props: {
                    ...item,
                    selected: item?.history?.[0]?.document?.runAt || 0,
                  },
                },
              });

            if (runningReport) rowClick = undefined;

            return (
              <TableRow
                actions={[
                  {
                    label: 'Delete',
                    type: TableRow.ACTION_TYPE.DESTRUCTIVE,
                    disabled: runningReport,
                    onClick: (evt, { item }) => {
                      if (checkUser(item.document.owner)) {
                        deleteReportConfig(item.id);
                      }
                    },
                  },
                ]}
              >
                <TableRowCell
                  style={{
                    // eslint-disable-next-line
                    borderLeft: `5px solid ${scoreToColor(latestScore).color
                      // eslint-disable-next-line prettier/prettier
                      }`,
                  }}
                  onClick={rowClick}
                  additionalValue={
                    item.document?.entitySearchQuery
                      ? `Entity Search: ${item.document.entitySearchQuery}`
                      : 'Entity Search: ALL'
                  }
                >
                  {item.document.name}
                </TableRowCell>
                <TableRowCell
                  onClick={rowClick}
                  additionalValue={item.document.owner.email}
                >
                  {item.document.owner?.name}{' '}
                </TableRowCell>
                <TableRowCell
                  onClick={rowClick}
                  alignmentType={TableRowCell.ALIGNMENT_TYPE.RIGHT}
                >
                  {item.document.accounts.length}
                </TableRowCell>
                <TableRowCell
                  onClick={rowClick}
                  alignmentType={TableRowCell.ALIGNMENT_TYPE.RIGHT}
                >
                  {item.document?.allProducts
                    ? 'All'
                    : item.document.products.length}
                </TableRowCell>
                <TableRowCell
                  onClick={rowClick}
                  alignmentType={TableRowCell.ALIGNMENT_TYPE.RIGHT}
                >
                  {latestScore !== null && latestScore !== undefined
                    ? `${latestScore.toFixed(2)}%`
                    : '-'}
                </TableRowCell>
                <TableRowCell style={{ textAlign: 'right' }}>
                  <Button
                    type={Button.TYPE.PRIMARY}
                    sizeType={Button.SIZE_TYPE.SMALL}
                    loading={dataCtx[`runningReport.${item.id}`]}
                    disabled={
                      runningReport || user.id !== item.document?.owner?.id
                    }
                    onClick={() => runReport(item)}
                  >
                    Run
                  </Button>
                  &nbsp; &nbsp;
                  <Button
                    type={Button.TYPE.PRIMARY}
                    sizeType={Button.SIZE_TYPE.SMALL}
                    disabled={
                      runningReport || user.id !== item.document?.owner?.id
                    }
                    onClick={() =>
                      setDataState({
                        view: {
                          page: 'CreateReport',
                          title: 'Edit Report',
                          props: item,
                        },
                      })
                    }
                  >
                    Edit
                  </Button>
                </TableRowCell>
              </TableRow>
            );
          }}
        </Table>
      </>
    );
  }, [reportConfigs, runningReport, reportHistory]);
}
