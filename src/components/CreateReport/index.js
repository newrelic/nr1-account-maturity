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
    accounts,
    user,
    selectedAccountId,
    fetchReportConfigs,
    setDataState,
    runReport,
    view,
  } = useContext(DataContext);

  const allProducts = selectedReport?.document?.allProducts;

  const [state, setState] = useSetState({
    creatingReport: false,
    name:
      view.page === 'DefaultReport'
        ? 'default'
        : selectedReport?.document?.name || '',
    entitySearchQuery: selectedReport?.document?.entitySearchQuery || '',
    allProducts:
      allProducts !== undefined && allProducts !== null ? true : allProducts,
    accounts: selectedReport?.document?.accounts || [],
    products: selectedReport?.document?.products || [],
  });

  console.log(view);

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
      setState({ creatingReport: true });

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

        const documentId = selectedReport?.id || uuidv4();

        if (view.page === 'DefaultReport') {
          UserStorageMutation.mutate({
            actionType: UserStorageMutation.ACTION_TYPE.WRITE_DOCUMENT,
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

            runReport({ document, id: 'default' });
            fetchReportConfigs().then(() => {
              setState({ creatingReport: false });
              resolve(res);
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

            runReport({ document, id: documentId });
            fetchReportConfigs().then(() => {
              setState({ creatingReport: false });
              resolve(res);
            });
          });
        }
      } else {
        setState({ creatingReport: false });
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
        {view.page !== 'DefaultReport' && (
          <div style={{ paddingTop: '10px' }}>
            <TextField
              label="Name"
              value={state.name}
              onChange={(e) => setState({ name: e.target.value })}
              labelInline
              placeholder="e.g. DevOps Team"
            />
            &nbsp;&nbsp;
            <Button
              type={Button.TYPE.PRIMARY}
              sizeType={Button.SIZE_TYPE.SMALL}
              onClick={async () => {
                const res = await createReport();
                if (!res?.error && res !== false) {
                  setDataState({
                    view: {
                      page: 'ReportList',
                      title: 'Maturity Reports',
                    },
                  });
                }
              }}
              loading={state.creatingReport}
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

          {view.page === 'DefaultReport' && (
            <div style={{ textAlign: 'right', marginRight: '10px' }}>
              <Button
                type={Button.TYPE.PRIMARY}
                sizeType={Button.SIZE_TYPE.SMALL}
                onClick={async () => {
                  const res = await createReport();
                  if (!res?.error && res !== false) {
                    setDataState({
                      view: {
                        page: 'ReportList',
                        title: 'Maturity Reports',
                      },
                    });
                  }
                }}
                loading={state.creatingReport}
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
          )}
        </div>
      </>
    );
  }, [accounts, user, state, selectedReport]);
}
