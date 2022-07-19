// SPDX-License-Identifier: MIT
pragma solidity ^0.8.7;

//? When we mint a NFT, we'll call the chainlink vrf call to get us a ranodm number.
//? using that number, we'll get a random nft
//? pub - rare , shiba inu - kinda rare , st. branard - common

//* users have to pay to mint a NFT
//* the owner of the contract can withdraw the ETH...

import "@chainlink/contracts/src/v0.8/interfaces/VRFCoordinatorV2Interface.sol";
import "@chainlink/contracts/src/v0.8/VRFConsumerBaseV2.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

error RandomIPFSNft__rangeOutOfBound();
error RandomIPFSNft__needMoreETH();
error RandomIPFSNft__transferFailed();

contract RandomIPFSNft is VRFConsumerBaseV2, ERC721URIStorage, Ownable {
    // chainlik vrf variables
    VRFCoordinatorV2Interface private immutable i_vrfCoordinator;
    uint64 private immutable i_subscriptionId;
    bytes32 private immutable i_gasLane; // keyhash
    uint32 private immutable i_callbackGasLimit;
    uint16 private constant REQUEST_CONFIRMATIONS = 3;
    uint32 private constant NUM_WORDS = 1;

    // vrf helpers
    mapping(uint256 => address) public s_requestIdToSender;

    // type declarations
    // enum Breed {
    //     PUG,
    //     SHIBA_INU,
    //     ST_BERNARD
    // }
    enum Breed {
        Meme1,
        BreakingBad,
        Meme2
    }

    // nft variables
    uint256 public s_tokenCounter;
    uint256 internal constant MAX_CHANCE_VALUE = 100;
    string[] internal s_dogTokenURIs;
    uint256 internal immutable i_mintFee;

    // events
    event NFTRequested(uint256 indexed requestId, address requester);
    event NFTMinted(Breed dogBreed, address minter);

    constructor(
        address VRFCoordinatorV2,
        uint64 subscriptionId,
        bytes32 gasLane,
        uint32 callbackGasLimit,
        string[3] memory dogTokenURIs,
        uint256 mintFee
    ) VRFConsumerBaseV2(VRFCoordinatorV2) ERC721("Random Ipfs NFT", "RIN") {
        i_vrfCoordinator = VRFCoordinatorV2Interface(VRFCoordinatorV2);
        i_subscriptionId = subscriptionId;
        i_gasLane = gasLane;
        i_callbackGasLimit = callbackGasLimit;
        s_dogTokenURIs = dogTokenURIs;
        i_mintFee = mintFee;
    }

    function requestNft() public payable returns (uint256 requestId) {
        if (msg.value < i_mintFee) {
            revert RandomIPFSNft__needMoreETH();
        }
        requestId = i_vrfCoordinator.requestRandomWords(
            i_gasLane,
            i_subscriptionId,
            REQUEST_CONFIRMATIONS,
            i_callbackGasLimit,
            NUM_WORDS
        );

        s_requestIdToSender[requestId] = msg.sender;
        emit NFTRequested(requestId, msg.sender);
    }

    function fulfillRandomWords(uint256 requestId, uint256[] memory randomWords) internal override {
        address nftDogOwner = s_requestIdToSender[requestId];
        uint256 newTokenId = s_tokenCounter;
        // token

        uint256 moddedRNG = randomWords[0] % MAX_CHANCE_VALUE;
        // mddedRNG = 0 -> 99
        // 0 -> 10 = pug
        // 10 -> 30 = shiba-inu
        // 30 -> 100 = st. branard
        Breed dogBreed = getBreedFromModdedRNG(moddedRNG);
        _safeMint(nftDogOwner, newTokenId);
        _setTokenURI(newTokenId, s_dogTokenURIs[uint256(dogBreed)]);
        emit NFTMinted(dogBreed, nftDogOwner);
    }

    function withdraw() public onlyOwner {
        uint256 amount = address(this).balance;
        (bool success, ) = payable(msg.sender).call{value: amount}("");
        if (!success) {
            revert RandomIPFSNft__transferFailed();
        }
    }

    function getBreedFromModdedRNG(uint256 moddedRNG) public pure returns (Breed) {
        uint256 cumulativeSum = 0;
        uint256[3] memory chanceArray = getChanceArray();

        for (uint256 i = 0; i < chanceArray.length; i++) {
            if (moddedRNG > cumulativeSum && moddedRNG < cumulativeSum + chanceArray[i]) {
                return Breed(i);
            }
            cumulativeSum += chanceArray[i];
        }
        revert RandomIPFSNft__rangeOutOfBound();
    }

    function getChanceArray() public pure returns (uint256[3] memory) {
        return [10, 30, MAX_CHANCE_VALUE];
    }

    function getMintFee() public view returns (uint256) {
        i_mintFee;
    }

    function getTokenCounter() public view returns (uint256) {
        s_tokenCounter;
    }

    function getTokenURIs(uint256 index) public view returns (string memory) {
        return s_dogTokenURIs[index];
    }

    // function tokenURI(uint256) public view override returns (string memory) {}
}
