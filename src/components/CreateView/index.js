import React, { useMemo, useContext } from 'react';
import {
  EmptyState,
  TextField,
  Toast,
  Switch,
  Grid,
  GridItem,
  Button,
  AccountStorageMutation,
  UserStorageMutation,
  NerdGraphQuery,
} from 'nr1';
import DataContext from '../../context/data';
import { useSetState } from '@mantine/hooks';
import { v4 as uuidv4 } from 'uuid';
import rules from '../../rules';
import { ACCOUNT_USER_CONFIG_COLLECTION } from '../../constants';

export default function CreateReport(selectedReport) {
  const {
    defaultView,
    userViewHistory,
    accounts,
    user,
    selectedAccountId,
    fetchReportConfigs,
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
        ? 'default'
        : selectedReport?.document?.name || '',
    entitySearchQuery: selectedReport?.document?.entitySearchQuery || '',
    allProducts:
      allProducts !== undefined && allProducts !== null ? true : allProducts,
    accounts: selectedReport?.document?.accounts || [],
    products: selectedReport?.document?.products || [],
  });

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

  const createReport = () => {
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
            fetchReportConfigs().then(() => {
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
            fetchReportConfigs().then(() => {
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
        {view.page !== 'CreateDefaultView' && (
          <>
            <div style={{ paddingTop: '10px' }}>
              <Button
                iconType={
                  Button.ICON_TYPE.INTERFACE__ARROW__ARROW_LEFT__V_ALTERNATE
                }
                type={Button.TYPE.PRIMARY}
                sizeType={Button.SIZE_TYPE.SMALL}
                onClick={() =>
                  setDataState({
                    view: {
                      page: 'DefaultView',
                      title: 'Maturity Scores',
                      props: {
                        ...defaultView,
                        isUserDefault: true,
                        selected: userViewHistory?.[0]?.document?.runAt || 0,
                      },
                    },
                  })
                }
              >
                Back
              </Button>
              &nbsp;&nbsp;
            </div>
            <br />
          </>
        )}

        {view.page !== 'CreateDefaultView' &&
          view.page !== 'EditDefaultView' && (
            <div style={{ paddingTop: '10px' }}>
              <TextField
                label="Name"
                value={state.name}
                onChange={(e) => setState({ name: e.target.value })}
                labelInline
                placeholder="e.g. DevOps Team"
              />
              &nbsp;&nbsp;
            </div>
          )}

        <br />

        <div>
          <TextField
            label="Entity Search Query (optional)"
            value={state.entitySearchQuery}
            onChange={(e) => setState({ entitySearchQuery: e.target.value })}
            labelInline
            placeholder="e.g. tags.team = 'labs'"
          />
          &nbsp;&nbsp;
        </div>

        <br />
        <div>
          <span style={{ fontWeight: 'bold', fontSize: '16px' }}>Products</span>
          &nbsp;&nbsp;&nbsp;
          <Switch
            label={'All Products'}
            checked={state.allProducts}
            style={{ paddingBottom: '0px' }}
            onChange={() => setState({ allProducts: !state.allProducts })}
          />
        </div>

        <div style={{ paddingTop: '10px' }}>
          <Grid>
            {Object.keys(rules).map((key) => (
              <GridItem columnSpan={3} key={key}>
                <Switch
                  key={key}
                  label={key}
                  style={{ paddingBottom: '0px' }}
                  disabled={state.allProducts}
                  checked={state.allProducts || state.products.includes(key)}
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
        <div style={{ paddingTop: '10px' }}>
          <br />
          <div>
            <span style={{ fontWeight: 'bold', fontSize: '16px' }}>
              Accounts
            </span>
            &nbsp;&nbsp;&nbsp;
            <Switch
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
          </div>

          <div style={{ paddingTop: '10px' }}>
            <Grid>
              {accounts.map((a) => (
                <GridItem columnSpan={3} key={a.id}>
                  <Switch
                    description={`${a.id}`}
                    label={a.name}
                    style={{ paddingBottom: '0px' }}
                    checked={state.accounts.includes(a.id)}
                    disabled={state.accounts.length === accounts.length}
                    onChange={() => {
                      if (state.accounts.includes(a.id)) {
                        setState({
                          accounts: state.accounts.filter((id) => id !== a.id),
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

          {view.page === 'CreateDefaultView' ||
            (view.page === 'EditDefaultView' ? (
              <div style={{ textAlign: 'right', marginRight: '10px' }}>
                <Button
                  type={Button.TYPE.PRIMARY}
                  sizeType={Button.SIZE_TYPE.SMALL}
                  onClick={async () => {
                    const { res, runAt } = await createReport();

                    if (!res?.error && res !== false) {
                      setDataState({
                        view: {
                          page: 'DefaultView',
                          title: 'Maturity Scores',
                          props: {
                            selected: runAt,
                            isUserDefault: true,
                            ...(res?.data?.nerdStorageWriteDocument || {}),
                          },
                        },
                      });
                    }
                  }}
                  loading={state.creatingView}
                  disabled={
                    state.accounts.length === 0 ||
                    !state.name ||
                    state.name.length <= 3 ||
                    (!state.allProducts && state.products.length === 0)
                  }
                >
                  Save
                </Button>
              </div>
            ) : (
              <>
                <div style={{ textAlign: 'right', marginRight: '10px' }}>
                  <Button
                    type={Button.TYPE.PRIMARY}
                    sizeType={Button.SIZE_TYPE.SMALL}
                    onClick={async () => {
                      const { res, runAt, documentId } = await createReport();

                      if (!res?.error && res !== false) {
                        setDataState({
                          view: {
                            page: 'ReportView',
                            title: state.name,
                            id: selectedReport?.id || documentId,
                            props: {
                              document: res?.data?.nerdStorageWriteDocument,
                              selected: runAt,
                            },
                          },
                        });
                      }
                    }}
                    loading={state.creatingView}
                    disabled={
                      state.accounts.length === 0 ||
                      !state.name ||
                      state.name.length <= 3 ||
                      (!state.allProducts && state.products.length === 0)
                    }
                  >
                    {selectedReport ? 'Save' : 'Create'}
                  </Button>
                </div>
              </>
            ))}
        </div>
      </>
    );
  }, [accounts, user, state, selectedReport]);
}
