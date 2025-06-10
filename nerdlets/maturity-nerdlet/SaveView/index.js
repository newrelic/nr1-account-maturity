import React, { useContext } from 'react';
import {
  Modal,
  HeadingText,
  TextField,
  Button,
  Select,
  SelectItem,
  Checkbox
} from 'nr1';
import DataContext from '../../../src/context/data';

export default function SaveView() {
  const {
    saveViewModalOpen,
    setDataState,
    selectedAccountId,
    accounts,
    selectedView,
    defaultViewId,
    userSettings,
    setDefaultView,
    saveView,
    savingView,
    selectedReport
  } = useContext(DataContext);

  return (
    <>
      <Modal
        hidden={!saveViewModalOpen}
        onClose={() => setDataState({ saveViewModalOpen: false })}
      >
        <HeadingText type={HeadingText.TYPE.HEADING_3}>Save view</HeadingText>
        <TextField
          label="View name"
          value={selectedReport?.document?.name}
          onChange={e => {
            selectedReport.document.name = e.target.value;
            setDataState({ selectedReport });
          }}
          placeholder="e.g. DevOps Team"
        />
        <br />
        <TextField
          label="Description (optional)"
          value={selectedReport?.document?.description}
          onChange={e => {
            selectedReport.document.description = e.target.value;
            setDataState({ selectedReport });
          }}
          placeholder="Add context to the view"
        />
        <br /> <br />
        <Checkbox
          defaultChecked={userSettings?.defaultViewId === selectedView.id}
          checked={defaultViewId === selectedView.id}
          onChange={e => {
            if (e.target.checked) {
              setDataState({ defaultViewId: selectedView.id });
            } else {
              setDataState({ defaultViewId: null });
            }
          }}
          label="Set as default view"
        />
        <br />
        <br />
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
        <br />
        <br />
        <Button
          type={Button.TYPE.PRIMARY}
          onClick={async () => {
            if (defaultViewId === selectedView.id) {
              await setDefaultView(selectedView.id);
            }

            saveView();
          }}
          loading={savingView}
        >
          Save
        </Button>
        &nbsp;
        <Button
          disabled={savingView}
          onClick={() => setDataState({ saveViewModalOpen: false })}
        >
          Close
        </Button>
      </Modal>
    </>
  );
}
