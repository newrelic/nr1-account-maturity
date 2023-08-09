import React, { useContext, useMemo } from 'react';
import { Spinner } from 'nr1';
import MaturityContainer from './maturityContainer';
import DataContext from '../../context/data';

export default function ReportView(props) {
  const { selected, selectedAccountId, document, isUserDefault } = props;
  const { runningReport, userViewHistory, reportHistory, view } =
    useContext(DataContext);

  return useMemo(() => {
    if (runningReport) {
      return (
        <>
          <div
            style={{
              textAlign: 'center',
              paddingBottom: '10px',
              paddingTop: '10px',
            }}
          >
            Generating View
          </div>
          <Spinner />
        </>
      );
    }

    const history = isUserDefault
      ? userViewHistory
      : reportHistory.filter(
        (h) => //eslint-disable-line
          h.document.reportId === (view?.id || view?.props?.id) //eslint-disable-line
      );//eslint-disable-line

    console.log(
      reportHistory,
      isUserDefault,
      view?.id,
      view?.props?.id,
      history.length
    );

    if (history.length === 0) {
      return (
        <div style={{ textAlign: 'center', paddingTop: '15px' }}>
          No history for this view. Click &apos;Run&apos; to generate this view.
          <br />
          {/* <br />
          <Button sizeType={Button.SIZE_TYPE.SMALL}>Run View</Button> */}
        </div>
      );
    }

    return (
      <div style={{ paddingTop: '10px' }}>
        {/* <hr style={{ marginTop: '30px' }} /> */}
        {/* <Grid style={{ paddingTop: '10px' }}>
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
        <br /> */}

        <MaturityContainer
          isUserDefault={isUserDefault}
          history={history}
          selected={selected}
          selectedAccountId={selectedAccountId}
          entitySearchQuery={document?.entitySearchQuery}
        />
      </div>
    );
  }, [props, view, history, runningReport]);
}
