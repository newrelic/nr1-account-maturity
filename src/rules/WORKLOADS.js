export default {
  domain: 'NR1',
  entityType: 'WORKLOAD_ENTITY',
  // some entities require additional data that can only be performed with a direct guid query
  graphql: `query ($guids: [EntityGuid]!) {
        actor {
          entities(guids: $guids) {
            guid
            ... on WorkloadEntity {
              guid
              name
              alertSeverity
              reporting
              dashboardEntities: relatedEntities(filter: {entityDomainTypes: {include: {domain: "VIZ", type: "DASHBOARD"}}}) {
                results {
                  source {
                    guid
                  }
                }  
              }
              workloadStatus {
                description
                statusSource
                summary
                statusValue
              }
            }
            ... on AlertableEntity {
              alertSeverity
            }
          }
        }
      }`,
  scores: [
    {
      name: 'Reporting',
      entityCheck: entity => entity.reporting
    },
    {
      name: 'Alerts',
      entityCheck: entity => entity?.alertSeverity !== 'NOT_CONFIGURED'
    },
    {
      name: 'Has Dashboards',
      entityCheck: entity =>
        (entity?.dashboardEntities?.results || []).length > 0
    }
  ]
};
