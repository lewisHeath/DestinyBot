const fs = require('fs');
const path = require('path');

/*
This function writes the details of a user to the csv file
*/
function setDetails(username, authCode, accessToken, refreshToken, membershipId) {
    // get the line based on the username
    const csvFile = fs.readFileSync(path.join(__dirname, '../Authorization.csv'), 'utf8');
    const lines = csvFile.split('\n');
    for (let i = 0; i < lines.length; i++) {
        const values = lines[i].split(',');
        if (values[0] === username) {
            // update the line
            lines[i] = `${username},${authCode},${accessToken},${refreshToken},${membershipId}`;
            break;
        }
    }

    const updatedLines = lines.join('\n');
    fs.writeFileSync(path.join(__dirname, '../Authorization.csv'), updatedLines, 'utf8');
}

module.exports = setDetails;