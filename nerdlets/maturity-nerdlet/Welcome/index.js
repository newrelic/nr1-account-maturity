import React, { useMemo, useContext } from 'react';
import { Spacing, BlockText, Link } from 'nr1';
import DataContext from '../../../src/context/data';

export default function Welcome() {
  const { userSettings } = useContext(DataContext);

  return useMemo(() => {
    if (!userSettings || userSettings?.doneWelcomeTest21) return <></>;

    return (
      <>
        <br />
        <div style={{ backgroundColor: 'white' }}>
          <Spacing type={[Spacing.TYPE.LARGE, Spacing.TYPE.LARGE]}>
            <div style={{ paddingTop: '3px', paddingBottom: '5px' }}>
              <Spacing type={[Spacing.TYPE.MEDIUM, Spacing.TYPE.OMIT]}>
                <BlockText type={BlockText.TYPE.PARAGRAPH}>
                  Welcome to the updated Account Maturity!
                </BlockText>
              </Spacing>
              <Spacing type={[Spacing.TYPE.MEDIUM, Spacing.TYPE.OMIT]}>
                <BlockText type={BlockText.TYPE.NORMAL}>
                  In this version, we are introducing a few new features:
                </BlockText>
              </Spacing>
              <Spacing type={[Spacing.TYPE.MEDIUM, Spacing.TYPE.EXTRA_LARGE]}>
                <ol>
                  <li>
                    Reusable views: You can create reusable views that target a
                    subset of accounts and entities. Once saved, you can easily
                    switch between views using the Views dropdown, without
                    having to re-enter the filter information.
                  </li>
                  <li>
                    Score trends: everytime you load a view, we will save the
                    score associated with that view so that you can view changes
                    over time and track attainment toward your maturity
                    objectives. You can also go back in time to see the results
                    of a previous saved score.
                  </li>
                  <li>
                    Group by account or product - you can now see your scores
                    based on product capability, as well as by account.
                  </li>
                </ol>
              </Spacing>

              <Spacing type={[Spacing.TYPE.MEDIUM, Spacing.TYPE.OMIT]}>
                <BlockText>
                  You can click the <strong>Skip this Step</strong> button above
                  to immediately evaluate all the data you have access to.
                </BlockText>
              </Spacing>
              <Spacing type={[Spacing.TYPE.MEDIUM, Spacing.TYPE.OMIT]}>
                <BlockText>
                  However, if you have access to a lot of accounts or entites,
                  we strongly recommend you use the form below to create a more
                  targeted view; this will help avoid performance issues and
                  timeouts.
                </BlockText>
              </Spacing>
              <Spacing type={[Spacing.TYPE.MEDIUM, Spacing.TYPE.OMIT]}>
                <BlockText>
                  You are seeing this message because it is your first time
                  visiting the app - you won't see it again. You can always
                  visit the{' '}
                  <Link to="https://github.com/newrelic/nr1-account-maturity">
                    docs
                  </Link>{' '}
                  page for more detailed information on using the app.
                </BlockText>
              </Spacing>
            </div>
          </Spacing>
        </div>
      </>
    );
  }, [userSettings, userSettings?.doneWelcomeTest21]);
}
