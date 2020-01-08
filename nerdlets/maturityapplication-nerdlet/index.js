import React from 'react';
import {EntitySearchQuery, List, ListItem, Spinner, AccountsQuery, EntitiesByDomainTypeQuery, NerdGraphQuery, Tooltip, Grid, GridItem, Spacing, TabsItem, Tabs} from 'nr1'
import gql from 'graphql-tag';
import ReactTable from 'react-table'
import { Account, AlertPolicy, Incident, Condition, Application, KeyTransaction , BrowserApplication} from '../entities';
import 'react-table/react-table.css'
import { css } from '@emotion/core';
import { CircleLoader } from 'react-spinners';
import Popup from "reactjs-popup";





const calcScore = require('../calcscores')
const gqlQuery = require('../query')
const legend = require('../legend.json');


// https://docs.newrelic.com/docs/new-relic-programmable-platform-introduction

export default class Maturityapplication extends React.Component {


    constructor(props){
        super(props)
        this.fetchAccountData = this.fetchAccountData.bind(this);
        this.fetchApmData2 = this.fetchApmData2.bind(this);
        this.handleStateUpdate = this.handleStateUpdate.bind(this);
        this.state = {accountMap: {}, accountsLoaded : false, apmLoaded : false, browserLoaded : false, accountsLoadingProgress: "Fetching Account Info", dtAppList: new Map(), topThroughputAppList: new Map(),deploymentAppList: new Map(),browserInteractionAppList: new Map()}
        
        

        this.apmColumns = [
            {Header: "Acccount Info",
            columns: [
                {Header: "Account Name", accessor: 'ACCOUNT_NAME'},
                { Header: "ID", accessor: 'ACCOUNT_ID'},
                { Header: "Apps" , accessor: 'APPS_TOTAL'  },
            ]},
            {Header: "Reporting Application Calculation",
            columns: [
                { Header:  <Tooltip text="Percentage of all reporting applications in APM UI.">Reporting Apps %</Tooltip>, accessor: 'APPS_REPORTING_PERCENTAGE',Cell: row => this.cellRenderer(row)},
                { Header:  <Tooltip text="Percentage of reporting applications with alert conditions.">Alerts %</Tooltip>, accessor: 'APPS_ALERT_TARGETED_PERCENTAGE',Cell: row => this.cellRenderer(row) },
                { Header:  <Tooltip text="Percentage of reporting applications with custom Apdex set.">Custom Apdex %</Tooltip>, accessor: 'APPS_CUSTOM_APDEX_PERCENTAGE',Cell: row => this.cellRenderer(row) },
                { Header:  <Tooltip text="Percentage of reporting applications with labels.">Labels %</Tooltip>, accessor: 'APPS_TARGETED_BY_LABELS_PERCENTAGE',Cell: row => this.cellRenderer(row) },
                { Header:  <Tooltip text="Percentage of reporting applications with DT capable agent.">Latest Agent %</Tooltip>, accessor: 'APPS_DT_CAPABLE_PERCENTAGE',Cell: row => this.cellRenderer(row) },
                { Header:  <Tooltip text="Percentage of reporting applications with DT enabled.">Distributed Tracing %</Tooltip>, accessor: 'APPS_DT_ENABLED_PERCENTAGE',Cell: row => this.cellRenderer(row) },
                //{ Header: "Key Transactions %", accessor: 'APPS_TARGETTED_BY_KT_PERCENTAGE',Cell: row => this.cellRenderer(row) },
                //{ Header: "Alerting Key Transactions %", accessor: 'ALERTING_KT_PERCENTAGE',Cell: row => this.cellRenderer(row) },
                { Header:  <Tooltip text="Percentage of reporting applications with deployment markers.">Deployment Markers %</Tooltip>, accessor: 'APPS_WITH_DEPLOYMENTS_PERCENTAGE',Cell: row => this.cellRenderer(row) },
                { Header:  <Tooltip text="Overall Maturity Score">Overall Score %</Tooltip>, accessor: 'MATURITY_SCORE',Cell: row => this.cellRenderer(row)},
            ]}
        ]
        this.applicationColumns = [
            {Header: "Account Applications Info",
            columns: [
                { Header:  <Tooltip text="Name">Name</Tooltip>, accessor: 'name'},
                { Header:  <Tooltip text="Throughput">Throughput</Tooltip>, accessor: 'throughput'},
                { Header:  <Tooltip text="Apdex T">Apdex T</Tooltip>, accessor: 'apdexT'},
                { Header:  <Tooltip text="Health Status">Health Status</Tooltip>, accessor: 'healthStatus'},
                { Header:  <Tooltip text="Language">Language</Tooltip>, accessor: 'language'},
                { Header:  <Tooltip text="Max Version">Max Version</Tooltip>, accessor: 'maxVersion'},
                { Header:  <Tooltip text="Labels">Labels</Tooltip>, accessor: 'labels',Cell: ({ value }) => String(value.length)-3},
                { Header:  <Tooltip text="Reporting">Reporting</Tooltip>, accessor: 'reporting', Cell: ({ value }) => <div style={{backgroundColor: value == true ? '#85cc00': '#ff2e00'}}>{String(value)}</div>},
                { Header:  <Tooltip text="Custom Apdex">Custom Apdex</Tooltip>, accessor: 'isCustomApdex',Cell: ({ value }) => <div style={{backgroundColor: value == true ? '#85cc00': '#ff2e00'}}>{String(value)}</div>},
                { Header:  <Tooltip text="Distributed Tracing Capable">DT Capable</Tooltip>, accessor: 'isDTCapable', Cell: ({ value }) => <div style={{backgroundColor: value == true ? '#85cc00': '#ff2e00'}}>{String(value)}</div>},
                { Header:  <Tooltip text="Deployment Markers">Deployment Marker</Tooltip>, accessor: 'deployMarker', Cell: ({ value }) => <div style={{backgroundColor: value == true ? '#85cc00': '#ff2e00'}}>{String(value)}</div>},
                { Header:  <Tooltip text="Distributed Tracing Enabled">DT Enabled</Tooltip>, accessor: 'dtEnabled', Cell: ({ value }) => <div style={{backgroundColor: value == true ? '#85cc00': '#ff2e00'}}>{String(value)}</div>},
                { Header:  <Tooltip text="Alerting Enabled">Alerting Enabled</Tooltip>, accessor: 'isAlerting', Cell: ({ value }) => <div style={{backgroundColor: value == true ? '#85cc00': '#ff2e00'}}>{String(value)}</div>},
                //{ Header:  <Tooltip text="Alert Conditions">Alert Conditions</Tooltip>, accessor: 'alertConditions'},
                //cell renderer below minus 3 because there are 3 default labels account, language etc
            { Header:  <Tooltip text="Has custom labels">Custom Labels</Tooltip>, accessor: 'hasLabels',Cell: ({ value }) => <div style={{backgroundColor: value == true ? '#85cc00': '#ff2e00'}}>{String(value)}</div>},

            ]}
        ]

        this.browserColumns = [
            {Header: "Acccount Info",
            columns: [
                {Header: "Account Name", accessor: 'ACCOUNT_NAME'},
                { Header: "ID", accessor: 'ACCOUNT_ID'},
                { Header: "Apps" , accessor: 'APPS_TOTAL'  },
            ]},
            {Header: "Reporting Application Calculation",
            columns: [
                { Header:  <Tooltip text="Percentage of all reporting applications in APM UI.">Reporting Apps %</Tooltip>, accessor: 'APPS_REPORTING_PERCENTAGE',Cell: row => this.browserCellRenderer(row)},
                { Header:  <Tooltip text="Percentage of reporting applications with alert conditions.">Alerts %</Tooltip>, accessor: 'APPS_ALERT_TARGETED_PERCENTAGE',Cell: row => this.browserCellRenderer(row) },
                { Header:  <Tooltip text="Percentage of reporting applications with custom Apdex set.">Custom Apdex %</Tooltip>, accessor: 'APPS_CUSTOM_APDEX_PERCENTAGE',Cell: row => this.browserCellRenderer(row) },
                { Header:  <Tooltip text="Percentage of reporting applications with labels.">Labels %</Tooltip>, accessor: 'APPS_TARGETED_BY_LABELS_PERCENTAGE',Cell: row => this.browserCellRenderer(row) },
                { Header:  <Tooltip text="Percentage of reporting applications with BrowserInteraction events.">BrowserInteraction %</Tooltip>, accessor: 'APPS_BROWSER_INTERACTIONS_PERCENTAGE',Cell: row => this.browserCellRenderer(row) },
                { Header:  <Tooltip text="Percentage of reporting applications that are autoinstrumented via APM.">Auto Instrumentation %</Tooltip>, accessor: 'APPS_AUTOINSTRUMENTATION_PERCENTAGE',Cell: row => this.browserCellRenderer(row) },
                { Header:  <Tooltip text="Percentage of reporting applications that have the SPA agent enabled.">SPA Agent Enabled %</Tooltip>, accessor: 'APPS_SPAAGENTENABLED_PERCENTAGE',Cell: row => this.browserCellRenderer(row) },
                { Header:  <Tooltip text="Overall Maturity Score">Overall Score %</Tooltip>, accessor: 'MATURITY_SCORE',Cell: row => this.browserCellRenderer(row)},
            ]}
        ]
        this.browserApplicationColumns = [
            {Header: "Account Applications Info",
            columns: [
                { Header:  <Tooltip text="Name">Name</Tooltip>, accessor: 'name'},
                { Header:  <Tooltip text="Apdex T">Apdex T</Tooltip>, accessor: 'apdexT'},
                { Header:  <Tooltip text="Health Status">Health Status</Tooltip>, accessor: 'healthStatus'},
                { Header:  <Tooltip text="Labels">Labels</Tooltip>, accessor: 'labels',Cell: ({ value }) => String(value.length)-2},
                { Header:  <Tooltip text="Reporting">Reporting</Tooltip>, accessor: 'reporting', Cell: ({ value }) => <div style={{backgroundColor: value == true ? '#85cc00': '#ff2e00'}}>{String(value)}</div>},
                { Header:  <Tooltip text="Custom Apdex">Custom Apdex</Tooltip>, accessor: 'isCustomApdex',Cell: ({ value }) => <div style={{backgroundColor: value == true ? '#85cc00': '#ff2e00'}}>{String(value)}</div>},
                { Header:  <Tooltip text="Browser Interactions">Browser Interactions</Tooltip>, accessor: 'browserInteractions', Cell: ({ value }) => <div style={{backgroundColor: value == true ? '#85cc00': '#ff2e00'}}>{String(value)}</div>},
                { Header:  <Tooltip text="Auto Instrumented">Auto Instrumented</Tooltip>, accessor: 'autoInstrumentation', Cell: ({ value }) => <div style={{backgroundColor: value == true ? '#85cc00': '#ff2e00'}}>{String(value)}</div>},
                { Header:  <Tooltip text="SPA Enabled">SPA Enabled</Tooltip>, accessor: 'spaAgentEnabled', Cell: ({ value }) => <div style={{backgroundColor: value == true ? '#85cc00': '#ff2e00'}}>{String(value)}</div>},
                { Header:  <Tooltip text="Alerting Enabled">Alerting Enabled</Tooltip>, accessor: 'isAlerting', Cell: ({ value }) => <div style={{backgroundColor: value == true ? '#85cc00': '#ff2e00'}}>{String(value)}</div>},
                //{ Header:  <Tooltip text="Alert Conditions">Alert Conditions</Tooltip>, accessor: 'alertConditions'},
                //cell renderer below minus 3 because there are 3 default labels account, language etc
            { Header:  <Tooltip text="Has custom labels">Custom Labels</Tooltip>, accessor: 'hasLabels',Cell: ({ value }) => <div style={{backgroundColor: value == true ? '#85cc00': '#ff2e00'}}>{String(value)}</div>},

            ]}
        ]
    }


    cellRenderer(row){
        const width = `${row.value}%`;
        const bar = <div
            style={{
            width: '100%',
            height: '100%',
            backgroundColor: '#dadada',
            borderRadius: '2px'
            }}
        >
            <div
            style={{
                width: width,
                height: '100%',
                backgroundColor: row.value > 70 ? '#85cc00'
                : row.value > 30 ? '#ffbf00'
                : '#ff2e00',
                borderRadius: '2px',
                transition: 'all .2s ease-out'
            }}
            >
            {row.value}
        </div>
        </div>

        const contentStyle = {
            maxWidth: '1500x',
            width: '90%',
        };

        let account = this.state.accountMap[row.row.ACCOUNT_ID]
        let applications = account.apmApps.entries()
        let application = applications.next()

        let applicationList = []
        while(!application.done){
            let applicationObj = {...application.value[1]}
            //newAccountMap[account.value[0]].apmApps = account.value[1]
            applicationObj.isDTCapable = application.value[1].isDTCapable()
            applicationObj.isDTEnabled = application.value[1].isDTEnabled()
            applicationObj.isCustomApdex = application.value[1].isCustomApdex()
            applicationObj.isAlerting = application.value[1].isAlerting()
            applicationObj.hasLabels = application.value[1].hasLabels()
            applicationList.push({...applicationObj})

            application = applications.next()
        }



        return  <Popup trigger={bar} position="right center" modal contentStyle={contentStyle}>
                <div>
                    <ReactTable 
                        data = {applicationList} 
                        columns = {this.applicationColumns}
                    />
                </div>
                </Popup>
    }

    browserCellRenderer(row){
        const width = `${row.value}%`;
        const bar = <div
            style={{
            width: '100%',
            height: '100%',
            backgroundColor: '#dadada',
            borderRadius: '2px'
            }}
        >
            <div
            style={{
                width: width,
                height: '100%',
                backgroundColor: row.value > 70 ? '#85cc00'
                : row.value > 30 ? '#ffbf00'
                : '#ff2e00',
                borderRadius: '2px',
                transition: 'all .2s ease-out'
            }}
            >
            {row.value}
        </div>
        </div>

        const contentStyle = {
            maxWidth: '1500x',
            width: '90%',
        };

        let account = this.state.accountMap[row.row.ACCOUNT_ID]
        let applications = account.browserApps.entries()
        let application = applications.next()

        let applicationList = []
        while(!application.done){
            let applicationObj = {...application.value[1]}
            //newAccountMap[account.value[0]].apmApps = account.value[1]
            applicationObj.isAutoInstrumentation = application.value[1].isAutoInstrumentation()
            applicationObj.isCustomApdex = application.value[1].isCustomApdex()
            applicationObj.isAlerting = application.value[1].isAlerting()
            applicationObj.hasLabels = application.value[1].hasLabels()
            applicationList.push({...applicationObj})

            application = applications.next()
        }



        return  <Popup trigger={bar} position="right center" modal contentStyle={contentStyle}>
                <div>
                    <ReactTable 
                        data = {applicationList} 
                        columns = {this.browserApplicationColumns}
                    />
                </div>
                </Popup>
    }

    componentDidMount(){
        this.fetchAccountData()
        if (this.state.accountsLoaded){
            this.fetchApmData()
            
        }        
    }

    fetchAccountData(){
        let NERDGRAPH_NRQL_QUERY = `query {
                                        actor {
                                            accounts {
                                            reportingEventTypes(filter: "Span")
                                            id
                                            name
                                            }
                                        }
                                    }`

            NerdGraphQuery.query({query: NERDGRAPH_NRQL_QUERY}).then(({ data }) => {
            data.actor.accounts.forEach(account => {
                let accountObj = new Account(account.id)
                if (account.reportingEventTypes.length > 0){
                    accountObj.accountDT = true
                }
                accountObj.name = account.name
                accountObj.apmApps = new Map()
                accountObj.browserApps = new Map()
                this.setState(prevState => {
                    const newAccountMap = prevState.accountMap
                    newAccountMap[account.id] = accountObj
                    return {accountMap: newAccountMap}
                })
                this.setState({accountsLoaded : true})
            })
            this.fetchDTData(this.state.accountMap)
            //this.fetchDeploymentData(this.state.accountMap)
            this.fetchApmData2(null)
            this.fetchBrowserData(null)
        })
        //this.fetchApmData () 
        
        
    }

    handleStateUpdate(stateObj){
        this.setState(stateObj)
    }
    

    fetchApmData2 (cursor) {
        let nerdcursor = cursor ? `(cursor: "${cursor}")` : ''
        let NERDGRAPH_NRQL_QUERY = `
                                        query {
                                            actor {
                                                entitySearch(queryBuilder: {domain: APM, type: APPLICATION}) {
                                                  results ${nerdcursor} {
                                                    nextCursor
                                                    entities {
                                                        accountId
                                                      guid
                                                      name
                                                      reporting
                                                      ... on ApmApplicationEntityOutline {
                                                        name
                                                        language
                                                        apmSummary {
                                                          throughput
                                                        }
                                                        settings {
                                                          apdexTarget
                                                        }
                                                        runningAgentVersions {
                                                          minVersion
                                                          maxVersion
                                                        }
                                                        tags {
                                                          key
                                                          values
                                                        }
                                                        guid
                                                      }
                                                      ... on AlertableEntityOutline {
                                                        alertStatus
                                                        alertSeverity
                                                      }
                                                    }
                                                  }
                                                  count
                                              }
                                            }
                                          }`;

        
        

        NerdGraphQuery.query({
            query: NERDGRAPH_NRQL_QUERY,
            /* variables: {
                cursor: nerdcursor,
              }, */
        }).then(({data}) => {
            this.setState({accountsLoadingProgress: "Fetching APM Data for " + data.actor.entitySearch.count + " Applications"})
            let accountsObj = new Map()
            const nextCursor = data.actor.entitySearch.results.nextCursor

            data.actor.entitySearch.results.entities.forEach(entity => {
                        const id = atob(entity.guid).split('|')[3]
                        const name = entity.name
                        let appObj = new Application(id)
                        const dtAppList = this.state.dtAppList
                        const deploymentAppList = this.state.deploymentAppList


                        if (dtAppList.has(entity.accountId)){
                            if (dtAppList.get(entity.accountId).includes(name)){
                                appObj.dtEnabled = true
                            }
                        }

                        if (deploymentAppList.has(entity.accountId)){
                            if (deploymentAppList.get(entity.accountId).includes(parseInt(id))){
                                appObj.deployMarker = true
                            }
                        }

                        appObj.id = entity.id
                        appObj.guid = entity.guid
                        appObj.name = entity.name
                        appObj.labels = entity.tags
                        
                        if (entity.reporting){
                            appObj.reporting = true
                            appObj.accountId = entity.accountId
                          
                            appObj.healthStatus = entity.alertSeverity
                            appObj.apdexT = entity.settings.apdexTarget
                            appObj.throughput = entity.apmSummary ? entity.apmSummary.throughput : 0
                            appObj.language = entity.language
                            appObj.maxVersion = entity.runningAgentVersions ? entity.runningAgentVersions.maxVersion : '0.0.0'
                        }
                        else{
                            appObj.reporting = false
                        }


                        if (accountsObj.get(entity.accountId)){
                            accountsObj.get(entity.accountId).set(entity.guid,appObj)
                        }
                        else{
                            accountsObj.set(entity.accountId,new Map())
                            accountsObj.get(entity.accountId).set(entity.guid,appObj)
                        }
                    })


                    let accountIter = accountsObj.entries()
                    let account = accountIter.next()
                    let newAccountMap = this.state.accountMap
                    

                    while(!account.done){
                        //newAccountMap[account.value[0]].apmApps = account.value[1]
                        this.setState(prevState => {
                            let newAccountMap = prevState.accountMap
                            if (account.value[0] == 20264){
                                //debugger
                            }

                            newAccountMap[account.value[0]].apmApps = new Map([...newAccountMap[account.value[0]].apmApps, ...account.value[1]]) 
                            return({accountMap: newAccountMap})
                        })
                        account = accountIter.next()
                    }
                    if (nextCursor != null){
                        this.fetchApmData2 (nextCursor)
                    }
                    else{
                        this.setState({apmLoaded : true})
                    }

        })

    }

    fetchBrowserData (cursor) {
        let nerdcursor = cursor ? `(cursor: "${cursor}")` : ''
        let NERDGRAPH_NRQL_QUERY = `
                                        query {
                                            actor {
                                                entitySearch(queryBuilder: {domain: BROWSER, type: APPLICATION}) {
                                                count
                                                results  ${nerdcursor}{
                                                  nextCursor
                                                  entities {
                                                    ... on BrowserApplicationEntityOutline {
                                                      accountId
                                                      account {
                                                          reportingEventTypes
                                                      }
                                                      alertSeverity
                                                      guid
                                                      name
                                                      settings {
                                                        apdexTarget
                                                      }
                                                      servingApmApplicationId
                                                      applicationId
                                                      tags {
                                                        key
                                                        values
                                                      }
                                                      browserSummary {
                                                        spaResponseTimeAverage
                                                      }
                                                      reporting
                                                    }
                                                  }
                                                }
                                              }
                                            }
                                          }`;

        
        

        NerdGraphQuery.query({
            query: NERDGRAPH_NRQL_QUERY,
            /* variables: {
                cursor: nerdcursor,
              }, */
        }).then(({data}) => {
            this.setState({accountsLoadingProgress: "Fetching Browser Data for " + data.actor.entitySearch.count + " Applications"})
            let accountsObj = new Map()
            const nextCursor = data.actor.entitySearch.results.nextCursor

            data.actor.entitySearch.results.entities.forEach(entity => {
                        const id = atob(entity.guid).split('|')[3]
                        const name = entity.name
                        let appObj = new BrowserApplication(id)

                        const browserInteractionAppList = this.state.browserInteractionAppList


                        if (browserInteractionAppList.has(entity.accountId)){
                            if (browserInteractionAppList.get(entity.accountId).includes(name)){
                                appObj.browserInteractions = true
                            }
                        }

                        appObj.id = entity.id
                        appObj.guid = entity.guid
                        appObj.name = entity.name
                        appObj.labels = entity.tags
                        appObj.apdexT = entity.settings.apdexTarget

                        
                        if (entity.reporting){
                            appObj.reporting = true
                            appObj.accountId = entity.accountId
                            
                            appObj.healthStatus = entity.alertSeverity
                            if (entity.servingApmApplicationId){
                                appObj.autoInstrumentation = true
                            }
                            if (entity.browserSummary && entity.browserSummary.spaResponseTimeAverage){
                                appObj.spaAgentEnabled = true
                            }
                        }
                        else{
                            appObj.reporting = false
                            appObj.healthStatus = "NOT_REPORTING"
                        }


                        if (accountsObj.get(entity.accountId)){
                            accountsObj.get(entity.accountId).set(entity.guid,appObj)
                        }
                        else{
                            accountsObj.set(entity.accountId,new Map())
                            accountsObj.get(entity.accountId).set(entity.guid,appObj)
                        }
                    })


                    let accountIter = accountsObj.entries()
                    let account = accountIter.next()
                    let newAccountMap = this.state.accountMap
                    

                    while(!account.done){
                        //newAccountMap[account.value[0]].apmApps = account.value[1]
                        this.setState(prevState => {
                            let newAccountMap = prevState.accountMap
                            if (account.value[0] == 20264){
                                //debugger
                            }

                            newAccountMap[account.value[0]].browserApps = new Map([...newAccountMap[account.value[0]].browserApps, ...account.value[1]]) 
                            return({accountMap: newAccountMap})
                        })
                        account = accountIter.next()
                    }
                    if (nextCursor != null){
                        this.fetchBrowserData (nextCursor)
                    }
                    else{
                        this.setState({browserLoaded : true})
                    }

        })

    }

    fetchDTData(accountMap){
        this.setState({accountsLoadingProgress: "Fetching Account Data for " + Object.values(accountMap).length + " Accounts"})
        const dtAccountMap = Object.values(accountMap).filter(account => {
                return true
        })


        let dtAppList = {}

        dtAccountMap.forEach(account => {
            const accountId = account.id
            let NERDGRAPH_NRQL_QUERY = `
                {
                    actor {
                    account(id: ${accountId}) {
                        id
                        dtData : nrql(query: "SELECT uniques(appName) from Span") {
                            results 
                        }
                        throughputData : nrql(query: "SELECT count(*) from Transaction facet appId") {
                            results 
                        }
                        browserInteractionData : nrql(query: "SELECT uniques(appName) from BrowserInteraction") {
                            results 
                        }
                    }
                    }
                }`;
            NerdGraphQuery.query({
                query: NERDGRAPH_NRQL_QUERY,
            }).then(({data}) => {
                const guid = `${data.actor.account.id}|APM|APPLICATION|`;
                const appList = data.actor.account.dtData.results.map(app => app.member)

                //creating guid strings and removing = buffer as graphql doesn't accept this ¯\_(ツ)_/¯
                const throughputList = data.actor.account.throughputData.results.map(app => btoa(guid+app.appId).split('=').join(''))
                const throughputListString = '"'+throughputList.join('","')+'"'

                const browserInteractionList = data.actor.account.browserInteractionData.results.map(app => app.member)
                this.setState(prevState => {
                    let newdtAppList = prevState.dtAppList
                    newdtAppList.set(accountId,appList)

                    let newtopThroughputAppList = prevState.topThroughputAppList
                    newtopThroughputAppList.set(accountId,throughputList)

                    let newbrowserInteractionAppList = prevState.browserInteractionAppList
                    newbrowserInteractionAppList.set(accountId,browserInteractionList)

                    return({dtAppList: newdtAppList, topThroughputAppList: newtopThroughputAppList, browserInteractionAppList: newbrowserInteractionAppList})
                })

                let NERDGRAPH_NRQL_QUERY = `
                {
                    actor {
                        entities(guids: [${throughputListString}]) {
                          ... on ApmApplicationEntity {
                            deployments(timeWindow: {endTime: 1574088600000, startTime: 1572088600000}) {
                              timestamp
                            }
                            accountId
                            applicationId
                            name
                          }
                        }
                      }
                }`;
                NerdGraphQuery.query({
                    query: NERDGRAPH_NRQL_QUERY,
                }).then(({data}) => {
                    let deploymentList = []

                    data.actor.entities.map(app => {
                        if (app.deployments.length >0){
                            deploymentList.push(app.applicationId)
                        }
                    })

                    this.setState(prevState => {
                        let newdeploymentAppList = prevState.deploymentAppList
                        newdeploymentAppList.set(accountId,deploymentList)
    
                        return({deploymentAppList: newdeploymentAppList})
                    })

                })

                


                
            })
        })

    


    }

    fetchDeployData(accountMap){

    }


    /* async getApplications(accountId, todaysDate, todaysDateDiff, cursor, data = []){
        return new Promise(resolve => {
            let nerdGraph = this.props.nr1.services.nerdGraph
           console.log('input',accountId, todaysDate, todaysDateDiff, cursor)
        nerdGraph.query(gqlQuery.entitySearchApps(accountId, todaysDate, todaysDateDiff, cursor))
        .then(response => {
            console.log('response',response)
                const nextCursor = response.raw.data.actor.entitySearch.results.nextCursor
                data = data.concat(((((((response || {}).raw || {}).data || {}).actor || {}).entitySearch || {}).results || {}).entities)
            if (nextCursor == null){
                let dtAppArray = []
                try {
                    const dt = (((((response || {}).raw || {}).data || {}).actor || {}).dt || {}).nrql || {}
                    dtAppArray = dt.results.map(result => {
                        return result['member']
                    })
                } catch (error) {
                    console.log(error)
                }
                resolve([data, dtAppArray])
            } 
            else{
                resolve(this.getApplications(accountId, todaysDate, todaysDateDiff, nextCursor,data))
            }    
        }
        )
        })
        
    } */

    render() {
        const accountMap = this.state.accountMap
        const apmLoaded = this.state.apmLoaded
        const browserLoaded = this.state.browserLoaded
        const accountsLoaded = this.state.accountsLoaded
        const override = css`
                                display: block;
                                margin: 0 auto;
                                border-color: red;
                            `;

        if (accountsLoaded && apmLoaded && browserLoaded){
        let [apmTable,overallApmScoreMap] = calcScore.calcApmScoreNew(accountMap)
        let [browserTable,overallBrowserScoreMap] = calcScore.calcBrowserScoreNew(accountMap)

        return <Tabs defaultValue="tab-1">
                    <TabsItem value="tab-1" label="APM">
                        <ReactTable 
                            data = {apmTable} 
                            columns = {this.apmColumns}
                        />
                    </TabsItem>
                    <TabsItem value="tab-2" label="Browser">
                    <ReactTable 
                            data = {browserTable} 
                            columns = {this.browserColumns}
                        />
                    </TabsItem>
                </Tabs>
        }
           
        return <div><CircleLoader
                    css={override}
                    sizeUnit={"px"}
                    size={300}
                    color={'#123abc'}
                    loading={!(accountsLoaded && apmLoaded && browserLoaded)}
                />
                    <Grid>
                        <GridItem columnSpan={4}><div></div></GridItem>
                        <GridItem columnSpan={4}><Spacing type={[Spacing.TYPE.MEDIUM]}><h1 align="center">{this.state.accountsLoadingProgress}</h1></Spacing></GridItem>
                        <GridItem columnSpan={4}><div></div></GridItem>
                    </Grid>
                </div>


        
    }
}