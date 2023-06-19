import React, { Fragment, useEffect } from 'react';
import { Card, CardHeader, CardBody } from 'nr1';
import { ProgressBar } from '@newrelic/nr-labs-components';
import rules from '../../rules';
import { percentageToStatus, scoreToColor } from '../../utils';
import { useSetState } from '@mantine/hooks';

export default function ScoreDetailsTable(props) {
  const { selectedDocument } = props;
  const [dataState, setDataState] = useSetState({});

  useEffect(() => {
    const categories = [];

    Object.keys(rules).forEach((key) => {
      if (
        selectedDocument?.[key] !== null &&
        selectedDocument?.[key] !== undefined
      ) {
        categories.push({
          name: key,
          score: selectedDocument[key],
        });
      }
    });

    const state = { categories };

    if (categories.length > 0) state[categories[0].name] = true;

    setDataState(state);
  }, [selectedDocument]);

  return (
    <div
      style={{
        paddingLeft: '15px',
        paddingTop: '10px',
        paddingBottom: '10px',
        paddingRight: '15px',
      }}
    >
      {(dataState.categories || []).map((cat) => {
        return (
          <div
            key={cat.name}
            style={{ paddingTop: '10px', paddingBottom: '10px' }}
          >
            <ProgressBar
              height="5px"
              value={cat.score}
              max={100}
              status={percentageToStatus(cat.score)}
            />
            <Card
              collapsible
              collapsed={!dataState[cat.name]}
              onChange={() =>
                setDataState({ [cat.name]: !dataState[cat.name] })
              }
              style={{ border: '1px solid #f4f6f6' }}
            >
              <CardHeader
                title={
                  <>
                    {cat.name}{' '}
                    <span style={{ fontWeight: 'normal', fontSize: '14px' }}>
                      | Overall score:
                    </span>
                    <span
                      style={{
                        color: scoreToColor(cat.score).color,
                        fontSize: '14px',
                      }}
                    >
                      &nbsp;{Math.round(cat.score)}%
                    </span>
                  </>
                }
              />
              <CardBody style={{ paddingLeft: '20px' }}>
                Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do
                eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut
                enim ad minim veniam, quis nostrud exercitation ullamco laboris
                nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor
                in reprehenderit in voluptate velit esse cillum dolore eu fugiat
                nulla pariatur. Excepteur sint occaecat cupidatat non proident,
                sunt in culpa qui officia deserunt mollit anim id est laborum.
              </CardBody>
            </Card>
          </div>
        );
      })}
    </div>
  );
}
