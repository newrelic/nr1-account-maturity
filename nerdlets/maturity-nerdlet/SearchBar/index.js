import React, { useContext, useMemo } from 'react';

import { TextField, Button } from 'nr1';
import DataContext from '../../../src/context/data';

export default function SearchBar(props) {
  const { width } = props;
  const { search, setDataState, view } = useContext(DataContext);

  const newViewWidth = 100;
  const textFieldWidth = width - newViewWidth - 30;

  return useMemo(() => {
    return (
      <div
        style={{
          paddingBottom: '17px',
          paddingTop: '8px',
          paddingLeft: '8px',
          marginBottom: '8px',
          backgroundColor: 'white',
        }}
      >
        <TextField
          type={TextField.TYPE.SEARCH}
          value={search}
          onChange={e => setDataState({ search: e.target.value })}
          style={{
            width: `${textFieldWidth}px`,
            float: 'left',
          }}
          placeholder="Search for view"
        />
        &nbsp;
        <Button
          style={{
            width: `${newViewWidth}px`,
            marginRight: '10px',
            float: 'right',
          }}
          type={Button.TYPE.PRIMARY}
          sizeType={Button.SIZE_TYPE.SMALL}
          iconType={Button.ICON_TYPE.INTERFACE__SIGN__PLUS}
          onClick={() => {
            setDataState({
              prevView: view,
              view: {
                page: 'CreateView',
                title: 'Create View Configuration',
              },
              selectedReport: {},
              selectedView: {},
            });
          }}
        >
          New View
        </Button>
      </div>
    );
  }, [search, width]);
}
