const { assert, expect } = require("chai")
const { ethers, network, deployments } = require("hardhat")
const { developmentChains } = require("../../helper-hardhat-config")

!developmentChains.includes(network.name)
    ? describe.skip
    : describe("Basic NFT unit test function", function () {
          let deployer, basicNft

          beforeEach(async () => {
              //accounts = await ethers.getSigners()
              //deployer = accounts[0]
              deployer = (await getNamedAccounts()).deployer
              await deployments.fixture(["basicnft"])
              basicNft = await ethers.getContract("BasicNft")
          })

          describe("Constructor function", () => {
              it("Initializes the basic NFT correctly...", async () => {
                  const tokenCounter = await basicNft.getTokenCounter()
                  assert.equal(tokenCounter.toString(), "0")
              })
          })

          describe("Minting...", () => {
              it("Allows users to mint and update the NFT", async () => {
                  const transactionResponse = await basicNft.mintNFT()
                  await transactionResponse.wait(1)
                  const tokenUri = await basicNft.tokenURI(0)
                  const tokenCounter = await basicNft.getTokenCounter()

                  assert.equal(tokenCounter.toString(), "1")
                  assert.equal(tokenUri, await basicNft.TOKEN_URI())
              })
          })
      })
