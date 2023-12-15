import React, { useContext, useMemo } from 'react';

import { Modal, HeadingText, Button } from 'nr1';

import DataContext from '../../../src/context/data';

export default function DeleteView() {
  const { deleteViewModalOpen, deletingView, deleteView, setDataState } =
    useContext(DataContext);

  return useMemo(() => {
    return (
      <>
        <Modal
          hidden={!deleteViewModalOpen}
          onClose={() => setDataState({ deleteViewModalOpen: null })}
          onHideEnd={() => setDataState({ deleteViewModalOpen: null })}
        >
          <HeadingText type={HeadingText.TYPE.HEADING_3}>
            Are you sure you want to delete View{' '}
            {deleteViewModalOpen?.document?.name}?
          </HeadingText>
          <br /> <br />
          <Button
            loading={deletingView}
            onClick={() => deleteView()}
            type={Button.TYPE.DESTRUCTIVE}
          >
            Delete
          </Button>
          &nbsp;&nbsp;
          <Button
            disabled={deletingView}
            onClick={() => setDataState({ deleteViewModalOpen: null })}
          >
            Cancel
          </Button>
        </Modal>
      </>
    );
  }, [deleteViewModalOpen, deletingView]);
}
