// import { Incident } from './Incident.js'

class AlertPolicy {
    constructor(id) {
        this.id = id
        this.name = ""
        this.incidents = null //Map
        this.channels = null //Set
        this.conditions = null //Map
    }

    getOpenIncidents() {
        if (this.incidents) {
            return this.incidents.size
        }
        return 0
    }

    getTotalIncidentsMoreThanADay() {
        let total = 0
        if (!this.incidents) {
            return total
        }

        for (var incident of this.incidents.values()) {
            if (incident.isMoreThanADay()) {
                total++
            }
        }
        return total
    }

    getIncidentsMoreThanADay() {
        let incidents = []
        if (!this.incidents) {
            return incidents
        }

        for (var incident of this.incidents.values()) {
            if (incident.isMoreThanADay()) {
                incidents.push(incident)
            }
        }
        return incidents
    }

    getIncidentsNotMoreThanADay() {
        let incidents = []
        if (!this.incidents) {
            return incidents
        }

        for (var incident of this.incidents.values()) {
            if (!incident.isMoreThanADay()) {
                incidents.push(incident)
            }
        }
        return incidents
    }

    hasIncidentsMoreThanADay() {
        if (!this.incidents) {
            return false
        }

        for (var incident of this.incidents.values()) {
            if (incident.isMoreThanADay()) {
                return true
            }
        }
        return false
    }

    isChannelNotEmail() {
        if (this.channels && (this.channels.size > 1 || (this.channels.size == 1 && !this.channels.has("email")))) {
            return true
        }
        return false
    }

    getTotalNrql() {
        let total = 0
        if (!this.conditions) {
            return total
        }

        for (var condition of this.conditions.values()) {
            if (condition.isNrql()) {
                total++
            }
        }

        return total
    }

    hasNrqlConditions() {
        if (!this.conditions) {
            return false
        }

        for (var condition of this.conditions.values()) {
            if (condition.isNrql()) {
                return true
            }
        }

        return false
    }

    getTotalConditionScore() {
        let score = 0
        if (!this.conditions) {
            return score
        }

        let size = this.conditions.size
        if (size == 1) {
            score = 40
        } else if (size == 2 || size == 3) {
            score = 60
        } else if (size >= 4 && size <= 8) {
            score = 80
        } else if (size >= 9) {
            score = 100
        }
        return score
    }
}

export {AlertPolicy}