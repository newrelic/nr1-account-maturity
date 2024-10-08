import React, { useContext, useEffect } from 'react';
import {
  PlatformStateContext,
  nerdlet,
  navigation,
  AutoSizer,
  SectionMessage,
} from 'nr1';
import { ProvideData } from '../../src/context/data';
import AccountMaturity from './AccountMaturity';

export default function AccountMaturityRoot() {
  const platformContext = useContext(PlatformStateContext);

  useEffect(() => {
    nerdlet.setConfig({
      accountPicker: true,
      timePicker: false,
    });
  }, []);

  return (
    <div>
      <SectionMessage
        title="Welcome to the new version of Account Maturity"
        description="If there are any bugs or features missing please raise an issue"
        actions={[
          {
            label: 'Raise issue or feature request',
            to:
              'https://github.com/newrelic/nr1-account-maturity/issues/new/choose',
          },
          {
            label: 'Launch the old version',
            onClick: () =>
              navigation.openNerdlet({ id: 'old-maturity-nerdlet' }),
          },
        ]}
      />
      <ProvideData platformContext={platformContext}>
        <AutoSizer>
          {({ width, height }) => (
            <AccountMaturity width={width} height={height} />
          )}
        </AutoSizer>
      </ProvideData>
    </div>
  );
}
