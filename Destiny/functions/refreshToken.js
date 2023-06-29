const { bungieAPIKEY, bungieClientID, bungieClientSecret } = require('../../config.json');
const btoa = require('btoa');

const url = 'https://www.bungie.net/Platform/App/OAuth/Token/';

/*
This function uses the auth code from a user and their refresh token and returns a new access token
*/

async function refreshAccessToken (refreshToken, authCode) {
    // Using the refresh token, get a new access token
    const headers = {
        'Authorization': `Basic ${btoa(`${bungieClientID}:${bungieClientSecret}`)}`,
        'Content-Type': 'application/x-www-form-urlencoded'
    };

    const body = `grant_type=refresh_token&refresh_token=${refreshToken}`;

    // console.log(`refresh token: ${refreshToken}`);

    const options = {
        method: 'POST',
        headers: headers,
        body, body
    }

    // Get the new access token and overwrite the old one in the csv file
    const response = await fetch(url, options);
    const data = await response.json();
    // console.log(data);
    const newAccessToken = data.access_token;
    const newRefreshToken = data.refresh_token;

    // console.log(`new access token: ${newAccessToken}`);
    // console.log(`refresh token: ${newRefreshToken}`);
    
    // return the new access token and refresh token
    return { newAccessToken, newRefreshToken };
}

module.exports = refreshAccessToken;