/* eslint-disable */

import { ngql } from 'nr1';

export const accountsQuery = ngql`{
  actor {
    accounts {
      id
      name
      reportingEventTypes
    }
  }
}`;

export const userQuery = ngql`{
  actor {
    user {
      email
      id
      name
    }
  }
}`;

export const nrqlGqlQuery = (accountId, entityQueries) => {
  const queryParts = [];

  entityQueries.forEach(({ guid, nrqlQueries }) => {
    Object.keys(nrqlQueries).forEach(queryKey => {
      const alias = `${guid}_${queryKey}`.replace(/[^a-zA-Z0-9_]/g, '_');
      queryParts.push(`
        ${alias}: nrql(query: "${nrqlQueries[queryKey]}", timeout: 120) {
          results
        }
      `);
    });
  });

  return ngql`{
    actor {
      account(id: ${accountId}) {
        ${queryParts.join('')}
      }
    }
  }`;
};

// eslint-disable-next-line
export const nrqlGqlQueryOld = (accountId, query, alias) => ngql`{
  actor {
    account(id: ${accountId}) {
      nrql(query: "${query}", timeout: 120) {
        results
      }
    }
  }
}`;

//  entityInfo: entitySearch(query: "tags.accountId = '${id}'") {
//     types {
//       count
//       entityType
//       type
//       domain
//     }
//   }

export const batchAccountQuery = accounts => {
  const fragments = accounts.map(account => {
    const id = account.id;
    const alias = `account_${id}`;
    return `
      ${alias}: actor {
        account(id: ${id}) {
          cloud {
            linkedAccounts {
              disabled
              name
              id
              nrAccountId
              provider {
                id
                name
              }
            }
          }
          logMessageCount: nrql(query: "SELECT count(*) as 'count' FROM Log since 12 hours ago ", timeout: 120) {
            results
          }
          nrqlLoggingAlertCount:alerts {
            nrqlConditionsSearch(searchCriteria: {queryLike: "FROM log"}) {
              totalCount
            }
          }
          KeySet_Transaction: nrql(query: "SELECT keyset() FROM Transaction") {
            results
          }
          KeySet_PageView: nrql(query: "SELECT keyset() FROM PageView") {
            results
          }
          KeySet_SystemSample: nrql(query: "SELECT keyset() FROM SystemSample") {
            results
          }
        }
      }
    `;
  });

  return `{ ${fragments.join('\n')} }`;
};

export const accountDataQuery = accountId => ngql`{
  actor {
    entityInfo: entitySearch(query: "tags.accountId = '${accountId}'") {
      types {
        count
        entityType
        type
        domain
      }
    }
    account(id: ${accountId}) {
      cloud {
        linkedAccounts {
          disabled
          name
          id
          nrAccountId
          provider {
            id
            name
          }
        }
      }
      logMessageCount: nrql(query: "SELECT latest(timestamp) FROM Log since 12 hours ago ", timeout: 120) {
        results
      }
      nrqlLoggingAlertCount:alerts {
        nrqlConditionsSearch(searchCriteria: {queryLike: "FROM log"}) {
          totalCount
        }
      }
      KeySet_Transaction: nrql(query: "SELECT keyset() FROM Transaction") {
        results
      }
      KeySet_PageView: nrql(query: "SELECT keyset() FROM PageView") {
        results
      }
      KeySet_SystemSample: nrql(query: "SELECT keyset() FROM SystemSample") {
        results
      }
    }
  }
}`;

export const entitySearchQueryByAccount = (
  accountId,
  searchClause
) => ngql`query ($cursor: String) {
  actor {
    entitySearch(query: "tags.accountId = '${accountId}' ${searchClause ||
  ''}  ") {
      count
      results(cursor: $cursor) {
        nextCursor
        entities {
          name
          guid
          entityType
          domain
          type
          account {
            id
            name
          }
          reporting
        }
      }
    }
  }
}`;

export const entityTypesQueryByAccount = accountId => ngql`{
  actor {
    entitySearch(query: "name LIKE '%' AND tags.accountId = '${accountId}'") {
      types {
        entityType
        type
        domain
        count
      }
    }
  }
}`;

export const dataDictionaryQuery = ngql`{
  docs {
    dataDictionary {
      APM_APPLICATION_ENTITY: events(names: "Transaction") {
        attributes {
          name
        }
      }
      BROWSER_APPLICATION_ENTITY: events(names: "PageView") {
        attributes {
          name
        }
      }
      INFRASTRUCTURE_HOST_ENTITY: events(names: "SystemSample") {
        attributes {
          name
        }
      }
    }
  }
}`;

export const agentReleasesQuery = ngql`{
      android: docs {
        agentReleases(agentName: ANDROID) {
          version
          date
        }
      }
      browser: docs {
        agentReleases(agentName: BROWSER) {
          version
          date
        }
      }
      dotnet: docs {
        agentReleases(agentName: DOTNET) {
          version
          date
        }
      }
      elixir: docs {
        agentReleases(agentName: ELIXIR) {
          version
          date
        }
      }
      go: docs {
        agentReleases(agentName: GO) {
          version
          date
        }
      }
      infrastructure: docs {
        agentReleases(agentName: INFRASTRUCTURE) {
          version
          date
        }
      }
      ios: docs {
        agentReleases(agentName: IOS) {
          version
          date
        }
      }
      java: docs {
        agentReleases(agentName: JAVA) {
          version
          date
        }
      }
      nodejs: docs {
        agentReleases(agentName: NODEJS) {
          version
          date
        }
      }
      php: docs {
        agentReleases(agentName: PHP) {
          version
          date
        }
      }
      python: docs {
        agentReleases(agentName: PYTHON) {
          version
          date
        }
      }
      ruby: docs {
        agentReleases(agentName: RUBY) {
          version
          date
        }
      }
      sdk: docs {
        agentReleases(agentName: SDK) {
          version
          date
        }
      }
    }`;

// eslint-disable-next-line
const nerdpackSubscriptionCheckQuery = id => `{
      actor {
        nerdpacks {
          nerdpack(id: "${id}") {
            accountId
            id
            subscriptionModel
            subscriptions {
              accountId
            }
          }
        }
      }
    }`;
