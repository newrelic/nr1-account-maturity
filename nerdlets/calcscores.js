module.exports = {

    calcApmScoreNew: (accountDataMap) => {
        let overallApmScoreMap = new Map()
        apmTable = []

        for (const account of Object.values(accountDataMap)){
            if (account.getReportingApps() > 0){
                apmObject = {}
                
    
                
                let results = []
                results["ACCOUNT_NAME"] = account.getName()
                results["ACCOUNT_ID"] = account.id
                results["APPS_TOTAL"] = account.getTotalApps() 
                results["APPS_REPORTING_PERCENTAGE"] = account.getReportingAppsPercent()
                results["APPS_ALERT_TARGETED_PERCENTAGE"] = account.getAlertingAppsPercent()
                results["APPS_CUSTOM_APDEX_PERCENTAGE"] = account.getCustomApdexAppsPercent()
                results["APPS_TARGETED_BY_LABELS_PERCENTAGE"] = account.getAppsWithLabelsPercent()
                results["APPS_DT_CAPABLE_PERCENTAGE"] = account.getDTCapableAppsPercent()
                results["APPS_DT_ENABLED_PERCENTAGE"] = account.getDTEnabledAppsPercent()
                results["APPS_WITH_DEPLOYMENTS_PERCENTAGE"] = account.getDeploymentAppsPercent()

                if (account.apiData){
                    results["APPS_TARGETTED_BY_KT_PERCENTAGE"] = account.getAppsWithKeyTxnsPercent()
                    results["ALERTING_KT_PERCENTAGE"] = account.getAlertingKeyTxnsPercent()
                    results["APPS_WITH_DEPLOYMENTS_PERCENTAGE"] = account.getDeploymentAppsPercent()
                    results["MATURITY_SCORE"] = Math.round(((
                        results["APPS_REPORTING_PERCENTAGE"] * .03 +
                        results["APPS_ALERT_TARGETED_PERCENTAGE"] * .2 +
                        results["APPS_CUSTOM_APDEX_PERCENTAGE"] * .1 +
                        results["APPS_TARGETED_BY_LABELS_PERCENTAGE"] * .12 +
                        results["APPS_DT_CAPABLE_PERCENTAGE"] * .05 +
                        results["APPS_DT_ENABLED_PERCENTAGE"] * .15 +
                        results["APPS_TARGETTED_BY_KT_PERCENTAGE"] * .08 +
                        results["ALERTING_KT_PERCENTAGE"] * .12 +
                        results["APPS_WITH_DEPLOYMENTS_PERCENTAGE"] * .15) / 100) * 100)
                }
                else{
                    results["APPS_TARGETTED_BY_KT_PERCENTAGE"] =  "api key required"
                    results["ALERTING_KT_PERCENTAGE"] = "api key required"
                    results["MATURITY_SCORE"] = Math.round(((
                        results["APPS_REPORTING_PERCENTAGE"] * .1 +
                        results["APPS_ALERT_TARGETED_PERCENTAGE"] * .2 +
                        results["APPS_CUSTOM_APDEX_PERCENTAGE"] * .1 +
                        results["APPS_TARGETED_BY_LABELS_PERCENTAGE"] * .12 +
                        results["APPS_DT_CAPABLE_PERCENTAGE"] * .05 +
                        results["APPS_DT_ENABLED_PERCENTAGE"] * .13) / 70)
                        * 100)
                }

                apmObject.ACCOUNT_NAME = results["ACCOUNT_NAME"],
                apmObject.ACCOUNT_ID = results["ACCOUNT_ID"],
                apmObject.APPS_TOTAL = results["APPS_TOTAL"],
                apmObject.APPS_REPORTING_PERCENTAGE = results["APPS_REPORTING_PERCENTAGE"],
                apmObject.APPS_ALERT_TARGETED_PERCENTAGE = results["APPS_ALERT_TARGETED_PERCENTAGE"],
                apmObject.APPS_CUSTOM_APDEX_PERCENTAGE = results["APPS_CUSTOM_APDEX_PERCENTAGE"],
                apmObject.APPS_TARGETED_BY_LABELS_PERCENTAGE = results["APPS_TARGETED_BY_LABELS_PERCENTAGE"],
                apmObject.APPS_DT_CAPABLE_PERCENTAGE = results["APPS_DT_CAPABLE_PERCENTAGE"],
                apmObject.APPS_DT_ENABLED_PERCENTAGE = results["APPS_DT_ENABLED_PERCENTAGE"],
                apmObject.APPS_TARGETTED_BY_KT_PERCENTAGE = results["APPS_TARGETTED_BY_KT_PERCENTAGE"],
                apmObject.ALERTING_KT_PERCENTAGE = results["ALERTING_KT_PERCENTAGE"],
                apmObject.APPS_WITH_DEPLOYMENTS_PERCENTAGE = results["APPS_WITH_DEPLOYMENTS_PERCENTAGE"],
                apmObject.MATURITY_SCORE = results["MATURITY_SCORE"]

                apmTable.push(apmObject)

                /* apmTable.push(
                    [
                        results["ACCOUNT_NAME"],
                        results["ACCOUNT_ID"],
                        results["APPS_TOTAL"],
                        results["APPS_REPORTING_PERCENTAGE"],
                        results["APPS_ALERT_TARGETED_PERCENTAGE"],
                        results["APPS_CUSTOM_APDEX_PERCENTAGE"],
                        results["APPS_TARGETED_BY_LABELS_PERCENTAGE"],
                        results["APPS_DT_CAPABLE_PERCENTAGE"],
                        results["APPS_DT_ENABLED_PERCENTAGE"],
                        results["APPS_TARGETTED_BY_KT_PERCENTAGE"],
                        results["ALERTING_KT_PERCENTAGE"],
                        results["APPS_WITH_DEPLOYMENTS_PERCENTAGE"],
                        results["MATURITY_SCORE"]
                    ]
                ) */
                overallApmScoreMap.set(results["ACCOUNT_ID"],results["MATURITY_SCORE"])
            }    
        }
        return [apmTable,overallApmScoreMap]
    },

    calcBrowserScoreNew: (accountDataMap) => {
        let overallBrowserScoreMap = new Map()
        let browserTable = []

        for (const account of Object.values(accountDataMap)){
            debugger
            if (account.getBrowserReportingApps() > 0){
                browserObject = {}

                let results = []
                results["ACCOUNT_NAME"] = account.getName()
                results["ACCOUNT_ID"] = account.id
                results["APPS_TOTAL"] = account.getBrowserTotalApps() 
                results["APPS_REPORTING_PERCENTAGE"] = account.getBrowserReportingAppsPercent()
                results["APPS_ALERT_TARGETED_PERCENTAGE"] = account.getBrowserAlertingAppsPercent()
                results["APPS_CUSTOM_APDEX_PERCENTAGE"] = account.getBrowserCustomApdexAppsPercent()
                results["APPS_TARGETED_BY_LABELS_PERCENTAGE"] = account.getBrowserAppsWithLabelsPercent()
                results["APPS_BROWSER_INTERACTIONS_PERCENTAGE"] = account.getBrowserInteractionEnabledAppsPercent()
                results["APPS_AUTOINSTRUMENTATION_PERCENTAGE"] = account.getAutoInstrumentationAppsPercent()
                results["APPS_SPAAGENTENABLED_PERCENTAGE"] = account.getSpaAgentEnabledAppsPercent()

                results["MATURITY_SCORE"] = Math.round(((
                    results["APPS_REPORTING_PERCENTAGE"] * .1 +
                    results["APPS_ALERT_TARGETED_PERCENTAGE"] * .2 +
                    results["APPS_CUSTOM_APDEX_PERCENTAGE"] * .1 +
                    results["APPS_BROWSER_INTERACTIONS_PERCENTAGE"] * .2 +
                    results["APPS_AUTOINSTRUMENTATION_PERCENTAGE"] * .1
                ) / 70)
                    * 100)


                    browserObject.ACCOUNT_NAME = results["ACCOUNT_NAME"],
                    browserObject.ACCOUNT_ID = results["ACCOUNT_ID"],
                    browserObject.APPS_TOTAL = results["APPS_TOTAL"],
                    browserObject.APPS_REPORTING_PERCENTAGE = results["APPS_REPORTING_PERCENTAGE"],
                    browserObject.APPS_ALERT_TARGETED_PERCENTAGE = results["APPS_ALERT_TARGETED_PERCENTAGE"],
                    browserObject.APPS_CUSTOM_APDEX_PERCENTAGE = results["APPS_CUSTOM_APDEX_PERCENTAGE"],
                    browserObject.APPS_TARGETED_BY_LABELS_PERCENTAGE = results["APPS_TARGETED_BY_LABELS_PERCENTAGE"],
                    browserObject.APPS_BROWSER_INTERACTIONS_PERCENTAGE = results["APPS_BROWSER_INTERACTIONS_PERCENTAGE"],
                    browserObject.APPS_AUTOINSTRUMENTATION_PERCENTAGE = results["APPS_AUTOINSTRUMENTATION_PERCENTAGE"],
                    browserObject.APPS_SPAAGENTENABLED_PERCENTAGE = results["APPS_SPAAGENTENABLED_PERCENTAGE"],
                    browserObject.MATURITY_SCORE = results["MATURITY_SCORE"]

                    browserTable.push(browserObject)
                /* browserTable.push(
                    [
                        results["ACCOUNT_NAME"],
                        results["ACCOUNT_ID"],
                        results["APPS_TOTAL"],
                        results["APPS_REPORTING_PERCENTAGE"],
                        results["APPS_ALERT_TARGETED_PERCENTAGE"],
                        results["APPS_CUSTOM_APDEX_PERCENTAGE"],
                        results["APPS_BROWSER_INTERACTIONS_PERCENTAGE"],
                        results["APPS_AUTOINSTRUMENTATION_PERCENTAGE"],
                        results["MATURITY_SCORE"]
                    ]
                ) */
                overallBrowserScoreMap.set(results["ACCOUNT_ID"],results["MATURITY_SCORE"])
            }    
        }
        return [browserTable, overallBrowserScoreMap]
    },

    calcAlertScore: (accountDataMap) => {
        let overallAlertScoreMap = new Map()
        let alertTable = []

        for (const account of accountDataMap.values()){
            if (account.getPoliciesWithConditions() > 0) {
                
                let results = []
                results["ACCOUNT_NAME"] = account.getName()
                results["ACCOUNT_ID"] = account.id
                results["APPS_TOTAL"] = account.getTotalApps() 
                results["APPS_ALERT_TARGETED_PERCENTAGE"] = account.getAlertingAppsPercent()

                if (account.apiData) {
                    results["CHANNELS_NOT_EMAIL_PERCENTAGE"] = account.getPolicyChannelsNotEmailPercent()
                    results["OPEN_INCIDENTS_PERCENTAGE"] = account.getTotalIncidentsMoreThanADayPercent()
                    results["ALERTING_KT_PERCENTAGE"] = account.getAlertingKeyTxnsPercent()
                    results["ACTIVE_CHANNELS_PERCENTAGE"] = account.getActiveChannelPercent()
                    results["POLICY_NRQL_PERCENTAGE"] = account.getPoliciesWithNrqlPercent()
                    results["POLICY_CONDITIONS_PERCENTAGE"] = account.getPoliciesWithConditions()
                }
                else {
                    results["CHANNELS_NOT_EMAIL_PERCENTAGE"] = "api key required"
                    results["OPEN_INCIDENTS_PERCENTAGE"] = "api key required"
                    results["ALERTING_KT_PERCENTAGE"] = "api key required"
                    results["ACTIVE_CHANNELS_PERCENTAGE"] = "api key required"
                    results["POLICY_NRQL_PERCENTAGE"] = "api key required"
                    results["POLICY_CONDITIONS_PERCENTAGE"] = "api key required"
                }
                results["MATURITY_SCORE"] = account.getAlertScore()

                alertTable.push(
                    [
                        results["ACCOUNT_NAME"],
                        results["ACCOUNT_ID"],
                        results["APPS_TOTAL"],
                        results["APPS_ALERT_TARGETED_PERCENTAGE"],
                        results["CHANNELS_NOT_EMAIL_PERCENTAGE"],
                        results["OPEN_INCIDENTS_PERCENTAGE"],
                        results["ALERTING_KT_PERCENTAGE"],
                        results["ACTIVE_CHANNELS_PERCENTAGE"],
                        results["POLICY_NRQL_PERCENTAGE"],
                        results["POLICY_CONDITIONS_PERCENTAGE"],
                        results["MATURITY_SCORE"]
                    ]
                )
                overallAlertScoreMap.set(results["ACCOUNT_ID"],results["MATURITY_SCORE"])
            }    
        }
        return [alertTable,overallAlertScoreMap]
    },
}