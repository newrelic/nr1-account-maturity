import React from 'react';
import { NerdGraphQuery } from 'nr1';

import { Tab, Tabs, TabList, TabPanel } from 'react-tabs';
import {
  OverviewPanel,
  APMPanel,
  BrowserPanel,
  SynthPanel,
  InfraPanel,
  InsightsPanel,
  LogPanel,
  ProgramPanel,
  MobilePanel,
  WorkloadPanel
} from 'maturity-products/dist/entities';
import {
  ApplicationCtxProvider,
  MaturityScoreCtxProvider
} from 'maturity-products/dist/contexts';

export default class MaturityApplication extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    return (
      <Tabs forceRenderTabPanel>
        <TabList>
          <Tab>Overview</Tab>
          <Tab>APM</Tab>
          <Tab>Browser</Tab>
          <Tab>Synthetics</Tab>
          <Tab>Infrastructure</Tab>
          <Tab>Insights</Tab>
          <Tab>Log</Tab>

          <Tab>Programmability</Tab>
          <Tab>Mobile</Tab>
          <Tab>Workloads</Tab>
        </TabList>
        <ApplicationCtxProvider nr1graph={NerdGraphQuery}>
          <MaturityScoreCtxProvider>
            <TabPanel>
              <OverviewPanel />
            </TabPanel>
            <TabPanel>
              <APMPanel />
            </TabPanel>
            <TabPanel>
              <BrowserPanel />
            </TabPanel>
            <TabPanel>
              <SynthPanel />
            </TabPanel>
            <TabPanel>
              <InfraPanel />
            </TabPanel>
            <TabPanel>
              <InsightsPanel />
            </TabPanel>
            <TabPanel>
              <LogPanel />
            </TabPanel>
            <TabPanel>
              <ProgramPanel />
            </TabPanel>
            <TabPanel>
              <MobilePanel />
            </TabPanel>
            <TabPanel>
              <WorkloadPanel />
            </TabPanel>
          </MaturityScoreCtxProvider>
        </ApplicationCtxProvider>
      </Tabs>
    );
  }
}
