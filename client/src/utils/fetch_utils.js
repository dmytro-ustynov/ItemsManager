import {ACCESS_TOKEN_KEY, BASE_URL, CURRENT_USER_KEY, REFRESH_TOKEN_URl} from "./constants";

export async function fetcher(params) {
    let {url, payload, body, credentials, headers, method = "POST", asFile = false} = params
    let fetchProps = {method: method}
    if (payload && Object.entries(payload).length) {
        fetchProps = {...fetchProps, body: JSON.stringify(payload)}
        headers = {
            ...headers,
            'Content-Type': 'application/json'
        }
    } else if (body) {
        fetchProps = {...fetchProps, body}
    }

    if (credentials === true) {
        fetchProps = {...fetchProps, credentials: 'include'}
        const accessToken = localStorage.getItem(ACCESS_TOKEN_KEY)
        if (Boolean(accessToken)) {
            headers = {...headers, 'Authorization': `Bearer ${accessToken}`}
        }
    }
    fetchProps = {...fetchProps, headers}
    try {
        const request = await fetch(url, fetchProps)
        if (request.ok) {
            if (asFile === false) return await request.json()
            else return await request.blob()
        } else {
            const status = request.status
            if (status === 401) {
                console.debug('try to refresh token...')
                const refreshUrl = BASE_URL + REFRESH_TOKEN_URl
                const refreshRequest = await fetch(refreshUrl, {
                    method: "GET",
                    credentials: "include"
                });
                const data = await refreshRequest.json()
                if (data[ACCESS_TOKEN_KEY]) {
                    localStorage.setItem(ACCESS_TOKEN_KEY, data[ACCESS_TOKEN_KEY]);
                    console.log('token refreshed successfully')
                    // retry the same request with updated access token
                    return fetcher(params)
                } else {
                    console.log('refresh fails, logout...')
                    localStorage.removeItem(ACCESS_TOKEN_KEY)
                    localStorage.removeItem(CURRENT_USER_KEY);
                    // redirect to login page for protected routes
                    window.location.href = '/login'
                }
            } else {
                const data = await request.json()
                // console.log('error request', request)
                return {result: false, details: data.details, status}
            }
        }
    } catch (e) {
        console.warn(`oops, smth wrong at our side, please try later:`)
        console.warn(e)
        return {result: false, details: e, status: 500}
    }
}