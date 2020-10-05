import React from 'react';
import { Dropdown, DropdownSection, DropdownItem, NerdGraphQuery } from 'nr1';

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
      allTags: null,
      searchText: '',
      selectedTag: null
    }
  }

  async componentDidMount() {
    await this.constructTags();
  }

  async constructTags(){
    let domains = ['APM', 'INFRA', 'SYNTH']; //start with these domains for sample set
    let allTags = {};
    let proms = [];

    for (let domain of domains) {
      let q = `
      {
        actor {
          entitySearch(queryBuilder: {domain: ${domain}}) {
            results {
              entities {
                tags {
                  key
                  values
                }
              }
            }
          }
        }
      }
      `
      proms.push(this.queryTags(q));
    }

    Promise.all(proms).then(resp => {
      let allTags = [];
      let flattend = resp.flat();
      let first = true;

      let i = 0;
      console.log("flat")
      console.log(flattend);
      for (let entityTags of flattend) {
        if (first == true) {
          for (let aTag of entityTags.tags) {
            allTags.push({title: aTag.key, items: []});
            allTags[i].items.push(aTag.values[0]);
            i++;
          }
          first = false;
        } else {
          for (let anotherTag of entityTags.tags) {
            let obj = allTags.filter(o => {
              return o.title == anotherTag.key;
            })
            if (obj.length > 0) {
              if (obj[0].items.includes(anotherTag.values[0])) {
                //do nothing
              } else {
                obj[0].items.push(anotherTag.values[0]);
              }
            } else {
              allTags.push({title: anotherTag.key, items: []});
              allTags[i].items.push(anotherTag.values[0]);
            }
          }
        }
      }

      this.setState({allTags: allTags});
    })
  }

  async queryTags(q) {
    let res = await NerdGraphQuery.query({query: q});
    if (res.errors) {
      console.debug(res);
    } else {
      let aSetOfTags = res.data.actor.entitySearch.results.entities;
      return aSetOfTags;
    }
  }

  selected = (tagVal) => {
    const { allTags } = this.state;
    let tagKey = null;

    for (let tag of allTags) {
      if (tag.items.includes(tagVal)) {
        tagKey = tag.title;
      }
    }

    this.setState({ selectedTag: tagKey + ':' + tagVal });
  }

  renderTagFilter() {
    const { allTags, searchText } = this.state;

    if (allTags == null) {
      return ''
    } else {
      return (
        <Dropdown style={{float: 'right'}} title='Tags' items={allTags} sectioned search={searchText} onSearch={this.handleSearch}>
        {({ item: section, index }) => (
          <DropdownSection key={index} title={section.title} items={section.items}>
          {({ item, index }) => (
            <DropdownItem onClick={() => this.selected(item)}>{item}</DropdownItem>
          )}
          </DropdownSection>
        )}
        </Dropdown>
      )
    }
  }

  render() {
    console.log(this.state);
    return (
      <>
      {this.renderTagFilter()}
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
        <ApplicationCtxProvider tag={this.state.selectedTag} nr1graph={NerdGraphQuery}>
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
