import React, { useContext, useMemo, useState } from 'react';
import { Dropdown, DropdownItem, DropdownSection, Icon, Toast } from 'nr1';

import DataContext from '../../../src/context/data';

export default function ViewSelector() {
  const {
    view,
    selectedView,
    setDataState,
    unsavedRun,
    viewConfigs,
    // viewHistory,
    loadHistoricalResult,
    selectedAccountId,
    selectedReport,
    setDefaultView,
    userSettings,
    runView,
    toggleFavoriteView
  } = useContext(DataContext);
  const [viewSearch, setViewSearch] = useState('');
  const favorites = userSettings?.favorites || [];

  return useMemo(() => {
    const configs = viewConfigs
      .filter(v => v && Object.keys(v).length > 0)
      .map(v => ({
        id: v.id,
        name: v.document?.name
      }));

    const items = [...configs];

    const filteredItems = items.filter(({ name }) =>
      (name || '').toLowerCase().includes((viewSearch || '').toLowerCase())
    );

    const currentViewConfig = viewConfigs.find(vc => vc.id === selectedView.id);

    // // eslint-disable-next-line
    // console.log('view sel', selectedView, currentViewConfig);

    return (
      <div style={{ paddingRight: '5px' }}>
        <Dropdown
          sectioned
          label="Views"
          labelInline
          title={selectedView?.name || 'Select'}
          search={viewSearch}
          onSearch={e => setViewSearch(e.target.value)}
        >
          <DropdownSection title="">
            <DropdownItem
              onClick={() =>
                setDataState({
                  view: { page: 'ViewList' },
                  loadedDefaultView: true
                })
              }
            >
              <div style={{ float: 'left' }}>{items.length} total views</div>
              <div style={{ float: 'right', color: 'blue' }}>See all views</div>
            </DropdownItem>
          </DropdownSection>

          <DropdownSection title="Views">
            {filteredItems
              .sort(
                (a, b) => favorites.includes(b.id) - favorites.includes(a.id)
              )
              .map(item => {
                const viewConfig = viewConfigs.find(vc => vc.id === item.id);
                const latestHistory = viewConfig?.history?.[0];

                const onClick = () => {
                  // if (item.id === 'allData') {
                  //   runView(
                  //     { id: 'allData', name: 'All data' },
                  //     null,
                  //     false,
                  //     true
                  //   );
                  // } else

                  if (
                    item.id !== selectedView.id
                    //  && item.id !== 'allData'
                  ) {
                    if (latestHistory) {
                      // eslint-disable-next-line
                      console.log('load previous', viewConfig);
                      loadHistoricalResult(viewConfig, latestHistory);
                    } else if (viewConfig) {
                      // eslint-disable-next-line
                      console.log('fresh run', viewConfig);
                      runView(
                        {
                          name: viewConfig.document.name,
                          account: selectedAccountId
                        },
                        { ...viewConfig },
                        false,
                        true
                      );
                    }
                  }
                };

                return (
                  <DropdownItem
                    key={item.id}
                    style={{
                      fontWeight: selectedView?.id === item.id ? 'bold' : 'none'
                    }}
                  >
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between'
                      }}
                    >
                      <div
                        style={{ flex: -1 }}
                        onClick={e => {
                          e.preventDefault();
                          toggleFavoriteView(item.id);
                        }}
                      >
                        {favorites.includes(item.id) ? (
                          <Icon
                            color="#F0B400"
                            style={{ marginTop: '-3px', paddingRight: '3px' }}
                            type={
                              Icon.TYPE.PROFILES__EVENTS__FAVORITE__WEIGHT_BOLD
                            }
                          />
                        ) : (
                          <Icon
                            style={{ marginTop: '-3px', paddingRight: '3px' }}
                            type={Icon.TYPE.PROFILES__EVENTS__FAVORITE}
                          />
                        )}
                      </div>

                      <div style={{ flex: 1 }} onClick={onClick}>
                        {item.name}
                        {userSettings?.defaultViewId === item.id ? (
                          <span style={{ fontStyle: 'italic' }}>
                            &nbsp;(default)
                          </span>
                        ) : (
                          ''
                        )}
                      </div>

                      <div
                        style={{
                          textAlign: 'right',
                          fontWeight: 'lighter',
                          cursor: 'text'
                        }}
                      >
                        &nbsp;&nbsp;&nbsp;
                        {latestHistory?.document?.runAt
                          ? new Date(
                              latestHistory?.document?.runAt
                            ).toLocaleString()
                          : ''}
                      </div>
                    </div>
                  </DropdownItem>
                );
              })}
          </DropdownSection>
        </Dropdown>
        {unsavedRun === true && (
          <>
            {/* disabling "save as" */}
            {/* &nbsp; &nbsp;
            <Button
              sizeType={Button.SIZE_TYPE.SMALL}
              type={Button.TYPE.OUTLINE}
              iconType={Button.ICON_TYPE.DOCUMENTS__DOCUMENTS__NOTES__A_ADD}
              onClick={() => setDataState({ saveViewModalOpen: true })}
            >
              Save
            </Button> */}
          </>
        )}
        <Dropdown
          iconType={Dropdown.ICON_TYPE.INTERFACE__OPERATIONS__MORE}
          label={<>&nbsp;</>}
          labelInline
        >
          <DropdownItem
            onClick={() => {
              if (unsavedRun) {
                setDataState({
                  view: {
                    page: 'CreateView',
                    title: 'Create New View'
                  }
                });
              } else if (selectedView.name === 'All Data') {
                Toast.showToast({
                  title: 'All Data is a reserved view and cannot be edited',
                  type: Toast.TYPE.NORMAL
                });
              } else {
                setDataState({
                  selectedReport,
                  view: { page: 'EditView' },
                  prevView: view,
                  prevSelectedReport: selectedReport,
                  prevSelectedView: selectedView
                });
              }
            }}
          >
            Update view
          </DropdownItem>

          {userSettings?.defaultViewId === selectedReport.id ? (
            <DropdownItem
              onClick={() => {
                setDefaultView(null);
              }}
            >
              Unset as default view
            </DropdownItem>
          ) : (
            <DropdownItem
              onClick={() => {
                setDefaultView(selectedReport.id);
              }}
            >
              Set as default view
            </DropdownItem>
          )}

          {currentViewConfig && (currentViewConfig.history || []).length > 1 && (
            <DropdownItem
              style={{ color: 'red' }}
              onClick={() =>
                setDataState({
                  deleteSnapshotModalOpen: {
                    historyId: selectedView?.historyId,
                    id: selectedView?.id,
                    document: { name: selectedView?.name }
                  }
                })
              }
            >
              Delete snapshot
            </DropdownItem>
          )}

          {!unsavedRun && (
            <DropdownItem
              style={{ color: 'red' }}
              onClick={() => {
                if (selectedView.name === 'All Data') {
                  Toast.showToast({
                    title: 'All Data is a reserved view and cannot be deleted',
                    type: Toast.TYPE.NORMAL
                  });
                } else {
                  setDataState({
                    deleteViewModalOpen: {
                      id: selectedView?.id,
                      document: { name: selectedView?.name }
                    }
                  });
                }
              }}
            >
              Delete view
            </DropdownItem>
          )}
        </Dropdown>
      </div>
    );
  }, [
    view,
    viewSearch,
    selectedView,
    unsavedRun,
    viewConfigs,
    toggleFavoriteView
  ]);
}
