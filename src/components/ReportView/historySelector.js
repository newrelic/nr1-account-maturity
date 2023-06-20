import React, { useMemo, useContext, useState } from 'react';
import DataContext from '../../context/data';
import { Select, SelectItem, Button, AccountStorageMutation, Toast } from 'nr1';
import { ACCOUNT_USER_HISTORY_COLLECTION } from '../../constants';

export default function HistorySelector(props) {
  const { history, accountId } = props;
  const { view, setDataState, fetchReportHistory } = useContext(DataContext);
  const [deleting, setDeleting] = useState(false);

  const deleteHistory = (runAt) => {
    setDeleting(true);
    const documentId = history.find((h) => h.document?.runAt === runAt)?.id;
    if (documentId) {
      AccountStorageMutation.mutate({
        accountId,
        actionType: AccountStorageMutation.ACTION_TYPE.DELETE_DOCUMENT,
        collection: ACCOUNT_USER_HISTORY_COLLECTION,
        documentId,
      }).then((res) => {
        setDeleting(false);

        if (res.error) {
          Toast.showToast({
            title: 'Failed to delete',
            type: Toast.TYPE.CRITICAL,
          });
        } else {
          fetchReportHistory();
          Toast.showToast({
            title: 'Successfully deleted',
            type: Toast.TYPE.NORMAL,
          });

          const newHistory = (view.props?.history || []).filter(
            (h) => h.document?.runAt !== runAt
          );

          const selected = newHistory?.[0]?.document?.runAt;

          if (selected) {
            view.props = { ...view.props, history: newHistory, selected };
            setDataState({ view });
          } else {
            setDataState({
              view: { page: 'ReportList', title: 'Report List' },
            });
          }
        }
      });
    } else {
      console.log('documentId not found');
      setDeleting(false);
    }
  };

  return useMemo(() => {
    return (
      <>
        <div>
          <Select
            value={view.props.selected}
            label={'History'}
            labelInline
            onChange={(e, value) => {
              view.props.selected = value;
              setDataState({ view });
            }}
          >
            {(history || []).map((h) => {
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
            loading={deleting}
            sizeType={Button.SIZE_TYPE.SMALL}
            type={Button.TYPE.DESTRUCTIVE}
            iconType={Button.ICON_TYPE.INTERFACE__OPERATIONS__TRASH}
            onClick={() => deleteHistory(view.props.selected)}
          />
        </div>
      </>
    );
  }, [props, view, history]);
}
