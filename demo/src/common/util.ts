export function getQuery() {
    const search = location.search.replace('?', '');
    const query = {};
    if (search.length > 0) {
        const kvArr = search.split("&");
        for (const kvs of kvArr) {
            const kv = kvs.split("=");
            query[kv[0]] = decodeURIComponent(kv[1]);
        }
    }
    return query;
}

export function isEmpty(str: string): boolean {
    return !str || str.length === 0 || str.trim().length === 0;
}
