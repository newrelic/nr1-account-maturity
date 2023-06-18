import React, { useMemo } from 'react';
import { Grid, GridItem, BillboardChart, LineChart } from 'nr1';
import rules from '../../rules';
import MaturityContainer from './maturityContainer';

export default function ReportView(props) {
  return useMemo(() => {
    const { history, selected } = props;

    const latestScorePerc = history?.[0]?.document?.totalScorePercentage;
    let prevScorePerc = history?.[1]?.document?.totalScorePercentage;
    prevScorePerc = isNaN(prevScorePerc) ? latestScorePerc : prevScorePerc;

    const billboardData = [
      {
        metadata: {
          id: 'LatestScore',
          name: 'Latest Score',
          viz: 'main',
          units_data: {
            y: 'PERCENTAGE',
          },
        },
        data: [
          { y: prevScorePerc / 100 }, // Previous value.
          { y: latestScorePerc / 100 }, // Current value.
        ],
      },
    ];

    const lineData = [
      {
        metadata: {
          id: 'scoreHistory',
          name: 'Score History',
          color: '#a35ebf',
          viz: 'main',
          units_data: {
            x: 'TIMESTAMP',
            y: 'COUNT',
          },
        },
        data: (history || []).map((h) => ({
          x: h?.document?.runAt,
          y: h?.document?.totalScorePercentage,
        })),
      },
    ];

    const productLineData = [];
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
          if (s[key]) {
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

    return (
      <>
        <Grid>
          <GridItem columnSpan={4} style={{ padding: '5px' }}>
            <BillboardChart data={billboardData} fullWidth />
          </GridItem>
          <GridItem columnSpan={4} style={{ padding: '5px' }}>
            <LineChart data={lineData} fullWidth />
          </GridItem>
          <GridItem columnSpan={4} style={{ padding: '5px' }}>
            <LineChart data={productLineData} fullWidth />
          </GridItem>
        </Grid>
        <br />
        <MaturityContainer history={history} selected={selected} />
      </>
    );
  }, [props]);
}
