import React, { useMemo, useContext, useEffect, useState } from 'react';
import {
  nerdlet,
  Switch,
  EmptyState,
  TextField,
  Toast,
  Checkbox,
  Grid,
  GridItem,
  Button,
  NerdGraphQuery,
  HeadingText,
  BlockText,
  Card,
  CardBody,
  CardHeader,
  Modal
} from 'nr1';
import DataContext from '../../../src/context/data';
import { useSetState } from '@mantine/hooks';
import rules from '../../../src/rules';
import { defaultActions } from '../AccountMaturity';

const ENTITY_COUNT_WARNING = 1000;

export default function CreateView() {
  const {
    viewConfigs,
    runView,
    email,
    selectedReport,
    accounts,
    user,
    selectedAccountId,
    setDataState,
    view,
    prevView,
    clearWelcome,
    userSettings
  } = useContext(DataContext);
  const [entityCount, setEntityCount] = useState(0);
  const [runParams, setRunParams] = useState(null);

  useEffect(() => {
    nerdlet.setConfig({
      actionControls: true,
      actionControlButtons: [...defaultActions(setDataState)]
    });
  }, []);

  let allProducts = selectedReport?.document?.allProducts;
  let products = selectedReport?.document?.products;
  let hideNotReporting = selectedReport?.document?.hideNotReporting;

  if ((selectedReport?.document?.products || []).length === 0) {
    if (view.page !== 'EditView') {
      hideNotReporting = true;
    }

    if (!allProducts) {
      allProducts = true;
      products = Object.keys(rules);
    } else {
      allProducts =
        allProducts !== undefined && allProducts !== null ? true : allProducts;

      // hideNotReporting =
      //   hideNotReporting !== undefined && hideNotReporting !== null
      //     ? true
      //     : hideNotReporting;
    }
  }

  const [state, setState] = useSetState({
    creatingView: false,
    name:
      view.page === 'CreateDefaultView' || view.page === 'CreateNewView'
        ? 'Untitled'
        : selectedReport?.document?.name || '',
    description: selectedReport?.document?.description || '',
    entitySearchQuery: selectedReport?.document?.entitySearchQuery || '',
    allProducts,
    accounts: selectedReport?.document?.accounts || [],
    accountsFilter: selectedReport?.document?.accountsFilter,
    accountsFilterEnabled: selectedReport?.document?.accountsFilterEnabled,
    products,
    setAsDefault: false,
    hideNotReporting
  });

  useEffect(() => {
    if (selectedReport?.document?.accounts === undefined) {
      setState({ accounts: [selectedAccountId] });
    }
  }, []);

  const runDisabled =
    (state.products.length === 0 && !state.allProducts) ||
    (state.accounts.length === 0 &&
      !state.accountsFilter &&
      !state.accountsFilterEnabled) ||
    state.name.toLowerCase() === 'all data';

  const validateEntitySearchQuery = () => {
    return new Promise(resolve => {
      const accountsClause = `and tags.accountId IN ('${state.accounts.join(
        "','"
      )}')`;
      const hnr = hideNotReporting ? `and reporting = 'true'` : '';

      NerdGraphQuery.query({
        query: `{
        actor {
          entitySearch(query: "${state.entitySearchQuery} ${accountsClause} ${hnr}") {
            count
          }
        }
      }`
      }).then(res => {
        if (res.error) {
          Toast.showToast({
            title: 'Bad entity search query',
            description: res?.error?.message,
            type: Toast.TYPE.CRITICAL
          });
          resolve(false);
        } else {
          const count = res?.data?.actor?.entitySearch?.count || 0;
          if (!count) {
            Toast.showToast({
              title: 'Bad entity search query',
              description: 'No entities returned',
              type: Toast.TYPE.CRITICAL
            });
            resolve(false);
          } else {
            resolve(true);
          }
        }
      });
    });
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

  const checkEntityCount = async data => {
    const { accounts, products, allProducts, hideNotReporting } = data;
    setRunParams(null);

    const reporting = hideNotReporting ? `reporting = 'true' and ` : '';

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

    setEntityCount(totalEntities);

    return { totalEntities, summarizedData };
  };

  let changes = true;

  if (viewConfigs.length > 1) {
    const nameChanged = selectedReport?.document?.name !== state?.name;
    const descChanged =
      selectedReport?.document?.description !== state?.description;
    const esqChanged =
      (selectedReport?.document?.entitySearchQuery || '') !==
      (state?.entitySearchQuery || '');
    const allProdChanged =
      (selectedReport?.document?.allProducts || false) !==
      (state?.allProducts || false);
    const hnrChanged =
      (selectedReport?.document?.hideNotReporting || false) !==
      (state?.hideNotReporting || false);

    const afeChanged =
      (selectedReport?.document?.accountsFilterEnabled || false) !==
      (state?.accountsFilterEnabled || false);

    const prodChanged = compareStringArrays(
      selectedReport?.document?.products || [],
      state?.products
    );
    const accChanged = compareStringArrays(
      selectedReport?.document?.accounts || [],
      state?.accounts || []
    );

    if (
      nameChanged ||
      descChanged ||
      esqChanged ||
      allProdChanged ||
      accChanged ||
      afeChanged ||
      prodChanged ||
      hnrChanged
    ) {
      changes = true;
    } else {
      changes = false;
    }
  }

  return useMemo(() => {
    if ((accounts || []).length === 0) {
      return (
        <div style={{ textAlign: 'center' }}>
          <EmptyState
            type={EmptyState.TYPE.ERROR}
            iconType={
              EmptyState.ICON_TYPE
                .HARDWARE_AND_SOFTWARE__SOFTWARE__DATABASE__S_ERROR
            }
            title="No accounts available"
            description="Please check your permissions, eg. subscription, profile and/or UUID."
          />
        </div>
      );
    }

    return (
      <>
        <Modal
          hidden={entityCount <= ENTITY_COUNT_WARNING}
          onClose={() => setEntityCount(0)}
        >
          <HeadingText type={HeadingText.TYPE.HEADING_3}>
            Proceed with caution
          </HeadingText>

          <BlockText
            spacingType={[
              BlockText.SPACING_TYPE.EXTRA_LARGE,
              BlockText.SPACING_TYPE.OMIT
            ]}
          >
            This query will target {entityCount} of entities; due to this high
            number of entities you may experience performance delays or crashes.
            Please consider setting up filters in the View configuration to
            reduce to the number of entities included in the query.
          </BlockText>

          <Button
            type={Button.TYPE.PRIMARY}
            style={{ float: 'left' }}
            onClick={() => {
              setEntityCount(0);
              runView(
                runParams.selectedView,
                runParams.selectedReport,
                runParams.doSaveView,
                null,
                runParams.setAsDefault
              );
            }}
          >
            Continue
          </Button>

          <Button style={{ float: 'right' }} onClick={() => setEntityCount(0)}>
            Close
          </Button>
        </Modal>
        <br />
        {viewConfigs.length > 1 && (
          <>
            <Button
              type={Button.TYPE.SECONDARY}
              onClick={() => {
                if (prevView) {
                  setDataState({ view: prevView });
                } else {
                  setDataState({ view: { page: 'ViewList' } });
                }
              }}
            >
              Back
            </Button>
            &nbsp;
          </>
        )}
        {/* Show all views if views exist */}
        {viewConfigs && viewConfigs.length > 1 && (
          <>
            <Button
              onClick={() => {
                clearWelcome();
                setDataState({ view: { page: 'ViewList' } });
              }}
            >
              See all views
            </Button>
          </>
        )}
        {/* {showSkipThisStep && (
          <Button
            type={Button.TYPE.SECONDARY}
            onClick={() =>
              runView(
                { id: `allData+${user.email}`, name: 'All data' },
                null,
                false,
                true,
                runParams?.setAsDefault
              )
            }
          >
            Skip this step
          </Button>
        )} */}
        <br />
        <br />
        <HeadingText>View Configuration</HeadingText>
        <BlockText style={{ paddingTop: '5px' }}>
          Use views to create saved filter sets that you can return to at
          anytime; letting you create shortcuts to product, account, environment
          or team specific views.
        </BlockText>
        <br />
        <TextField
          label="Name"
          value={state.name}
          invalid={
            (state?.name || '').toLowerCase() === 'all data'
              ? `'All Data' is a reserved name`
              : false
          }
          onChange={e => {
            if (e.target.value.toLowerCase() === 'all data') {
              Toast.showToast({
                description: `'All Data' is a reserved name`,
                title: 'Cannot use this name',
                type: Toast.TYPE.CRITICAL
              });
            }

            setState({
              name: e.target.value,
              setAsDefault: !e.target.value ? false : state.setAsDefault
            });
          }}
          placeholder="e.g. DevOps Team"
        />
        &nbsp;&nbsp;
        <TextField
          label="Description (optional)"
          value={state.description}
          onChange={e => setState({ description: e.target.value })}
          placeholder="Add context to the view"
        />
        &nbsp;&nbsp;
        {/* && !selectedReport?.document */}
        {state.name && (
          <div style={{ display: 'inline-block', verticalAlign: 'middle' }}>
            <Checkbox
              label="Set as default view"
              checked={state.setAsDefault}
              disabled={!state.name}
              style={{
                marginBottom: '-45px',
                paddingBottom: '0px',
                verticalAlign: 'middle'
              }}
              onChange={() => {
                setState({
                  setAsDefault: !state.setAsDefault
                });
              }}
            />
          </div>
        )}
        <br />
        <br />
        <Card collapsible>
          <CardHeader
            style={{
              fontSize: '16px',
              fontWeight: 'bold',
              marginBottom: '5px'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <div style={{ flex: -1 }}>
                Accounts&nbsp;
                {!state?.accountsFilterEnabled && (
                  <span
                    style={{
                      fontWeight: 'normal',
                      fontSize: '14px',
                      color: '#666'
                    }}
                  >
                    ({state.accounts.length} selected)
                  </span>
                )}
                &nbsp;&nbsp;&nbsp;
              </div>
              <div style={{ flex: -1 }}>
                <Checkbox
                  label="All Accounts"
                  disabled={state?.accountsFilterEnabled}
                  checked={state.accounts.length === accounts.length}
                  style={{ paddingBottom: '0px', paddingTop: '2px' }}
                  onChange={() => {
                    if (state.accounts.length === accounts.length) {
                      setState({ accounts: [] });
                    } else {
                      setState({ accounts: accounts.map(a => a.id) });
                    }
                  }}
                />
              </div>
              <div style={{ flex: 'auto', marginTop: '-2px' }}>
                <TextField
                  type={TextField.TYPE.SEARCH}
                  style={{
                    fontSize: '12px',
                    fontWeight: 'normal',
                    width: '99%'
                  }}
                  value={state.accountsFilter}
                  onChange={e => setState({ accountsFilter: e.target.value })}
                  placeholder="Filter by account names"
                />
              </div>
              <div style={{ textAlign: 'right' }}>
                <Switch
                  onChange={() =>
                    setState({
                      accountsFilterEnabled: !state?.accountsFilterEnabled
                    })
                  }
                  checked={state?.accountsFilterEnabled}
                  label="Apply dynamic filter"
                  info="Accounts will be automatically selected for assessment depending on filter eg. 'Production'"
                />
              </div>
            </div>
          </CardHeader>
          <CardBody style={{ paddingLeft: '20px', marginTop: '5px' }}>
            <div style={{ paddingTop: '10px' }}>
              <Grid style={{ maxHeight: '100px' }}>
                {accounts
                  .filter(a =>
                    a.name
                      .toLowerCase()
                      .includes((state?.accountsFilter || '').toLowerCase())
                  )
                  // Sort accounts: selected ones first, then unselected
                  .sort((a, b) => {
                    const aSelected = state.accounts.includes(a.id);
                    const bSelected = state.accounts.includes(b.id);

                    // If both are selected or both are unselected, maintain original order
                    if (aSelected === bSelected) return 0;

                    // Selected accounts come first
                    return aSelected ? -1 : 1;
                  })
                  .map(a => (
                    <GridItem columnSpan={3} key={a.id}>
                      <Checkbox
                        // description={`${a.id}`}
                        label={`${a.name} (${a.id})`}
                        style={{
                          paddingBottom: '0px',
                          // Highlight selected accounts
                          backgroundColor: state.accounts.includes(a.id)
                            ? '#f0f8ff'
                            : 'transparent',
                          padding: '2px 4px',
                          borderRadius: '4px'
                        }}
                        checked={
                          state.accounts.includes(a.id) ||
                          state?.accountsFilterEnabled === true
                        }
                        disabled={
                          // state.accounts.length === accounts.length ||
                          state?.accountsFilterEnabled
                        }
                        onChange={() => {
                          if (state.accounts.includes(a.id)) {
                            setState({
                              accounts: state.accounts.filter(id => id !== a.id)
                            });
                          } else {
                            setState({ accounts: [...state.accounts, a.id] });
                          }
                        }}
                      />
                    </GridItem>
                  ))}
              </Grid>
            </div>
          </CardBody>
        </Card>
        <Card collapsible>
          <CardHeader
            style={{
              fontSize: '16px',
              fontWeight: 'bold',
              marginBottom: '5px'
            }}
          >
            Advanced Filtering
          </CardHeader>
          <CardBody style={{ paddingLeft: '20px', marginTop: '5px' }}>
            <div style={{ display: 'inline-block', verticalAlign: 'middle' }}>
              <Checkbox
                label="Hide not reporting entities"
                checked={state.hideNotReporting}
                style={{
                  verticalAlign: 'middle'
                }}
                onChange={() => {
                  setState({
                    hideNotReporting: !state.hideNotReporting
                  });
                }}
              />
            </div>
            <br /> <br />
            <TextField
              label="Entity Filter"
              value={state.entitySearchQuery}
              onChange={e => setState({ entitySearchQuery: e.target.value })}
              placeholder="e.g. tags.team = 'labs'"
            />
          </CardBody>
        </Card>
        <div style={{ paddingTop: '10px' }}>
          <br />
          <Button
            type={Button.TYPE.PRIMARY}
            disabled={runDisabled || !state.name || !changes}
            onClick={async () => {
              clearWelcome();

              let run = true;
              if (state.entitySearchQuery) {
                run = await validateEntitySearchQuery();
              }

              // eslint-disable-next-line
              const { totalEntities, summarizedData } = await checkEntityCount({
                accounts: state.accounts,
                allAccounts: state.accounts.length === accounts.length,
                entitySearchQuery: state.entitySearchQuery,
                accountsFilter: state.accountsFilter,
                accountsFilterEnabled: state.accountsFilterEnabled,
                allProducts: state.allProducts,
                products: state.products,
                hideNotReporting: state.hideNotReporting
              });

              const runParams = {
                selectedView: {
                  name: state.name,
                  account: selectedAccountId
                },
                selectedReport: {
                  id: selectedReport?.id,
                  document: {
                    owner: email,
                    name: state.name,
                    description: state.description,
                    accounts: state.accounts,
                    allAccounts: state.accounts.length === accounts.length,
                    accountsFilter: state.accountsFilter,
                    accountsFilterEnabled: state.accountsFilterEnabled,
                    allProducts: state.allProducts,
                    products: state.products,
                    hideNotReporting: state.hideNotReporting
                  }
                },
                doSaveView: true,
                setAsDefault: state.setAsDefault
              };

              if (totalEntities > ENTITY_COUNT_WARNING) {
                setRunParams(runParams);
              } else if (run) {
                runView(
                  runParams.selectedView,
                  runParams.selectedReport,
                  runParams.doSaveView,
                  null,
                  runParams.setAsDefault
                );
              }
            }}
          >
            Save and run
          </Button>
          &nbsp;&nbsp;
          {/* {view.page !== 'EditView' && ( */}
          <Button
            disabled={runDisabled}
            onClick={async () => {
              clearWelcome();

              let run = true;

              if (state.entitySearchQuery) {
                run = await validateEntitySearchQuery();
              }

              // eslint-disable-next-line
              const { totalEntities, summarizedData } = await checkEntityCount({
                accounts: state.accounts,
                allAccounts: state.accounts.length === accounts.length,
                entitySearchQuery: state.entitySearchQuery,
                accountsFilter: state.accountsFilter,
                accountsFilterEnabled: state.accountsFilterEnabled,
                allProducts: state.allProducts,
                products: state.products,
                hideNotReporting: state.hideNotReporting
              });

              const runParams = {
                selectedView: {
                  name: state.name,
                  account: selectedAccountId,
                  unsavedRun: true
                },
                selectedReport: {
                  document: {
                    owner: email,
                    name: state.name,
                    description: state.description,
                    accounts: state.accounts,
                    allAccounts: state.accounts.length === accounts.length,
                    entitySearchQuery: state.entitySearchQuery,
                    accountsFilter: state.accountsFilter,
                    accountsFilterEnabled: state.accountsFilterEnabled,
                    allProducts: state.allProducts,
                    products: state.products,
                    hideNotReporting: state.hideNotReporting
                  }
                },
                setAsDefault: state.setAsDefault
              };

              // eslint-disable-next-line
              console.log(totalEntities, ENTITY_COUNT_WARNING);

              if (totalEntities > ENTITY_COUNT_WARNING) {
                setRunParams(runParams);
              } else if (run) {
                runView(
                  runParams.selectedView,
                  runParams.selectedReport,
                  null,
                  null,
                  runParams.setAsDefault
                );
              }
            }}
          >
            Run
          </Button>
          {/* )} */}
        </div>
      </>
    );
  }, [
    userSettings,
    accounts,
    user,
    state,
    selectedReport,
    email,
    view.page,
    viewConfigs.length,
    entityCount,
    runParams,
    products,
    allProducts,
    hideNotReporting
  ]);
}

function compareStringArrays(arr1, arr2) {
  if (arr1.length !== arr2.length) return true;

  const sortedArr1 = arr1.slice().sort();
  const sortedArr2 = arr2.slice().sort();

  return sortedArr1.join() !== sortedArr2.join();
}
