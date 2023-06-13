/* eslint-disable eslint-comments/disable-enable-pair */
/* eslint-disable prettier/prettier */

export default {
  scores: [
    {
      name: 'SNMP Devices',
      // porting this check to entity tag based
      // # How many devices are sending SNMP data
      // npmKentikProviders: nrql(query: "SELECT uniqueCount(device_name) FROM Metric where  instrumentation.provider='kentik' AND provider != 'kentik-agent' FACET device_name since 1 day ago limit max", timeout: 120) {
      //   results
      // }
      valueCheck: (account) => {
        const passed = account.entities.filter(
          (e) =>
            e.tags.find((t) => t.key === 'instrumentation.provider')
              ?.values?.[0] === 'kentik'
        ).length;

        const failed = 0;

        return { passed, failed };
      },
    },
    {
      name: 'Defined Entities',
      valueCheck: (account) => {
        let totalSnmpEntities = account.entities.filter(
          (e) =>
            e.tags.find((t) => t.key === 'instrumentation.provider')
              ?.values?.[0] === 'kentik'
        ).length;

        let kentikDefaultEntities = account.entities.filter(
          (e) =>
            e.tags.find((t) => t.key === 'instrumentation.provider')
              ?.values?.[0] === 'kentik-default'
        ).length;

        return { passed: totalSnmpEntities, failed: kentikDefaultEntities };
      },
    },
    {
      name: 'Defined Entities',
      valueCheck: (account) => {
        let totalSnmpEntities = account.entities.filter(
          (e) =>
            e.tags.find((t) => t.key === 'instrumentation.provider')
              ?.values?.[0] === 'kentik'
        ).length;

        let failed =
          account?.data?.npmNoEntityDefinitionDevices?.results?.[0]?.[
          'uniqueCount.device_name'
          ] || 0;

        let passed = totalSnmpEntities - failed;

        return { passed, failed };
      },
    },
    {
      name: 'SNMP Polling Failures',
      valueCheck: (account) => {
        let totalSnmpEntities = account.entities.filter(
          (e) =>
            e.tags.find((t) => t.key === 'instrumentation.provider')
              ?.values?.[0] === 'kentik'
        ).length;

        let failed =
          account?.data?.npmSnmpPollingFailures?.results?.[0]?.[
          'uniqueCount.device_name'
          ] || 0;

        let passed = totalSnmpEntities - failed;

        return { passed, failed };
      },
    },
    {
      name: 'VPC Flows',
      accountCheck: (account) =>
        (account.reportingEventTypes || []).includes('Log_VPC_Flows') ||
        (account.reportingEventTypes || []).includes('Log_VPC_Flows_AWS') ||
        (account.reportingEventTypes || []).includes('Log_VPC_Flows_GCP'),
    },
    {
      name: 'Network Flows',
      accountCheck: (account) =>
        (account.reportingEventTypes || []).includes('KFlow'),
    },
    {
      name: 'Network Syslogs',
      accountCheck: (account) =>
        (account?.data?.npmKtranslateSyslogDevices?.results?.[0]?.[
          'uniqueCount.device_name'
        ] || 0) > 0,
    },
  ],
};
