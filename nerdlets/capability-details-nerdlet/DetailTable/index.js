// eslint-disable-next-line eslint-comments/disable-enable-pair
/* eslint-disable prettier/prettier */
import React, { useEffect } from 'react';
import { Button, Card, CardHeader, CardBody } from 'nr1';
import { ProgressBar } from '@newrelic/nr-labs-components';
import { useSetState } from '@mantine/hooks';
import EntityTable from './entityTable';
import { percentageToStatus, scoreToColor } from '../../../src/utils';
import rules from '../../../src/rules';
import csvDownload from 'json-to-csv-export';

export default function DetailsTable(props) {
  const { sortBy, elementScores, title } = props;
  const [dataState, setDataState] = useSetState({});

  useEffect(() => {
    let categories = [];

    const state = { categories: elementScores };

    if (sortBy === 'Lowest score') {
      categories = (elementScores || []).sort(
        (a, b) => parseInt(a.score) - parseInt(b.score)
      );
    } else if (sortBy === 'Highest score') {
      categories = (elementScores || []).sort(
        (a, b) => parseInt(b.score) - parseInt(a.score)
      );
    }

    state.categories = categories;

    setDataState(state);
  }, [elementScores, sortBy]);

  console.log(dataState?.categories);

  return (
    <div
      style={{
        paddingLeft: '15px',
        paddingTop: '10px',
        paddingBottom: '10px',
        paddingRight: '15px',
      }}
    >
      <div>
        {(dataState.categories || []).map((cat) => {
          const ruleSet = rules[title];
          const tdWidth = (1 / (ruleSet.scores || []).length) * 100;

          const totalEntities =
            Object.keys(cat.entities).length +
            Object.keys(cat.entitiesPassing).length;

          const allEntities = [];
          Object.keys(cat.entities).forEach((guid) => {
            const value = cat.entities[guid];
            allEntities.push({
              guid,
              ...value,
            });
          });

          Object.keys(cat.entitiesPassing).forEach((guid) => {
            const value = cat.entitiesPassing[guid];
            allEntities.push({
              guid,
              ...value,
            });
          });

          ruleSet.scores.forEach((s) => {
            if (
              s.name !== 'name' &&
              !(ruleSet?.tagMeta || []).some((t) => t.key === s.name)
            ) {
              allEntities.forEach((i) => {
                if (i[s.name] === undefined) {
                  i[s.name] = true;
                }
              });
            }
          });

          return (
            <div
              key={cat.name}
              style={{ paddingTop: '10px', paddingBottom: '10px' }}
            >
              <ProgressBar
                height="5px"
                value={parseInt(cat.score)}
                max={100}
                status={percentageToStatus(parseInt(cat.score))}
              />
              <Card
                collapsible
                defaultCollapsed
                // collapsed={!dataState[cat.name]}
                onChange={() =>
                  setDataState({ [cat.name]: !dataState[cat.name] })
                }
                style={{ border: '1px solid #f4f6f6' }}
              >
                <CardHeader
                  style={{ overflow: 'hidden' }}
                  title={
                    <>
                      {cat.name}{' '}
                      <span style={{ fontWeight: 'normal', fontSize: '14px' }}>
                        | Overall score:
                      </span>
                      <span
                        style={{
                          color: scoreToColor(parseInt(cat.score))?.color,
                          fontSize: '14px',
                        }}
                      >
                        &nbsp;{Math.round(parseInt(cat.score))}%
                      </span>
                      <div style={{ float: 'right', paddingRight: '0px' }}>
                        <Button
                          iconType={
                            Button.ICON_TYPE.INTERFACE__OPERATIONS__DOWNLOAD
                          }
                          onClick={() =>
                            csvDownload({
                              data: allEntities,
                              filename: `${new Date().getTime()}-${
                                cat.name
                              }-export.csv`,
                              delimiter: ',',
                            })
                          }
                          type={Button.TYPE.PRIMARY}
                          sizeType={Button.SIZE_TYPE.SMALL}
                        >
                          Download CSV
                        </Button>
                      </div>
                      <br /> <br />
                      <div>
                        <div
                          style={{
                            width: '5%',
                            float: 'left',
                            paddingTop: '2px',
                          }}
                        >
                          <span style={{ fontSize: '16px' }}>
                            {totalEntities}
                          </span>
                          <br />
                          <span
                            style={{ fontWeight: 'normal', fontSize: '12px' }}
                          >
                            {ruleSet?.short || 'Entities'}
                          </span>
                        </div>
                        <div style={{ width: '95%', float: 'right' }}>
                          <table
                            style={{ width: '100%', tableLayout: 'fixed' }}
                          >
                            <tr>
                              {(ruleSet.scores || []).map((score) => {
                                const {
                                  entityCheck,
                                  accountCheck,
                                  valueCheck,
                                } = score;

                                const { passed = 0, failed = 0 } =
                                  cat.scoring?.[score.name] || {};
                                const maxValue = passed + failed;

                                let label = undefined;
                                if (entityCheck) {
                                  const value = Math.round(
                                    (passed / maxValue) * 100
                                  );
                                  label = `${isNaN(value) ? 0 : value}/100`;
                                } else if (accountCheck) {
                                  label = passed >= 1 ? 'true' : 'false';
                                } else if (valueCheck) {
                                  label = `${passed}`;
                                }

                                return (
                                  <td
                                    key={score.name}
                                    style={{
                                      width: `${tdWidth}%`,
                                      // maxWidth:"150px",
                                      display: 'inline-block',
                                      padding: '10px',
                                    }}
                                  >
                                    <ProgressBar
                                      height="15px"
                                      value={passed}
                                      label={label}
                                      max={maxValue}
                                      status={percentageToStatus(
                                        (passed / maxValue) * 100
                                      )}
                                    />
                                    {score.name}
                                  </td>
                                );
                              })}
                            </tr>
                          </table>
                        </div>
                      </div>
                    </>
                  }
                />
                <CardBody style={{ paddingLeft: '20px' }}>
                  <div>
                    {Object.keys(cat.entities).length > 0 && (
                      <EntityTable
                        isCapability={true}
                        categoryName={title}
                        accountId={cat.id}
                        accountName={cat.name}
                        allEntities={allEntities}
                      />
                    )}
                  </div>
                </CardBody>
              </Card>
            </div>
          );
        })}
      </div>
    </div>
  );
}
