/* eslint-disable */
import React, { useState, useEffect, useRef, useLayoutEffect } from 'react';
import {
  Popover,
  PopoverTrigger,
  PopoverBody,
  Card,
  CardBody,
  HeadingText,
} from 'nr1';
import { StatusIcon } from '@newrelic/nr-labs-components';

export default function NavigatorCard({ elementScores = [] }) {
  const [hexagons, setHexagons] = useState(null);
  const [width, setWidth] = useState(null);
  const wrapperRef = useRef();

  useEffect(() => {
    if (elementScores) {
      const sortedScores = sortByStatusAndScore(elementScores);
      setHexagons(
        sortedScores.map(({ status, name, score }, i) => (
          <Popover key={i} openOnHover>
            <PopoverTrigger>
              <StatusIcon
                status={status}
                style={{
                  width: '30px',
                  height: '36px',
                  margin: 1,
                  marginBottom: -7,
                }}
                // eslint-disable-next-line
                onClick={() => console.info(`Navigator clicked ${i}`)}
              />
            </PopoverTrigger>
            <PopoverBody>
              <Card>
                <CardBody>
                  <HeadingText type={HeadingText.TYPE.HEADING_4}>
                    {name}
                  </HeadingText>
                  <div className="score-label">
                    <span className={status}>{score}</span>
                  </div>
                </CardBody>
              </Card>
            </PopoverBody>
          </Popover>
        )),
      );
    }
  }, [elementScores]);

  useLayoutEffect(() => {
    const { width } = wrapperRef.current.getBoundingClientRect();
    setWidth(width);
  }, []);

  return (
    <div className="status-icons-wrapper" ref={wrapperRef}>
      <div className="status-icons-container" style={{ width }}>
        {width ? hexagons : null}
      </div>
    </div>
  );
}

function sortByStatusAndScore(arr) {
  const statusPriority = {
    critical: 1,
    warning: 2,
    success: 3,
  };

  return arr.sort((a, b) => {
    const statusDifference =
      statusPriority[a.status] - statusPriority[b.status];
    if (statusDifference !== 0) return statusDifference;

    const scoreA = parseFloat(a.score);
    const scoreB = parseFloat(b.score);

    return scoreA - scoreB;
  });
}
