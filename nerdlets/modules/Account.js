// import { AlertPolicy } from './AlertPolicy.js'
import React from 'react'

class Account {

    constructor(id) {
        this.id = id
        this.name = name
        this.alertPolicies = null; // Map
        this.apmApps = null //Map
        this.activeChannels = null //Set
        this.apiKey = null
        this.apiData = false
        this.accountDT = false
    }

    getName() {
        if (this.name) {
            return this.name
        }
        return 0
    }

    getTotalPolicies() {
        if (this.alertPolicies) {
            return this.alertPolicies.size
        }
        return 0
    }

    getOpenIncidents() {
        let total = 0
        if (!this.alertPolicies) {
            return total
        }

        for (var policy of this.alertPolicies.values()) {
            total += policy.getOpenIncidents()
        }
        return total
    }

    getTotalIncidentsMoreThanADay() {
        let total = 0
        if (!this.alertPolicies) {
            return total
        }

        for (var policy of this.alertPolicies.values()) {
            total += policy.getTotalIncidentsMoreThanADay()
        }
        return total
    }

    getTotalIncidentsMoreThanADayPercent() {
        return Math.round(
            this.getTotalIncidentsMoreThanADay() / this.getOpenIncidents() * 100)
            || 0
    }

    getPolicyChannelsNotEmail() {
        let total = 0
        if (!this.alertPolicies) {
            return total
        }

        for (var policy of this.alertPolicies.values()) {
            if (policy.isChannelNotEmail()) {
                total++
            }
        }

        return total
    }

    getPolicyChannelsNotEmailPercent() {
        return Math.round(
            this.getPolicyChannelsNotEmail() / this.getTotalPolicies() * 100)
            || 0
    }

    getActiveChannelPercent() {
        let percentValue = 0
        if (this.activeChannels) {
            switch(this.activeChannels.size) {
                case 0:
                    percentValue = 0
                    break
                case 1:
                    percentValue = 25
                    break
                case 2:
                    percentValue = 50
                    break
                case 3:
                    percentValue = 75
                    break
                default:
                    percentValue = 100
                    break
            }
        }
        return percentValue
    }

    getPoliciesWithNrql() {
        let total = 0
        if (!this.alertPolicies) {
            return total
        }

        for (var policy of this.alertPolicies.values()) {
            if (policy.getTotalNrql() > 0) {
                total++
            }
        }

        return total
    }

    getPoliciesWithNrqlPercent() {
        return Math.round(
            this.getPoliciesWithNrql() / this.getTotalPolicies() * 100)
            || 0
    }

    getPoliciesWithConditions() {
        let total = 0
        if (!this.alertPolicies) {
            return total
        }

        let quotient = (100 / this.getTotalPolicies()) / 100
        for (var policy of this.alertPolicies.values()) {
            total += policy.getTotalConditionScore()
        }

        return Math.round(total * quotient) || 0
    }

    getAlertScore() {
        let score = 0

        if (this.apiData) {
            score =
                (this.getAlertingAppsPercent() * .3) +
                (this.getPolicyChannelsNotEmailPercent() * .15) +
                ((100 - this.getTotalIncidentsMoreThanADayPercent()) * .15) +
                (this.getAlertingKeyTxnsPercent() * .1) +
                (this.getActiveChannelPercent() * .1) +
                (this.getPoliciesWithNrqlPercent() * .1) +
                (this.getPoliciesWithConditions() * .1)
        } else {
            score =
                (this.getAlertingAppsPercent() * .3)
        }

        return Math.round(score)
    }

    getTotalApps() {
        if (this.apmApps) {
            return this.apmApps.size
        }
        return 0
    }

    getReportingApps() {
        let total = 0
        if (!this.apmApps) {
            return total
        }

        for (let app of this.apmApps.values()) {
            if (app.reporting) {
                total++
            }
        }
        return total
    }

    getReportingAppsPercent() {
        return Math.round(
            this.getReportingApps() / this.getTotalApps() * 100) 
            || 0 
    }

    getDeploymentApps() {
        let total = 0
        if (!this.apmApps) {
            return total
        }

        for (let app of this.apmApps.values()) {
            if (app.deployMarker) {
                total++
            }
        }
        return total
    }

    getDeploymentAppsPercent() {
        let totalReportingApps = this.getReportingApps()
        totalReportingApps = totalReportingApps < 10 ? totalReportingApps : 10

        return Math.round(
            this.getDeploymentApps() / totalReportingApps * 100) 
            || 0 
    }

    getCustomApdexApps() {
        let total = 0
        if (!this.apmApps) {
            return total
        }

        for (let app of this.apmApps.values()) {
            if (app.isCustomApdex()) {
                total++
            }
        }
        return total
    }


    getCustomApdexAppsPercent() {
        return Math.round(
            this.getCustomApdexApps() / this.getReportingApps() * 100) 
            || 0 
    }

    getDTCapableApps() {
        let total = 0
        if (!this.apmApps) {
            return total
        }

        for (let app of this.apmApps.values()) {
            if (app.isDTCapable()) {
                total++
            }
        }
        return total
    }

    getDTCapableAppsPercent() {
        return Math.round(
            this.getDTCapableApps() / this.getReportingApps() * 100) 
            || 0 
    }

    getDTEnabledApps() {
        let total = 0
        if (!this.apmApps) {
            return total
        }

        for (let app of this.apmApps.values()) {
            if (app.isDTEnabled()) {
                total++
            }
        }
        return total
    }

    getDTEnabledAppsPercent() {
        return Math.round(
            this.getDTEnabledApps() / this.getReportingApps() * 100) 
            || 0 
    }


    getAlertingApps() {
        let total = 0
        if (!this.apmApps) {
            return total
        }

        for (let app of this.apmApps.values()) {
            if (app.isAlerting()) {
                total++
            }
        }
        return total
    }

    getAlertingAppsPercent() {
        return Math.round(
            this.getAlertingApps() / this.getReportingApps() * 100) 
            || 0 
    }

    getAppsWithLabels() {
        let total = 0
        if (!this.apmApps) {
            return total
        }

        for (let app of this.apmApps.values()) {
            if (app.hasLabels()) {
                total++
            }
        }
        return total
    }

    getAppsWithLabelsPercent() {
        return Math.round(
            this.getAppsWithLabels() / this.getReportingApps() * 100) 
            || 0 
    }

    getAppsWithKeyTxns() {
        let total = 0
        if (!this.apmApps) {
            return total
        }

        for (let app of this.apmApps.values()) {
            if (app.hasReportingKeyTxns()) {
                total++
            }
        }
        return total
    }

    getAppsWithKeyTxnsPercent() {
        return Math.round(
            this.getAppsWithKeyTxns() / this.getReportingApps() * 100) 
            || 0 
    }

    getAlertingKeyTxns() {
        let total = 0
        if (!this.apmApps) {
            return total
        }

        for (let app of this.apmApps.values()) {
            total += app.getAlertingKeyTxns()
        }
        return total
    }

    getAlertingKeyTxnsPercent() {
        let totalReportingKTs = 0
        if (!this.apmApps) {
            return 0
        }

        for (let app of this.apmApps.values()) {
            totalReportingKTs += app.getReportingKeyTxns()
        }

        return Math.round(
            this.getAlertingKeyTxns() / totalReportingKTs * 100) 
            || 0 
    }

    getReportingAppsArray() {
        let reportingArray = []
        let nonReportingArray = []
        if (!this.apmApps) {
            return [reportingArray, nonReportingArray]
        }

        for (let app of this.apmApps.values()) {
            if (app.reporting) {
                reportingArray.push(<a href={"https://rpm.newrelic.com/accounts/" + this.id + '/applications/' + app.id}> {app.name} </a>)
            }
            else{
                nonReportingArray.push(<a href={"https://rpm.newrelic.com/accounts/" + this.id + '/applications/' + app.id}> {app.name} </a>)
            }
        }
        return [reportingArray, nonReportingArray, 'Reporting Apps']
    }

    getCustomApdexAppsArray() {
        let customApdexArray = []
        let noncustomApdexArray = []

        if (!this.apmApps) {
            return [customApdexArray, noncustomApdexArray]
        }

        for (let app of this.apmApps.values()) {
            if (app.reporting){
                if (app.isCustomApdex()) {
                    customApdexArray.push(<a href={"https://rpm.newrelic.com/accounts/" + this.id + '/applications/' + app.id}> {app.name} </a>)
                }
                else{
                    noncustomApdexArray.push(<a href={"https://rpm.newrelic.com/accounts/" + this.id + '/applications/' + app.id}> {app.name} </a>)
    
                }
            }
        }
        return [customApdexArray, noncustomApdexArray, 'Custom Apdex Reporting Apps']
    }

    getAlertingAppsArray() {
        let alertingArray = []
        let nonalertingArray = []

        if (!this.apmApps) {
            return [alertingArray, nonalertingArray]
        }

        for (let app of this.apmApps.values()) {
            if (app.reporting){
                if (app.isAlerting()) {
                    alertingArray.push(<a href={"https://rpm.newrelic.com/accounts/" + this.id + '/applications/' + app.id}> {app.name} </a>)
                }
                else{
                    nonalertingArray.push(<a href={"https://rpm.newrelic.com/accounts/" + this.id + '/applications/' + app.id}> {app.name} </a>)
    
                }
            }
        }
        return [alertingArray, nonalertingArray, 'Alert Enabled Reporting Apps']
    }

    getLabelAppsArray() {
        let labelArray = []
        let nonlabelArray = []

        if (!this.apmApps) {
            return [labelArray, nonlabelArray, 'Labelled Reporting Apps']
        }

        for (let app of this.apmApps.values()) {
            if (app.reporting){
                if (app.hasLabels()) {
                    labelArray.push(<a href={"https://rpm.newrelic.com/accounts/" + this.id + '/applications/' + app.id}> {app.name} </a>)
                }
                else{
                    nonlabelArray.push(<a href={"https://rpm.newrelic.com/accounts/" + this.id + '/applications/' + app.id}> {app.name} </a>)
    
                }
            }
        }
        return [labelArray, nonlabelArray, 'Labelled Reporting Apps']
    }

    getDTAppsArray() {
        let dtEnabledArray = []
        let nonDtEnabledArray = []
        if (!this.apmApps) {
            return [dtEnabledArray, nonDtEnabledArray, 'Distributed Tracing Enabled Reporting Apps']
        }

        for (let app of this.apmApps.values()) {
            if (app.isDTEnabled()) {
                dtEnabledArray.push(<a href={"https://rpm.newrelic.com/accounts/" + this.id + '/applications/' + app.id}> {app.name} </a>)
            }
            else{
                nonDtEnabledArray.push(<a href={"https://rpm.newrelic.com/accounts/" + this.id + '/applications/' + app.id}> {app.name} </a>)
            }
        }
        return [dtEnabledArray, nonDtEnabledArray, 'Distributed Tracing Enabled Reporting Apps']
    }

    getDTCapableAppsArray() {
        let dtCapableArray = []
        let nondtCapableArray = []
        if (!this.apmApps) {
            return [dtCapableArray, nondtCapableArray, 'Distributed Tracing Capable Reporting Agent Versions']
        }

        for (let app of this.apmApps.values()) {
            if (app.reporting){
            if (app.isDTCapable()) {
                dtCapableArray.push(<a href={"https://rpm.newrelic.com/accounts/" + this.id + '/applications/' + app.id}> {app.name} </a>)
            }
            else{
                nondtCapableArray.push(<a href={"https://rpm.newrelic.com/accounts/" + this.id + '/applications/' + app.id}> {app.name} </a>)
            }
        }
        }
        return [dtCapableArray, nondtCapableArray, 'Distributed Tracing Capable Reporting Agent Versions']
    }


    getAppsWithKeyTxnsArray() {
        let keyTxnsArray = []
        let nonkeyTxnsArray = []
        if (!this.apmApps) {
            return [keyTxnsArray, nonkeyTxnsArray, 'Key Transaction Targeted Apps']
        }

        for (let app of this.apmApps.values()) {
            if (this.apiData && app.reporting){
            if (app.hasReportingKeyTxns()) {
                keyTxnsArray.push(<a href={"https://rpm.newrelic.com/accounts/" + this.id + '/applications/' + app.id}> {app.name} </a>)
            }
            else{
                nonkeyTxnsArray.push(<a href={"https://rpm.newrelic.com/accounts/" + this.id + '/applications/' + app.id}> {app.name} </a>)
            }
        }
        }
        return [keyTxnsArray, nonkeyTxnsArray, 'Key Transaction Targeted Apps']
    }

    getAlertingKeyTxnsArray() {
        let alertingKeyTxnsArray = []
        let nonalertingKeyTxnsArray = []
        if (!this.apmApps) {
            return [alertingKeyTxnsArray, nonalertingKeyTxnsArray, 'Alerting Key Transactions']
        }

        for (let app of this.apmApps.values()) {
            if (this.apiData){
                if (app.hasReportingKeyTxns()) {
                    for (let kt of app.keyTxns) {
                        if (kt.isAlerting()) {
                            alertingKeyTxnsArray.push(<a href={"https://rpm.newrelic.com/accounts/" + this.id + '/key_transactions/' + kt.id}> {kt.name} </a>)
                        }
                        else{
                            nonalertingKeyTxnsArray.push(<a href={"https://rpm.newrelic.com/accounts/" + this.id + '/key_transactions/' + kt.id}> {kt.name} </a>)
                        }
                    }
                }
            }
        }
        return [alertingKeyTxnsArray, nonalertingKeyTxnsArray, 'Alerting Key Transactions']
    }

    getDeploymentAppsArray() {
        let deploymentsAppsArray = []
        let nondeploymentsAppsArray = []
        if (!this.apmApps) {
            return [deploymentsAppsArray, nondeploymentsAppsArray, 'Distributed Tracing Capable Reporting Agent Versions']
        }

        for (let app of this.apmApps.values()) {
            if (app.reporting){
            if (app.deployMarker) {
                deploymentsAppsArray.push(<a href={"https://rpm.newrelic.com/accounts/" + this.id + '/applications/' + app.id}> {app.name} </a>)
            }
            else{
                nondeploymentsAppsArray.push(<a href={"https://rpm.newrelic.com/accounts/" + this.id + '/applications/' + app.id}> {app.name} </a>)
            }
        }
        }
        return [deploymentsAppsArray, nondeploymentsAppsArray, 'Distributed Tracing Capable Reporting Agent Versions']
    }

    getPolicyChannelsNotEmailArray() {
        let policyNotEmailArray = []
        let nonPolicyNotEmailArray = []

        if (!this.alertPolicies) {
            return [policyNotEmailArray, nonPolicyNotEmailArray, 'Policies With Channels != Email', 'Policies With Channels = Email or None']
        }

        for (var policy of this.alertPolicies.values()) {
            if (policy.isChannelNotEmail()) {
                policyNotEmailArray.push(<a href={"https://alerts.newrelic.com/accounts/" + this.id + '/policies/' + policy.id + '/channels'}> {policy.name} </a>)
            } else {
                nonPolicyNotEmailArray.push(<a href={"https://alerts.newrelic.com/accounts/" + this.id + '/policies/' + policy.id + '/channels'}> {policy.name} </a>)
            }
        }

        return [policyNotEmailArray, nonPolicyNotEmailArray, 'Policies With Channels != Email', 'Policies With Channels = Email or None']
    }

    getIncidentsMoreThanADayArray() {
        let incidentsNotMoreThanADayArray = []
        let incidentsMoreThanADayArray = []

        if (!this.alertPolicies) {
            return [incidentsNotMoreThanADayArray, incidentsMoreThanADayArray, 'Open Incidents Less Than A Day', 'Open Incidents Older Than A Day']
        }

        for (var policy of this.alertPolicies.values()) {
            if (policy.hasIncidentsMoreThanADay()) {
                let incidents = policy.getIncidentsMoreThanADay()
                for (let incident of incidents) {
                    incidentsMoreThanADayArray.push(<a href={"https://alerts.newrelic.com/accounts/" + this.id + '/incidents/' + incident.id + '/violations'}> {incident.id} </a>)
                }
            } else {
                let incidents = policy.getIncidentsNotMoreThanADay()
                for (let incident of incidents) {
                    incidentsNotMoreThanADayArray.push(<a href={"https://alerts.newrelic.com/accounts/" + this.id + '/incidents/' + incident.id + '/violations'}> {incident.id} </a>)
                }
            }
        }
        return [incidentsNotMoreThanADayArray, incidentsMoreThanADayArray, 'Open Incidents Less Than A Day', 'Open Incidents Older Than A Day']
    }

    getActiveChannelsArray() {
        let activeChannelsArray = []
        let inactiveChannelsArray = []
        let allChannels = ["campfire", "email", "hipchat", "opsgenie", "pagerduty", "slack", "victorops", "webhook"]

        if (!this.activeChannels) {
            inactiveChannelsArray = allChannels.map(channel =>
                <a href={"https://alerts.newrelic.com/accounts/" + this.id + '/channels/new'}> {channel} </a> //eslint-disable-line
            )
            return [activeChannelsArray, inactiveChannelsArray, 'Active Channels']
        }

        inactiveChannelsArray = allChannels.filter(x => !this.activeChannels.has(x)).map(channel =>
            <a href={"https://alerts.newrelic.com/accounts/" + this.id + '/channels/new'}> {channel} </a> //eslint-disable-line
        )

        for (var channel of this.activeChannels.values()) {
            activeChannelsArray.push(<a href={"https://alerts.newrelic.com/accounts/" + this.id + '/channels?offset=0&text=' + channel}> {channel} </a>)
        }
        return [activeChannelsArray, inactiveChannelsArray, 'Active Channels']
    }

    getPoliciesWithNrqlArray() {
        let policyWithNrqlArray = []
        let policyWithoutNrqlArray = []

        if (!this.alertPolicies) {
            return [policyWithNrqlArray, policyWithoutNrqlArray, 'NRQL Policies']
        }

        for (var policy of this.alertPolicies.values()) {
            if (policy.hasNrqlConditions()) {
                policyWithNrqlArray.push(<a href={"https://alerts.newrelic.com/accounts/" + this.id + '/policies/' + policy.id}> {policy.name} </a>)
            } else {
                policyWithoutNrqlArray.push(<a href={"https://alerts.newrelic.com/accounts/" + this.id + '/policies/' + policy.id}> {policy.name} </a>)
            }
        }

        return [policyWithNrqlArray, policyWithoutNrqlArray, 'NRQL Policies']
    }

    getPoliciesWithConditionsArray() {
        let policyWithCondArray = []
        let policyWithLessCondArray = []

        if (!this.alertPolicies) {
            return [policyWithCondArray, policyWithLessCondArray, 'Policies With At Least 4 Conditions', 'Policies With Less Than 4 Conditions']
        }

        for (var policy of this.alertPolicies.values()) {
            if (policy.getTotalConditionScore() >= 80) {
                policyWithCondArray.push(<a href={"https://alerts.newrelic.com/accounts/" + this.id + '/policies/' + policy.id}> {policy.name} </a>)
            } else {
                policyWithLessCondArray.push(<a href={"https://alerts.newrelic.com/accounts/" + this.id + '/policies/' + policy.id}> {policy.name} </a>)
            }
        }

        return [policyWithCondArray, policyWithLessCondArray, 'Policies With At Least 4 Conditions', 'Policies With Less Than 4 Conditions']
    }

    //BROWSER METHODS
    getBrowserTotalApps() {
        if (this.browserApps) {
            return this.browserApps.size
        }
        return 0
    }

    getBrowserReportingApps() {
        let total = 0
        if (!this.browserApps) {
            return total
        }

        for (let app of this.browserApps.values()) {
            if (app.reporting) {
                total++
            }
        }
        return total
    }

    getBrowserReportingAppsPercent() {
        return Math.round(
            this.getBrowserReportingApps() / this.getBrowserTotalApps() * 100) 
            || 0 
    }

    getBrowserReportingAppsArray() {
        let reportingArray = []
        let nonreportingArray = []

        if (!this.browserApps) {
            return [reportingArray, nonreportingArray, 'Reporting Browser Apps']
        }

        for (let app of this.browserApps.values()) {
            if (app.reporting) {
                reportingArray.push(<a href={"https://rpm.newrelic.com/accounts/" + this.id + '/browser/' + app.id}> {app.name} </a>)
            }
            else{
                nonreportingArray.push(<a href={"https://rpm.newrelic.com/accounts/" + this.id + '/browser/' + app.id}> {app.name} </a>)
            }
        }
        return [reportingArray, nonreportingArray, 'Reporting Browser Apps']
    }

    getBrowserAlertingApps() {
        let total = 0
        if (!this.browserApps) {
            return total
        }

        for (let app of this.browserApps.values()) {
            if (app.isAlerting()) {
                total++
            }
        }
        return total
    }

    getBrowserAlertingAppsPercent() {
        return Math.round(
            this.getBrowserAlertingApps() / this.getBrowserReportingApps() * 100) 
            || 0 
    }

    getBrowserAlertingAppsArray() {
        let alertingArray = []
        let nonalertingArray = []

        if (!this.browserApps) {
            return [alertingArray, nonalertingArray, 'Alerting Browser Apps']
        }

        for (let app of this.browserApps.values()) {
            if (app.isAlerting()) {
                alertingArray.push(<a href={"https://rpm.newrelic.com/accounts/" + this.id + '/browser/' + app.id}> {app.name} </a>)
            }
            else{
                nonalertingArray.push(<a href={"https://rpm.newrelic.com/accounts/" + this.id + '/browser/' + app.id}> {app.name} </a>)
            }
        }
        return [alertingArray, nonalertingArray, 'Alerting Browser Apps']
    }

    getBrowserAppsWithLabels() {
        let total = 0
        if (!this.browserApps) {
            return total
        }

        for (let app of this.browserApps.values()) {
            if (app.hasLabels()) {
                total++
            }
        }
        return total
    }

    getBrowserAppsWithLabelsPercent() {
        return Math.round(
            this.getBrowserAppsWithLabels() / this.getBrowserReportingApps() * 100) 
            || 0 
    }

    getBrowserAppsWithLabelsArray() {
        let labelArray = []
        let nonlabelArray = []
        if (!this.browserApps) {
            return [labelArray,nonlabelArray, 'Labelled Apps']
        }

        for (let app of this.browserApps.values()) {
            if (app.hasLabels()) {
                labelArray.push(<a href={"https://rpm.newrelic.com/accounts/" + this.id + '/browser/' + app.id}> {app.name} </a>)
            }
            else{
                nonlabelArray.push(<a href={"https://rpm.newrelic.com/accounts/" + this.id + '/browser/' + app.id}> {app.name} </a>)
            }
        }
        return [labelArray,nonlabelArray, 'Labelled Apps']
    }

    getBrowserCustomApdexApps() {
        let total = 0
        if (!this.browserApps) {
            return total
        }

        for (let app of this.browserApps.values()) {
            if (app.isCustomApdex()) {
                total++
            }
        }
        return total
    }


    getBrowserCustomApdexAppsPercent() {
        return Math.round(
            this.getBrowserCustomApdexApps() / this.getBrowserReportingApps() * 100) 
            || 0 
    }

    getBrowserCustomApdexAppsArray() {
        let customapdexArray = []
        let noncustomapdexArray = []
        if (!this.browserApps) {
            return [customapdexArray, noncustomapdexArray, 'Custom Apdex Browser Apps']
        }

        for (let app of this.browserApps.values()) {
            if (app.isCustomApdex()) {
                customapdexArray.push(<a href={"https://rpm.newrelic.com/accounts/" + this.id + '/browser/' + app.id}> {app.name} </a>)
            }
            else{
                noncustomapdexArray.push(<a href={"https://rpm.newrelic.com/accounts/" + this.id + '/browser/' + app.id}> {app.name} </a>)
            }
        }
        return [customapdexArray, noncustomapdexArray, 'Custom Apdex Browser Apps']
    }

    getBrowserInteractionEnabledApps() {
        let total = 0
        if (!this.browserApps) {
            return total
        }

        for (let app of this.browserApps.values()) {
            if (app.browserInteractions) {
                total++
            }
        }
        return total
    }

    getBrowserInteractionEnabledAppsPercent() {
        return Math.round(
            this.getBrowserInteractionEnabledApps() / this.getBrowserReportingApps() * 100) 
            || 0 
    }

    getBrowserInteractionEnabledAppsArray() {
        let browserinteractionArray = []
        let nonbrowserinteractionArray = []
        if (!this.browserApps) {
            return [browserinteractionArray, nonbrowserinteractionArray, 'Browser Interactions Apps']
        }

        for (let app of this.browserApps.values()) {
            if (app.browserInteractions) {
                browserinteractionArray.push(<a href={"https://rpm.newrelic.com/accounts/" + this.id + '/browser/' + app.id}> {app.name} </a>)
            }
            else{
                nonbrowserinteractionArray.push(<a href={"https://rpm.newrelic.com/accounts/" + this.id + '/browser/' + app.id}> {app.name} </a>)
            }
        }
        return [browserinteractionArray, nonbrowserinteractionArray, 'Browser Interactions Apps']
    }

    getAutoInstrumentationApps() {
        let total = 0
        if (!this.browserApps) {
            return total
        }

        for (let app of this.browserApps.values()) {
            if (app.autoInstrumentation) {
                total++
            }
        }
        return total
    }

    getAutoInstrumentationAppsPercent() {
        return Math.round(
            this.getAutoInstrumentationApps() / this.getBrowserReportingApps() * 100) 
            || 0 
    }

    getAutoInstrumentationAppsArray() {
        let autoinstrumentationArray = []
        let nonautoinstrumentationArray = []
        if (!this.browserApps) {
            return [autoinstrumentationArray, nonautoinstrumentationArray, 'Auto Instrumentation Apps']
        }

        for (let app of this.browserApps.values()) {
            if (app.autoInstrumentation) {
                autoinstrumentationArray.push(<a href={"https://rpm.newrelic.com/accounts/" + this.id + '/browser/' + app.id}> {app.name} </a>)
            }
            else{
                nonautoinstrumentationArray.push(<a href={"https://rpm.newrelic.com/accounts/" + this.id + '/browser/' + app.id}> {app.name} </a>)
            }
        }
        return [autoinstrumentationArray, nonautoinstrumentationArray, 'Auto Instrumentation Apps']
    }

    getSpaAgentEnabledApps() {
        let total = 0
        if (!this.browserApps) {
            return total
        }

        for (let app of this.browserApps.values()) {
            if (app.spaAgentEnabled) {
                total++
            }
        }
        return total
    }

    getSpaAgentEnabledAppsPercent() {
        return Math.round(
            this.getSpaAgentEnabledApps() / this.getBrowserReportingApps() * 100) 
            || 0 
    }


}

export {Account}