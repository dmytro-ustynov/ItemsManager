import {BASE_URL} from '../constants'

const AUTH_URL = BASE_URL + '/auth'

export async function login(data) {
    const loginUrl = AUTH_URL + '/login'
    const req = await fetch(loginUrl, {
        method: 'POST',
        body: JSON.stringify(data),
        headers: {'Content-Type': 'application/json'}
    })
    return req
}

export async function refresh_token() {
    const refresh_url = AUTH_URL + '/refresh'
    const req = await fetch(refresh_url, {
        method: 'POST',
        headers: {
            Authorization: `Bearer ${localStorage.getItem('accessToken')}`
        },
        credentials: 'include'
    })
    const res = await req.json()
    return res
}
