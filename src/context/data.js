import React, { createContext, useEffect } from 'react';
import { useSetState } from '@mantine/hooks';
import {
  NerdGraphQuery,
  Toast,
  AccountStorageQuery,
  AccountStorageMutation,
} from 'nr1';
import {
  accountDataQuery,
  accountsQuery,
  agentReleasesQuery,
  dataDictionaryQuery,
  entitySearchQueryByAccount,
  nrqlGqlQuery,
  userQuery,
} from '../queries/data';
import rules from '../rules';
import { v4 as uuidv4 } from 'uuid';
import { chunk, generateAccountSummary } from '../utils';
import {
  ACCOUNT_USER_CONFIG_COLLECTION,
  ACCOUNT_USER_HISTORY_COLLECTION,
} from '../constants';

const DataContext = createContext();
const async = require('async');

export function ProvideData(v) {
  const auth = useProvideData(v.platformContext);
  return <DataContext.Provider value={auth}>{v.children}</DataContext.Provider>;
}

export default DataContext;

export function useProvideData(props) {
  const [dataState, setDataState] = useSetState({
    accounts: null,
    userConfirmed: null,
    fetchingData: true,
    fetchingAccountData: false,
    apiKeyModalOpen: false,
    errorMsg: null,
    searchText: '',
    checkingAccount: false,
    diracAuth: null,
    summarizedScores: {},
    accountSummaries: null,
    agentReleases: null,
    dataDictionary: null,
    selectedAccountId: null,
    runningReport: false,
    selectedReport: null,
    reportConfigs: null,
    reportHistory: null,
    fetchingReportConfigs: false,
    fetchingReportHistory: false,
    user: null,
    view: { page: 'ReportList', title: 'Maturity Reports' },
    sortBy: 'Lowest score',
  });

  // handle initial load
  useEffect(async () => {
    // eslint-disable-next-line
    console.log("DataProvider loaded");
    const user = await NerdGraphQuery.query({ query: userQuery });
    setDataState({ user: user?.data?.actor?.user });
  }, []);

  // handle account picker changes
  useEffect(async () => {
    const { accountId } = props;
    console.log('account id changed => ', accountId);
    setDataState({ fetchingData: true, selectedAccountId: accountId });

    const reportConfigs =
      (
        await AccountStorageQuery.query({
          accountId,
          collection: ACCOUNT_USER_CONFIG_COLLECTION,
        })
      )?.data || [];

    await fetchReportHistory(accountId);

    const [accountsInit, agentReleases, dataDictionary] = await Promise.all([
      getAccounts(),
      getAgentReleases(),
      getDataDictionary(),
    ]);

    const accounts = await decorateAccountData(accountsInit);

    setDataState({
      selectedAccountId: accountId,
      accounts,
      agentReleases,
      dataDictionary,
      reportConfigs,
      fetchingData: false,
    });
  }, [props.accountId]);

  const runReport = async (selectedReport) => {
    console.log('selected', selectedReport);
    setDataState({
      runningReport: true,
      [`runningReport.${selectedReport.id}`]: true,
      entitiesByAccount: null,
      summarizedScores: null,
      accountSummaries: null,
    });

    const report = selectedReport || dataState.selectedReport;
    const accounts = [...report.document.accounts].map((id) => ({
      ...[...dataState.accounts].find((a) => a.id === id),
    }));

    const { entitiesByAccount, summarizedScores } =
      await getEntitiesForAccounts(
        accounts,
        report.document?.entitySearchQuery || '',
        dataState.agentReleases,
        dataState.dataDictionary
      );

    const accountSummaries = generateAccountSummary(
      entitiesByAccount,
      dataState?.sortBy,
      selectedReport
    );

    const totalScorePercentage =
      accountSummaries.reduce(
        (n, { scorePercentage }) => n + (scorePercentage || 0),
        0
      ) / accountSummaries.length;

    const res = await AccountStorageMutation.mutate({
      accountId: dataState.selectedAccountId,
      actionType: AccountStorageMutation.ACTION_TYPE.WRITE_DOCUMENT,
      collection: ACCOUNT_USER_HISTORY_COLLECTION,
      documentId: uuidv4(),
      document: {
        reportId: report.id,
        runAt: new Date().getTime(),
        totalScorePercentage,
        accountSummaries,
      },
    });

    if (res.error) {
      Toast.showToast({
        title: 'Failed to save',
        description: 'Check your permissions',
        type: Toast.TYPE.CRITICAL,
      });
    } else {
      Toast.showToast({
        title: 'Saved result successfully',
        description: 'Refreshing history...',
        type: Toast.TYPE.NORMAL,
      });
    }

    // console.log(accountSummaries, totalScorePercentage);

    fetchReportHistory();

    setDataState({
      runningReport: false,
      [`runningReport.${selectedReport.id}`]: false,
      entitiesByAccount,
      summarizedScores,
      accountSummaries,
    });
  };

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
        accounts[index].entityInfo = res?.data?.actor?.entityInfo;
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

  const checkUser = (owner) => {
    if (owner?.id !== dataState.user?.id) {
      Toast.showToast({
        title: 'Failed to deleted',
        description: 'You are not the owner',
        type: Toast.TYPE.CRITICAL,
      });

      return false;
    } else {
      return true;
    }
  };

  const fetchReportHistory = (accountId) => {
    // eslint-disable-next-line
    return new Promise(async (resolve) => {
      setDataState({ fetchingReportHistory: true });

      const reportHistory =
        (
          await AccountStorageQuery.query({
            accountId: accountId || dataState.selectedAccountId,
            collection: ACCOUNT_USER_HISTORY_COLLECTION,
          })
        )?.data || [];

      setDataState({
        fetchingReportHistory: false,
        reportHistory: reportHistory.sort(
          (a, b) => b.document.runAt - a.document.runAt
        ),
      });
      resolve();
    });
  };

  const fetchReportConfigs = async () => {
    setDataState({ fetchingReports: true });

    const reportConfigs =
      (
        await AccountStorageQuery.query({
          accountId: dataState.selectedAccountId,
          collection: ACCOUNT_USER_CONFIG_COLLECTION,
        })
      )?.data || [];

    setDataState({ fetchingReports: false, reportConfigs });
  };

  const deleteReportConfig = async (documentId) => {
    const res = await AccountStorageMutation.mutate({
      accountId: dataState.selectedAccountId,
      actionType: AccountStorageMutation.ACTION_TYPE.DELETE_DOCUMENT,
      collection: ACCOUNT_USER_CONFIG_COLLECTION,
      documentId,
    });

    if (res.error) {
      Toast.showToast({
        title: 'Failed to deleted',
        description: 'Check your permissions',
        type: Toast.TYPE.CRITICAL,
      });
    } else {
      Toast.showToast({
        title: 'Deleted successfully',
        type: Toast.TYPE.NORMAL,
      });

      await fetchReportConfigs();
    }
  };

  const getEntitiesForAccounts = async (
    accounts,
    entitySearchQuery,
    agentReleases,
    dataDictionary
  ) => {
    setDataState({ gettingEntities: true });

    return new Promise((resolve) => {
      let completedAccounts = [];
      // eslint-disable-next-line
      let completedPercentage = 0;

      const q = async.queue((task, callback) => {
        getEntitiesByAccount(task, entitySearchQuery).then((entities) => {
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
            const { name, entityCheck, accountCheck, valueCheck } = score;

            if (!valueCheck) {
              account.scores[key].maxScore += score?.weight || 1;
            }

            if (!account.scores[key].offendingEntities) {
              account.scores[key].offendingEntities = {};
            }

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
                account.scores[key][name].passed += score?.weight || 1;
                summarizedScores[key][name].passed += score?.weight || 1;
                account.scores[key].overallScore += score?.weight || 1;
              } else {
                account.scores[key][name].failed += score?.weight || 1;
                summarizedScores[key][name].failed += score?.weight || 1;
              }
            } else if (valueCheck) {
              const { passed, failed } = valueCheck(account);
              const weightedPass = passed * (score?.weight || 1);
              const weightedFail = failed * (score?.weight || 1);

              account.scores[key][name].passed += weightedPass;
              summarizedScores[key][name].passed += weightedPass;
              account.scores[key][name].failed += weightedFail;
              summarizedScores[key][name].failed += weightedFail;

              account.scores[key].overallScore += weightedPass;

              // may need to do something about this
              account.scores[key].maxScore += weightedPass + weightedFail;
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
                    if (!account.scores[key].offendingEntities[entity.guid]) {
                      account.scores[key].offendingEntities[entity.guid] = {
                        name: entity.name,
                        [name]: false,
                      };
                    } else {
                      account.scores[key].offendingEntities[entity.guid][
                        name
                      ] = false;
                    }
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
        });
      });

      resolve({ accounts, summarizedScores });
    });
  };

  const getEntitiesByAccount = (account, entitySearchQuery) => {
    return new Promise((resolve) => {
      let completedEntities = [];
      let totalEntityCount = 0;
      let completedPercentage = 0;

      const q = async.queue((task, callback) => {
        const entityClause = entitySearchQuery
          ? `AND ${entitySearchQuery}`
          : '';
        const searchClause = ` AND type NOT IN ('DASHBOARD') ${entityClause}`;
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
    fetchReportConfigs,
    fetchReportHistory,
    deleteReportConfig,
    checkUser,
    runReport,
  };
}
