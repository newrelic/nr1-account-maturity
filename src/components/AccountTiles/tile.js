import React, { useMemo } from 'react';
import { HeadingText } from 'nr1';

export default function AccountTile(props) {
  const { account } = props;

  return useMemo(() => {
    console.log(account);
    return (
      <div className="grid-tile shadow">
        <HeadingText type={HeadingText.TYPE.HEADING_3}>
          {account.name}
        </HeadingText>
        {account.id}

        <br />
        <br />
      </div>
    );
  }, [account]);
}
