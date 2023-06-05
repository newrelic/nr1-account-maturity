import React, { createContext, useEffect } from 'react';
import { useSetState } from '@mantine/hooks';
import { nerdlet, NerdGraphQuery, Toast, NrqlQuery } from 'nr1';
import {
  accountDataQuery,
  accountsQuery,
  agentReleasesQuery,
  dataDictionaryQuery,
  entitySearchQueryByAccount,
  nrqlGqlQuery,
} from '../queries/data';
import rules from '../rules';
import { chunk } from '../utils';

const DataContext = createContext();
const async = require('async');

export function ProvideData({ children }) {
  const auth = useProvideData();
  return <DataContext.Provider value={auth}>{children}</DataContext.Provider>;
}

export default DataContext;

export function useProvideData() {
  const [dataState, setDataState] = useSetState({
    userConfirmed: null,
    fetchingData: true,
    fetchingAccountData: false,
    apiKeyModalOpen: false,
    errorMsg: null,
    searchText: '',
    checkingAccount: false,
    diracAuth: null,
    accountIds: [],
    summarizedScores: {},
    agentReleases: null,
    dataDictionary: null,
  });

  useEffect(async () => {
    // eslint-disable-next-line
    console.log("DataProvider loaded");
    setDataState({ fetchingData: true });

    nerdlet.setConfig({
      accountPicker: true,
      timePicker: false,
    });

    const [accountsInit, agentReleases, dataDictionary] = await Promise.all([
      getAccounts(),
      getAgentReleases(),
      getDataDictionary(),
    ]);

    const accounts = await decorateAccountData(accountsInit);

    setDataState({
      accounts,
      agentReleases,
      dataDictionary,
    });

    const { entitiesByAccount, summarizedScores } =
      await getEntitiesForAccounts(accounts, agentReleases, dataDictionary);

    console.log(summarizedScores);

    setDataState({ entitiesByAccount, summarizedScores, fetchingData: false });
  }, []);

  // decorate additional account data
  const decorateAccountData = (accounts) => {
    // eslint-disable-next-line
    return new Promise(async (resolve) => {
      const accountData = await Promise.all(
        accounts.map((account) =>
          NerdGraphQuery.query({ query: accountDataQuery(account.id) })
        )
      );

      accountData.forEach((res, index) => {
        accounts[index].data = res?.data?.actor?.account;
      });

      resolve(accounts);
    });
  };

  const getAgentReleases = () =>
    NerdGraphQuery.query({ query: agentReleasesQuery }).then(
      (res) => res?.data
    );

  const getDataDictionary = () =>
    NerdGraphQuery.query({ query: dataDictionaryQuery }).then(
      (res) => res?.data?.docs?.dataDictionary
    );

  const getAccounts = () =>
    NerdGraphQuery.query({ query: accountsQuery }).then(
      (res) => res?.data?.actor?.accounts || []
    );

  const getEntitiesForAccounts = async (
    accounts,
    agentReleases,
    dataDictionary
  ) => {
    setDataState({ gettingEntities: true });

    return new Promise((resolve) => {
      let completedAccounts = [];
      let completedPercentage = 0;

      const q = async.queue((task, callback) => {
        getEntitiesByAccount(task).then((entities) => {
          task.entities = entities;
          completedAccounts.push(task);
          completedPercentage = (completedAccounts / accounts.length) * 100;
          callback();
        });
      }, 5);

      q.push(accounts);

      q.drain(() => {
        setDataState({ gettingEntities: false });
        evaluateAccounts(completedAccounts, agentReleases, dataDictionary).then(
          ({ accounts, summarizedScores }) => {
            resolve({ entitiesByAccount: accounts, summarizedScores });
          }
        );
      });
    });
  };

  const evaluateAccounts = (accounts, agentReleases, dataDictionary) => {
    return new Promise((resolve) => {
      const summarizedScores = {};

      accounts.forEach((account) => {
        if (!account.scores) {
          account.scores = {};
        }

        Object.keys(rules).forEach((key) => {
          const { scores } = rules[key];

          if (!account.scores[key]) {
            account.scores[key] = { overallScore: 0, maxScore: 0 };
          }

          if (!summarizedScores[key]) {
            summarizedScores[key] = {
              // overallScore: scores.length * accounts.length,
            };
          }

          scores.forEach((score) => {
            const { name, entityCheck, accountCheck } = score;

            account.scores[key].maxScore += score?.weight || 1;

            if (!account.scores[key][name]) {
              account.scores[key][name] = {
                passed: 0,
                failed: 0,
              };
            }

            if (!summarizedScores[key][name]) {
              summarizedScores[key][name] = {
                passed: 0,
                failed: 0,
              };
            }

            if (accountCheck) {
              if (accountCheck(account, dataDictionary)) {
                account.scores[key][name].passed++;
                summarizedScores[key][name].passed++;
                account.scores[key].overallScore++;
              } else {
                account.scores[key][name].failed++;
                summarizedScores[key][name].failed++;
              }
            }

            if (rules[key].entityType) {
              const foundEntities = account.entities.filter(
                (e) =>
                  e.entityType === rules[key].entityType &&
                  (rules[key].type ? rules[key].type === e.type : true)
              );

              foundEntities.forEach((entity) => {
                if (entityCheck) {
                  if (entityCheck(entity, agentReleases)) {
                    account.scores[key][name].passed++;
                    summarizedScores[key][name].passed++;
                  } else {
                    account.scores[key][name].failed++;
                    summarizedScores[key][name].failed++;
                  }
                }
              });

              if (entityCheck) {
                const computedScore =
                  account.scores[key][name].passed / foundEntities.length || 0;

                account.scores[key].overallScore +=
                  computedScore * (score?.weight || 1);
              }
            }
          });

          //
        });
      });

      resolve({ accounts, summarizedScores });
    });
  };

  const getEntitiesByAccount = (account) => {
    return new Promise((resolve) => {
      let completedEntities = [];
      let totalEntityCount = 0;
      let completedPercentage = 0;

      const q = async.queue((task, callback) => {
        const searchClause = " AND type NOT IN ('DASHBOARD')";
        NerdGraphQuery.query({
          query: entitySearchQueryByAccount(account.id, searchClause),
          variables: { cursor: task.cursor },
        }).then((res) => {
          if (res.error) {
            Toast.showToast({
              title: 'Failed to fetch entities',
              description: res.error.message,
              type: Toast.TYPE.CRITICAL,
            });
            callback();
          } else {
            const entitySearch = res?.data?.actor?.entitySearch || {};

            totalEntityCount = entitySearch.count;
            completedEntities = [
              ...completedEntities,
              ...(entitySearch?.results?.entities || []),
            ];
            completedPercentage =
              (completedEntities.length / totalEntityCount) * 100;

            console.log(account.id, completedPercentage);

            const nextCursor = entitySearch?.results?.nextCursor;
            if (nextCursor) {
              q.push({ cursor: nextCursor });
            }

            callback();
          }
        });
      }, 5);

      q.push({ cursor: null });

      q.drain(() => {
        decorateEntities(completedEntities).then((decoratedEntities) => {
          resolve(decoratedEntities);
        });
      });
    });
  };

  const decorateEntities = (entities) => {
    //eslint-disable-next-line
    return new Promise(async (resolve) => {
      const entityTypesToQuery = [];
      const entityNrqlQueries = [];

      Object.keys(rules).forEach((key) => {
        const rule = rules[key];

        if (rule.graphql) {
          const foundEntities = entities.filter(
            (e) => e.entityType === rule.entityType
          );

          if (foundEntities.length > 0) {
            entityTypesToQuery.push({
              entities: foundEntities,
              graphql: rule.graphql,
            });
          }
        }

        if (rule.nrqlQueries) {
          const foundEntities = entities.filter(
            (e) => e.entityType === rule.entityType && e.type === rule.type
          );

          foundEntities.forEach((e) => {
            entityNrqlQueries.push({
              guid: e.guid,
              name: e.name,
              accountId: e.account.id,
              nrqlQueries: rule.nrqlQueries(e),
            });
          });
        }
      });

      if (entityNrqlQueries.length > 0) {
        let entityNrqlData = [];

        const nrqlQueue = async.queue((task, callback) => {
          const nrqlPromises = Object.keys(task.nrqlQueries).map((q) => {
            return NerdGraphQuery.query({
              query: nrqlGqlQuery(task.accountId, task.nrqlQueries[q]),
            });
          });

          Promise.all(nrqlPromises).then((values) => {
            const nrqlData = {};

            values.forEach((v, i) => {
              nrqlData[Object.keys(task.nrqlQueries)[i]] =
                v?.data?.actor?.account?.nrql?.results;
            });

            entityNrqlData.push({
              guid: task.guid,
              nrqlData,
            });

            callback();
          });
        }, 5);

        nrqlQueue.push(entityNrqlQueries);

        await nrqlQueue.drain();

        console.log(entityNrqlData);

        entities.forEach((entity, i) => {
          const foundEntity = entityNrqlData.find(
            (e) => e.guid === entity.guid
          );
          if (foundEntity) {
            entities[i] = { ...foundEntity, ...entity };
          }
        });
      }

      if (entityTypesToQuery.length > 0) {
        let entityData = [];

        const entityTypeQueue = async.queue((task, callback) => {
          getEntityData(task).then((data) => {
            entityData = [...entityData, ...data];
            callback();
          });
        }, 5);

        entityTypeQueue.push(entityTypesToQuery);

        entityTypeQueue.drain(() => {
          // merge entity data
          entities.forEach((entity, i) => {
            const foundEntity = entityData.find((e) => e.guid === entity.guid);
            if (foundEntity) {
              entities[i] = { ...foundEntity, ...entity };
            }
          });

          resolve(entities);
        });
      }

      if (entityTypesToQuery.length === 0 && entityNrqlQueries.length === 0) {
        resolve(entities);
      }
    });
  };

  const getEntityData = (entityTask) => {
    return new Promise((resolve) => {
      const guidChunks = chunk(
        entityTask.entities.map((e) => e.guid),
        25
      );

      let entityData = [];

      const taskQueue = async.queue((guids, callback) => {
        NerdGraphQuery.query({
          query: entityTask.graphql,
          variables: { guids },
        }).then((res) => {
          entityData = [...entityData, ...(res?.data?.actor?.entities || [])];
          callback();
        });
      }, 5);

      taskQueue.push(guidChunks);

      taskQueue.drain(() => {
        resolve(entityData);
      });
    });
  };

  return {
    ...dataState,
    setDataState,
  };
}
