
class BrowserApplication {

    constructor(id) {
        this.id = id
        this.throughput = 0
        this.reporting = false
        this.apdexT = 0
        this.maxVersion= '0.0.1'
        this.healthStatus = ""
        this.alertConditions = []
        this.labels = []
        this.browserInteractions = false
        this.autoInstrumentation = false
        this.spaAgentEnabled = false
    }

    isCustomApdex() {
        if (this.reporting) {
            if (this.apdexT != 7) {
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
            //Check if more that the default labels are attached
            if ((this.labels || []).length > 2) {
                return true
            }
        }
        return false
    }

    isAutoInstrumentation() {
        if (this.reporting) {
            if (this.autoInstrumentation) {
                return true
            }
        }
        return false
    }
}

export {BrowserApplication}