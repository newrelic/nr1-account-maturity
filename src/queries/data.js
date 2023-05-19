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
