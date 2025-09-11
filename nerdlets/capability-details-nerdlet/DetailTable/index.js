/* eslint-disable */
import React, { useEffect, useState } from 'react';
import { Button, Card, CardHeader, CardBody } from 'nr1';
import { ProgressBar } from '@newrelic/nr-labs-components';
import EntityTable from './entityTable';
import { percentageToStatus, scoreToColor } from '../../../src/utils';
import rules from '../../../src/rules';
import csvDownload from 'json-to-csv-export';

export default function DetailsTable(props) {
  const { sortBy, elementScores, title } = props;

  const [dataState, setDataState] = useState({
    categories: []
  });

  useEffect(() => {
    let categories = elementScores || [];

    if (sortBy === 'Lowest score') {
      categories = [...elementScores].sort(
        (a, b) => parseInt(a.score, 10) - parseInt(b.score, 10)
      );
    } else if (sortBy === 'Highest score') {
      categories = [...elementScores].sort(
        (a, b) => parseInt(b.score, 10) - parseInt(a.score, 10)
      );
    }

    setDataState(prev => ({
      ...prev,
      categories
    }));
  }, [elementScores, sortBy]);

  return (
    <div
      style={{
        paddingLeft: '15px',
        paddingTop: '10px',
        paddingBottom: '10px',
        paddingRight: '15px'
      }}
    >
      <div>
        {(dataState.categories || []).map((cat, index) => {
          const ruleSet = rules[title];
          const tdWidth = (1 / (ruleSet.scores || []).length) * 100;

          const totalEntities =
            Object.keys(cat.entities).length +
            Object.keys(cat.entitiesPassing).length;

          const allEntities = [];
          Object.keys(cat.entities).forEach(guid => {
            const value = cat.entities[guid];
            allEntities.push({
              guid,
              ...value
            });
          });

          Object.keys(cat.entitiesPassing).forEach(guid => {
            const value = cat.entitiesPassing[guid];
            allEntities.push({
              guid,
              ...value
            });
          });

          ruleSet.scores.forEach(s => {
            if (
              s.name !== 'name' &&
              !(ruleSet?.tagMeta || []).some(t => t.key === s.name)
            ) {
              allEntities.forEach(i => {
                if (i[s.name] === undefined) {
                  i[s.name] = true;
                }
              });
            }
          });

          return (
            <div
              key={index}
              style={{ paddingTop: '10px', paddingBottom: '10px' }}
            >
              <ProgressBar
                height="5px"
                value={parseInt(cat.score, 10)}
                max={100}
                status={percentageToStatus(parseInt(cat.score, 10))}
              />
              <Card
                collapsible={allEntities.length > 0}
                defaultCollapsed
                collapsed={!dataState[cat.name]} // ✅ reads dynamic key
                onChange={() =>
                  setDataState(prev => ({
                    ...prev,
                    [cat.name]: !prev[cat.name] // ✅ functional toggle
                  }))
                }
                style={{ border: '1px solid #f4f6f6' }}
              >
                <CardHeader
                  style={{ overflow: 'hidden' }}
                  title={
                    <>
                      <div
                        style={{ cursor: 'pointer' }}
                        onClick={() =>
                          setDataState(prev => ({
                            ...prev,
                            [cat.name]: !prev[cat.name] // ✅ functional toggle
                          }))
                        }
                      >
                        {cat.name}{' '}
                        <span
                          style={{ fontWeight: 'normal', fontSize: '14px' }}
                        >
                          | Overall score:
                        </span>
                        <span
                          style={{
                            color: scoreToColor(parseInt(cat.score, 10))?.color,
                            fontSize: '14px'
                          }}
                        >
                          &nbsp;{Math.round(parseInt(cat.score, 10))}%
                        </span>
                      </div>
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
                              delimiter: ','
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
                            paddingTop: '2px'
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
                              {(ruleSet.scores || []).map(score => {
                                const {
                                  entityCheck,
                                  accountCheck,
                                  valueCheck
                                } = score;

                                const { passed = 0, failed = 0 } =
                                  cat.scoring?.[score.name] || {};
                                const maxValue = passed + failed;

                                let label;
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
                                      display: 'inline-block',
                                      padding: '10px'
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
                        isCapability
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
