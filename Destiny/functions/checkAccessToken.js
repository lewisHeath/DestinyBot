const refreshToken = require('./refreshToken.js');
const getDetails = require('./getDetails.js');
const setDetails = require('./setDetails.js');

/*
This function takes a username and updates the access token from the csv file
*/
async function checkAccessToken (username) {
    // Based on the username, get the auth code from Authorization.csv and the refresh token from Tokens.csv
    const { authCode, accessToken, refreshTokenValue, membershipId } = getDetails(username);
    // check for error
    if(authCode == '' || accessToken == '' || refreshTokenValue == '' || membershipId == '') {
        return false;
    }
    // refresh the access token
    const { newAccessToken, newRefreshToken } = await refreshToken(refreshTokenValue, authCode);
    // write the new access token to the file
    setDetails(username, authCode, newAccessToken, newRefreshToken, membershipId);
    return true;
}

module.exports = checkAccessToken;