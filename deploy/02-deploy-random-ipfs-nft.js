const { network, ethers } = require("hardhat")
const { developmentChains, networkConfig } = require("../helper-hardhat-config")
const { verify } = require("../utils/verify")
const { storeImages } = require("../utils/uploadToPinata")

const imagesLocation = "./images/randomNFT/"

module.exports = async function ({ getNamedAccounts, deployments }) {
    const { deploy, log } = deployments
    const { deployer } = await getNamedAccounts()
    const chainId = network.config.chainId
    let dogTokenURIs

    // get the IPFS hashes for the nft images
    if (process.env.UPLOAD_TO_PINATA == "true") {
        dogTokenURIs = await handleTokenURIs()
    }
    let vrfCoordinatorV2Address, subscriptionId

    if (chainId == 31337) {
        const vrfCoordinatorV2Mock = await ethers.getContract("VRFCoordinatorV2Mock")
        vrfCoordinatorV2Address = vrfCoordinatorV2Mock.address
        const transaction = await vrfCoordinatorV2Mock.createSubscription()
        const transactionRecipt = await transaction.wait(1)
        subscriptionId = transactionRecipt.events[0].args.subId
        //console.log(undefined.name)
    } else {
        vrfCoordinatorV2Address = networkConfig[chainId].VRFCoordinatorV2
        subscriptionId = networkConfig[chainId].subscriptionId
    }

    log(`--------###-------!!!-------###----------`)
    await storeImages(imagesLocation)
    // const args = [
    //     vrfCoordinatorV2Address,
    //     subscriptionId,
    //     networkConfig[chainId].gasLane,
    //     networkConfig[chainId].callbackGasLimitj,
    //     // dogTokenURIs,
    //     networkConfig[chainId].mintFee,
    // ]
}

async function handleTokenURIs() {
    // 1. store the image on ipfs
    // 2. store the metadata on ipfs
    dogTokenURIs = []

    return dogTokenURIs
}

module.exports.tags = ["all", "randomipfs", "main"]
