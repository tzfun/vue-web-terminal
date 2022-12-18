import axios from "axios";

const server = 'http://192.168.0.148:8080'

export function sshLogin(data) {
    return new Promise((resolve, reject) => {
        axios({
            url: server + '/ssh/account_login',
            method:'get',
            responseType: 'json',
            timeout: 10000,
            params: data
        }).then(res => {
            if (res.data.code === 0) {
                resolve(res.data.data)
            } else {
                reject({message: res.data.msg})
            }
        }).catch(e => {
            reject(e)
        })
    })
}
