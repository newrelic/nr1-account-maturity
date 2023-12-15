import React, { useContext, useEffect } from 'react';
import { PlatformStateContext, nerdlet, AutoSizer } from 'nr1';
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
