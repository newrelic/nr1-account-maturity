/* eslint-disable */

export default {
  short: 'Apps',
  long: 'Applications',
  domain: 'APM',
  // what entity types to check against
  entityType: 'APM_APPLICATION_ENTITY',
  // some entities require additional data that can only be performed with a direct guid query
  graphql: `query ($guids: [EntityGuid]!) {
      actor {
        entities(guids: $guids) {
          guid
          deploymentSearch(filter: {limit: 1}) {
            results {
              commit
            }
          }
          reporting
          ... on ApmApplicationEntity {
            applicationId
            name
            language
            settings {
              apdexTarget
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

  tagMeta: [
    { key: 'language', name: 'Language' },
    { key: 'agentVersion', name: 'Version' }
  ],
  // nrqlQueries: (entity) => ({
  //   agentUpdate: `FROM AgentUpdate SELECT latest(currentVersion) as 'currentVersion', latest(recommendedVersion) as 'recVersion' WHERE entity.guid = '${entity.guid}' SINCE 30 hours ago`,
  // }),
  // scores and values to run and display
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
      name: 'Custom Apdex',
      entityCheck: entity => {
        const { language, settings } = entity;
        return (
          (settings?.apdexTarget !== 0.5 && language !== 'nodejs') ||
          (settings?.apdexTarget !== 0.1 && language === 'nodejs')
        );
      }
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
    },
    // {
    //   name: 'Latest Release',
    //   entityCheck: (entity, releases) => {
    //     const { runningAgentVersions, language } = entity;

    //     // the logic of the original implementation assumes that the max version is okay to use and that the latest will be rolled out completely eventually
    //     const maxVersion =
    //       runningAgentVersions?.maxVersion ||
    //       runningAgentVersions?.minVersion ||
    //       '0.0.0';

    //     if (releases[language]) {
    //       const releaseCount = releases[language]?.agentReleases.length - 1;
    //       const latestVersion =
    //         releases[language]?.agentReleases[releaseCount || 0];

    //       const lversion = semver.coerce(latestVersion?.version);
    //       const mversion = semver.coerce(maxVersion);

    //       return semver.satisfies(mversion?.raw, `>=${lversion?.raw}`);
    //     } else {
    //       console.log(
    //         "Can't determine agent release for",
    //         entity.name,
    //         entity.guid
    //       );
    //       return false;
    //     }
    //   },
    // },
    {
      name: 'Latest Release',
      entityCheck: (entity, releases) => {
        const data = entity?.nrqlData?.agentUpdate?.[0];
        if (data && data.currentVersion && data.recVersion) {
          if (data.currentVersion !== data.recVersion) {
            return false;
          } else {
            return true;
          }
        } else {
          console.log(
            `No AgentUpdate available to retrieve for ${entity.guid}`
          );
          return false;
        }
      }
    },
    {
      name: 'DT Enabled',
      entityCheck: entity =>
        entity.tags.find(tag => tag.key === 'nr.dt.enabled')?.values?.[0] ===
        'true'
    },
    {
      name: 'Deployments',
      entityCheck: entity =>
        (entity?.deploymentSearch?.results || []).length > 0
    },
    {
      name: 'Custom Attributes',
      accountCheck: (account, dataDictionary) => {
        const currentKeySet = account?.data?.KeySet_Transaction?.results || [];
        const attributes =
          dataDictionary?.APM_APPLICATION_ENTITY?.[0]?.attributes || [];

        if (attributes) {
          return currentKeySet.length > attributes.length;
        } else {
          console.log(
            'unable to determine if data dictionary or attributes exist, returning true'
          );
          return true;
        }
      }
    }
  ]
};
