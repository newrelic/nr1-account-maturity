import React, { createContext, useEffect } from 'react';
import { useSetState } from '@mantine/hooks';
import { nerdlet, NerdGraphQuery, Toast } from 'nr1';
import { accountsQuery, entitySearchQueryByAccount } from '../queries/data';

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
    fetchingAccountData: false,
    apiKeyModalOpen: false,
    errorMsg: null,
    searchText: '',
    checkingAccount: false,
    diracAuth: null,
    accountIds: [],
  });

  useEffect(async () => {
    // eslint-disable-next-line
    console.log("DataProvider loaded");

    nerdlet.setConfig({
      accountPicker: true,
      timePicker: false,
    });

    const accounts = await getAccounts();
    setDataState({ accounts });

    const entitiesByAccount = await getEntitiesForAccounts(accounts);
    setDataState({ entitiesByAccount });

    console.log(entitiesByAccount);
  }, []);

  const getAccounts = () =>
    NerdGraphQuery.query({ query: accountsQuery }).then(
      (res) => res?.data?.actor?.accounts || []
    );

  const getEntitiesForAccounts = async (accounts) => {
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
        resolve(completedAccounts);
      });
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
        resolve(completedEntities);
      });
    });
  };

  // const getEntityTypesByAccount = (accounts) => {
  //   return new Promise((resolve) => {
  //     const results = [];

  //     const q = async.queue((task, callback) => {
  //       NerdGraphQuery.query({
  //         query: entityTypesQueryByAccount(task.id),
  //       }).then((res) => {
  //         task.entityTypes = res?.data?.actor?.entitySearch?.types || [];
  //         results.push(task);
  //         callback();
  //       });
  //     }, 5);

  //     q.push(accounts);

  //     q.drain(() => {
  //       resolve(results);
  //     });
  //   });
  // };

  return {
    ...dataState,
    setDataState,
  };
}
