import React, { useContext, useMemo } from 'react';
import { HelpModal } from '@newrelic/nr-labs-components';
import DataContext from '../../../src/context/data';

export default function Help() {
  const { helpModalOpen, setDataState } = useContext(DataContext);

  return useMemo(() => {
    return (
      <>
        <HelpModal
          isModalOpen={helpModalOpen}
          setModalOpen={() => setDataState({ helpModalOpen: !helpModalOpen })}
          about={{
            appName: 'Account Maturity',
            blurb:
              'Understand the features and capabilities being used across your accounts',
            moreInfo: {
              link: 'https://github.com/newrelic/nr1-account-maturity',
              text: 'Find out more',
            },
          }}
          urls={{
            docs: 'https://github.com/newrelic/nr1-account-maturity',
            createIssue:
              'https://github.com/newrelic/nr1-account-maturity/issues/new?labels=bug&template=bug_report.md',
            createFeature:
              'https://github.com/newrelic/nr1-account-maturity/issues/new?labels=enhancement&template=enhancement.md',
            createQuestion:
              'https://github.com/newrelic/nr1-account-maturity/discussions',
          }}
          ownerBadge={{
            logo: {
              style: { height: '20px', paddingRight: '12px' },
              alt: 'New Relic',
              src:
                'https://newrelic.com/themes/custom/erno/assets/mediakit/new_relic_logo_horizontal.svg',
            },
            blurb: {
              text: 'You can build your own New Relic app!',
              link: {
                text: 'Find out how',
                url: 'https://developer.newrelic.com/build-apps',
              },
            },
          }}
        />
      </>
    );
  }, [helpModalOpen]);
}
