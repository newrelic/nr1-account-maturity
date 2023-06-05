import semver from 'semver';

// notes
// not adding docker label check as it uses its own point system depending on how many labels exist does not really indicate maturity in a meaningful way imo
//

export default {
  // what entity types to check against
  entityType: 'INFRASTRUCTURE_HOST_ENTITY',
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
          ... on InfrastructureHostEntity {
            hostSummary {
              servicesCount
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
              ].includes(key)
          ),
    },
    {
      name: 'Latest Release',
      entityCheck: (entity, releases) => {
        const { tags } = entity;

        const agentVersion = tags.find((t) => t.key === 'agentVersion')
          ?.values?.[0];

        if (releases.infrastructure) {
          const releaseCount =
            releases?.infrastructure?.agentReleases.length - 1;
          const latestVersion =
            releases?.infrastructure?.agentReleases[releaseCount || 0];

          const lversion = semver.coerce(latestVersion?.version);
          const mversion = semver.coerce(agentVersion);

          return semver.satisfies(mversion?.raw, `>=${lversion?.raw}`);
        } else {
          console.log(
            "Can't determine agent release for",
            entity.name,
            entity.guid
          );
          return false;
        }
      },
    },
    {
      name: 'Deployments',
      entityCheck: (entity) =>
        (entity?.deploymentSearch?.results || []).length > 0,
    },
    {
      name: 'Custom Attributes',
      accountCheck: (account, dataDictionary) => {
        const currentKeySet = account?.data?.KeySet_SystemSample?.results || [];
        const attributes =
          dataDictionary?.INFRASTRUCTURE_HOST_ENTITY?.[0]?.attributes || [];

        console.log(currentKeySet, attributes);

        if (attributes) {
          return currentKeySet.length > attributes.length;
        } else {
          console.log(
            'unable to determine if data dictionary or attributes exist, returning true'
          );
          return true;
        }
      },
    },
    {
      name: 'Cloud Integration Enabled',
      accountCheck: (account) =>
        (account?.data?.cloud?.linkedAccounts || []).length > 0,
    },
    {
      name: 'AWS Billing Enabled',
      accountCheck: (account) =>
        (account?.data?.awsBilling?.results || []).length > 0,
    },
  ],
};
