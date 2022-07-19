const pinataSdk = require("@pinata/sdk")
const path = require("path")
const fs = require("fs")

async function storeImages(imageFilePath) {
    const fullImagePath = path.resolve(imageFilePath)
    const files = fs.readdirSync(fullImagePath)
    console.log(files)
}

module.exports = { storeImages }
