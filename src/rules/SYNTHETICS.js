export default {
  // what entity types to check against
  entityType: 'SYNTHETIC_MONITOR_ENTITY',
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
          ... on SyntheticMonitorEntity {
            guid
            name
            alertSeverity
            monitorType
            reporting
            monitorId
            monitorSummary {
              locationsRunning
              locationsFailing
              successRate
            }
            tags {
              key
              values
            }
            period
            entityType
            domain
            accountId
          }
          ... on AlertableEntity {
            alertSeverity
          }
        }
      }
    }`,
  // scores and values to run and display
  scores: [
    {
      name: 'Reporting Apps',
      entityCheck: (entity) => entity.reporting,
    },
    {
      name: 'Alerts',
      entityCheck: (entity) => entity?.alertSeverity !== 'NOT_CONFIGURED',
    },
    {
      name: 'Tags', // this was previously the labels check, which is really just checking for non-standard tags (value of this check is questionable)
      entityCheck: (entity) =>
        entity.tags
          .map((tag) => tag.key)
          .some(
            (key) =>
              ![
                'account',
                'accountId',
                'language',
                'trustedAccountId',
                'guid',
                'monitorType',
                'period',
                'publicLocation',
              ].includes(key)
          ),
    },
    {
      name: 'Deployments',
      entityCheck: (entity) =>
        (entity?.deploymentSearch?.results || []).length > 0,
    },
    {
      name: 'Using Private Locations',
      entityCheck: (entity) =>
        entity.tags.some((tag) => tag.key === 'privateLocation'),
    },
  ],
};
