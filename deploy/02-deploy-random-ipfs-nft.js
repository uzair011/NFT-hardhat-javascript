const { network, ethers } = require("hardhat")
const { developmentChains, networkConfig } = require("../helper-hardhat-config")
const { verify } = require("../utils/verify")
const { storeImages, storeTokenURIMetadata } = require("../utils/uploadToPinata")

const imagesLocation = "./images/randomNFT/"

const metadataTemplate = {
    name: "",
    discription: "",
    image: "",
    attributes: [
        {
            trait_type: "Funniness",
            value: "100",
        },
    ],
}

FUND_AMOUNT = 1000000000000000000000

let tokenURIs = [
    "ipfs://QmTT6woYsRQR9jVbvPU4KJj5TASGLmgxTXhgHPfeMHRaGc",
    "ipfs://QmP8Q89y6PNz7gv4DHCd4qjXLAoyCqEcQNZ97BfphPxPnu",
    "ipfs://QmNyrDMYN4FLBQ3YgKpu77Ftfv1umSsa6U1Qs5XRzdEx5D",
]

module.exports = async function ({ getNamedAccounts, deployments }) {
    const { deploy, log } = deployments
    const { deployer } = await getNamedAccounts()
    const chainId = network.config.chainId

    // get the IPFS hashes for the nft images
    if (process.env.UPLOAD_TO_PINATA == "true") {
        tokenURIs = await handleTokenURIs()
    }
    let vrfCoordinatorV2Address, subscriptionId

    if (chainId == 31337) {
        const vrfCoordinatorV2Mock = await ethers.getContract("VRFCoordinatorV2Mock")
        vrfCoordinatorV2Address = vrfCoordinatorV2Mock.address
        const transaction = await vrfCoordinatorV2Mock.createSubscription()
        const transactionRecipt = await transaction.wait(1)
        subscriptionId = transactionRecipt.events[0].args.subId
        //console.log(undefined.name)

        // funding the contract - for testing...
        await vrfCoordinatorV2Mock.fundSubscription(subscriptionId, FUND_AMOUNT)
    } else {
        vrfCoordinatorV2Address = networkConfig[chainId].VRFCoordinatorV2
        subscriptionId = networkConfig[chainId].subscriptionId
    }

    log(`--------###-------!!!-------###----------`)
    //! await storeImages(imagesLocation)

    const args = [
        vrfCoordinatorV2Address,
        subscriptionId,
        networkConfig[chainId].gasLane,
        networkConfig[chainId].callbackGasLimit,
        tokenURIs,
        networkConfig[chainId].mintFee,
    ]

    const randomIpfsNft = await deploy("RandomIPFSNft", {
        from: deployer,
        args: args,
        log: true,
        waitConfirmations: network.config.blockConfirmations || 1,
    })
    log(`...@@--!!--$$--@@--!!--$$...`)

    if (!developmentChains.includes(network.name) && process.env.ETHERSCAN_API_KEY) {
        log(`Verifying...`)
        await verify(randomIpfsNft.address, args)
    }
    log(`---------!!!---------`)
}

async function handleTokenURIs() {
    // 1. store the image on ipfs
    // 2. store the metadata on ipfs
    tokenURIs = []
    const { responses: imageUploadResponses, files } = await storeImages(imagesLocation)
    for (imageUploadResponseIndex in imageUploadResponses) {
        // create responses
        // upload metadata
        let tokenURIMetadata = { ...metadataTemplate }
        tokenURIMetadata.name = files[imageUploadResponseIndex].replace(".png", "")
        tokenURIMetadata.discription = `${tokenURIMetadata.name} is a very funny meme`
        tokenURIMetadata.image = `ipfs://${imageUploadResponses[imageUploadResponseIndex].IpfsHash}`
        console.log(`Uploading NFT ${tokenURIMetadata.name}...`)

        // ? Store the metadata on pinata/ipfs

        const metadataUploadResponse = await storeTokenURIMetadata(tokenURIMetadata)
        tokenURIs.push(`ipfs://${metadataUploadResponse.IpfsHash}`)
    }
    console.log("dogTokenURI's uploaded...")
    console.log(tokenURIs)
    return tokenURIs
}

module.exports.tags = ["all", "randomipfs", "main"]
