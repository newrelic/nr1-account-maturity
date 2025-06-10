import React, { useMemo, useContext, useState } from 'react';
import DataContext from '../../context/data';
import {
  Select,
  SelectItem,
  Button,
  AccountStorageMutation,
  UserStorageMutation,
  Toast
} from 'nr1';
import { ACCOUNT_USER_HISTORY_COLLECTION } from '../../constants';

export default function HistorySelector(props) {
  const { accountId } = props;
  const {
    view,
    runningReport,
    setDataState,
    viewHistory,
    userViewHistory,
    fetchViewHistory,
    fetchUserViewHistory
  } = useContext(DataContext);
  const isUserDefault = props?.isUserDefault || view?.props?.isUserDefault;
  const history =
    props?.history ||
    (isUserDefault
      ? userViewHistory
      : viewHistory.filter(
          r => r.document.reportId === (view?.id || view.props.id) // eslint-disable-line
        )); // eslint-disable-line

  const [deleting, setDeleting] = useState(false);

  const deleteHistory = runAt => {
    setDeleting(true);
    const documentId = history.find(h => h.document?.runAt === runAt)?.id;

    if (documentId) {
      if (isUserDefault) {
        UserStorageMutation.mutate({
          actionType: UserStorageMutation.ACTION_TYPE.DELETE_DOCUMENT,
          collection: ACCOUNT_USER_HISTORY_COLLECTION,
          documentId
        }).then(async res => {
          setDeleting(false);

          if (res.error) {
            Toast.showToast({
              title: 'Failed to delete',
              type: Toast.TYPE.CRITICAL
            });
          } else {
            await fetchUserViewHistory();
            Toast.showToast({
              title: 'Successfully deleted',
              type: Toast.TYPE.NORMAL
            });

            const newHistory = (history || []).filter(
              h => h.document?.runAt !== runAt
            );

            const selected = newHistory?.[0]?.document?.runAt;

            if (selected) {
              view.props = { ...view.props, history: newHistory, selected };
              setDataState({ view });
            } else {
              // setDataState({
              //   view: { page: 'ReportList', title: 'Report List' },
              // });
            }
          }
        });
      } else {
        AccountStorageMutation.mutate({
          accountId,
          actionType: AccountStorageMutation.ACTION_TYPE.DELETE_DOCUMENT,
          collection: ACCOUNT_USER_HISTORY_COLLECTION,
          documentId
        }).then(async res => {
          if (res.error) {
            Toast.showToast({
              title: 'Failed to delete',
              type: Toast.TYPE.CRITICAL
            });
            setDeleting(false);
          } else {
            await fetchViewHistory();

            Toast.showToast({
              title: 'Successfully deleted',
              type: Toast.TYPE.NORMAL
            });

            setDeleting(false);

            const newHistory = (history || []).filter(
              h => h.document?.runAt !== runAt
            );

            const selected = newHistory?.[0]?.document?.runAt;

            if (selected) {
              view.props = { ...view.props, history: newHistory, selected };
              setDataState({ view });
            } else {
              // console.log(
              //   'unable to find any prior history, going to default view',
              //   documentId,
              //   selected
              // );
              // setDataState({
              //   view: {
              //     page: 'DefaultView',
              //     title: 'Maturity Scores',
              //     id: 'DefaultView',
              //     props: {
              //       isUserDefault: true,
              //       selected: userViewHistory?.[0]?.document?.runAt || 0,
              //     },
              //   },
              // });
            }
          }
        });
      }
    } else {
      // eslint-disable-next-line
      console.log('documentId not found');
      setDeleting(false);
    }
  };

  return useMemo(() => {
    if ((history || []).length === 0) {
      return <></>;
    }

    return (
      <>
        <div>
          <Select
            disabled={runningReport}
            value={view?.props?.selected || undefined}
            label="History"
            labelInline
            onChange={(e, value) => {
              view.props.selected = value;
              setDataState({ view });
            }}
          >
            {(history || []).map(h => {
              const { document } = h;
              const dateStr = new Date(document.runAt).toLocaleString();

              return (
                <SelectItem key={document.runAt} value={document.runAt}>
                  {dateStr}
                </SelectItem>
              );
            })}
          </Select>
          &nbsp;
          <Button
            disabled={deleting || runningReport}
            loading={deleting}
            sizeType={Button.SIZE_TYPE.SMALL}
            type={Button.TYPE.DESTRUCTIVE}
            iconType={Button.ICON_TYPE.INTERFACE__OPERATIONS__TRASH}
            onClick={() => deleteHistory(view?.props?.selected)}
          />
        </div>
      </>
    );
  }, [props, view, history]);
}
