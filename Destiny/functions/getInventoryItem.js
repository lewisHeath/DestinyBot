const DestinyInventoryItemDefinition = require('../manifests/DestinyInventoryItemLiteDefinition.json')

/*
This function gets the details of an item from the manifest when given a name
*/

function getInventoryItem(itemName) {
    // Make everything lowercase for easier comparison
    itemName = itemName.toLowerCase()
    // for each item in the manifest, check if the name matches the name given
    for (let item in DestinyInventoryItemDefinition) {
        let name = DestinyInventoryItemDefinition[item].displayProperties.name.toLowerCase()
        if (name === itemName) {
            // return hash along with values
            console.log(`Found ${name}/${DestinyInventoryItemDefinition[item].displayProperties.name} with hash ${item}`)
            return {
                itemHash: item,
                ...DestinyInventoryItemDefinition[item]
            }
        }
    }
    // if no item is found, return null
    return null
}

module.exports = getInventoryItem

// example usage
// console.log(getInventoryItem('The Last Word'))