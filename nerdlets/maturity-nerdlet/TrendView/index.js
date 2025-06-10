import React, { useContext, useEffect, useMemo, useState } from 'react';
import {
  Grid,
  GridItem,
  LineChart,
  Card,
  CardBody,
  CardHeader,
  Select,
  SelectItem
} from 'nr1';
import DataContext from '../../../src/context/data';
import rules, { productColors } from '../../../src/rules';

export default function TrendView(props) {
  const { documentId } = props;
  const [selectedTime, setTime] = useState('all');
  const [accountInfo, setAccountInfo] = useState([]);

  const {
    view,
    viewConfigs,
    viewGroupBy,
    selectedReport,
    selectedView,
    getAccounts
  } = useContext(DataContext);

  useEffect(async () => {
    const x = await getAccounts();
    setAccountInfo(x);
  });

  const viewConfig = (viewConfigs || []).find(vc => vc.id === documentId);
  let { history } = viewConfig || [];

  if (selectedTime === 'month') {
    const timeAgoMs = new Date().getTime() - 2.628e9;
    history = history.filter(h => h.document.runAt >= timeAgoMs);
  } else if (selectedTime === 'week') {
    const timeAgoMs = new Date().getTime() - 6.048e8;
    history = history.filter(h => h.document.runAt >= timeAgoMs);
  } else if (selectedTime === 'day') {
    const timeAgoMs = new Date().getTime() - 8.64e7;
    history = history.filter(h => h.document.runAt >= timeAgoMs);
  }

  const selectedHistory = history.find(
    h => h.historyId === selectedView.historyId
  );

  // eslint-disable-next-line
  const selected = selectedHistory?.document?.runAt || 0;
  const accounts = selectedReport.document?.accounts || [];

  // standardize the colors used if in product grouping
  const accountColors = {};
  accounts.forEach(account => {
    accountColors[account.id] = `#${Math.floor(
      Math.random() * 16777215
    ).toString(16)}`;
  });

  let chartData = [];

  if (viewGroupBy === 'capability') {
    chartData = Object.keys(rules)
      .filter(product =>
        history.find(h =>
          h.document.accountSummaries.find(
            a => a[product] !== null && a[product] !== undefined
          )
        )
      )
      .map(product => {
        const lineData = [];
        const chartData = {};
        // eslint-disable-next-line
        let showHistoryMarker = false;

        accounts.forEach(accountId => {
          const series = {
            metadata: {
              id: accountId,
              name:
                accountInfo.find(a => a.id === accountId)?.name || accountId,
              color:
                accountColors[accountId] ||
                `#${Math.floor(Math.random() * 16777215).toString(16)}`,
              viz: 'main',
              units_data: {
                x: 'TIMESTAMP',
                y: 'COUNT'
              }
            },
            data: []
          };

          history.forEach(h => {
            const { document } = h;
            const { accountSummaries, runAt } = document;
            const data = { x: runAt, y: null };

            const summary = accountSummaries.find(a => a.id === accountId);

            if (summary) {
              if (summary[product] !== null && summary[product] !== undefined) {
                chartData.productName = product;
                data.y += summary[product];
              }
            }

            // data.y = data.y / accountSummaries.length;

            if (data.y) {
              series.data.push(data);
            }
          });

          if (series.data.length > 0) {
            lineData.push(series);
          }

          if (series.data.length > 1) {
            showHistoryMarker = true;
          }
        });

        // if (showHistoryMarker && selected) {
        //   lineData.push({
        //     metadata: {
        //       id: `History Marker`,
        //       name: 'History Marker',
        //       color: '#000000',
        //       viz: 'event',
        //     },
        //     data: [
        //       {
        //         x0: selected,
        //         x1: selected + 1,
        //       },
        //     ],
        //   });
        // }
        chartData.lineData = lineData;
        return chartData;
      });
  } else if (viewGroupBy === 'account') {
    chartData = accounts.map(a => {
      const lineData = [];
      const chartData = {};
      // eslint-disable-next-line
      let showHistoryMarker = false;

      Object.keys(rules).forEach(key => {
        const series = {
          metadata: {
            id: key,
            name: key,
            color:
              productColors[key] ||
              `#${Math.floor(Math.random() * 16777215).toString(16)}`,
            viz: 'main',
            units_data: {
              x: 'TIMESTAMP',
              y: 'COUNT'
            }
          },
          data: []
        };

        history.forEach(h => {
          const { document } = h;
          const { accountSummaries, runAt } = document;
          const data = { x: runAt, y: null };

          accountSummaries.forEach(s => {
            if (s[key] !== null && s[key] !== undefined && s.id === a) {
              chartData.accountName = s.name;
              chartData.accountId = s.id;
              data.y += s[key];
            }
          });

          data.y = data.y / accountSummaries.length;

          if (data.y) {
            series.data.push(data);
          }
        });

        if (series.data.length > 0) {
          lineData.push(series);
        }

        if (series.data.length > 1) {
          showHistoryMarker = true;
        }
      });

      // inject history marker
      // more than 1 series should be present in any product category otherwise it will highlight the entire chart
      // if (showHistoryMarker && selected) {
      //   lineData.push({
      //     metadata: {
      //       id: `History Marker`,
      //       name: 'History Marker',
      //       color: '#000000',
      //       viz: 'event',
      //     },
      //     data: [
      //       {
      //         x0: selected,
      //         x1: selected + 1,
      //       },
      //     ],
      //   });
      // }
      chartData.lineData = lineData;
      return chartData;
    });
  }

  return useMemo(() => {
    return (
      <div>
        <div style={{ float: 'right', paddingRight: '13px' }}>
          <Select
            value={selectedTime}
            onChange={(evt, value) => setTime(value)}
          >
            <SelectItem value="all">All time</SelectItem>
            <SelectItem value="month">Since last month</SelectItem>
            <SelectItem value="week">Since last week</SelectItem>
            <SelectItem value="day">Since last 24 hours</SelectItem>
          </Select>
        </div>
        <Grid style={{ paddingTop: '10px' }}>
          {chartData.map(a => {
            return (
              <GridItem
                key={a.accountId || a.productName}
                columnSpan={4}
                style={{
                  padding: '5px',
                  boxShadow: '1px 1px 2px rgb(243,244,255)',
                  margin: '6px'
                }}
              >
                <div className="golden-metrics">
                  <Card className="golden-metric-card">
                    <CardHeader
                      className="golden-metric-card-header"
                      title={a.accountName || a.productName}
                    />
                    <CardBody className="golden-metric-card-body">
                      <LineChart data={a.lineData} fullWidth />
                    </CardBody>
                  </Card>
                </div>
              </GridItem>
            );
          })}
        </Grid>
      </div>
    );
  }, [view, chartData, selectedTime]);
}
