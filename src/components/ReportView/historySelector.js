import React, { useMemo, useContext } from 'react';
import DataContext from '../../context/data';
import { Select, SelectItem } from 'nr1';

export default function HistorySelector(props) {
  const { history } = props;
  const { view, setDataState } = useContext(DataContext);

  return useMemo(() => {
    return (
      <>
        <div>
          <Select
            value={view.props.selected}
            label={'History'}
            labelInline
            onChange={(e, value) => {
              view.props.selected = value;
              setDataState({ view });
            }}
          >
            {history.map((h) => {
              const { document } = h;
              const dateStr = new Date(document.runAt).toLocaleString();

              return (
                <SelectItem key={document.runAt} value={document.runAt}>
                  {dateStr}
                </SelectItem>
              );
            })}
          </Select>
        </div>
      </>
    );
  }, [props, view]);
}
