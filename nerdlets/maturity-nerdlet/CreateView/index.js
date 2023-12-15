import React, { useMemo, useContext } from 'react';
import {
  EmptyState,
  TextField,
  Toast,
  Checkbox,
  Grid,
  GridItem,
  Button,
  AccountStorageMutation,
  UserStorageMutation,
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
import { v4 as uuidv4 } from 'uuid';
import rules from '../../../src/rules';
import { ACCOUNT_USER_CONFIG_COLLECTION } from '../../../src/constants';

export default function CreateView() {
  const {
    runView,
    // defaultView,
    // userViewHistory,
    selectedReport,
    accounts,
    user,
    selectedAccountId,
    fetchViewConfigs,
    setDataState,
    runReport,
    runUserReport,
    view,
  } = useContext(DataContext);

  const allProducts = selectedReport?.document?.allProducts;

  const [state, setState] = useSetState({
    creatingView: false,
    name:
      view.page === 'CreateDefaultView' || view.page === 'EditDefaultView'
        ? 'Untitled'
        : selectedReport?.document?.name || '',
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
    return new Promise((resolve) => {
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
      }).then((res) => {
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

  const createView = () => {
    // eslint-disable-next-line
    return new Promise(async (resolve) => {
      const runAt = new Date().getTime();

      setState({ creatingView: true });

      let esqPassed = false;
      if (state.entitySearchQuery) {
        esqPassed = await validateEntitySearchQuery();
      } else {
        esqPassed = true;
      }

      if (esqPassed) {
        const document = {
          name: state.name,
          owner: user,
          accounts: state.accounts,
        };
        if (state.entitySearchQuery) {
          document.entitySearchQuery = state.entitySearchQuery;
        }

        if (state.allProducts) {
          document.allProducts = true;
        } else {
          document.products = state.products;
        }

        const documentId =
          selectedReport?.id || view?.id || view?.props?.id || uuidv4();

        if (
          view.page === 'CreateDefaultView' ||
          view.page === 'EditDefaultView'
        ) {
          UserStorageMutation.mutate({
            actionType: UserStorageMutation.ACTION_TYPE.WRITE_DOCUMENT,
            collection: 'userViews',
            documentId: 'default',
            document,
          }).then(async (res) => {
            if (res.error) {
              Toast.showToast({
                title: 'Failed to save',
                description: 'Check your permissions',
                type: Toast.TYPE.CRITICAL,
              });
            } else {
              Toast.showToast({
                title: selectedReport ? 'Saved' : 'Created',
                type: Toast.TYPE.NORMAL,
              });
              setDataState({ defaultView: document });
            }

            // need new handling for default run
            runUserReport({ document, id: 'default', runAt });
            fetchViewConfigs().then(() => {
              setState({ creatingView: false });
              resolve({ res, runAt, documentId });
            });
          });
        } else {
          AccountStorageMutation.mutate({
            accountId: selectedAccountId,
            actionType: AccountStorageMutation.ACTION_TYPE.WRITE_DOCUMENT,
            collection: ACCOUNT_USER_CONFIG_COLLECTION,
            documentId,
            document,
          }).then((res) => {
            if (res.error) {
              Toast.showToast({
                title: 'Failed to save',
                description: 'Check your permissions',
                type: Toast.TYPE.CRITICAL,
              });
            } else {
              Toast.showToast({
                title: selectedReport ? 'Saved' : 'Created',
                type: Toast.TYPE.NORMAL,
              });
            }

            runReport({ document, id: documentId, runAt });
            fetchViewConfigs().then(() => {
              setState({ creatingView: false });
              resolve({ res, runAt, documentId });
            });
          });
        }
      } else {
        setState({ creatingView: false });
        resolve(false);
      }
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
        <Button
          type={Button.TYPE.SECONDARY}
          onClick={() => runView({ id: 'allData', name: 'All data' })}
        >
          Skip this step
        </Button>
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
          onChange={(e) => setState({ name: e.target.value })}
          placeholder="e.g. DevOps Team"
        />
        &nbsp;&nbsp;
        <TextField
          label="Description (optional)"
          value={state.description}
          onChange={(e) => setState({ description: e.target.value })}
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
              {accounts.map((a) => (
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
                {Object.keys(rules).map((key) => (
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
                            products: state.products.filter((id) => id !== key),
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
                  setState({ accounts: accounts.map((a) => a.id) });
                }
              }}
            />
          </CardHeader>
          <CardBody style={{ paddingLeft: '20px', marginTop: '5px' }}>
            <div style={{ paddingTop: '10px' }}>
              <Grid style={{ maxHeight: '100px' }}>
                {accounts.map((a) => (
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
                            accounts: state.accounts.filter(
                              (id) => id !== a.id
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
              onChange={(e) => setState({ entitySearchQuery: e.target.value })}
              placeholder="e.g. tags.team = 'labs'"
            />
          </CardBody>
        </Card>
        <div style={{ paddingTop: '10px' }}>
          <br />
          <Button
            type={Button.TYPE.PRIMARY}
            disabled={runDisabled}
            onClick={() => {
              runView(
                {
                  name: state.name,
                  account: selectedAccountId,
                },
                {
                  document: {
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
            }}
          >
            Save and run
          </Button>
          &nbsp;&nbsp;
          <Button
            disabled={runDisabled}
            onClick={() => {
              runView(
                {
                  name: state.name,
                  account: selectedAccountId,
                  unsavedRun: true,
                },
                {
                  document: {
                    name: state.name,
                    description: state.description,
                    accounts: state.accounts,
                    allAccounts: state.accounts.length === accounts.length,
                    accountsFilter: state.accountsFilter,
                    allProducts: state.allProducts,
                    products: state.products,
                  },
                }
              );
            }}
          >
            Run
          </Button>
        </div>
      </>
    );
  }, [accounts, user, state, selectedReport]);
}
