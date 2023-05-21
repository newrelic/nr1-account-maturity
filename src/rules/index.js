export default {
  // category name
  APM: {
    // what entity types to check against
    entityType: 'APM_APPLICATION_ENTITY',
    // some entities require additional data that can only be performed with a direct guid query
    graphql: `query ($guids: [EntityGuid]!) {
      actor {
        entities(guids: $guids) {
          guid
          deploymentSearch {
            results {
              commit
            }
          }
          reporting
          ... on ApmApplicationEntity {
            applicationId
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
          }
          ... on AlertableEntity {
            alertSeverity
          }
        }
      }
    }`,
    // rules and values to run and display
    rules: [
      {
        name: 'Reporting Apps',
        check: (entity) => entity.reporting,
      },
      {
        name: 'DT Enabled',
        check: (entity) =>
          entity.tags.find((tag) => tag.key === 'nr.dt.enabled')
            ?.values?.[0] === 'true',
      },
    ],
  },
};
