export function getQuery() {
    let search = location.search.replace('?', '')
    let query = {}
    if (search.length > 0) {
        let kvArr = search.split("&")
        for (let kvs of kvArr) {
            let kv = kvs.split("=")
            query[kv[0]] = decodeURIComponent(kv[1])
        }
    }
    return query
}
