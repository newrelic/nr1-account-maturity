import React, { useContext, useMemo, useState } from 'react';
import { Button, Dropdown, DropdownItem, DropdownSection } from 'nr1';

import DataContext from '../../../src/context/data';

export default function ViewSelector() {
  const { view, selectedView, setDataState, unsavedRun, viewConfigs } =
    useContext(DataContext);
  const [viewSearch, setViewSearch] = useState('');

  return useMemo(() => {
    const configs = viewConfigs
      .filter((v) => v && Object.keys(v).length > 0)
      .map((v) => ({
        id: v.id,
        name: v.document?.name,
      }));

    const items = [{ id: 'allData', name: 'All data' }, ...configs];

    const filteredItems = items.filter(({ name }) =>
      name.toLowerCase().includes(viewSearch.toLowerCase())
    );

    console.log(selectedView, view);

    return (
      <div style={{ paddingRight: '5px' }}>
        <Dropdown
          sectioned
          label={'Views'}
          labelInline={true}
          title={unsavedRun ? 'Select' : selectedView?.name || 'Select'}
          search={viewSearch}
          onSearch={(e) => setViewSearch(e.target.value)}
        >
          <DropdownSection title="Views">
            {filteredItems.map((item) => (
              <DropdownItem
                onClick={() => {
                  if (item.id !== selectedView.id) {
                    setDataState({ selectedView: item });
                  }
                }}
                key={item.id}
                style={{
                  fontWeight: selectedView?.id === item.id ? 'bold' : 'none',
                }}
              >
                {item.name}
              </DropdownItem>
            ))}
          </DropdownSection>

          <DropdownSection title="">
            <DropdownItem
              onClick={() => setDataState({ view: { page: 'ViewList' } })}
            >
              <div style={{ float: 'left' }}>{items.length} total views</div>
              <div style={{ float: 'right', color: 'blue' }}>See all views</div>
            </DropdownItem>
          </DropdownSection>
        </Dropdown>
        {unsavedRun === true && (
          <>
            &nbsp; &nbsp;
            <Button
              sizeType={Button.SIZE_TYPE.SMALL}
              type={Button.TYPE.OUTLINE}
              iconType={Button.ICON_TYPE.DOCUMENTS__DOCUMENTS__NOTES__A_ADD}
              onClick={() => setDataState({ saveViewModalOpen: true })}
            >
              Save
            </Button>
          </>
        )}
        <Dropdown
          iconType={Dropdown.ICON_TYPE.INTERFACE__OPERATIONS__MORE}
          label={<>&nbsp;</>}
          labelInline={true}
        >
          <DropdownItem
            onClick={() => {
              if (unsavedRun) {
                setDataState({
                  view: {
                    page: 'CreateView',
                    title: 'Create New View',
                  },
                });
              } else {
                // take to some edit screen
                // todo!
              }
            }}
          >
            Update view
          </DropdownItem>
          <DropdownItem>Set as default view</DropdownItem>
          {!unsavedRun && (
            <DropdownItem
              style={{ color: 'red' }}
              onClick={() =>
                setDataState({
                  deleteViewModalOpen: {
                    id: selectedView?.id,
                    document: { name: selectedView?.name },
                  },
                })
              }
            >
              Delete view
            </DropdownItem>
          )}
        </Dropdown>
      </div>
    );
  }, [view, viewSearch, selectedView, unsavedRun, viewConfigs]);
}
