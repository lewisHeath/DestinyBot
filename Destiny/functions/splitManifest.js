const fs = require("fs");
const manifest = require("../manifest.json");

const keys = Object.keys(manifest);
const directory = "../manifests/";

// Create the 'manifests' directory if it doesn't exist
if (!fs.existsSync(directory)) {
  fs.mkdirSync(directory);
}

// Write values to respective files
keys.forEach((key) => {
  fs.writeFile(`${directory}${key}.json`, JSON.stringify(manifest[key]), (err) => {
    if (err) throw err;
  });
});

console.log("Done!");
