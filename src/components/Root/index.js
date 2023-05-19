import React from 'react';

import { ProvideData } from '../../context/data';
import AccountMaturity from '../AccountMaturity';

export default function AccountMaturityRoot() {
  return (
    <div>
      <ProvideData>
        <AccountMaturity />
      </ProvideData>
    </div>
  );
}
