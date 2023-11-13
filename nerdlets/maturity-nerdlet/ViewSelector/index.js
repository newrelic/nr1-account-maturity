import React, { useContext, useMemo, useState } from 'react';
import { Dropdown, DropdownItem, DropdownSection } from 'nr1';

import DataContext from '../../../src/context/data';

export default function ViewSelector() {
  const { view, selectedView, setDataState } = useContext(DataContext);
  const [viewSearch, setViewSearch] = useState('');

  return useMemo(() => {
    const items = [
      { id: 'allData', name: 'All data' },
      { id: 'f5a3', name: 'Finley Mendez' },
      { id: '93bc', name: 'Coleen Salinas' },
    ];

    const filteredItems = items.filter(({ name }) =>
      name.toLowerCase().includes(viewSearch.toLowerCase())
    );

    return (
      <div style={{ paddingRight: '5px' }}>
        <Dropdown
          sectioned
          label={'Views'}
          labelInline={true}
          title={selectedView?.name || 'Select'}
          search={viewSearch}
          onSearch={(e) => setViewSearch(e.target.value)}
        >
          <DropdownSection title="Views">
            {filteredItems.map((item) => (
              <DropdownItem
                onClick={() => setDataState({ selectedView: item })}
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
            <DropdownItem>
              <div style={{ float: 'left' }}>{items.length} total views</div>
              <div style={{ float: 'right', color: 'blue' }}>See all views</div>
            </DropdownItem>
          </DropdownSection>
        </Dropdown>
        <Dropdown
          iconType={Dropdown.ICON_TYPE.INTERFACE__OPERATIONS__MORE}
          label={<>&nbsp;</>}
          labelInline={true}
        >
          <DropdownItem>Update view</DropdownItem>
          <DropdownItem>Set as default view</DropdownItem>
          <DropdownItem style={{ color: 'red' }}>Delete view</DropdownItem>
        </Dropdown>
      </div>
    );
  }, [view, viewSearch, selectedView]);
}
