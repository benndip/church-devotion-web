import * as AppUtils from '../utils/AppUtils';
import {BASE_URL, userUrls} from './ApiUrls';
import {getApiUserDetails} from './UserAPI'

let refreshTokenState = false;
const accessToken = AppUtils.getAccessToken();
const headers = {
    'Accept': 'application/json'
}
export const login = (credentials, callback, errorCallback) => {
    console.log("initializing login...");
    fetch(`${BASE_URL}${userUrls.LOGIN}`, { 
        method: 'POST',
        headers: {
            ...headers,
            'Content-Type': 'application/json',
        }, 
        body: JSON.stringify(credentials)
     }).then(res => {
         if(res.ok) {
            res.json().then(response => {
                console.log(response);
                AppUtils.setAuthenticationState(true);
                AppUtils.setAccessToken(response.access_token);
                AppUtils.setRefreshToken(response.refresh_token);
                AppUtils.setTokenExpiresIn(response.expires_in);
                // get the user details here
                getApiUserDetails();
                return callback && callback();
            })} else {
                console.log(res);
                return errorCallback && errorCallback();
            }
        });
}

export const refreshToken = () => {
    fetch(`${BASE_URL}${userUrls.TOKEN_REFRESH}`, { 
        method: 'POST',
        headers: {
            ...headers,
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${accessToken}`
        }, 
        body: JSON.stringify({refreshToken: AppUtils.getRefreshToken()})
    })
    .then(res => res.json())
    .then((token) => {
        console.log('System: refreshing token');
        AppUtils.setAccessToken(token.access_token);
        AppUtils.setRefreshToken(token.refresh_token);
        AppUtils.setTokenExpiresIn(token.expires_in);
        // since the user details may have changed, just refresh it too
        refreshApiUserDetails();
        setTimeout(() => refreshTokenState = false, 100);
      }, (error) => {
        console.log(error);
        refreshTokenState = false;
      });
}
export const refreshApiUserDetails = () => getApiUserDetails();
export const startRefreshTokenTimeout = () => {
    refreshTokenState = true;
    setTimeout(() => refreshToken(), 5);
}
export const initiateForgotPasswordRequest = (email) => fetch(`${BASE_URL}${userUrls.FORGOT_PASSWORD}`, { 
            method: 'POST',
            headers: {
                ...headers,
                'Content-Type': 'application/json',
            }, 
            body: JSON.stringify({email: email})
        })
        .then(res => res.json());
export const resetPassword = (code, password) => fetch(`${BASE_URL}${userUrls.RESET_PASSWORD}?ref=${code}`, { 
    method: 'POST',
    headers: {
        ...headers,
        'Content-Type': 'application/json',
    }, 
    body: JSON.stringify({password: password})
})
.then(res => res.json());