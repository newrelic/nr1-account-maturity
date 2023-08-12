import React, { useContext, useMemo } from 'react';
import rules, { productColors } from '../../rules';
import DataContext from '../../context/data';
import { Grid, GridItem, LineChart, HeadingText } from 'nr1';

export default function ScoreCharts() {
  const { view, reportHistory, userViewHistory } = useContext(DataContext);
  const history =
    view?.page === 'DefaultView'
      ? userViewHistory
      : reportHistory.filter((r) => r.document.reportId === view?.props?.id);

  const selected = view?.props?.selected || view?.props?.document?.selected;

  const accountProductChartData = (
    view?.props?.accounts ||
    view?.props?.document?.accounts ||
    []
  ).map((a) => {
    const productLineData = [];
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
        productLineData.push(series);
      }

      if (series.data.length > 1) {
        showHistoryMarker = true;
      }
    });

    // inject history marker
    // more than 1 series should be present in any product category otherwise it will highlight the entire chart
    if (showHistoryMarker) {
      productLineData.push({
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
    chartData.productLineData = productLineData;
    return chartData;
  });

  return useMemo(() => {
    return (
      <div>
        <Grid style={{ paddingTop: '10px' }}>
          {accountProductChartData.map((a) => {
            return (
              <GridItem
                key={a.accountId}
                columnSpan={4}
                style={{ padding: '5px' }}
              >
                <HeadingText>{a.accountName}</HeadingText>
                <LineChart data={a.productLineData} fullWidth />
              </GridItem>
            );
          })}
        </Grid>
      </div>
    );
  }, [view, selected]);
}
