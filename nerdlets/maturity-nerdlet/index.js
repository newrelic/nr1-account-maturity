import React from 'react';
import { NerdGraphQuery } from 'nr1';
import Tags from './tags';
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
  MobilePanel
} from 'maturity-products/dist/entities';
import {
  ApplicationCtxProvider,
  MaturityScoreCtxProvider
} from 'maturity-products/dist/contexts';

export default class MaturityApplication extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      tag: null,
    }
    this.setTag = this.setTag.bind(this);
  }

  setTag(selected) {
    this.setState({tag: selected});
  }

  render() {
    let { tag } = this.state;

    return (
      <>
      <Tags setTag={this.setTag}/>
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
        </TabList>
        <ApplicationCtxProvider tag={tag} nr1graph={NerdGraphQuery}>
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
          </MaturityScoreCtxProvider>
        </ApplicationCtxProvider>
      </Tabs>
      </>
    );
  }
}
