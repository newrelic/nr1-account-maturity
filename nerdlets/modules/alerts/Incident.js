class Incident {

    constructor(id, openedAt) {
        this.id = id
        this.openedAt = openedAt
    }

    isMoreThanADay() {
        let current = (new Date()).getTime()
        if(current - this.openedAt > 86400000){ //ms in 24 hrs
            return true
        }
        return false
    }
}

export {Incident}