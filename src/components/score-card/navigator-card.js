import React, { useState, useEffect, useRef, useLayoutEffect } from 'react';
import PropTypes from 'prop-types';
import {
  Popover,
  PopoverTrigger,
  PopoverBody,
  Card,
  CardBody,
  HeadingText,
} from 'nr1';
import { StatusIcon } from '@newrelic/nr-labs-components';
import { STATUSES } from '../../constants';

const NavigatorCard = ({ elementScores = [] }) => {
  const [hexagons, setHexagons] = useState(null);
  const [width, setWidth] = useState(null);
  const wrapperRef = useRef();

  useEffect(() => {
    if (elementScores) {
      setHexagons(
        elementScores.map(({ status, name, score }, i) => (
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
        ))
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
};

NavigatorCard.propTypes = {
  elementScores: PropTypes.arrayOf(
    PropTypes.shape({
      name: PropTypes.string,
      status: PropTypes.oneOf(Object.values(STATUSES)),
      score: PropTypes.string,
    })
  ),
};

export default NavigatorCard;
