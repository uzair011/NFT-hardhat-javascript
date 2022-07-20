const pinataSDK = require("@pinata/sdk")
const path = require("path")
const fs = require("fs")
require("dotenv").config()

pinataApiKey = process.env.PINATA_API_KEY
pinataSecret = process.env.PINATA_API_SECRET
const pinata = pinataSDK(pinataApiKey, pinataSecret)

async function storeImages(imageFilePath) {
    const fulllImagePath = path.resolve(imageFilePath)
    const files = fs.readdirSync(fulllImagePath)
    //console.log(files)

    let responses = []
    console.log(`Uploading to Pinata-IPFS...`)
    for (fileIndex in files) {
        console.log(`Working on ${fileIndex}`)
        const readableStreamForFile = fs.createReadStream(`${fulllImagePath}/${files[fileIndex]}`)
        try {
            const response = await pinata.pinFileToIPFS(readableStreamForFile)
            responses.push(response)
        } catch (error) {
            console.log(error)
        }
    }
    return { responses, files }
}

async function storeTokenURIMetadata(metadata) {
    try {
        const response = await pinata.pinJSONToIPFS(metadata)
        return response
    } catch (e) {
        console.log(e)
    }
    return null
}

module.exports = { storeImages, storeTokenURIMetadata }
