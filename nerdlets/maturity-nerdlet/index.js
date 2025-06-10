import React, { useContext, useEffect } from 'react';
import { PlatformStateContext, nerdlet, AutoSizer } from 'nr1';
import { ProvideData } from '../../src/context/data';
import AccountMaturity from './AccountMaturity';
import { Messages } from '@newrelic/nr-labs-components';

export default function AccountMaturityRoot() {
  const platformContext = useContext(PlatformStateContext);

  useEffect(() => {
    nerdlet.setConfig({
      accountPicker: true,
      timePicker: false,
      actionControls: true
    });
  }, []);

  return (
    <div>
      <Messages
        org="newrelic"
        repo="nr1-account-maturity"
        branch="main"
        directory="src/"
        fileName="messages"
        timeoutPeriod={8 * 7 * 24 * 60 * 60} // 8 weeks
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
