const fs = require('fs');
const path = require('path');

/*
This function retrieves the membership details from the csv file based on the username
*/
function getMembershipDetails(username) {
    // based on the username, return the csv row from ../Memberships.csv
    let membershipID = '';
    let membershipType = '';

    const csvFile = fs.readFileSync(path.join(__dirname, '../Memberships.csv'), 'utf8');
    const lines = csvFile.split('\n');
    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        const values = line.split(',');
        if (values[0] === username) {
            membershipID = values[1];
            membershipType = values[2];
            break;
        }
    }

    if (membershipID === '' || membershipType === '') {
        throw new Error('There was an error getting the details from the csv file!');
    }

    return { membershipID, membershipType };
}

module.exports = getMembershipDetails;