import React, { useContext, useMemo } from 'react';
import rules, { productColors } from '../../rules';
import DataContext from '../../context/data';
import { Grid, GridItem, LineChart, HeadingText } from 'nr1';

export default function ScoreCharts(props) {
  const { groupBy } = props;
  const { view, viewHistory, userViewHistory } = useContext(DataContext);
  const history =
    view?.page === 'DefaultView'
      ? userViewHistory
      : viewHistory.filter((r) => r.document.reportId === view?.props?.id);

  const selected = view?.props?.selected || view?.props?.document?.selected;
  const accounts =
    view?.props?.accounts || view?.props?.document?.accounts || [];

  // standardize the colors used if in product grouping
  const accountColors = {};
  accounts.forEach((account) => {
    accountColors[account.id] = `#${Math.floor(
      Math.random() * 16777215
    ).toString(16)}`;
  });

  let chartData = [];

  if (groupBy === 'product') {
    chartData = Object.keys(rules)
      .filter((product) =>
        history.find((h) =>
          h.document.accountSummaries.find(
            (a) => a[product] !== null && a[product] !== undefined
          )
        )
      )
      .map((product) => {
        const lineData = [];
        const chartData = {};
        let showHistoryMarker = false;

        accounts.forEach((accountId) => {
          const series = {
            metadata: {
              id: accountId,
              name: accountId,
              color:
                accountColors[accountId] ||
                `#${Math.floor(Math.random() * 16777215).toString(16)}`,
              viz: 'main',
              units_data: {
                x: 'TIMESTAMP',
                y: 'COUNT',
              },
            },
            data: [],
          };

          history.forEach((h) => {
            const { document } = h;
            const { accountSummaries, runAt } = document;
            const data = { x: runAt, y: null };

            const summary = accountSummaries.find((a) => a.id === accountId);

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

        if (showHistoryMarker) {
          lineData.push({
            metadata: {
              id: `History Marker`,
              name: 'History Marker',
              color: '#000000',
              viz: 'event',
            },
            data: [
              {
                x0: selected,
                x1: selected + 1,
              },
            ],
          });
        }
        chartData.lineData = lineData;
        return chartData;
      });
  } else if (groupBy === 'account') {
    chartData = accounts.map((a) => {
      const lineData = [];
      const chartData = {};
      let showHistoryMarker = false;

      Object.keys(rules).forEach((key) => {
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
              y: 'COUNT',
            },
          },
          data: [],
        };

        history.forEach((h) => {
          const { document } = h;
          const { accountSummaries, runAt } = document;
          const data = { x: runAt, y: null };

          accountSummaries.forEach((s) => {
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
      if (showHistoryMarker) {
        lineData.push({
          metadata: {
            id: `History Marker`,
            name: 'History Marker',
            color: '#000000',
            viz: 'event',
          },
          data: [
            {
              x0: selected,
              x1: selected + 1,
            },
          ],
        });
      }
      chartData.lineData = lineData;
      return chartData;
    });
  }

  return useMemo(() => {
    return (
      <div>
        <Grid style={{ paddingTop: '10px' }}>
          {chartData.map((a) => {
            return (
              <GridItem
                key={a.accountId || a.productName}
                columnSpan={4}
                style={{ padding: '5px' }}
              >
                <HeadingText>{a.accountName || a.productName}</HeadingText>
                <LineChart data={a.lineData} fullWidth />
              </GridItem>
            );
          })}
        </Grid>
      </div>
    );
  }, [view, selected, chartData]);
}
