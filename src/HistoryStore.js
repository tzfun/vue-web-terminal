const instance = new HistoryStore()

function HistoryStore() {
    const storageKey = 'terminal'
    let dataMap = window.localStorage.getItem(storageKey)
    if (dataMap == null) {
        dataMap = {}
    } else {
        dataMap = JSON.parse(dataMap)
    }

    const pushCmd = function (name, cmd) {
        let data = getData(name)
        if (data.cmdLog == null) {
            data.cmdLog = []
        }
        data.cmdLog.push(cmd)
        if (data.cmdLog.length > 1000) {
            data.cmdLog.splice(0, data.cmdLog.length - 1000)
        }
        data.cmdIdx = data.cmdLog.length
        store()
    }

    const store = function () {
        window.localStorage.setItem(storageKey, JSON.stringify(dataMap))
    }

    const getData = function (name) {
        let data = dataMap[name]
        if (data == null) {
            data = {}
            dataMap[name] = data
        }
        return data
    }

    const getLog = function (name) {
        let data = getData(name)
        if (data.cmdLog == null) {
            data.cmdLog = []
        }
        return data.cmdLog
    }

    const clearLog = function (name) {
        let data = getData(name)
        data.cmdLog = []
        store()
    }

    const getIdx = function (name) {
        let data = getData(name)
        return data.cmdIdx | 0
    }

    const setIdx = function (name, idx) {
        let data = getData(name)
        data.cmdIdx = idx
    }

    return {
        pushCmd: pushCmd,
        getLog: getLog,
        clearLog: clearLog,
        getIdx: getIdx,
        setIdx: setIdx
    }
}

export default instance