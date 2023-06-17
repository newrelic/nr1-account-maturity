import React, { useContext, useEffect } from 'react';
import { PlatformStateContext, nerdlet } from 'nr1';
import { ProvideData } from '../../context/data';
import AccountMaturity from '../AccountMaturity';

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
        <AccountMaturity />
      </ProvideData>
    </div>
  );
}
