const { assert, expect } = require("chai")
const { getNamedAccounts, ethers, network, deployments } = require("hardhat")
const { developmentChains, networkConfig } = require("../../helper-hardhat-config")

// testing only on development chains...
!developmentChains.includes(network.name)
    ? describe.skip
    : describe("RandomIPFSNft unit testing...", async function () {
          let deployer, randomipfsnft, vrfcoordinatorv2mock

          beforeEach(async () => {
              accounts = await ethers.getSigners()
              //   deployer = (await getNamedAccounts()).deployer
              deployer = accounts[0]
              await deployments.fixture(["mocks", "randomipfs"])
              randomipfsnft = await ethers.getContract("RandomIPFSNft")
              vrfcoordinatorv2mock = await ethers.getContract("VRFCoordinatorV2Mock")
          })

          describe("Constructor function", () => {
              it("Initializes the smart contract...", async () => {
                  const dogTokenUriToZero = await randomipfsnft.getTokenURIs(0)
                  const isInitialized = await randomipfsnft.getInitialized()

                  assert(dogTokenUriToZero.includes("ipfs://"))
                  assert.equal(isInitialized, true)
              })
          })

          describe("fulfillRandomwords function check", () => {
              beforeEach(async () => {
                  //
              })

              it("Mints an NFT after a random number is returned.", async () => {
                  await new Promise(async (resolve, reject) => {
                      randomipfsnft.once("NFTMinted", async () => {
                          try {
                              const tokenuri = await randomipfsnft.tokenuri("0")
                              const tokenCounter = await randomipfsnft.getTokenCounter()
                              assert.equal(tokenuri.toString().includes("ipfs://"), true)
                              assert.equal(tokenCounter.toString(), "1")
                              resolve()
                          } catch (e) {
                              console.log(e)
                              reject(e)
                          }
                      })
                      try {
                          const fee = await randomipfsnft.getMintFee()
                          const requestNftResponse = await randomipfsnft.requestNft({
                              value: fee.toString(),
                          })
                          const requestNftReceipt = await requestNftResponse.wait(1)
                          await vrfcoordinatorv2mock.fulfillRandomWords(
                              requestNftReceipt.events[1].args.requestId,
                              randomipfsnft.address
                          )
                      } catch (e) {
                          console.log(e)
                          reject(e)
                      }
                  })
              })
          })
      })
