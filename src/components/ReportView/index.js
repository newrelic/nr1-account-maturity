import React, { useMemo } from 'react';
import { Grid, GridItem, BillboardChart, LineChart } from 'nr1';
import rules from '../../rules';
import MaturityContainer from './maturityContainer';

export default function ReportView(props) {
  const { history, selected, selectedAccountId, document } = props;

  return useMemo(() => {
    const latestScorePerc = history?.[0]?.document?.totalScorePercentage;

    const selectedHistory = (history || []).find(
      (h) => h.document.runAt === selected
    );

    let selectedScorePerc = selectedHistory?.document?.totalScorePercentage;
    selectedScorePerc = isNaN(selectedScorePerc)
      ? latestScorePerc
      : selectedScorePerc;

    const billboardTitle =
      history?.[0]?.document?.runAt === selectedHistory?.document?.runAt
        ? 'Latest Score'
        : 'Latest Score vs Selected Score';

    const billboardData = [
      {
        metadata: {
          id: 'LatestScore',
          name: billboardTitle,
          viz: 'main',
          units_data: {
            y: 'PERCENTAGE',
          },
        },
        data: [
          { y: selectedScorePerc / 100 }, // Previous value.
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
        <hr style={{ marginTop: '30px' }} />
        <Grid style={{ paddingTop: '10px' }}>
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
        <hr />
        <br />

        <MaturityContainer
          history={history}
          selected={selected}
          selectedAccountId={selectedAccountId}
          entitySearchQuery={document?.entitySearchQuery}
        />
      </>
    );
  }, [props, history]);
}
