class KeyTransaction {

    constructor(id) {
        this.id = id
        this.name = null
        this.reporting = false
        this.healthStatus = ""
        this.alertConditions = []
    }

    isAlerting() {
        if (this.reporting) {
            if (this.healthStatus.indexOf('unknown') == -1) {
                return true
            }
            return false
        }
    }

}

export {KeyTransaction}