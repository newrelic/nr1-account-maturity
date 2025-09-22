/* eslint-disable */
import React, { useContext, useMemo } from 'react';

import { Modal, HeadingText, Button } from 'nr1';

import DataContext from '../../../src/context/data';

export default function DeleteSnapshot() {
  const {
    deleteSnapshotModalOpen,
    deletingSnapshot,
    deleteSnapshot,
    setDataState,
  } = useContext(DataContext);

  return useMemo(() => {
    return (
      <>
        <Modal
          hidden={!deleteSnapshotModalOpen}
          onClose={() => setDataState({ deleteSnapshotModalOpen: null })}
          onHideEnd={() => setDataState({ deleteSnapshotModalOpen: null })}
        >
          <HeadingText type={HeadingText.TYPE.HEADING_3}>
            Are you sure you want to delete this snapshot from{' '}
            {deleteSnapshotModalOpen?.document?.name}?
          </HeadingText>
          <br /> <br />
          <Button
            loading={deletingSnapshot}
            onClick={() =>
              deleteSnapshot(
                deleteSnapshotModalOpen?.id,
                deleteSnapshotModalOpen?.historyId,
              )
            }
            type={Button.TYPE.DESTRUCTIVE}
          >
            Delete
          </Button>
          &nbsp;&nbsp;
          <Button
            disabled={deletingSnapshot}
            onClick={() => setDataState({ deleteSnapshotModalOpen: null })}
          >
            Cancel
          </Button>
        </Modal>
      </>
    );
  }, [deleteSnapshotModalOpen, deletingSnapshot]);
}
