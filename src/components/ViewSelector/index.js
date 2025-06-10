import React, { useMemo, useContext, useState, useEffect } from 'react';
import DataContext from '../../context/data';
import { Select, SelectItem, Button, Toast, AccountStorageMutation } from 'nr1';
import { ACCOUNT_USER_CONFIG_COLLECTION } from '../../constants';

export default function ViewSelector(props) {
  const { view } = props;
  const {
    defaultView,
    runningReport,
    selectedAccountId,
    setDataState,
    viewHistory,
    userViewHistory,
    viewConfigs,
    fetchViewConfigs,
    runReport,
    runUserReport,
  } = useContext(DataContext);
  const [selectedView, setView] = useState('DefaultView');
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    setView(view?.id || 'DefaultView');
  }, [view?.id]);

  const deleteReportConfig = async (documentId) => {
    setDeleting(true);
    const res = await AccountStorageMutation.mutate({
      accountId: selectedAccountId,
      actionType: AccountStorageMutation.ACTION_TYPE.DELETE_DOCUMENT,
      collection: ACCOUNT_USER_CONFIG_COLLECTION,
      documentId,
    });

    if (res.error) {
      Toast.showToast({
        title: 'Failed to deleted',
        description: 'Check your permissions',
        type: Toast.TYPE.CRITICAL,
      });
      setDeleting(false);
    } else {
      Toast.showToast({
        title: 'Deleted successfully',
        type: Toast.TYPE.NORMAL,
      });

      setDeleting(false);
      await fetchViewConfigs();

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
      });
    }
  };

  return useMemo(() => {
    const sortedReportConfigs = viewConfigs.map((r) => ({
      ...r,
      history: viewHistory.filter((h) => h.document.reportId === r.id),
    }));

    return (
      <>
        <div>
          <Button
            disabled={runningReport}
            sizeType={Button.SIZE_TYPE.SMALL}
            iconType={Button.ICON_TYPE.INTERFACE__SIGN__PLUS}
            onClick={() =>
              setDataState({
                view: { page: 'CreateView', title: 'Create New View' },
              })
            }
          >
            New View
          </Button>
          &nbsp;&nbsp;
          <Select
            disabled={runningReport}
            value={selectedView}
            onChange={(evt, value) => {
              setView(value);

              if (value === 'defaultView') {
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
                });
              } else {
                const item = sortedReportConfigs.find((s) => s.id === value);

                if (item) {
                  setDataState({
                    view: {
                      page: 'ReportView',
                      title: item?.document?.name,
                      subtitle: (
                        <div style={{ paddingBottom: '10px' }}>
                          <span
                            style={{ fontSize: '12px', fontWeight: 'bold' }}
                          >
                            Entity Search Query:
                          </span>
                          <span style={{ fontSize: '12px' }}>
                            &nbsp;{item.document?.entitySearchQuery || 'ALL'}
                          </span>
                        </div>
                      ),
                      props: {
                        ...item,
                        selected: item?.history?.[0]?.document?.runAt || 0,
                      },
                    },
                  });
                }
              }
            }}
          >
            <SelectItem value="defaultView">Default View</SelectItem>

            {sortedReportConfigs.map((config) => {
              return (
                <SelectItem key={config.id} value={config.id}>
                  {config.document?.name || 'bad name'}
                </SelectItem>
              );
            })}
          </Select>
          &nbsp;
          <Button
            disabled={runningReport}
            loading={runningReport}
            sizeType={Button.SIZE_TYPE.SMALL}
            iconType={
              Button.ICON_TYPE.INTERFACE__CARET__CARET_RIGHT__V_ALTERNATE
            }
            onClick={async () => {
              const runAt = new Date().getTime();

              if (view.props?.isUserDefault) {
                await runUserReport({
                  document: defaultView,
                  id: 'default',
                  runAt,
                });
              } else {
                await runReport({
                  ...view.props,
                  id: view?.id || view.props?.id,
                  runAt,
                });
              }
              view.props.selected = runAt;
              setDataState({ view });
            }}
          >
            Run
          </Button>
          &nbsp;
          <Button
            disabled={runningReport}
            sizeType={Button.SIZE_TYPE.SMALL}
            iconType={Button.ICON_TYPE.INTERFACE__OPERATIONS__EDIT}
            onClick={() => {
              const props = view.props?.isUserDefault
                ? { document: { ...view.props } }
                : { ...view.props };

              setDataState({
                view: {
                  page: view.props?.isUserDefault
                    ? 'EditDefaultView'
                    : 'EditView',
                  title: 'Edit View',
                  props,
                },
              });
            }}
          >
            Edit
          </Button>
          {view.page !== 'DefaultView' && (
            <>
              &nbsp;&nbsp;&nbsp;
              <Button
                disabled={runningReport || deleting}
                loading={deleting}
                sizeType={Button.SIZE_TYPE.SMALL}
                type={Button.TYPE.DESTRUCTIVE}
                iconType={Button.ICON_TYPE.INTERFACE__OPERATIONS__TRASH}
                onClick={() => deleteReportConfig(view?.id || view?.props?.id)}
              />
            </>
          )}
          {/* &nbsp;
          <Button
            disabled={runningReport || deleting}
            loading={deleting}
            sizeType={Button.SIZE_TYPE.SMALL}
            iconType={Button.ICON_TYPE.DATAVIZ__DATAVIZ__LINE_CHART}
            onClick={() => {
              //
            }}
          >
            Scores
          </Button> */}
        </div>
      </>
    );
  }, [view, runningReport, viewConfigs, selectedView]);
}
