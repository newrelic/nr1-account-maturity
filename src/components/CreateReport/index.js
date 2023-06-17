import React, { useMemo, useContext } from 'react';
import {
  EmptyState,
  HeadingText,
  TextField,
  Toast,
  Switch,
  Grid,
  GridItem,
  Button,
  AccountStorageMutation,
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
  } = useContext(DataContext);

  const allProducts = selectedReport?.document?.allProducts;

  const [state, setState] = useSetState({
    creatingReport: false,
    name: selectedReport?.document?.name || '',
    entitySearchQuery: selectedReport?.document?.entitySearchQuery || '',
    allProducts:
      allProducts !== undefined && allProducts !== null ? true : allProducts,
    accounts: selectedReport?.document?.accounts || [],
    products: selectedReport?.document?.products || [],
  });

  const createReport = () => {
    return new Promise((resolve) => {
      setState({ creatingReport: true });
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

      AccountStorageMutation.mutate({
        accountId: selectedAccountId,
        actionType: AccountStorageMutation.ACTION_TYPE.WRITE_DOCUMENT,
        collection: ACCOUNT_USER_CONFIG_COLLECTION,
        documentId: selectedReport?.id || uuidv4(),
        document,
      }).then((res) => {
        if (res.error) {
          Toast.showToast({
            title: 'Failed to save report',
            description: 'Check your permissions',
            type: Toast.TYPE.CRITICAL,
          });
        } else {
          Toast.showToast({
            title: 'Report created',
            type: Toast.TYPE.NORMAL,
          });
        }

        fetchReportConfigs().then(() => {
          setState({ creatingReport: false });
          resolve(res);
        });
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
              if (!res?.error) {
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
            {selectedReport ? 'Save Report' : 'Create Report'}
          </Button>
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
          <HeadingText type={HeadingText.TYPE.HEADING_4}>Accounts</HeadingText>

          <div style={{ paddingTop: '10px' }}>
            <Grid>
              {accounts.map((a) => (
                <GridItem columnSpan={3} key={a.id}>
                  <Switch
                    description={`${a.id}`}
                    label={a.name}
                    style={{ paddingBottom: '0px' }}
                    checked={state.accounts.includes(a.id)}
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
        </div>
      </>
    );
  }, [accounts, user, state, selectedReport]);
}
