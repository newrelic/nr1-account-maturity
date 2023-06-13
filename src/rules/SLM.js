export default {
  entityType: 'EXTERNAL_ENTITY',
  type: 'SERVICE_LEVEL',
  // some entities require additional data that can only be performed with a direct guid query
  graphql: `query ($guids: [EntityGuid]!) {
        actor {
          entities(guids: $guids) {
            guid
            serviceLevel {
              indicators {
                createdAt
                objectives {
                  description
                  name
                }
                name
                id
                guid
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
      entityCheck: (entity) => entity.reporting,
    },
    {
      name: 'Alerts',
      entityCheck: (entity) => entity?.alertSeverity !== 'NOT_CONFIGURED',
    },
    {
      name: 'Alerts Using SLIs',
      accountCheck: (account) =>
        (account?.data?.slmAlertCount?.nrqlConditionsSearch?.totalCount || 0) >
        0,
    },
    // the has owner check just looks for a team tag, this has arguable value since it is not communicated to end users on how to resolve it
    // have chosen not to add that check
  ],
};
