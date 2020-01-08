const semver = require('semver')

class Application {

    constructor(id) {
        this.id = id
        this.name = ""
        this.throughput = 0
        this.reporting = false
        this.apdexT = 0
        this.maxVersion= '0.0.1'
        this.language = null
        this.deployMarker = false
        this.dtEnabled = false
        this.healthStatus = ""
        this.alertConditions = []
        this.labels = []
        this.keyTxns = []
    }

    isDTCapable() {
        try {
        if (this.reporting) {
            switch (this.language) {
                case "python":
                    if (semver.gt(semver.coerce(this.maxVersion),"4.1.0")) {
                        return true
                    }
                    break
                case "ruby":
                    if (semver.gt(semver.coerce(this.maxVersion),"5.2.0")) {
                        return true
                    }
                    break
                case "nodejs":
                    if (semver.gt(semver.coerce(this.maxVersion),"4.3.0")) {
                        return true
                    }
                    break
                case "go":
                    if (semver.gt(semver.coerce(this.maxVersion),"2.0.0")) {
                        return true
                    }
                    break
                case "dotnet":
                    if (semver.gt(semver.coerce(this.maxVersion),"8.5.45")) {
                        return true
                    }
                    break
                case "php":
                    if (semver.gt(semver.coerce(this.maxVersion),"8.3.0")) {
                        return true
                    }
                    break
                case "java":
                    if (semver.gt(semver.coerce(this.maxVersion),"4.2.0")) {
                        return true
                    }
                    break
                default:
            }
        }
        return false
    }
    catch (err) {
        /* eslint-disable no-console */
        //console.debug(err, this)
        /* eslint-enable no-console */
    }
    }

    isCustomApdex() {
        if (this.reporting) {
            if ((this.apdexT != .5 && this.language != "nodejs") ||
            (this.apdexT != .1 && this.language == "nodejs")) {
                return true
            }
        }
        return false
    }

    isDTEnabled() {
        if (this.reporting) {
            if (this.dtEnabled) {
                return true
            }
        }
        return false
    }

    isAlerting() {
        if (this.reporting) {
            if (this.healthStatus.indexOf('NOT_CONFIGURED') == -1 || this.healthStatus.indexOf('') == -1) {
                return true
            }
        }
        return false
    }

    hasLabels() {
        if (this.reporting) {
            if ((this.labels || []).length > 3) {
                return true
            }
        }
        return false
    }

    hasReportingKeyTxns() {
        if (this.reporting) {
            if ((this.keyTxns || []).length > 0) {
                for (let kt of this.keyTxns) {
                    if (kt.reporting) {
                        return true
                    }
                }
            }
        }
        return false
    }

    getAlertingKeyTxns() {
        let total = 0
        if (this.reporting) {
            if ((this.keyTxns || []).length > 0) {
                for (let kt of this.keyTxns) {
                    if (kt.isAlerting()) {
                        total++
                    }
                }
            }
        }
        return total
    }

    getReportingKeyTxns() {
        let total = 0
        if (this.reporting) {
            if ((this.keyTxns || []).length > 0) {
                for (let kt of this.keyTxns) {
                    if (kt.reporting) {
                        total++
                    }
                }
            }
        }
        return total
    }
}

export {Application}