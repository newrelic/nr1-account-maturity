/* eslint-disable */
import React, { createContext, useEffect } from 'react';
import { useSetState } from '@mantine/hooks';
import {
  navigation,
  NerdGraphQuery,
  Toast,
  UserStorageQuery,
  UserStorageMutation,
  AccountStorageQuery,
  AccountStorageMutation
} from 'nr1';
import {
  accountDataQuery,
  accountsQuery,
  agentReleasesQuery,
  batchAccountQuery,
  dataDictionaryQuery,
  entitySearchQueryByAccount,
  nrqlGqlQuery,
  userQuery
} from '../queries/data';
import rules from '../rules';
import { v4 as uuidv4 } from 'uuid';
import { chunk, chunkString, generateAccountSummary } from '../utils';
// import { useResourceMonitor } from '../../nerdlets/maturity-nerdlet/ResourceMonitor';

import {
  ACCOUNT_CONFIG_COLLECTION,
  ACCOUNT_HISTORY_COLLECTION,
  NRQL_BATCH_SIZE
} from '../constants';

const DataContext = createContext();
const async = require('async');

export function ProvideData(v) {
  const auth = useProvideData(v.platformContext);
  return <DataContext.Provider value={auth}>{v.children}</DataContext.Provider>;
}

const ENTITY_COUNT_BLOCK = 50000;

const TAG_WHITELIST_RULES = [
  // Keep specific tag keys
  key => key === 'accountId',
  key => key === 'nr.dt.enabled',
  key => key === 'instrumentation.provider',
  key => key === 'privateLocation',
  key => key.startsWith('instrumentation.')
];
const stripEntityTags = entity => {
  if (entity.tags && Array.isArray(entity.tags)) {
    const originalLength = entity.tags.length;
    entity.tags = entity.tags.filter(tag => {
      // Keep tags that match any whitelist rule
      return TAG_WHITELIST_RULES.some(rule => rule(tag.key));
    });
    // if (entity.tags.length !== originalLength) {
    //   console.log(
    //     `Kept ${entity.tags.length} of ${originalLength} tags for entity ${entity.guid}`,
    //   );
    // }
  }
};

const TYPE_BLACKLIST =
  "'DASHBOARD','CONTAINER','DESTINATION','CONDITION','HTTPSERVICE','SERVICE','WORKFLOW','POLICY','SERVICE_LEVEL'";

const GLOBAL_CONCURRENCY_LIMIT = 3;

const RETRY_INIT_MS = 1500;

const RETRY_LIMIT = 7;

export default DataContext;

export function useProvideData(props) {
  // const { startTracking, stopTracking } = useResourceMonitor();
  const [dataState, setDataState] = useSetState({
    loadedDefaultView: false,
    showSkipThisStep: true,
    email: null,
    helpModalOpen: false,
    deleteViewModalOpen: null,
    search: '',
    saveViewModalOpen: false,
    viewSegment: 'list',
    viewGroupBy: 'account',
    selectedView: null,
    tempAllData: null,
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
    viewConfigs: null,
    viewHistory: null,
    fetchingReportConfigs: false,
    fetchingViewHistory: false,
    defaultViewId: null,
    defaultView: null,
    userViewHistory: null,
    view: { page: 'CreateView', title: 'Create New View' },
    sortBy: 'Lowest score',
    savingView: false,
    userSettings: null,
    entityCount: 0
  });

  // for testing
  // eslint-disable-next-line
  const wipeUserDetails = async () => {
    // wipe user default config
    const userView = await UserStorageMutation.mutate({
      actionType: UserStorageMutation.ACTION_TYPE.DELETE_DOCUMENT,
      collection: 'userViews',
      documentId: 'default'
    });

    // wipe user history
    const userHistory = await UserStorageMutation.mutate({
      actionType: UserStorageMutation.ACTION_TYPE.DELETE_DOCUMENT,
      collection: ACCOUNT_HISTORY_COLLECTION
    });

    console.log(userView, userHistory);
  };

  const wipeAccountHistory = async () => {
    const res = await AccountStorageMutation.mutate({
      accountId: props?.accountId || dataState?.selectedAccountId,
      actionType: AccountStorageMutation.ACTION_TYPE.DELETE_COLLECTION,
      collection: ACCOUNT_HISTORY_COLLECTION
    });
    console.log('account history deleted resp =>', res);
  };

  const clearWelcome = async () => {
    const userSettings = dataState.userSettings;
    userSettings.doneWelcomeTest23 = new Date().getTime();
    console.log('clearing welcome', userSettings);
    const res = await UserStorageMutation.mutate({
      actionType: UserStorageMutation.ACTION_TYPE.WRITE_DOCUMENT,
      collection: 'userSettings',
      documentId: 'main',
      document: userSettings
    });

    setDataState({ userSettings });

    console.log('user welcome clear resp =>', res);
  };

  // handle initial load
  useEffect(() => {
    const initializeData = async () => {
      console.log('DataProvider initialized');
      const state = {};
      await getUserEmail();

      const userSettings = await getUserSettings();
      state.userSettings = userSettings;
      console.log('userSettings =>', userSettings);

      // load list view if welcome has been done
      if (userSettings?.doneWelcomeTest23) {
        state.view = {
          page: 'ViewList'
        };
      }

      const user = await NerdGraphQuery.query({ query: userQuery });
      state.user = user?.data?.actor?.user;

      const viewConfigs = await fetchViewConfigs(null, state.user);
      const accounts = await getAccounts();

      state.accounts = accounts;
      state.selectedAccountId = accounts[0].id;

      setDataState(state);
    };

    initializeData();
  }, []);

  // handle account picker changes
  useEffect(() => {
    const handleAccountChange = async () => {
      const { accountId } = props;
      const state = {};

      console.log('account id changed => ', accountId);
      if (accountId === 'cross-account') {
        console.log('cross account should not be selected, reloading...');
        navigation.openNerdlet({ id: 'maturity-home' });
        return;
      }

      const accountsInit = await getAccounts();

      if (!accountsInit.find(a => a.id === accountId)) {
        Toast.showToast({
          title: 'Account Maturity is not subscribed to the selected account',
          description: `Change account or subscribe account: ${accountId}`,
          type: Toast.TYPE.CRITICAL
        });
        state.view = { page: 'unavailable-account' };
        state.viewSegment = 'unavailable-account';
      } else {
        state.view = { page: 'ViewList' };
        state.viewSegment = 'list';
      }

      await getUserEmail();

      const userSettings = await getUserSettings();
      state.userSettings = userSettings;
      console.log('userSettings =>', userSettings);
      if (userSettings?.doneWelcomeTest23) {
        state.view = { page: 'ViewList' };
        state.viewSegment = 'list';
      }

      const user = await NerdGraphQuery.query({ query: userQuery });
      state.user = user?.data?.actor?.user;

      setDataState({
        fetchingData: true,
        selectedAccountId: accountId,
        ...state
      });

      if (state.viewSegment == 'unavailable-account') {
        setDataState({
          selectedAccountId: accountId,
          fetchingData: false,
          view: state.view,
          viewSegment: 'unavailable-account'
        });
      } else {
        const viewConfigs = await fetchViewConfigs(accountId, state.user);
        const viewHistory = await fetchViewHistory(accountId);

        const [agentReleases, dataDictionary] = await Promise.all([
          getAgentReleases(),
          getDataDictionary()
        ]);

        deleteOrphanedReports(viewConfigs, viewHistory, accountId);

        let view = dataState.view;
        if (userSettings?.doneWelcomeTest23) {
          view = { page: 'ViewList' };
        }

        setDataState({
          selectedAccountId: accountId,
          accounts: accountsInit,
          agentReleases,
          dataDictionary,
          viewConfigs,
          fetchingData: false,
          view
        });
      }
    };

    handleAccountChange();
  }, [props.accountId]);

  const loadHistoricalResult = (report, result) => {
    console.log('load historical', report, result);
    const { document } = result;
    setDataState({
      tempAllData: document,
      lastRunAt: document?.runAt,
      entitiesByAccount: document?.entitiesByAccount,
      summarizedScores: document?.summarizedScores,
      accountSummaries: document?.accountSummaries,
      totalPercentage: document?.totalPercentage,
      selectedView: {
        ...report,
        id: report.id,
        name: report?.document?.name,
        historyId: result.historyId
      },
      selectedReport: report,
      view: { page: 'MaturityView', historyId: result.historyId }
    });
  };

  const setDefaultView = id => {
    return new Promise(resolve => {
      console.log('setting default view id =>', id);
      const userSettings = dataState?.userSettings || {};
      userSettings.defaultViewId = id;
      UserStorageMutation.mutate({
        actionType: UserStorageMutation.ACTION_TYPE.WRITE_DOCUMENT,
        collection: 'userSettings',
        documentId: 'main',
        document: userSettings
      }).then(res => {
        if (res.error) {
          Toast.showToast({
            title: 'Failed to save',
            type: Toast.TYPE.CRITICAL
          });
        } else {
          Toast.showToast({
            title: 'Saved successfully',
            type: Toast.TYPE.NORMAL
          });
        }

        setDataState({ userSettings });
        resolve(res);
      });
    });
  };

  const toggleFavoriteView = id => {
    return new Promise(resolve => {
      console.log('toggle favorite view id =>', id);
      const userSettings = dataState?.userSettings || {};
      const favorites = userSettings?.favorites || [];

      const foundIndex = favorites.indexOf(id);
      if (foundIndex >= 0) {
        favorites.splice(foundIndex, 1);
      } else {
        favorites.push(id);
      }

      userSettings.favorites = favorites;

      UserStorageMutation.mutate({
        actionType: UserStorageMutation.ACTION_TYPE.WRITE_DOCUMENT,
        collection: 'userSettings',
        documentId: 'main',
        document: userSettings
      }).then(res => {
        if (res.error) {
          Toast.showToast({
            title: 'Failed to save',
            type: Toast.TYPE.CRITICAL
          });
        } else {
          Toast.showToast({
            title: 'Updated successfully',
            type: Toast.TYPE.NORMAL
          });
        }

        setDataState({ userSettings });
        resolve(res);
      });
    });
  };

  const getUserEmail = () => {
    return new Promise(resolve => {
      NerdGraphQuery.query({
        query: `{
        actor {
          user {
            email
          }
        }
      }`
      }).then(res => {
        const email = res?.data?.actor?.user?.email;
        setDataState({ email });
        resolve(email);
      });
    });
  };

  const getUserSettings = () => {
    return new Promise(resolve => {
      UserStorageQuery.query({
        collection: 'userSettings',
        documentId: 'main'
      }).then(res => {
        const userSettings = res?.data || {};
        setDataState({ userSettings });
        resolve(userSettings);
      });
    });
  };

  const runView = async (
    selectedView,
    selectedReport,
    doSaveView,
    saveHistory,
    setAsDefault
  ) => {
    const { totalEntities, summarizedData } = await checkEntityCount({
      accounts: selectedReport?.document?.accounts,
      allAccounts: selectedReport?.document?.allAccounts,
      entitySearchQuery: selectedReport?.document?.entitySearchQuery,
      accountsFilter: selectedReport?.document?.accountsFilterEnabled
        ? selectedReport?.document?.accountsFilter
        : '',
      accountsFilterEnabled: selectedReport?.document?.accountsFilterEnabled,
      allProducts: selectedReport?.document?.allProducts,
      products: selectedReport?.document?.products,
      hideNotReporting: selectedReport?.document?.hideNotReporting,
      selectedView
    });

    setDataState({ entityCount: totalEntities });

    if (totalEntities > ENTITY_COUNT_BLOCK) {
      console.log(
        `blocked run, ${totalEntities} entities exceed ${ENTITY_COUNT_BLOCK} `
      );
      // setRunParams(runParams);
    } else {
      console.log('total ent', totalEntities);

      runViewWrapper(
        selectedView,
        selectedReport,
        doSaveView,
        saveHistory,
        setAsDefault
      );
    }
  };

  const runViewWrapper = async (
    selectedView,
    selectedReport,
    doSaveView,
    saveHistory,
    setAsDefault
  ) => {
    console.log(
      'running',
      selectedView,
      selectedReport,
      doSaveView,
      saveHistory,
      dataState?.email
    );
    let documentId = selectedReport?.id || selectedView.id || uuidv4();

    if (doSaveView && setAsDefault) {
      setDefaultView(documentId);
    }

    // fallback handling from testing
    documentId =
      documentId === 'allData+undefined'
        ? `allData+${dataState?.email}`
        : documentId;

    // startTracking();
    setDataState({
      runningReport: true,
      [`runningReport.${documentId}`]: true,
      entitiesByAccount: null,
      summarizedScores: null,
      accountSummaries: null,
      selectedView: { ...selectedView, id: documentId },
      view: { page: 'Loading' }
      // view:
      //   selectedView.id === 'allData' ? { page: 'Loading' } : dataState.view,
    });

    let report = selectedReport || {};
    if (
      selectedView.id === `allData+${dataState?.email}` ||
      documentId === `allData+${dataState?.email}`
    ) {
      report = {
        id: `allData+${dataState?.email}`,
        document: {
          accounts: dataState.accounts.map(a => a.id),
          allAccounts: true,
          allProducts: true
        }
      };
      console.log(dataState.accounts);
    } else if (selectedView.account && selectedReport) {
      report.id = documentId;

      // if accounts filter enabled dynamical determine accounts
      if (report.document?.accountsFilterEnabled) {
        report.document.accounts = dataState.accounts
          .filter(a =>
            (a?.name || `UNAUTHORIZED ${a?.id}`)
              .toLowerCase()
              .includes((report.document?.accountsFilter || '').toLowerCase())
          )
          .map(a => a.id);
      }

      console.log('this is an account based run');
      console.log(selectedReport);
    } else {
      // unknown
    }

    // const selectedAccounts =
    //   selectedView.id === 'allData'
    //     ? dataState.accounts
    //     : report.document.accounts;

    //
    if (documentId.includes('allData')) {
      report.document.accounts = (dataState?.accounts || []).map(a => a.id);
      report.document.products = Object.keys(rules);
    }

    let accountsToDecorate = [...report.document.accounts].map(id => ({
      ...[...dataState.accounts].find(a => a.id === id)
    }));

    accountsToDecorate = await decorateAccountData(accountsToDecorate);

    // Create a new accounts array with decorated accounts replaced
    const updatedAccounts = [...dataState.accounts].map(originalAccount => {
      const decoratedAccount = accountsToDecorate.find(
        decorated => decorated.id === originalAccount.id
      );
      return decoratedAccount || originalAccount;
    });

    // inject hideNotReporting to entitySearchQuery
    let entitySearchQuery = report.document?.entitySearchQuery || '';

    if (report.document?.hideNotReporting) {
      entitySearchQuery = entitySearchQuery
        ? `${entitySearchQuery} AND reporting = 'true'`
        : `reporting = 'true'`;
    }

    //----------------------------------------------------
    const {
      entitiesByAccount,
      summarizedScores
    } = await getEntitiesForAccounts(
      accountsToDecorate,
      entitySearchQuery || '',
      dataState.agentReleases,
      dataState.dataDictionary,
      report.document.products
    );

    console.log(summarizedScores);

    const accountSummaries = generateAccountSummary(
      entitiesByAccount,
      dataState?.sortBy,
      report
    );

    console.log(accountSummaries);

    let allTotalMaxScore = 0;
    let allTotalScore = 0;
    accountSummaries.forEach(a => {
      allTotalScore += a.totalScore;
      allTotalMaxScore += a.maxScore;
    });
    const totalPercentage = (allTotalScore / allTotalMaxScore) * 100;

    const totalScorePercentage =
      accountSummaries.reduce(
        (n, { scorePercentage }) => n + (scorePercentage || 0),
        0
      ) / accountSummaries.length;

    const runAt = report?.runAt || new Date().getTime();

    console.log(totalScorePercentage, runAt);

    // stopTracking();
    const prepareState = {
      runningReport: false,
      accounts: updatedAccounts,
      [`runningReport.${report?.id || selectedView.id}`]: true,
      lastRunAt: runAt,
      entitiesByAccount,
      summarizedScores,
      accountSummaries,
      totalPercentage,
      view: { page: 'MaturityView' },
      selectedReport: report,
      unsavedRun: selectedView?.unsavedRun
    };

    prepareState.tempAllData = {
      documentId,
      entitiesByAccount,
      summarizedScores,
      accountSummaries,
      totalPercentage,
      runAt
    };

    if (doSaveView) {
      saveView(report, prepareState.tempAllData);
    } else if (!doSaveView && saveHistory) {
      await saveResult(prepareState.tempAllData, {
        ...selectedView,
        id: documentId
      });
    }

    setDataState(prepareState);
  };

  const runReport = async selectedReport => {
    // console.log('selected', selectedReport);
    // setDataState({
    //   runningReport: true,
    //   [`runningReport.${selectedReport.id}`]: true,
    //   entitiesByAccount: null,
    //   summarizedScores: null,
    //   accountSummaries: null,
    // });

    if (documentId.includes('allData')) {
      report.document.accounts = dataState?.accounts;
    }

    const report = selectedReport || dataState.selectedReport;
    const accounts = [...report.document.accounts].map(id => ({
      ...[...dataState.accounts].find(a => a.id === id)
    }));

    console.log('runReport', accounts);

    const {
      entitiesByAccount,
      summarizedScores
    } = await getEntitiesForAccounts(
      accounts,
      report.document?.entitySearchQuery || '',
      dataState.agentReleases,
      dataState.dataDictionary,
      report.products
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

    const runAt = selectedReport?.runAt || new Date().getTime();

    const res = await AccountStorageMutation.mutate({
      accountId: dataState.selectedAccountId,
      actionType: AccountStorageMutation.ACTION_TYPE.WRITE_DOCUMENT,
      collection: ACCOUNT_HISTORY_COLLECTION,
      documentId: uuidv4(),
      document: {
        reportId: report.id,
        runAt,
        totalScorePercentage,
        accountSummaries,
        entitySearchQuery: report.document?.entitySearchQuery
      }
    });

    if (res.error) {
      Toast.showToast({
        title: 'Failed to save',
        description: 'Check your permissions',
        type: Toast.TYPE.CRITICAL
      });
    } else {
      Toast.showToast({
        title: 'Saved result successfully',
        description: 'Refreshing history...',
        type: Toast.TYPE.NORMAL
      });
    }

    // console.log(accountSummaries, totalScorePercentage);

    await fetchViewHistory();

    // stopTracking();
    setDataState({
      runningReport: false,
      [`runningReport.${selectedReport.id}`]: false,
      lastRunAt: runAt,
      entitiesByAccount,
      summarizedScores,
      accountSummaries
    });
  };

  const saveResult = (runData, selectedView) => {
    // eslint-disable-next-line
    return new Promise(async resolve => {
      const data = runData || dataState?.tempAllData;
      const accountId = dataState.selectedAccountId || props?.accountId;

      if (data) {
        // this is a large chunk of data and seemingly not needed after processing
        // this can be removed if a legitimate reason is found
        delete data.entitiesByAccount;

        data.accountId = accountId;
        const historyId = uuidv4();

        const dataString = JSON.stringify(data);
        const chunkedData = chunkString(dataString, 824 * 1024); // browser shows between  ~930-970kB per chunked element
        console.log('data to save', chunkedData);

        const writePromises = chunkedData.map((chunk, chunkIndex) =>
          AccountStorageMutation.mutate({
            accountId,
            actionType: AccountStorageMutation.ACTION_TYPE.WRITE_DOCUMENT,
            collection: ACCOUNT_HISTORY_COLLECTION,
            documentId: uuidv4(),
            document: {
              accountId,
              historyId,
              viewId: data.documentId,
              runAt: data.runAt,
              chunkIndex,
              chunk
            }
          })
        );

        Promise.all(writePromises).then(results => {
          setDataState({
            selectedView: {
              ...selectedView,
              historyId
            }
          });
          fetchViewConfigs().then(() => {
            resolve(results);
          });
        });
      } else {
        resolve();
      }
    });
  };

  // decorate additional account data
  const decorateAccountData = async accounts => {
    return new Promise((resolve, reject) => {
      // Split into batches of 10
      const batches = [];
      for (let i = 0; i < accounts.length; i += 10) {
        batches.push(accounts.slice(i, i + 10));
      }

      const q = async.queue((batch, callback) => {
        const query = batchAccountQuery(batch);
        NerdGraphQuery.query({ query })
          .then(res => {
            const data = res?.data || {};
            for (const account of batch) {
              const alias = `account_${account.id}`;
              const result = data[alias];
              if (result) {
                account.data = result.account;
                account.entityInfo = result.entityInfo;
              }
            }
            callback();
          })
          .catch(err => callback(err));
      }, GLOBAL_CONCURRENCY_LIMIT);

      q.push(batches);

      q.drain(() => {
        resolve(accounts);
      });

      q.error(err => {
        reject(err);
      });
    });
  };

  const getAgentReleases = () =>
    NerdGraphQuery.query({ query: agentReleasesQuery }).then(res => res?.data);

  const getDataDictionary = () =>
    NerdGraphQuery.query({ query: dataDictionaryQuery }).then(
      res => res?.data?.docs?.dataDictionary
    );

  const getAccounts = () =>
    NerdGraphQuery.query({ query: accountsQuery }).then(
      res => res?.data?.actor?.accounts || []
    );

  const checkUser = owner => {
    if (owner?.id !== dataState.user?.id) {
      Toast.showToast({
        title: 'Failed to deleted',
        description: 'You are not the owner',
        type: Toast.TYPE.CRITICAL
      });

      return false;
    } else {
      return true;
    }
  };

  const deleteView = () => {
    return new Promise(resolve => {
      setDataState({ deletingView: true });
      AccountStorageMutation.mutate({
        accountId: dataState?.selectedAccountId,
        actionType: AccountStorageMutation.ACTION_TYPE.DELETE_DOCUMENT,
        collection: ACCOUNT_CONFIG_COLLECTION,
        documentId: dataState?.deleteViewModalOpen.id
      }).then(res => {
        fetchViewConfigs().then(() => {
          setDataState({
            deletingView: false,
            deleteViewModalOpen: null,
            view: { page: 'ViewList' }
          });
          resolve(res);
        });
      });
    });
  };

  const deleteOrphanedReports = (viewConfigs, viewHistory, accountId) => {
    let reportsToDelete = viewHistory.filter(
      vh =>
        !viewConfigs.find(rc => rc.id === vh?.document?.documentId) &&
        !vh?.document?.documentId.includes('allData')
    );

    // use when debugging
    // console.log("reportsToDelete", reportsToDelete);
    // reportsToDelete = [];
    //

    if (reportsToDelete.length > 0) {
      const deleteDocPromises = reportsToDelete
        .map(r =>
          r.mergedChunkIds.map(id =>
            AccountStorageMutation.mutate({
              accountId,
              actionType: AccountStorageMutation.ACTION_TYPE.DELETE_DOCUMENT,
              collection: ACCOUNT_HISTORY_COLLECTION,
              documentId: id
            })
          )
        )
        .flat();

      Promise.all(deleteDocPromises).then(() => {
        console.log(
          `Deleted ${reportsToDelete.length} orphaned history records`
        );
      });
    } else {
      console.log('no orphaned history records to delete');
    }
  };

  const deleteSnapshot = (documentId, historyId, incomingAccountId) => {
    return new Promise(resolve => {
      setDataState({ deletingSnapshot: true });

      const historyToDelete =
        dataState.viewHistory.find(vh => vh.historyId === historyId)
          ?.mergedChunkIds || [];

      console.log('deleting snapshot =>', historyId, historyToDelete);

      const accountId =
        incomingAccountId || dataState.selectedAccountId || props?.accountId;

      const deletePromises = historyToDelete.map(id =>
        AccountStorageMutation.mutate({
          accountId,
          actionType: AccountStorageMutation.ACTION_TYPE.DELETE_DOCUMENT,
          collection: ACCOUNT_HISTORY_COLLECTION,
          documentId: id
        })
      );

      Promise.all(deletePromises).then(() => {
        fetchViewConfigs().then(configs => {
          const currentConfig = configs.find(c => c.id === documentId);
          const latestHistory = currentConfig?.history?.[0];

          if (latestHistory) {
            // const viewConfig = viewConfigs.find(vc => vc.id === documentId);

            // console.log('!!FOUND', viewConfig);

            setDataState({
              deletingSnapshot: false,
              deleteSnapshotModalOpen: null
            });
            loadHistoricalResult(currentConfig, latestHistory);
            resolve();
          } else {
            setDataState({
              deletingSnapshot: false,
              deleteSnapshotModalOpen: null,
              view: { page: 'ViewList' }
            });
            resolve();
          }
        });
      });
    });
  };

  const fetchViewHistory = incomingAccountId => {
    // eslint-disable-next-line
    return new Promise(async resolve => {
      setDataState({ fetchingViewHistory: true });

      const accountId =
        incomingAccountId || dataState.selectedAccountId || props?.accountId;

      let unmergedViewHistory =
        (
          await AccountStorageQuery.query({
            accountId,
            collection: ACCOUNT_HISTORY_COLLECTION
          })
        )?.data || [];

      const groupedHistory = {};

      unmergedViewHistory.forEach(h => {
        const historyId = h?.document?.historyId;
        if (historyId) {
          if (!groupedHistory[historyId]) {
            groupedHistory[historyId] = [h];
          } else {
            groupedHistory[historyId].push(h);
          }
        }
      });

      const viewHistory = [];

      Object.keys(groupedHistory).forEach(historyId => {
        const chunks = groupedHistory[historyId];
        const mergedChunksString = chunks
          .sort((a, b) => a.document.chunkIndex - b.document.chunkIndex)
          .map(c => c.document.chunk)
          .join('');

        try {
          const mergedChunksJson = JSON.parse(mergedChunksString);
          const builtDocument = {
            historyId,
            document: mergedChunksJson,
            mergedChunkIds: chunks.map(c => c.id) // needed to know all chunks to delete from history
          };
          viewHistory.push(builtDocument);
        } catch (e) {
          console.log('failed to re-merge history chunks');
        }
      });

      setDataState({
        fetchingViewHistory: false,
        viewHistory: viewHistory.sort(
          (a, b) => b.document.runAt - a.document.runAt
        )
      });
      resolve(viewHistory);
    });
  };

  const fetchUserViewHistory = () => {
    // eslint-disable-next-line
    return new Promise(async resolve => {
      setDataState({ fetchingViewHistory: true });

      const userViewHistory = (
        (
          await UserStorageQuery.query({
            collection: ACCOUNT_HISTORY_COLLECTION
          })
        )?.data || []
      ).sort((a, b) => b?.document?.runAt - a?.document?.runAt);

      setDataState({
        fetchingViewHistory: false,
        userViewHistory
      });
      resolve(userViewHistory);
    });
  };

  const fetchViewConfigs = (accountId, user) => {
    console.log('!!!', user, dataState?.user, dataState?.email);
    // eslint-disable-next-line no-async-promise-executor
    return new Promise(async resolve => {
      setDataState({ fetchingReports: true });

      const viewHistory = await fetchViewHistory(accountId);

      // const defaultView = await getUserReport();

      let viewConfigs =
        (
          await AccountStorageQuery.query({
            accountId:
              accountId || dataState.selectedAccountId || props.accountId,
            collection: ACCOUNT_CONFIG_COLLECTION
          })
        )?.data || [];

      // stitch history to config
      viewConfigs = viewConfigs.map(vc => {
        const history = viewHistory.filter(
          vh => vh.document.documentId === vc.id
        );
        return { ...vc, history };
      });

      const eml = dataState?.user?.email || dataState?.email || user?.email;

      if (eml) {
        const allDataConfig = {
          id: `allData+${eml}`,
          document: { name: 'All Data' },
          history: viewHistory.filter(
            vh => vh.document.documentId === `allData+${eml}`
          )
        };

        viewConfigs.push(allDataConfig);
      }

      // simulate no configs being added, the will only include all data
      // viewConfigs = [viewConfigs[viewConfigs.length - 1]];

      setDataState({
        fetchingReports: false,
        viewConfigs: [...viewConfigs]
      });

      resolve(viewConfigs);
    });
  };

  const deleteReportConfig = async documentId => {
    const res = await AccountStorageMutation.mutate({
      accountId: dataState.selectedAccountId,
      actionType: AccountStorageMutation.ACTION_TYPE.DELETE_DOCUMENT,
      collection: ACCOUNT_CONFIG_COLLECTION,
      documentId
    });

    if (res.error) {
      Toast.showToast({
        title: 'Failed to deleted',
        description: 'Check your permissions',
        type: Toast.TYPE.CRITICAL
      });
    } else {
      Toast.showToast({
        title: 'Deleted successfully',
        type: Toast.TYPE.NORMAL
      });

      await fetchViewConfigs();
    }
  };

  const getEntitiesForAccounts = async (
    accounts,
    entitySearchQuery,
    agentReleases,
    dataDictionary,
    products
  ) => {
    setDataState({ gettingEntities: true });

    return new Promise(resolve => {
      let completedAccounts = [];
      // eslint-disable-next-line
      let completedPercentageTotal = 0;
      let completedAccountTotal = 0;

      // start an interval to track updates
      const pollJobStatus = setInterval(() => {
        setDataState({
          completedPercentageTotal,
          completedAccountTotal,
          accountTotal: accounts.length
        });
      }, 1000);

      console.log(`${new Date().toLocaleTimeString()} - fetch accounts start`);
      const q = async.queue((task, callback) => {
        getEntitiesByAccount(task, entitySearchQuery, products).then(
          entities => {
            task.entities = entities;
            completedAccounts.push(task);

            completedAccountTotal = completedAccounts.length;
            completedPercentageTotal =
              (completedAccounts.length / accounts.length) * 100;
            callback();
          }
        );
      }, GLOBAL_CONCURRENCY_LIMIT);

      q.push(accounts);

      q.drain(() => {
        console.log(`${new Date().toLocaleTimeString()} - fetch accounts end`);
        clearInterval(pollJobStatus);
        setDataState({ gettingEntities: false, completedPercentageTotal: 100 });
        evaluateAccounts(completedAccounts, agentReleases, dataDictionary).then(
          ({ accounts, summarizedScores }) => {
            resolve({ entitiesByAccount: accounts, summarizedScores });
          }
        );
      });
    });
  };

  const evaluateAccounts = (accounts, agentReleases, dataDictionary) => {
    return new Promise(resolve => {
      const summarizedScores = {};

      accounts.forEach(account => {
        account.scores = {};

        Object.keys(rules).forEach(key => {
          const { scores } = rules[key];

          if (!account.scores[key]) {
            account.scores[key] = { overallScore: 0, maxScore: 0 };
          }

          if (!summarizedScores[key]) {
            summarizedScores[key] = {
              // overallScore: scores.length * accounts.length,
            };
          }

          const foundEntities = account.entities.filter(
            e =>
              e.entityType === rules[key].entityType &&
              (rules[key].type ? rules[key].type === e.type : true)
          );

          scores.forEach(score => {
            const { name, entityCheck, accountCheck, valueCheck } = score;

            if (!valueCheck) {
              account.scores[key].maxScore += score?.weight || 1;
            }

            if (!account.scores[key].offendingEntities) {
              account.scores[key].offendingEntities = {};
            }

            if (!account.scores[key].passingEntities) {
              account.scores[key].passingEntities = {};
            }

            if (!account.scores[key][name]) {
              account.scores[key][name] = {
                passed: 0,
                failed: 0
              };
            }

            if (!summarizedScores[key][name]) {
              summarizedScores[key][name] = {
                passed: 0,
                failed: 0
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
              foundEntities.forEach(entity => {
                if (entityCheck) {
                  if (entityCheck(entity, agentReleases)) {
                    account.scores[key][name].passed++;
                    summarizedScores[key][name].passed++;
                  } else {
                    if (!account.scores[key].offendingEntities[entity.guid]) {
                      account.scores[key].offendingEntities[entity.guid] = {
                        name: entity.name,
                        [name]: false
                      };

                      if (rules[key].tagMeta) {
                        rules[key].tagMeta.forEach(t => {
                          const foundTag = entity.tags.find(
                            tag => tag.key === t.key
                          );
                          if (foundTag) {
                            account.scores[key].offendingEntities[entity.guid][
                              t.key
                            ] = foundTag?.values?.[0];
                          }
                        });
                      }
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

          foundEntities.forEach(entity => {
            if (!account.scores[key].offendingEntities[entity.guid]) {
              account.scores[key].passingEntities[entity.guid] = {
                name: entity.name
              };

              if (rules[key].tagMeta) {
                rules[key].tagMeta.forEach(t => {
                  const foundTag = entity.tags.find(tag => tag.key === t.key);
                  if (foundTag) {
                    account.scores[key].passingEntities[entity.guid][t.key] =
                      foundTag?.values?.[0];
                  }
                });
              }
            }
          });
        });
      });

      resolve({ accounts, summarizedScores });
    });
  };

  const getEntitiesByAccount = (account, entitySearchQuery, products) => {
    return new Promise(resolve => {
      let completedEntities = [];
      let totalEntityCount = 0;
      let completedPercentage = 0;
      let currentLoadingAccount = null;

      const pollJobStatus = setInterval(() => {
        setDataState({ currentLoadingAccount, completedPercentage });
      }, 1500);

      console.log(
        `${new Date().toLocaleTimeString()} - get entities by account start`
      );
      const q = async.queue((task, callback) => {
        const entityClause = entitySearchQuery
          ? `AND ${entitySearchQuery}`
          : '';

        const infraTypes = [];

        const productDomains = products
          .map(p => {
            if (rules[p]?.domain === 'INFRA') {
              infraTypes.push(rules[p].type);
            }

            return rules[p]?.domain;
          })
          .filter(p => {
            return p && p !== 'INFRA';
          });

        const infraClause = infraTypes
          ? ` OR type IN ('${infraTypes.join("','")}')`
          : '';

        const domainClause = productDomains
          ? ` AND domain IN ('${productDomains.join("','")}')`
          : '';

        const searchClause = ` AND type NOT IN (${TYPE_BLACKLIST}) AND type NOT LIKE 'KUBERNETES_%' ${domainClause} ${infraClause} ${entityClause}`;

        // console.log('!!! CLAUSE -> ', searchClause);
        // console.log('!!! INFRA CLAUSE -> ', infraClause);

        async.retry(
          {
            times: RETRY_LIMIT,
            interval: retryCount => RETRY_INIT_MS * Math.pow(2, retryCount) // Exponential backoff formula
          },
          retryCallback => {
            NerdGraphQuery.query({
              query: entitySearchQueryByAccount(account.id, searchClause),
              variables: { cursor: task.cursor }
            })
              .then(res => {
                if (res.error) {
                  // Toast.showToast({
                  //   title: 'Failed to fetch entities, retrying',
                  //   description: res.error.message,
                  //   type: Toast.TYPE.CRITICAL,
                  // });
                  retryCallback(res.error, null); // Pass error to retry, will trigger retry
                } else {
                  const entitySearch = res?.data?.actor?.entitySearch || {};

                  totalEntityCount = entitySearch.count;
                  for (
                    let i = 0;
                    i < (entitySearch?.results?.entities || []).length;
                    i++
                  ) {
                    completedEntities.push(entitySearch.results.entities[i]);
                  }

                  completedPercentage =
                    (completedEntities.length / totalEntityCount) * 100;

                  if (currentLoadingAccount !== account) {
                    currentLoadingAccount = account;
                  }

                  const nextCursor = entitySearch?.results?.nextCursor;
                  if (nextCursor) {
                    q.push({ cursor: nextCursor });
                  }

                  retryCallback(null, res); // Success, no retry
                }
              })
              .catch(error => {
                retryCallback(error, null); // Handle promise rejection, trigger retry
              });
          },
          (err, result) => {
            // Final callback after retrying or on success
            if (err) {
              console.error('Final error after retries:', err);
            }
            callback(); // Continue queue
          }
        );
      }, GLOBAL_CONCURRENCY_LIMIT);

      q.push({ cursor: null });

      q.drain(() => {
        console.log(
          `${new Date().toLocaleTimeString()} - get entities by account end`
        );
        clearInterval(pollJobStatus);

        decorateEntitiesOld(completedEntities).then(decoratedEntities => {
          resolve(decoratedEntities);
        });
      });
    });
  };

  const chunkArray = (array, size) => {
    const chunks = [];
    for (let i = 0; i < array.length; i += size) {
      chunks.push(array.slice(i, i + size));
    }
    return chunks;
  };

  // Helper function to process a batch of NRQL queries
  const processBatchedNrqlQueries = async batch => {
    // Group by account ID for efficient querying
    const accountGroups = batch.reduce((acc, entity) => {
      const accountId = entity.accountId;
      if (!acc[accountId]) {
        acc[accountId] = [];
      }
      acc[accountId].push(entity);
      return acc;
    }, {});

    const results = [];

    // Process each account group
    for (const [accountId, entities] of Object.entries(accountGroups)) {
      const entityQueries = entities.map(entity => ({
        guid: entity.guid,
        nrqlQueries: entity.nrqlQueries
      }));

      try {
        const response = await NerdGraphQuery.query({
          query: nrqlGqlQuery(accountId, entityQueries)
        });

        // Parse the aliased results back to individual entities
        const accountData = response?.data?.actor?.account;
        if (accountData) {
          entities.forEach(entity => {
            const nrqlData = {};

            Object.keys(entity.nrqlQueries).forEach(queryKey => {
              const alias = `${entity.guid}_${queryKey}`.replace(
                /[^a-zA-Z0-9_]/g,
                '_'
              );
              nrqlData[queryKey] = accountData[alias]?.results;
            });

            results.push({
              guid: entity.guid,
              nrqlData
            });
          });
        }
      } catch (error) {
        console.error(
          `Error processing batch for account ${accountId}:`,
          error
        );
        // Fallback to individual queries for this batch if needed
        // You could implement fallback logic here
      }
    }

    return results;
  };

  const decorateEntities = entities => {
    return new Promise(async resolve => {
      const entityTypesToQuery = [];
      const entityNrqlQueries = [];

      Object.keys(rules).forEach(key => {
        const rule = rules[key];

        if (rule.graphql) {
          const foundEntities = entities.filter(
            e => e.entityType === rule.entityType
          );

          if (foundEntities.length > 0) {
            entityTypesToQuery.push({
              entities: foundEntities,
              graphql: rule.graphql
            });
          }
        }

        if (rule.nrqlQueries) {
          const foundEntities = entities.filter(
            e =>
              e.entityType === rule.entityType &&
              (rule.type ? e.type === rule.type : true)
          );

          foundEntities.forEach(e => {
            entityNrqlQueries.push({
              guid: e.guid,
              name: e.name,
              accountId: e.account.id,
              nrqlQueries: rule.nrqlQueries(e)
            });
          });
        }
      });

      if (entityNrqlQueries.length > 0) {
        let entityNrqlData = [];

        console.log(
          `${new Date().toLocaleTimeString()} - fetch entity nrql data start (${
            entityNrqlQueries.length
          } entities)`
        );

        // Split into batches for processing
        const batches = chunkArray(entityNrqlQueries, NRQL_BATCH_SIZE);
        console.log(
          `Processing ${batches.length} batches of max ${NRQL_BATCH_SIZE} entities each`
        );

        // Process batches with concurrency control
        const nrqlQueue = async.queue((batch, callback) => {
          processBatchedNrqlQueries(batch)
            .then(batchResults => {
              for (let i = 0; i < batchResults.length; i++) {
                entityNrqlData.push(batchResults[i]);
              }
              callback();
            })
            .catch(error => {
              console.error('Error processing NRQL batch:', error);
              callback(error);
            });
        }, GLOBAL_CONCURRENCY_LIMIT);

        nrqlQueue.push(batches);

        await nrqlQueue.drain();
        console.log(
          `${new Date().toLocaleTimeString()} - fetch entity nrql data end`
        );
      }

      if (entityTypesToQuery.length > 0) {
        let entityData = [];

        console.log(
          `${new Date().toLocaleTimeString()} - entity type queue start`
        );
        // const entityTypeQueue = async.queue((task, callback) => {
        //   getEntityData(task).then((data) => {
        //     data.forEach((item) => entityData.push(item));
        //     callback();
        //   });
        // }, 1);

        const entityTypeQueue = async.queue((task, callback) => {
          getEntityData(task).then(data => {
            // Process data immediately and update entities
            data.forEach(item => {
              const entityIndex = entities.findIndex(e => e.guid === item.guid);

              if (entityIndex !== -1) {
                Object.assign(
                  entities[entityIndex],
                  item,
                  entities[entityIndex]
                );
              }
            });
            callback();
          });
        }, GLOBAL_CONCURRENCY_LIMIT);

        entityTypeQueue.push(entityTypesToQuery);

        entityTypeQueue.drain(() => {
          console.log(
            `${new Date().toLocaleTimeString()} - entity type queue end`
          );

          // merge entity data
          // entities.forEach((entity, i) => {
          //   const foundEntity = entityData.find((e) => e.guid === entity.guid);
          //   if (foundEntity) {
          //     Object.assign(entities[i], foundEntity, entity);
          //   }
          // });

          entityData.length = 0;

          resolve(entities);
        });
      }
    });
  };

  const decorateEntitiesOld = entities => {
    //eslint-disable-next-line
    return new Promise(async resolve => {
      const entityTypesToQuery = [];
      const entityNrqlQueries = [];

      Object.keys(rules).forEach(key => {
        const rule = rules[key];

        if (rule.graphql) {
          const foundEntities = entities.filter(
            e => e.entityType === rule.entityType
          );

          if (foundEntities.length > 0) {
            entityTypesToQuery.push({
              entities: foundEntities,
              graphql: rule.graphql,
              type: rule?.type,
              domain: rule?.domain,
              entityType: rule?.entityType
            });
          }
        }

        if (rule.nrqlQueries) {
          const foundEntities = entities.filter(
            e =>
              e.entityType === rule.entityType &&
              (rule.type ? e.type === rule.type : true)
          );

          foundEntities.forEach(e => {
            entityNrqlQueries.push({
              guid: e.guid,
              name: e.name,
              accountId: e.account.id,
              nrqlQueries: rule.nrqlQueries(e)
            });
          });
        }
      });

      if (entityNrqlQueries.length > 0) {
        let entityNrqlData = [];

        console.log(
          `${new Date().toLocaleTimeString()} - fetch entity nrql data start`
        );
        const nrqlQueue = async.queue((task, callback) => {
          const nrqlPromises = Object.keys(task.nrqlQueries).map(q => {
            return NerdGraphQuery.query({
              query: nrqlGqlQuery(task.accountId, task.nrqlQueries[q])
            });
          });

          Promise.all(nrqlPromises).then(values => {
            const nrqlData = {};

            values.forEach((v, i) => {
              nrqlData[Object.keys(task.nrqlQueries)[i]] =
                v?.data?.actor?.account?.nrql?.results;
            });

            entityNrqlData.push({
              guid: task.guid,
              nrqlData
            });

            callback();
          });
        }, GLOBAL_CONCURRENCY_LIMIT);

        nrqlQueue.push(entityNrqlQueries);

        await nrqlQueue.drain();
        console.log(
          `${new Date().toLocaleTimeString()} - fetch entity nrql data end`
        );

        entities.forEach((entity, i) => {
          const foundIndex = entityNrqlData.findIndex(
            e => e.guid === entity.guid
          );

          if (entityIndex !== -1) {
            Object.assign(entities[i], entityNrqlData[foundIndex], entity);
          }
        });
      }

      if (entityTypesToQuery.length > 0) {
        let entityData = [];

        // console.log(
        //   `${new Date().toLocaleTimeString()} - entity type queue start`,
        // );
        const entityTypeQueue = async.queue((task, callback) => {
          console.log(
            `${new Date().toLocaleTimeString()} - start entity type: ${task?.domain ||
              ''} ${task?.entityType || ''} ${task?.type || ''}`
          );

          getEntityData(task).then(data => {
            data.forEach(item => entityData.push(item));
            callback();
          });
        }, GLOBAL_CONCURRENCY_LIMIT);

        entityTypeQueue.push(entityTypesToQuery);

        entityTypeQueue.drain(() => {
          console.log(
            `${new Date().toLocaleTimeString()} - entity type queue end`
          );

          // Merge data without keeping references
          // const resultEntities = entities.map((entity) => {
          //   const foundEntity = entityData.find((e) => e.guid === entity.guid);
          //   return foundEntity ? { ...foundEntity, ...entity } : entity;
          // });

          entities.forEach((entity, i) => {
            const foundIndex = entityData.findIndex(
              e => e.guid === entity.guid
            );

            if (foundIndex !== -1) {
              Object.assign(entities[i], entityData[foundIndex], entity);
            }

            // perform strip ops
            if ((entity?.deploymentSearch?.results || []).length === 0) {
              delete entity.deploymentSearch;
            }

            stripEntityTags(entity);
          });

          entityData = null;

          resolve(entities);
        });
      } else {
        resolve(entities);
      }
    });
  };

  const getEntityData = entityTask => {
    return new Promise(resolve => {
      const guidChunks = chunk(
        entityTask.entities.map(e => e.guid),
        25
      );

      let entityData = [];

      console.log(`${new Date().toLocaleTimeString()} - get entity data start`);
      const taskQueue = async.queue((guids, callback) => {
        async.retry(
          {
            times: RETRY_LIMIT,
            interval: retryCount => RETRY_INIT_MS * Math.pow(2, retryCount) // Exponential backoff
          },
          retryCallback => {
            NerdGraphQuery.query({
              query: entityTask.graphql,
              variables: { guids }
            })
              .then(res => {
                if (res.error) {
                  console.error('Error fetching data, retrying...', res.error);
                  retryCallback(res.error);
                } else {
                  const newEntities = res?.data?.actor?.entities || [];
                  for (let i = 0; i < newEntities.length; i++) {
                    entityData.push(newEntities[i]);
                  }

                  retryCallback(null);
                }
              })
              .catch(error => {
                console.error('Query failed', error);
                retryCallback(error);
              });
          },
          (err, result) => {
            // Final callback for retry
            if (err) {
              console.error('Failed after retries:', err);
              callback();
            } else {
              callback();
            }
          }
        );
      }, GLOBAL_CONCURRENCY_LIMIT);

      taskQueue.push(guidChunks);

      taskQueue.drain(() => {
        console.log(`${new Date().toLocaleTimeString()} - get entity data end`);
        resolve(entityData);
      });
    });
  };

  const saveView = async (report, runData) => {
    setDataState({ savingView: true });

    const documentId = report?.id || dataState.selectedReport.id;
    const document = report?.document || dataState.selectedReport.document;

    const prepareState = {
      saveViewModalOpen: false,
      savingView: false,
      unsavedRun: false,
      selectedView: { ...report, id: documentId, name: document.name }
    };

    const res = await AccountStorageMutation.mutate({
      accountId: dataState.selectedAccountId,
      actionType: AccountStorageMutation.ACTION_TYPE.WRITE_DOCUMENT,
      collection: ACCOUNT_CONFIG_COLLECTION,
      documentId,
      document
    });

    // save if this was trigged from a run view
    if (runData) {
      runData.documentId = documentId;
      await saveResult(runData);
    }

    if (res.error) {
      Toast.showToast({
        title: 'Failed to save',
        description: 'Check your permissions',
        type: Toast.TYPE.CRITICAL
      });
    } else {
      Toast.showToast({
        title: 'Saved view successfully',
        // description: 'Refreshing...',
        type: Toast.TYPE.NORMAL
      });

      if (
        dataState.defaultViewId === (report?.id || dataState.selectedReport.id)
      ) {
        setDefaultView(dataState.defaultViewId);
      }
      setDataState(prepareState);
    }
  };

  const checkEntityCount = async data => {
    let {
      accounts,
      products,
      allProducts,
      hideNotReporting,
      selectedView
    } = data;
    // setRunParams(null);

    const reporting = hideNotReporting ? `reporting = 'true' and ` : '';

    if (selectedView.name === `All Data`) {
      accounts = dataState.accounts.map(a => a.id);
      allProducts = true;
    }

    const accountEntityData = accounts.map(id => {
      return NerdGraphQuery.query({
        query: `{
              actor {
                entitySearch(query: "${reporting} tags.accountId = '${id}'") {
                  types {
                    count
                    domain
                    entityType
                    type
                  }
                }
              }
            }`
      });
    });

    const accountData = await Promise.all(accountEntityData);
    const summarizedData = summarizeTypesWithRules(
      accountData,
      products,
      allProducts
    );

    const totalEntities = summarizedData.reduce(
      (total, type) => total + type.count,
      0
    );

    setDataState({ entityCount: totalEntities });

    return { totalEntities, summarizedData };
  };

  function summarizeTypesWithRules(data, products, allProducts) {
    const summary = {};

    data.forEach(item => {
      const types = item?.data?.actor?.entitySearch?.types || [];

      types.forEach(type => {
        const key = `${type.domain}_${type.entityType}_${type.type}`;

        if (summary[key]) {
          summary[key].count += type.count;
        } else {
          summary[key] = { ...type };
        }
      });
    });

    let summarizedArray = Object.values(summary);

    const selectedProducts = allProducts ? Object.keys(rules) : products;

    summarizedArray = summarizedArray.filter(type => {
      return selectedProducts.some(product => {
        const rule = rules[product];
        if (rule) {
          if (rule.entityType && rule.type) {
            return (
              type.entityType === rule.entityType && type.type === rule.type
            );
          } else if (rule.entityType) {
            return type.entityType === rule.entityType;
          }
        }
        return false;
      });
    });

    return summarizedArray;
  }

  return {
    ...dataState,
    setDataState,
    deleteView,
    runView,
    fetchViewConfigs,
    fetchViewHistory,
    deleteReportConfig,
    checkUser,
    runReport,
    fetchUserViewHistory,
    saveView,
    loadHistoricalResult,
    setDefaultView,
    toggleFavoriteView,
    deleteSnapshot,
    getAccounts,
    getUserSettings,
    clearWelcome
  };
}
