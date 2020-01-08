class Condition {

    constructor(id, type) {
        this.id = id
        this.type = type
        this.entities = null //Array
        this.nrqlQuery = null //String
    }

    isNrql() {
        if (this.nrqlQuery) {
            return true
        }
        return false
    }

}

export {Condition}