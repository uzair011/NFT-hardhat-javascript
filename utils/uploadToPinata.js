const pinataSDK = require("@pinata/sdk")
const path = require("path")
const fs = require("fs")

async function storeImages(imageFilePath) {
    const fulllImagePath = path.resolve(imageFilePath)
    const files = fs.readdirSync(fulllImagePath)
    console.log(files)
}

module.exports = { storeImages }
