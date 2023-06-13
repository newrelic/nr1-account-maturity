// eslint-disable-next-line eslint-comments/disable-enable-pair
/* eslint-disable prettier/prettier */
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

// eslint-disable-next-line
export const nrqlGqlQuery = (accountId, query, alias) => ngql`{
  actor {
    account(id: ${accountId}) {
      nrql(query: "${query}", timeout: 120) {
        results
      }
    }
  }
}`

export const accountDataQuery = (accountId) => ngql`{
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
      awsBilling: nrql(query: "SELECT count(*) as 'count' FROM FinanceSample", timeout: 120) {
        results
      }
      logMessageCount: nrql(query: "SELECT count(*) as 'count' FROM Log since 12 hours ago ", timeout: 120) {
        results
      }
      nrqlLoggingAlertCount:alerts {
        nrqlConditionsSearch(searchCriteria: {queryLike: "FROM log"}) {
          totalCount
        }
      }
      slmAlertCount:alerts {
        nrqlConditionsSearch(searchCriteria: {queryLike: "newrelic.sli"}) {
          totalCount
        }
      }
      npmNoEntityDefinitionDevices: nrql(query: "SELECT uniqueCount(device_name) from Metric where entity.name is null and instrumentation.provider = 'kentik' and instrumentation.name != 'heartbeat'", timeout: 120) {
        results
      }
      npmSnmpPollingFailures: nrql(query: "SELECT uniqueCount(device_name) From Metric where PollingHealth = 'BAD' SINCE 1 day ago", timeout: 120) {
        results
      }
      npmKtranslateSyslogDevices: nrql(query: "SELECT uniqueCount(device_name) from Log where plugin.type = 'ktranslate-syslog' since 1 day ago", timeout: 120) {
        results
      }  
      programDeployCount: nrql(query: "SELECT count(*) FROM NrAuditEvent  WHERE targetType = 'nerdpack' and actionIdentifier ='nerdpack.subscribe' SINCE 7 days ago", timeout: 120) {
        results
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
}`

export const entitySearchQueryByAccount = (
  accountId,
  searchClause
) => ngql`query ($cursor: String) {
  actor {
    entitySearch(query: "tags.accountId = '${accountId}' ${searchClause || ''
  }  ") {
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
          tags {
            key
            values
          }
          reporting
        }
      }
    }
  }
}`;

export const entityTypesQueryByAccount = (accountId) => ngql`{
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
}`

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
    }`

const nerdpackSubscriptionCheckQuery = (id) => `{
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
    }`