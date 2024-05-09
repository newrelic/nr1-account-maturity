export default {
  scores: [
    {
      name: 'Has Dashboards',
      accountCheck: account =>
        ((account?.entityInfo?.types || []).find(t => t.type === 'DASHBOARD')
          ?.count || 0) > 0,
    },
    {
      name: 'Uses Flex',
      accountCheck: account =>
        (account.reportingEventTypes || []).includes('flexStatusSample'),
    },
    {
      name: 'Using Programmability',
      accountCheck: account => {
        return (
          (account?.data?.programDeployCount?.results?.[0]?.count || 0) > 0
        );
      },
    },
  ],
};
