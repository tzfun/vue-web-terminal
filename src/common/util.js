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

export function _isEmpty(str) {
    return str == null || str.length === 0 || str.trim().length === 0
}

export function _html(str) {
    return String(str)
        .replace(/&(?!\w+;)/g, '&amp;')
        .replace(/ /g, '&nbsp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;')
        .replace(/\n/g, '<br>')
        .replace(/\t/g, '&nbsp;&nbsp;&nbsp;&nbsp;');
}