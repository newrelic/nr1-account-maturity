/* eslint-disable */
import React from 'react';
import { NerdletStateContext, navigation, Spinner } from 'nr1';

// we cannot do a simple reload of the current nerdlet with the same nerdlet or with window.location or history
// so we bounce via the redirector nerdlet

export default class RedirectorNerdlet extends React.Component {
  render() {
    return (
      <NerdletStateContext.Consumer>
        {nerdletState => {
          if (nerdletState?.redirectNerdlet) {
            navigation.replaceNerdlet({ id: nerdletState.redirectNerdlet });
          }

          console.log('redirector nerdlet', nerdletState);

          return (
            <>
              <Spinner />
            </>
          );
        }}
      </NerdletStateContext.Consumer>
    );
  }
}
