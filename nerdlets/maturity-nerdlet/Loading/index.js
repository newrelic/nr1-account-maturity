import React, { useMemo, useContext } from 'react';
import DataContext from '../../../src/context/data';
import { EmptyState } from 'nr1';

export default function Loading() {
  const {
    currentLoadingAccount,
    completedPercentage,
    accountTotal,
    completedAccountTotal,
    completedPercentageTotal
  } = useContext(DataContext);

  const diffPercentage = (100 / accountTotal) * (completedPercentage / 100);

  const value =
    completedPercentageTotal >= 100
      ? 100
      : ((completedPercentageTotal || 0) + (diffPercentage || 0)).toFixed(2);

  return useMemo(() => {
    return (
      <>
        <EmptyState
          title={`Analyzing Accounts & Capabilities ${value}%`}
          type={EmptyState.TYPE.LOADING}
        />
      </>
    );
  }, [
    currentLoadingAccount,
    completedPercentage,
    completedPercentageTotal,
    accountTotal,
    completedAccountTotal
  ]);
}
