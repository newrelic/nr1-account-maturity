export default {
  domain: 'MOBILE',
  entityType: 'MOBILE_APPLICATION_ENTITY',
  // some entities require additional data that can only be performed with a direct guid query
  graphql: `query ($guids: [EntityGuid]!) {
        actor {
          entities(guids: $guids) {
            mobileBreadcrumbs: nrdbQuery(nrql: "SELECT latest(timestamp) FROM MobileBreadcrumb SINCE 1 day ago", timeout: 120) {
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
  scores: [
    {
      name: 'Reporting',
      entityCheck: entity => entity.reporting
    },
    {
      name: 'Breadcrumbs',
      entityCheck: entity =>
        (entity.mobileBreadcrumbs?.results?.[0]?.count || 0) > 0
    },
    {
      name: 'Alerts',
      entityCheck: entity => entity?.alertSeverity !== 'NOT_CONFIGURED'
    },
    {
      name: 'Tags', // this was previously the labels check, which is really just checking for non-standard tags (value of this check is questionable)
      entityCheck: entity => {
        if (!entity.tags) {
          console.log('no tags', entity);
          return false;
        } else {
          return entity.tags
            .map(tag => tag.key)
            .some(
              key =>
                ![
                  'account',
                  'accountId',
                  'language',
                  'trustedAccountId',
                  'guid'
                ].includes(key)
            );
        }
      }
    }
    // {
    //   name: 'Launch count',
    //   entityCheck: (entity) =>
    //     (entity.mobileAppLaunch?.results?.[0]?.['uniqueCount.sessionId'] || 0) >
    //     0,
    // },
    // {
    //   name: 'Handled Exceptions',
    //   entityCheck: (entity) =>
    //     (entity.mobileHandledExceptions?.results?.[0]?.count || 0) > 0,
    // },
  ]
};

// mobileAppLaunch: nrdbQuery(nrql: "SELECT latest(sessionId) from Mobile SINCE 30 hours ago", timeout: 120) {
//   results
// }

// mobileEvents: nrdbQuery(nrql: "SELECT count(*) FROM Mobile SINCE 60 minutes ago", timeout: 120) {
//   results
// }

// mobileHandledExceptions: nrdbQuery(nrql: "SELECT latest(timestamp) FROM MobileHandledException SINCE 1 day ago", timeout: 120) {
//   results
// }

// mobileDeployedVersions: nrdbQuery(nrql: "SELECT uniqueCount(appId), latest(osName) FROM Mobile SINCE 30 hours ago FACET newRelicVersion", timeout: 120) {
//   results
// }
