import React, { useContext, useEffect } from 'react';
import { PlatformStateContext, nerdlet, AutoSizer } from 'nr1';
import { ProvideData } from '../../src/context/data';
import AccountMaturity from './AccountMaturity';
import { Messages } from '@newrelic/nr-labs-components';
import { ResourceMonitorProvider } from './ResourceMonitor';

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

      <ResourceMonitorProvider timeLimitMinutes={0.01}>
        <ProvideData platformContext={platformContext}>
          <AutoSizer>
            {({ width, height }) => (
              <AccountMaturity width={width} height={height} />
            )}
          </AutoSizer>
        </ProvideData>
      </ResourceMonitorProvider>
    </div>
  );
}
