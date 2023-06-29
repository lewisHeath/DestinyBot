const fs = require('fs');
const path = require('path');

let manifest = null;

const manifestPath = path.resolve(__dirname, 'manifest.json');

fs.readFile(manifestPath, 'utf8', (error, data) => {
    if (error) {
        console.error(error);
        return;
    }
    manifest = JSON.parse(data);
    manifest = manifest.DestinyInventoryItemDefinition;
    console.log('Manifest loaded successfully.');
});

module.exports = manifest;
