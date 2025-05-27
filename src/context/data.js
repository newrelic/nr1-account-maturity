import React, { createContext, useEffect } from 'react';
import { useSetState } from '@mantine/hooks';
import {
  navigation,
  NerdGraphQuery,
  Toast,
  UserStorageQuery,
  UserStorageMutation,
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
import { chunk, chunkString, generateAccountSummary } from '../utils';
import {
  ACCOUNT_CONFIG_COLLECTION,
  ACCOUNT_HISTORY_COLLECTION,
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
  });

  // for testing
  // eslint-disable-next-line
  const wipeUserDetails = async () => {
    // wipe user default config
    const userView = await UserStorageMutation.mutate({
      actionType: UserStorageMutation.ACTION_TYPE.DELETE_DOCUMENT,
      collection: 'userViews',
      documentId: 'default',
    });

    // wipe user history
    const userHistory = await UserStorageMutation.mutate({
      actionType: UserStorageMutation.ACTION_TYPE.DELETE_DOCUMENT,
      collection: ACCOUNT_HISTORY_COLLECTION,
    });

    console.log(userView, userHistory);
  };

  const wipeAccountHistory = async () => {
    const res = await AccountStorageMutation.mutate({
      accountId: props?.accountId || dataState?.selectedAccountId,
      actionType: AccountStorageMutation.ACTION_TYPE.DELETE_COLLECTION,
      collection: ACCOUNT_HISTORY_COLLECTION,
    });
    console.log('account history deleted resp =>', res);
  };

  const clearWelcome = async () => {
    const userSettings = dataState.userSettings;
    userSettings.doneWelcomeTest21 = new Date().getTime();
    console.log('clearing welcome', userSettings);
    const res = await UserStorageMutation.mutate({
      actionType: UserStorageMutation.ACTION_TYPE.WRITE_DOCUMENT,
      collection: 'userSettings',
      documentId: 'main',
      document: userSettings,
    });

    setDataState({ userSettings });

    console.log('user welcome clear resp =>', res);
  };

  // handle initial load
  useEffect(async () => {
    // await wipeUserDetails();
    // eslint-disable-next-line
    console.log('DataProvider initialized');
    // wipeAccountHistory(); // testing
    const state = {};
    await getUserEmail();

    // const defaultView = await getUserReport(); // needs to be removed
    const userSettings = await getUserSettings();
    state.userSettings = userSettings;
    console.log('userSettings =>', userSettings);
    const user = await NerdGraphQuery.query({ query: userQuery });
    state.user = user?.data?.actor?.user;

    // if (userSettings.doneWelcomeTest21) {
    //   state.showSkipThisStep = false;
    // }

    const viewConfigs = await fetchViewConfigs(null, state.user);
    const accounts = await getAccounts();

    // default view not configured, request configuration
    // there will always be at least one view config because of allAata
    if (viewConfigs.length > 1) {
      state.view = {
        page: 'ViewList',
      };
    }

    // if (viewConfigs.length === 1) {
    //   state.view = {
    //     page: 'CreateNewView',
    //     title: 'Create New View',
    //   };
    // }

    state.accounts = accounts;
    state.selectedAccountId = accounts[0].id;

    setDataState(state);
  }, []);

  // handle account picker changes
  useEffect(async () => {
    const accountsInit = await getAccounts();
    const { accountId } = props;
    const state = {};

    console.log('account id changed => ', accountId);
    if (accountId === 'cross-account') {
      console.log('cross account should not be selected, reloading...');
      navigation.openNerdlet({ id: 'maturity-nerdlet' });
    } else {
      if (!accountsInit.find(a => a.id === accountId)) {
        Toast.showToast({
          title: 'Account Maturity is not subscribed to the selected account',
          description: `Change account or subscribe account: ${accountId}`,
          type: Toast.TYPE.CRITICAL,
        });
        state.view = { page: 'unavailable-account' };
        state.viewSegment = 'unavailable-account';
      } else {
        state.view = { page: 'ViewList' };
        state.viewSegment = 'list';
      }
    }

    await getUserEmail();

    const userSettings = await getUserSettings();
    state.userSettings = userSettings;
    console.log('userSettings =>', userSettings);
    const user = await NerdGraphQuery.query({ query: userQuery });
    state.user = user?.data?.actor?.user;

    setDataState({
      fetchingData: true,
      selectedAccountId: accountId,
      ...state,
    });

    // if (!state.userSettings.doneWelcome) {
    //   console.log('Welcome not complete');
    //   state.view = {
    //     page: 'Welcome',
    //   };

    //   setDataState({
    //     fetchingData: false,
    //     view: state.view,
    //   });
    // } else
    if (state.viewSegment == 'unavailable-account') {
      setDataState({
        selectedAccountId: accountId,
        fetchingData: false,
        view: state.view,
        viewSegment: 'unavailable-account',
      });
    } else {
      const viewConfigs = await fetchViewConfigs(accountId, state.user);
      const viewHistory = await fetchViewHistory(accountId);

      const [agentReleases, dataDictionary] = await Promise.all([
        getAgentReleases(),
        getDataDictionary(),
      ]);

      const accounts = await decorateAccountData(accountsInit);

      deleteOrphanedReports(viewConfigs, viewHistory, accountId);

      let view = dataState.view;
      if (viewConfigs.length > 1) {
        view = { page: 'ViewList' };
      }

      setDataState({
        selectedAccountId: accountId,
        accounts,
        agentReleases,
        dataDictionary,
        viewConfigs,
        fetchingData: false,
        view,
      });
    }
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
        historyId: result.historyId,
      },
      selectedReport: report,
      view: { page: 'MaturityView', historyId: result.historyId },
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
        document: userSettings,
      }).then(res => {
        if (res.error) {
          Toast.showToast({
            title: 'Failed to save',
            type: Toast.TYPE.CRITICAL,
          });
        } else {
          Toast.showToast({
            title: 'Saved successfully',
            type: Toast.TYPE.NORMAL,
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
        document: userSettings,
      }).then(res => {
        if (res.error) {
          Toast.showToast({
            title: 'Failed to save',
            type: Toast.TYPE.CRITICAL,
          });
        } else {
          Toast.showToast({
            title: 'Updated successfully',
            type: Toast.TYPE.NORMAL,
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
      }`,
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
        documentId: 'main',
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

    setDataState({
      runningReport: true,
      [`runningReport.${documentId}`]: true,
      entitiesByAccount: null,
      summarizedScores: null,
      accountSummaries: null,
      selectedView: { ...selectedView, id: documentId },
      view: { page: 'Loading' },
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
          allProducts: true,
        },
      };
      console.log(dataState.accounts);
    } else if (selectedView.account && selectedReport) {
      report.id = documentId;

      // if accounts filter enabled dynamical determine accounts
      if (report.document?.accountsFilterEnabled) {
        report.document.accounts = dataState.accounts
          .filter(a =>
            a.name
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
    }

    const accounts = [...report.document.accounts].map(id => ({
      ...[...dataState.accounts].find(a => a.id === id),
    }));

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
      summarizedScores,
    } = await getEntitiesForAccounts(
      accounts,
      entitySearchQuery || '',
      dataState.agentReleases,
      dataState.dataDictionary
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

    const prepareState = {
      runningReport: false,
      [`runningReport.${report?.id || selectedView.id}`]: true,
      lastRunAt: runAt,
      entitiesByAccount,
      summarizedScores,
      accountSummaries,
      totalPercentage,
      view: { page: 'MaturityView' },
      selectedReport: report,
      unsavedRun: selectedView?.unsavedRun,
    };

    prepareState.tempAllData = {
      documentId,
      entitiesByAccount,
      summarizedScores,
      accountSummaries,
      totalPercentage,
      runAt,
    };

    if (doSaveView) {
      saveView(report, prepareState.tempAllData);
    } else if (!doSaveView && saveHistory) {
      await saveResult(prepareState.tempAllData, {
        ...selectedView,
        id: documentId,
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
      ...[...dataState.accounts].find(a => a.id === id),
    }));

    console.log('runReport', accounts);

    const {
      entitiesByAccount,
      summarizedScores,
    } = await getEntitiesForAccounts(
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
        entitySearchQuery: report.document?.entitySearchQuery,
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

    await fetchViewHistory();

    setDataState({
      runningReport: false,
      [`runningReport.${selectedReport.id}`]: false,
      lastRunAt: runAt,
      entitiesByAccount,
      summarizedScores,
      accountSummaries,
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
              chunk,
            },
          })
        );

        Promise.all(writePromises).then(results => {
          setDataState({
            selectedView: {
              ...selectedView,
              historyId,
            },
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
  const decorateAccountData = accounts => {
    // eslint-disable-next-line
    return new Promise(async resolve => {
      const accountData = await Promise.all(
        accounts.map(account =>
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
        type: Toast.TYPE.CRITICAL,
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
        documentId: dataState?.deleteViewModalOpen.id,
      }).then(res => {
        fetchViewConfigs().then(() => {
          setDataState({
            deletingView: false,
            deleteViewModalOpen: null,
            view: { page: 'ViewList' },
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
              documentId: id,
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
          documentId: id,
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
              deleteSnapshotModalOpen: null,
            });
            loadHistoricalResult(currentConfig, latestHistory);
            resolve();
          } else {
            setDataState({
              deletingSnapshot: false,
              deleteSnapshotModalOpen: null,
              view: { page: 'ViewList' },
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
            collection: ACCOUNT_HISTORY_COLLECTION,
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
            mergedChunkIds: chunks.map(c => c.id), // needed to know all chunks to delete from history
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
        ),
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
            collection: ACCOUNT_HISTORY_COLLECTION,
          })
        )?.data || []
      ).sort((a, b) => b?.document?.runAt - a?.document?.runAt);

      setDataState({
        fetchingViewHistory: false,
        userViewHistory,
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
            collection: ACCOUNT_CONFIG_COLLECTION,
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
          ),
        };

        viewConfigs.push(allDataConfig);
      }

      // simulate no configs being added, the will only include all data
      // viewConfigs = [viewConfigs[viewConfigs.length - 1]];

      setDataState({
        fetchingReports: false,
        viewConfigs: [...viewConfigs],
      });

      resolve(viewConfigs);
    });
  };

  const deleteReportConfig = async documentId => {
    const res = await AccountStorageMutation.mutate({
      accountId: dataState.selectedAccountId,
      actionType: AccountStorageMutation.ACTION_TYPE.DELETE_DOCUMENT,
      collection: ACCOUNT_CONFIG_COLLECTION,
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

      await fetchViewConfigs();
    }
  };

  const getEntitiesForAccounts = async (
    accounts,
    entitySearchQuery,
    agentReleases,
    dataDictionary
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
          accountTotal: accounts.length,
        });
      }, 1000);

      console.log(`${new Date().toLocaleTimeString()} - fetch accounts start`);
      const q = async.queue((task, callback) => {
        getEntitiesByAccount(task, entitySearchQuery).then(entities => {
          task.entities = entities;
          completedAccounts.push(task);

          completedAccountTotal = completedAccounts.length;
          completedPercentageTotal =
            (completedAccounts.length / accounts.length) * 100;
          callback();
        });
      }, 5);

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
        if (!account.scores) {
          account.scores = {};
        }

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
              foundEntities.forEach(entity => {
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
                name: entity.name,
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

  const getEntitiesByAccount = (account, entitySearchQuery) => {
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
        const searchClause = ` AND type NOT IN ('DASHBOARD') ${entityClause}`;

        async.retry(
          {
            times: 5, // Number of retries
            interval: retryCount => 100 * Math.pow(2, retryCount), // Exponential backoff formula
          },
          retryCallback => {
            NerdGraphQuery.query({
              query: entitySearchQueryByAccount(account.id, searchClause),
              variables: { cursor: task.cursor },
            })
              .then(res => {
                if (res.error) {
                  Toast.showToast({
                    title: 'Failed to fetch entities, retrying',
                    description: res.error.message,
                    type: Toast.TYPE.CRITICAL,
                  });
                  retryCallback(res.error, null); // Pass error to retry, will trigger retry
                } else {
                  const entitySearch = res?.data?.actor?.entitySearch || {};

                  totalEntityCount = entitySearch.count;
                  completedEntities = [
                    ...completedEntities,
                    ...(entitySearch?.results?.entities || []),
                  ];
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
      }, 5);

      q.push({ cursor: null });

      q.drain(() => {
        console.log(
          `${new Date().toLocaleTimeString()} - get entities by account end`
        );
        clearInterval(pollJobStatus);

        decorateEntities(completedEntities).then(decoratedEntities => {
          resolve(decoratedEntities);
        });
      });
    });
  };

  const decorateEntities = entities => {
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
              nrqlQueries: rule.nrqlQueries(e),
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
              query: nrqlGqlQuery(task.accountId, task.nrqlQueries[q]),
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
              nrqlData,
            });

            callback();
          });
        }, 5);

        nrqlQueue.push(entityNrqlQueries);

        await nrqlQueue.drain();
        console.log(
          `${new Date().toLocaleTimeString()} - fetch entity nrql data end`
        );

        entities.forEach((entity, i) => {
          const foundEntity = entityNrqlData.find(e => e.guid === entity.guid);
          if (foundEntity) {
            entities[i] = { ...foundEntity, ...entity };
          }
        });
      }

      if (entityTypesToQuery.length > 0) {
        let entityData = [];

        console.log(
          `${new Date().toLocaleTimeString()} - entity type queue start`
        );
        const entityTypeQueue = async.queue((task, callback) => {
          getEntityData(task).then(data => {
            entityData = [...entityData, ...data];
            callback();
          });
        }, 5);

        entityTypeQueue.push(entityTypesToQuery);

        entityTypeQueue.drain(() => {
          console.log(
            `${new Date().toLocaleTimeString()} - entity type queue end`
          );

          // merge entity data
          entities.forEach((entity, i) => {
            const foundEntity = entityData.find(e => e.guid === entity.guid);
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
            times: 5, // Retry up to 5 times
            interval: retryCount => 100 * Math.pow(2, retryCount), // Exponential backoff, starting at 100ms
          },
          retryCallback => {
            NerdGraphQuery.query({
              query: entityTask.graphql,
              variables: { guids },
            })
              .then(res => {
                if (res.error) {
                  console.error('Error fetching data, retrying...', res.error);
                  retryCallback(res.error);
                } else {
                  entityData = [
                    ...entityData,
                    ...(res?.data?.actor?.entities || []),
                  ];
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
      }, 5);

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
      selectedView: { ...report, id: documentId, name: document.name },
    };

    const res = await AccountStorageMutation.mutate({
      accountId: dataState.selectedAccountId,
      actionType: AccountStorageMutation.ACTION_TYPE.WRITE_DOCUMENT,
      collection: ACCOUNT_CONFIG_COLLECTION,
      documentId,
      document,
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
        type: Toast.TYPE.CRITICAL,
      });
    } else {
      Toast.showToast({
        title: 'Saved view successfully',
        // description: 'Refreshing...',
        type: Toast.TYPE.NORMAL,
      });

      if (
        dataState.defaultViewId === (report?.id || dataState.selectedReport.id)
      ) {
        setDefaultView(dataState.defaultViewId);
      }
      setDataState(prepareState);
    }
  };

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
    clearWelcome,
  };
}
