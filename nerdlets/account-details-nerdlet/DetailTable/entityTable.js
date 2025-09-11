/* eslint-disable */
import React from 'react';
import { navigation } from 'nr1';
import ExtendedDetailsTable from '../../details-table-nerdlet';

export default function EntityTable(props) {
  const { accountId, accountName, categoryName, allEntities } = props;

  return (
    <div style={{ paddingTop: '15px' }}>
      <ExtendedDetailsTable
        limit={5}
        noMeta
        hideDownload
        categoryName={categoryName}
        accountId={accountId}
        accountName={accountName}
        allEntities={allEntities}
      />

      {allEntities.length >= 1 && (
        <>
          <div style={{ paddingLeft: '20px', paddingTop: '10px' }}>
            <a
              onClick={() =>
                navigation.openStackedNerdlet({
                  id: 'details-table-nerdlet',
                  urlState: {
                    categoryName,
                    accountId,
                    accountName,
                    allEntities
                  }
                })
              }
            >
              {allEntities.length === 1
                ? 'View all entity data'
                : `View all ${allEntities.length} entities`}{' '}
            </a>
          </div>
        </>
      )}
    </div>
  );
}
