const {
    SlashCommandBuilder,
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
} = require("discord.js");

const {
    bungieAPIKEY,
    bungieClientID,
    bungieClientSecret,
} = require("../config.json");

const checkAccessToken = require("../Destiny/functions/checkAccessToken.js");
const getDetails = require("../Destiny/functions/getDetails.js");
const getMembershipDetails = require("../Destiny/functions/getMembershipDetails.js");
const askToAuthorize = require("../Destiny/functions/askToAuthorize.js");
// Getting API
const Destiny2API = require("node-destiny-2");
// Helper functions
const getInventoryItem = require("../Destiny/functions/getInventoryItem.js");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("transfer")
        .setDescription("Transfers an item!")
        .addStringOption((option) =>
            option
                .setName("item")
                .setDescription("The item you want to transfer")
                .setRequired(true)
        )
        .addIntegerOption((option) =>
            option
                .setName("destination")
                .setDescription("Where you want to transfer the item to")
                .setRequired(true)
                .addChoices(
                    { name: "Titan", value: 0 },
                    { name: "Hunter", value: 1 },
                    { name: "Warlock", value: 2 },
                    { name: "Vault", value: 3 }
                )
        ),

    async execute(interaction, client) {
        await interaction.deferReply({
            //this is the important part
            ephemeral: true,
        });

        try {
            // Check if they are authorized
            const username = interaction.user.username;
            const authorized = await checkAccessToken(username);
            // If not, ask them to authorize
            if (!authorized) {
                await askToAuthorize(interaction, username);
                return;
            }

            // Get the character
            const character = interaction.options.getInteger("destination");
            // Get the item name
            const itemName = interaction.options.getString("item");
            const item = getInventoryItem(itemName);
            
            const { accessToken } = getDetails(username);
            const { membershipID, membershipType } = getMembershipDetails(username);

            const response = await fetch(`https://www.bungie.net/Platform/Destiny2/${membershipType}/Profile/${membershipID}/?components=100,102,200,201,205`, {
                headers: {
                    "X-API-Key": bungieAPIKEY,
                    "Authorization": `Bearer ${accessToken}`
                }
            });

            const profile = await response.json();

            const vault = profile.Response.profileInventory.data.items;
            // Find which characters are which class
            const characters = profile.Response.characters.data;
            // Map of number (class) to ID
            const characterClasses = {};
            for (let character in characters) {
                characters[character].classType = characterClasses[characters[character].characterId]
            }

            const characterInventories = profile.Response.characterInventories.data;
            // Map of character ID to inventory
            const characterInventoryData = {};
            for (let character in characterInventories) {
                characterInventoryData[character] = characterInventories[character].items;
            }

            const characterEquipment = profile.Response.characterEquipment.data;
            // Map of character ID to eqipped items
            const characterEquipmentData = {};
            for (let character in characterEquipment) {
                characterEquipmentData[character] = characterEquipment[character].items;
            }

            let items = [];
            const itemHashToLookFor = item.itemHash;
            console.log(`Looking for ${itemHashToLookFor}`)

            // If its a transfer from the vault to a character
            if(character != 3) {
                // Find the item/s in the vault
                for (let searchedItem in vault) {
                    if (vault[searchedItem].itemHash == itemHashToLookFor) {
                        items.push(vault[searchedItem]);
                    }
                }
                // If there are no items in the vault, return
                if (items.length == 0) {
                    await interaction.editReply("No items found in the vault");
                    return;
                }
                // For now, transfer first item found. TODO: Add option to choose which item to transfer
                const itemToTransfer = items[0];
                console.log(itemToTransfer)
                // Get the item instance ID
                const itemInstanceID = itemToTransfer.itemInstanceId;
                const body = {
                    itemReferenceHash: itemHashToLookFor,
                    stackSize: 1,
                    transferToVault: false,
                    itemId: itemInstanceID,
                    characterId: characterClasses[character],
                    membershipType: membershipType
                }
                
                const transferResponse = await fetch(`https://www.bungie.net/Platform/Destiny2/Actions/Items/TransferItem/`, {
                    headers: {
                        "X-API-Key": bungieAPIKEY,
                        "Authorization": `Bearer ${accessToken}`
                    },
                    method: "POST",
                    body: JSON.stringify(body)
                });

                const transferResponseJSON = await transferResponse.json();
                if(transferResponseJSON.ErrorCode != 1) {
                    await interaction.editReply("Error transferring item");
                    return;
                }

                await interaction.editReply("Item transferred!");
            } else {
                // look for the item in each character inventories and equipment
                for (let character in characterInventoryData) {
                    for (let searchedItem in characterInventoryData[character]) {
                        if (characterInventoryData[character][searchedItem].itemHash == itemHashToLookFor) {
                            items.push(characterInventoryData[character][searchedItem]);
                        }
                    }
                }
                for (let character in characterEquipmentData) {
                    for (let searchedItem in characterEquipmentData[character]) {
                        if (characterEquipmentData[character][searchedItem].itemHash == itemHashToLookFor) {
                            items.push(characterEquipmentData[character][searchedItem]);
                        }
                    }
                }
                // If there are no items found, return
                if (items.length == 0) {
                    await interaction.editReply("No items found in your inventory");
                    return;
                }
                // For now, transfer first item found. TODO: Add option to choose which item to transfer
                const itemToTransfer = items[0];
                console.log(itemToTransfer)
                // Get the item instance ID
                const itemInstanceID = itemToTransfer.itemInstanceId;
                const body = {
                    itemReferenceHash: itemHashToLookFor,
                    stackSize: 1,
                    transferToVault: true,
                    itemId: itemInstanceID,
                    characterId: characterClasses[character],
                    membershipType: membershipType
                }

                const transferResponse = await fetch(`https://www.bungie.net/Platform/Destiny2/Actions/Items/TransferItem/`, {
                    headers: {
                        "X-API-Key": bungieAPIKEY,
                        "Authorization": `Bearer ${accessToken}`
                    },
                    method: "POST",
                    body: JSON.stringify(body)
                });

                const transferResponseJSON = await transferResponse.json();
                if(transferResponseJSON.ErrorCode != 1) {
                    await interaction.editReply("Error transferring item");
                    return;
                }

                await interaction.editReply("Item transferred!");
            }
        
        } catch (error) {
            console.log(error);
            await interaction.editReply("Internal error :(");
        }
    },
};
