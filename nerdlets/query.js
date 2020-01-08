module.exports = {
    entitySearchApps: (cursor) => {
        let cursorLine = ''
        if (cursor != ''){
          cursorLine = '(cursor: "' + cursor + '")' 
        }
        return `
        {
            actor {
                entitySearch(queryBuilder: {domain: APM, type: APPLICATION}) {
                  results ${cursorLine} {
                    nextCursor
                    entities {
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
          }`
      },
    }