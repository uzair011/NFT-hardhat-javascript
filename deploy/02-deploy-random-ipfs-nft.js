const { network, ethers } = require("hardhat")
const { developmentChains, networkConfig } = require("../helper-hardhat-config")
const { verify } = require("../utils/verify")
const { storeImages } = require("../utils/uploadToPinata")

const imagesLocation = "./images/randomNFT/"

module.exports = async function ({ getNamedAccounts, deployments }) {
    const { deploy, log } = deployments
    const { deployer } = await getNamedAccounts()
    const chainId = network.config.chainId

    let VRFCoordinatorV2Address, subscriptionId, dogTokenURIs

    // get the IPFS hashes for the nft images
    if (process.env.UPLOAD_TO_PINATA == "true") {
        dogTokenURIs = await handleTokenURIs()
    }

    if (developmentChains.includes(network.name)) {
        const VRFCoordinatorV2Mock = await ethers.getContract("VRFCoordinatorV2Mock")
        VRFCoordinatorV2Address = VRFCoordinatorV2Mock.address
        const transaction = await VRFCoordinatorV2Mock.createSubscription()
        const transactionRecipt = transaction.wait(1)
        subscriptionId = transactionRecipt.events[0].args.subId
    } else {
        VRFCoordinatorV2Address = networkConfig[chainId].VRFCoordinatorV2
        subscriptionId = networkConfig[chainId].subscriptionId
    }

    log(`--------###-------!!!-------###----------`)
    await storeImages(imagesLocation)
    // const args = [
    //     VRFCoordinatorV2Address,
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
