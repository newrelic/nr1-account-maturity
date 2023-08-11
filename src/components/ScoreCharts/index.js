import React, { useContext, useMemo } from 'react';
import rules from '../../rules';
import DataContext from '../../context/data';
import { Grid, GridItem, LineChart, HeadingText } from 'nr1';

export default function ScoreCharts() {
  const { view, reportHistory, userViewHistory } = useContext(DataContext);
  const history =
    view?.page === 'DefaultView'
      ? userViewHistory
      : reportHistory.filter((r) => r.document.reportId === view?.props?.id);

  const accountProductChartData = (
    view?.props?.accounts ||
    view?.props?.document?.accounts ||
    []
  ).map((a) => {
    const productLineData = [];
    const chartData = {};

    Object.keys(rules).forEach((key) => {
      const series = {
        metadata: {
          id: key,
          name: key,
          color: `#${Math.floor(Math.random() * 16777215).toString(16)}`,
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

      productLineData.push(series);
    });
    chartData.productLineData = productLineData;
    return chartData;
  });

  console.log(accountProductChartData);

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
  }, [view]);
}
