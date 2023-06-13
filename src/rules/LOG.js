export default {
  scores: [
    {
      name: 'Using Logging',
      accountCheck: (account) =>
        (account?.data?.logMessageCount?.results?.[0]?.count || 0) > 0,
    },
    {
      name: 'Logging Alert Enabled',
      accountCheck: (account) =>
        (account?.data?.nrqlLoggingAlertCount?.nrqlConditionsSearch
          ?.totalCount || 0) > 0,
    },
  ],
};
