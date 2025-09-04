export default {
  domain: 'MOBILE',
  entityType: 'MOBILE_APPLICATION_ENTITY',
  // some entities require additional data that can only be performed with a direct guid query
  graphql: `query ($guids: [EntityGuid]!) {
        actor {
          entities(guids: $guids) {
            mobileBreadcrumbs: nrdbQuery(nrql: "SELECT count(*) FROM MobileBreadcrumb SINCE 1 day ago", timeout: 120) {
              results
            }
            mobileHandledExceptions: nrdbQuery(nrql: "SELECT count(*) FROM MobileHandledException SINCE 1 day ago", timeout: 120) {
              results
            }
            mobileEvents: nrdbQuery(nrql: "SELECT count(*) FROM Mobile SINCE 60 minutes ago", timeout: 120) {
              results
            }
            mobileAppLaunch: nrdbQuery(nrql: "SELECT uniqueCount(sessionId) from Mobile SINCE 30 hours ago", timeout: 120) {
              results
            }
            mobileDeployedVersions: nrdbQuery(nrql: "SELECT uniqueCount(appId), latest(osName) FROM Mobile SINCE 30 hours ago FACET newRelicVersion", timeout: 120) {
              results
            }
            guid
            deploymentSearch {
              results {
                commit
              }
            }
            ... on MobileApplicationEntity {
              applicationId
              guid
              name
              alertSeverity
              reporting
              mobileSummary {
                appLaunchCount
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
      name: 'Launch count',
      entityCheck: entity =>
        (entity.mobileAppLaunch?.results?.[0]?.['uniqueCount.sessionId'] || 0) >
        0
    },
    {
      name: 'Breadcrumbs',
      entityCheck: entity =>
        (entity.mobileBreadcrumbs?.results?.[0]?.count || 0) > 0
    },
    {
      name: 'Handled Exceptions',
      entityCheck: entity =>
        (entity.mobileHandledExceptions?.results?.[0]?.count || 0) > 0
    },
    {
      name: 'Alerts',
      entityCheck: entity => entity?.alertSeverity !== 'NOT_CONFIGURED'
    }
  ]
};
