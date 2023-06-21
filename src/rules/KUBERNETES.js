export default {
  // what entity types to check against
  entityType: 'GENERIC_INFRASTRUCTURE_ENTITY',
  // additional type to check
  type: 'KUBERNETESCLUSTER',
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
          ... on AlertableEntity {
            alertSeverity
          }
        }
      }
    }`,
  nrqlQueries: (entity) => ({
    pixie: `FROM Span SELECT count(*) where instrumentation.provider = 'pixie' AND service.name is not null AND k8s.cluster.name = '${entity.name}' since 7 days ago LIMIT MAX`,
    prometheusLabels: `SELECT uniqueCount(clusterName) as 'clusterName' FROM Metric WHERE integrationName ='nri-prometheus' OR instrumentation.provider = 'prometheus' AND clusterName = '${entity.name}' since 7 days ago LIMIT MAX`,
    logEvents: `FROM Log SELECT count(*) where plugin.source = 'kubernetes' AND cluster_name = '${entity.name}' since 7 days ago LIMIT MAX`,
    apmAgents: `FROM Transaction SELECT uniqueCount(appName) as 'appName' WHERE clusterName IS NOT NULL AND clusterName = '${entity.name}' since 7 days ago LIMIT MAX`,
    infraAgents: `FROM K8sClusterSample SELECT uniqueCount(clusterName) as 'clusterName' WHERE agentName = 'Infrastructure' AND clusterName = '${entity.name}' since 7 days ago LIMIT MAX`,
  }),
  // scores and values to run and display
  scores: [
    {
      name: 'Reporting',
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
              ].includes(key)
          ),
    },
    {
      name: 'Deployments',
      entityCheck: (entity) =>
        (entity?.deploymentSearch?.results || []).length > 0,
    },
    {
      name: 'Using Prometheus',
      entityCheck: (entity) =>
        entity?.nrqlData?.prometheusLabels?.[0]?.clusterName > 0,
    },
    {
      name: 'Using Pixie',
      entityCheck: (entity) => entity?.nrqlData?.pixie?.[0]?.count > 0,
    },
    {
      name: 'Using Logs',
      entityCheck: (entity) => entity?.nrqlData?.logEvents?.[0]?.count > 0,
    },
    {
      name: 'APM Agents Installed',
      entityCheck: (entity) => entity?.nrqlData?.apmAgents?.[0]?.appName > 0,
    },
    {
      name: 'Infra Agents Installed',
      entityCheck: (entity) =>
        entity?.nrqlData?.infraAgents?.[0]?.clusterName > 0,
    },
  ],
};
