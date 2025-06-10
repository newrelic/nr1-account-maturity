import React, { useMemo, useContext } from 'react';
import DataContext from '../../context/data';
import { Select, SelectItem } from 'nr1';

export const sortSummaries = (summaries, sortBy) => {
  let newAccountSummaries = [...summaries];
  if (sortBy === 'Lowest score') {
    newAccountSummaries = newAccountSummaries.sort(
      (a, b) =>
        (a.totalScore / a.maxScore) * 100 - (b.totalScore / b.maxScore) * 100
    );
  } else if (sortBy === 'Highest score') {
    newAccountSummaries = newAccountSummaries.sort(
      (a, b) =>
        (b.totalScore / b.maxScore) * 100 - (a.totalScore / a.maxScore) * 100
    );
  }

  return newAccountSummaries;
};

export default function SortBy() {
  const { sortBy, setDataState, accountSummaries } = useContext(DataContext);

  return useMemo(() => {
    return (
      <>
        <div style={{ float: 'right' }}>
          <Select
            value={sortBy}
            onChange={(evt, value) => {
              setDataState({
                sortBy: value,
                accountSummaries: sortSummaries(accountSummaries, value),
              });
            }}
          >
            <SelectItem value="Lowest score">Lowest score</SelectItem>
            <SelectItem value="Highest score">Highest score</SelectItem>
          </Select>
          &nbsp;&nbsp;&nbsp;
        </div>
        <div style={{ float: 'right', marginTop: '5px' }}>
          <span style={{ fontWeight: 'bold' }}>Sort by:</span>&nbsp;&nbsp;&nbsp;
        </div>
      </>
    );
  }, [sortBy]);
}
