import React, { useMemo, useContext, useEffect } from 'react';
import {
  nerdlet,
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
} from 'nr1';
import DataContext from '../../../src/context/data';
import { useSetState } from '@mantine/hooks';
import rules from '../../../src/rules';

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
  } = useContext(DataContext);

  useEffect(() => {
    nerdlet.setConfig({
      actionControls: false,
    });
  }, []);

  const allProducts = selectedReport?.document?.allProducts;

  const [state, setState] = useSetState({
    creatingView: false,
    name:
      view.page === 'CreateDefaultView' || view.page === 'CreateNewView'
        ? 'Untitled'
        : selectedReport?.document?.name || '',
    description: selectedReport?.document?.description || '',
    entitySearchQuery: selectedReport?.document?.entitySearchQuery || '',
    allProducts:
      allProducts !== undefined && allProducts !== null ? true : allProducts,
    accounts: selectedReport?.document?.accounts || [],
    accountsFilter: selectedReport?.document?.accountsFilter,
    products: selectedReport?.document?.products || [],
  });

  const runDisabled =
    (state.products.length === 0 && !state.allProducts) ||
    (state.accounts.length === 0 && !state.accountsFilter);

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
        <br />
        {viewConfigs.length > 1 && (
          <>
            <Button
              type={Button.TYPE.SECONDARY}
              onClick={() => setDataState({ view: { page: 'ViewList' } })}
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
              runView({ id: 'allData', name: 'All data' }, null, false, true)
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
            <div>
              Capabilities &nbsp;&nbsp;&nbsp;
              <Checkbox
                label={'All Products'}
                checked={state.allProducts}
                style={{ paddingBottom: '0px' }}
                onChange={() => setState({ allProducts: !state.allProducts })}
              />
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
            Accounts&nbsp;&nbsp;&nbsp;
            <Checkbox
              label={'All Accounts'}
              checked={state.accounts.length === accounts.length}
              style={{ paddingBottom: '0px' }}
              onChange={() => {
                if (state.accounts.length === accounts.length) {
                  setState({ accounts: [] });
                } else {
                  setState({ accounts: accounts.map(a => a.id) });
                }
              }}
            />
          </CardHeader>
          <CardBody style={{ paddingLeft: '20px', marginTop: '5px' }}>
            <div style={{ paddingTop: '10px' }}>
              <Grid style={{ maxHeight: '100px' }}>
                {accounts.map(a => (
                  <GridItem columnSpan={3} key={a.id}>
                    <Checkbox
                      // description={`${a.id}`}
                      label={`${a.name} (${a.id})`}
                      style={{ paddingBottom: '0px' }}
                      checked={state.accounts.includes(a.id)}
                      disabled={state.accounts.length === accounts.length}
                      onChange={() => {
                        if (state.accounts.includes(a.id)) {
                          setState({
                            accounts: state.accounts.filter(id => id !== a.id),
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
            disabled={runDisabled}
            onClick={async () => {
              let run = true;
              if (state.entitySearchQuery) {
                run = await validateEntitySearchQuery();
              }

              if (run) {
                runView(
                  {
                    name: state.name,
                    account: selectedAccountId,
                  },
                  {
                    id: selectedReport?.id,
                    document: {
                      owner: email,
                      name: state.name,
                      description: state.description,
                      accounts: state.accounts,
                      allAccounts: state.accounts.length === accounts.length,
                      accountsFilter: state.accountsFilter,
                      allProducts: state.allProducts,
                      products: state.products,
                    },
                  },
                  true
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

                if (run) {
                  runView(
                    {
                      name: state.name,
                      account: selectedAccountId,
                      unsavedRun: true,
                    },
                    {
                      document: {
                        owner: email,
                        name: state.name,
                        description: state.description,
                        accounts: state.accounts,
                        allAccounts: state.accounts.length === accounts.length,
                        entitySearchQuery: state.entitySearchQuery,
                        accountsFilter: state.accountsFilter,
                        allProducts: state.allProducts,
                        products: state.products,
                      },
                    }
                  );
                }
              }}
            >
              Run
            </Button>
          )}
        </div>
      </>
    );
  }, [accounts, user, state, selectedReport, email, view.page, viewConfigs.length]);
}
