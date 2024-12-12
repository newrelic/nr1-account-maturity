import React from 'react';
import { navigation, NerdGraphQuery, SectionMessage, nerdlet, Icon } from 'nr1';

import { Tab, Tabs, TabList, TabPanel } from 'react-tabs';
import {
  OverviewPanel,
  APMPanel,
  BrowserPanel,
  SynthPanel,
  InfraPanel,
  KubernetesPanel,
  InsightsPanel,
  LogPanel,
  ProgramPanel,
  MobilePanel,
  WorkloadPanel,
  SLMPanel,
  NPMPanel,
} from 'maturity-products/dist/entities';
import {
  ApplicationCtxProvider,
  MaturityScoreCtxProvider,
} from 'maturity-products/dist/contexts';

export default class MaturityApplication extends React.Component {
  constructor(props) {
    super(props);
  }

  componentDidMount() {
    nerdlet.setConfig({
      actionControls: true,
      actionControlButtons: [
        {
          label: 'Launch new version',
          type: 'secondary',
          hint: 'Launch the new version',
          iconType: Icon.TYPE.INTERFACE__OPERATIONS__EXTERNAL_LINK,
          onClick: () => navigation.openNerdlet({ id: 'maturity-nerdlet' }),
        },
      ],
    });
  }

  render() {
    return (
      <>
        <SectionMessage
          type={SectionMessage.TYPE.WARNING}
          title="You are on the old version of account maturity"
          description="No further support will be provided on this version"
          actions={[
            {
              label: 'Launch the new version',
              onClick: () => navigation.openNerdlet({ id: 'maturity-nerdlet' }),
            },
          ]}
        />
        <Tabs forceRenderTabPanel>
          <TabList>
            <Tab>Overview</Tab>
            <Tab>APM</Tab>
            <Tab>Browser</Tab>
            <Tab>Synthetics</Tab>
            <Tab>Infrastructure</Tab>
            <Tab>Kubernetes</Tab>
            <Tab>Insights</Tab>
            <Tab>Log</Tab>
            <Tab>Programmability</Tab>
            <Tab>Mobile</Tab>
            <Tab>Workloads</Tab>
            <Tab>SLM</Tab>
            <Tab>NPM</Tab>
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
                <KubernetesPanel />
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
              <TabPanel>
                <SLMPanel />
              </TabPanel>
              <TabPanel>
                <NPMPanel />
              </TabPanel>
            </MaturityScoreCtxProvider>
          </ApplicationCtxProvider>
        </Tabs>
      </>
    );
  }
}
