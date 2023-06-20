// eslint-disable-next-line eslint-comments/disable-enable-pair
/* eslint-disable prettier/prettier */
import React, { useEffect } from 'react';
import { Card, CardHeader, CardBody, Select, SelectItem } from 'nr1';
import { ProgressBar } from '@newrelic/nr-labs-components';
import rules from '../../rules';
import { percentageToStatus, scoreToColor } from '../../utils';
import { useSetState } from '@mantine/hooks';
import EntityTable from './entityTable';

export default function ScoreDetailsTable(props) {
  const { selectedDocument } = props;
  const [dataState, setDataState] = useSetState({ sortBy: "Default" });

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

  const updateSortBy = (sortBy) => {
    if (sortBy === 'Lowest score') {
      setDataState({ sortBy, categories: dataState.categories.sort((a, b) => a.score - b.score) });
    } else if (sortBy === 'Highest score') {
      setDataState({ sortBy, categories: dataState.categories.sort((a, b) => b.score - a.score) });
    } else if (sortBy === 'Default') {
      const categories = []
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
      setDataState({ sortBy, categories });
    }
  }

  return (
    <div
      style={{
        paddingLeft: '15px',
        paddingTop: '10px',
        paddingBottom: '10px',
        paddingRight: '15px',
      }}
    >

      <div style={{ textAlign: 'right', paddingBottom: "15px" }}>
        <Select
          value={dataState.sortBy}
          label="Sort by"
          labelInline
          onChange={(evt, value) => updateSortBy(value)}
        >
          <SelectItem value="Default">Default</SelectItem>
          <SelectItem value="Lowest score">Lowest score</SelectItem>
          <SelectItem value="Highest score">Highest score</SelectItem>
        </Select>
      </div>


      <div>
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
                          color: scoreToColor(cat.score)?.color,
                          fontSize: '14px',
                        }}
                      >
                        &nbsp;{Math.round(cat.score)}%
                      </span>
                    </>
                  }
                />
                <CardBody style={{ paddingLeft: '20px' }}>
                  <div>
                    {rules[cat.name].scores.map((score) => {
                      const { entityCheck, accountCheck, valueCheck } = score;

                      const { passed = 0, failed = 0 } =
                        selectedDocument[`${cat.name}.scoring`]?.[score.name] ||
                        {};
                      const maxValue = passed + failed;

                      let label = undefined;
                      if (entityCheck) {
                        const value = Math.round(((passed) / maxValue) * 100)
                        label = `${isNaN(value) ? 0 : value}/100`;
                      } else if (accountCheck) {
                        label = passed >= 1 ? 'true' : 'false';
                      } else if (valueCheck) {
                        label = `${passed}`;
                      }

                      return (
                        <div
                          key={score.name}
                          style={{
                            width: '150px',
                            display: 'inline-block',
                            padding: '10px',
                          }}
                        >
                          <ProgressBar
                            height="15px"
                            value={passed}
                            label={label}
                            max={maxValue}
                            status={percentageToStatus((passed / maxValue) * 100)}
                          />
                          {score.name}
                        </div>
                      );
                    })}
                    {Object.keys(selectedDocument[`${cat.name}.entities`])
                      .length > 0 && (
                        <EntityTable
                          entities={selectedDocument[`${cat.name}.entities`]}
                        />
                      )}
                  </div>
                </CardBody>
              </Card>
            </div>
          );
        })}</div>
    </div>
  );
}
