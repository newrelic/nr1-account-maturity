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
  Select,
  SelectItem,
  Card,
  CardBody,
  CardHeader,
  Modal,
} from 'nr1';
import DataContext from '../../../src/context/data';
import { useSetState } from '@mantine/hooks';
import rules from '../../../src/rules';

const ENTITY_COUNT_WARNING = 50;

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
  } = useContext(DataContext);
  const [entityCount, setEntityCount] = useState(0);
  const [runParams, setRunParams] = useState(null);

  useEffect(() => {
    nerdlet.setConfig({
      actionControls: false,
    });
  }, []);

  let allProducts = selectedReport?.document?.allProducts;

  if (!allProducts && (selectedReport?.document?.products || []).length === 0) {
    allProducts = true;
  } else {
    allProducts =
      allProducts !== undefined && allProducts !== null ? true : allProducts;
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
    accounts: selectedReport?.document?.accounts || [selectedAccountId],
    accountsFilter: selectedReport?.document?.accountsFilter,
    accountsFilterEnabled: selectedReport?.document?.accountsFilterEnabled,
    products: selectedReport?.document?.products || [],
  });

  const runDisabled =
    (state.products.length === 0 && !state.allProducts) ||
    (state.accounts.length === 0 &&
      !state.accountsFilter &&
      !state.accountsFilterEnabled);

  const validateEntitySearchQuery = () => {
    return new Promise(resolve => {
      const accountsClause = `and tags.accountId IN ('${state.accounts.join(
        "','"
      )}')`;
      NerdGraphQuery.query({
        query: `{
        actor {
          entitySearch(query: "${state.entitySearchQuery} ${accountsClause}") {
            count
          }
        }
      }`,
      }).then(res => {
        if (res.error) {
          Toast.showToast({
            title: 'Bad entity search query',
            description: res?.error?.message,
            type: Toast.TYPE.CRITICAL,
          });
          resolve(false);
        } else {
          const count = res?.data?.actor?.entitySearch?.count || 0;
          console.log(count);
          if (!count) {
            Toast.showToast({
              title: 'Bad entity search query',
              description: 'No entities returned',
              type: Toast.TYPE.CRITICAL,
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
      const types = item.data.actor.entitySearch.types;

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

    let selectedProducts = allProducts ? Object.keys(rules) : products;

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
    const { accounts, products, allProducts } = data;

    const accountEntityData = accounts.map(id => {
      return NerdGraphQuery.query({
        query: `{
          actor {
            entitySearch(query: "tags.accountId = '${id}'") {
              types {
                count
                domain
                entityType
                type
              }
            }
          }
        }`,
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
              BlockText.SPACING_TYPE.OMIT,
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
                runParams.doSaveView
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
        {view.page === 'CreateNewView' && (
          <Button
            type={Button.TYPE.SECONDARY}
            onClick={() =>
              runView(
                { id: `allData+${user.email}`, name: 'All data' },
                null,
                false,
                true
              )
            }
          >
            Skip this step
          </Button>
        )}
        <br />
        <br />
        <HeadingText>Create View Configuration</HeadingText>
        <BlockText style={{ paddingTop: '5px' }}>
          Use views to create saved filter sets that you can return to at
          anytime; letting you create shortcuts to product, account, environment
          or team specific views.
        </BlockText>
        <br />
        <TextField
          label="Name"
          value={state.name}
          onChange={e => setState({ name: e.target.value })}
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
        {accounts && accounts.length > 0 && (
          <>
            <Select
              value={selectedAccountId}
              label="Select an account"
              info="Your view will be stored into this account, but can access other accounts if selected below"
              onChange={(evt, value) =>
                setDataState({ selectedAccountId: value })
              }
            >
              {accounts.map(a => (
                <SelectItem key={a.id} value={a.id}>
                  {a.name}
                </SelectItem>
              ))}
            </Select>
          </>
        )}
        <br />
        <br />
        <Card collapsible>
          <CardHeader
            style={{
              fontSize: '16px',
              fontWeight: 'bold',
              marginBottom: '5px',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <div style={{ flex: -1 }}>Capabilities&nbsp;&nbsp;&nbsp;</div>
              <div style={{ flex: -1 }}>
                <Checkbox
                  label={'All Capabilities'}
                  checked={state.allProducts}
                  style={{ paddingBottom: '0px', paddingTop: '2px' }}
                  onChange={() => setState({ allProducts: !state.allProducts })}
                />
              </div>
              <div style={{ flex: 'auto' }}></div>
            </div>
          </CardHeader>
          <CardBody style={{ paddingLeft: '20px', marginTop: '5px' }}>
            <div style={{ paddingTop: '10px' }}>
              <Grid>
                {Object.keys(rules).map(key => (
                  <GridItem columnSpan={3} key={key}>
                    <Checkbox
                      key={key}
                      label={key}
                      style={{ paddingBottom: '0px' }}
                      disabled={state.allProducts}
                      checked={
                        state.allProducts || state.products.includes(key)
                      }
                      onChange={() => {
                        if (state.products.includes(key)) {
                          setState({
                            products: state.products.filter(id => id !== key),
                          });
                        } else {
                          setState({ products: [...state.products, key] });
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
              marginBottom: '5px',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <div style={{ flex: -1 }}>Accounts&nbsp;&nbsp;&nbsp;</div>
              <div style={{ flex: -1 }}>
                <Checkbox
                  label={'All Accounts'}
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
                    width: '99%',
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
                      accountsFilterEnabled: !state?.accountsFilterEnabled,
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
                  .map(a => (
                    <GridItem columnSpan={3} key={a.id}>
                      <Checkbox
                        // description={`${a.id}`}
                        label={`${a.name} (${a.id})`}
                        style={{ paddingBottom: '0px' }}
                        checked={
                          state.accounts.includes(a.id) ||
                          state?.accountsFilterEnabled
                        }
                        disabled={
                          // state.accounts.length === accounts.length ||
                          state?.accountsFilterEnabled
                        }
                        onChange={() => {
                          if (state.accounts.includes(a.id)) {
                            setState({
                              accounts: state.accounts.filter(
                                id => id !== a.id
                              ),
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
              marginBottom: '5px',
            }}
          >
            Advanced Filtering
          </CardHeader>
          <CardBody style={{ paddingLeft: '20px', marginTop: '5px' }}>
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
            disabled={runDisabled || !state.name}
            onClick={async () => {
              let run = true;
              if (state.entitySearchQuery) {
                run = await validateEntitySearchQuery();
              }

              let { totalEntities, summarizedData } = await checkEntityCount({
                accounts: state.accounts,
                allAccounts: state.accounts.length === accounts.length,
                entitySearchQuery: state.entitySearchQuery,
                accountsFilter: state.accountsFilter,
                accountsFilterEnabled: state.accountsFilterEnabled,
                allProducts: state.allProducts,
                products: state.products,
              });

              const runParams = {
                selectedView: {
                  name: state.name,
                  account: selectedAccountId,
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
                  },
                },
                doSaveView: true,
              };

              if (totalEntities > ENTITY_COUNT_WARNING) {
                setRunParams(runParams);
              } else if (run) {
                runView(
                  runParams.selectedView,
                  runParams.selectedReport,
                  runParams.doSaveView
                );
              }
            }}
          >
            Save and run
          </Button>
          &nbsp;&nbsp;
          {view.page !== 'EditView' && (
            <Button
              disabled={runDisabled}
              onClick={async () => {
                let run = true;

                if (state.entitySearchQuery) {
                  run = await validateEntitySearchQuery();
                }

                let { totalEntities, summarizedData } = await checkEntityCount({
                  accounts: state.accounts,
                  allAccounts: state.accounts.length === accounts.length,
                  entitySearchQuery: state.entitySearchQuery,
                  accountsFilter: state.accountsFilter,
                  accountsFilterEnabled: state.accountsFilterEnabled,
                  allProducts: state.allProducts,
                  products: state.products,
                });

                const runParams = {
                  selectedView: {
                    name: state.name,
                    account: selectedAccountId,
                    unsavedRun: true,
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
                    },
                  },
                };

                if (totalEntities > ENTITY_COUNT_WARNING) {
                  setRunParams(runParams);
                } else if (run) {
                  runView(runParams.selectedView, runParams.selectedReport);
                }
              }}
            >
              Run
            </Button>
          )}
        </div>
      </>
    );
  }, [
    accounts,
    user,
    state,
    selectedReport,
    email,
    view.page,
    viewConfigs.length,
    entityCount,
    runParams,
  ]);
}
