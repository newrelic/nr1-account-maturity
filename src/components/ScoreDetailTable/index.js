import React from 'react';
import { Card, CardHeader, CardBody } from 'nr1';

export default function ScoreDetailsTable() {
  return (
    <div style={{ paddingLeft: '15px', paddingTop: '10px' }}>
      <Card collapsible>
        <CardHeader title="Card title" subtitle="This is a subtitle" />
        <CardBody style={{ paddingLeft: '20px' }}>
          Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do
          eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad
          minim veniam, quis nostrud exercitation ullamco laboris nisi ut
          aliquip ex ea commodo consequat. Duis aute irure dolor in
          reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla
          pariatur. Excepteur sint occaecat cupidatat non proident, sunt in
          culpa qui officia deserunt mollit anim id est laborum.
        </CardBody>
      </Card>
    </div>
  );
}
