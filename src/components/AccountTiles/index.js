import React, { useMemo, useContext } from 'react';
import { Grid, GridItem } from 'nr1';
import DataContext from '../../context/data';
import AccountTile from './tile';

export default function AccountTiles() {
  const { entitiesByAccount } = useContext(DataContext);

  return useMemo(() => {
    console.log(entitiesByAccount);
    return (
      <div>
        <Grid>
          {entitiesByAccount.map((account) => {
            //
            return (
              <GridItem key={account.id} columnSpan={3}>
                <AccountTile account={account} />
              </GridItem>
            );
          })}
        </Grid>
      </div>
    );
  }, [entitiesByAccount]);
}
