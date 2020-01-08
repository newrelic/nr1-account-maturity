function fetchApmData (cursor,handleStateUpdate,parentState) {
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
        handleStateUpdate({accountsLoadingProgress: "Fetching APM Data for " + data.actor.entitySearch.count + " Applications"})
        let accountsObj = new Map()
        const nextCursor = data.actor.entitySearch.results.nextCursor

        data.actor.entitySearch.results.entities.forEach(entity => {
                    const id = atob(entity.guid).split('|')[3]
                    const name = entity.name
                    let appObj = new Application(id)
                    const dtAppList = parentState.dtAppList
                    const deploymentAppList = parentState.deploymentAppList


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
                    
                    if (entity.reporting){
                        appObj.reporting = true
                        appObj.accountId = entity.accountId
                        appObj.id = entity.id
                        appObj.guid = entity.guid
                        appObj.name = entity.name
                        appObj.healthStatus = entity.alertSeverity
                        appObj.labels = entity.tags
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
                let newAccountMap = parentState.accountMap
                

                while(!account.done){
                    //newAccountMap[account.value[0]].apmApps = account.value[1]
                    this.setState(parentState => {
                        let newAccountMap = parentState.accountMap
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