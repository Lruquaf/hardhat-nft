// SPDX-License-Identifier: MIT

pragma solidity 0.8.20;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";

contract BasicNFTs is ERC721URIStorage {
    uint256 private tokenCounter;

    enum General {
        SALADIN,
        CHARLEMAGNE,
        ATTILA,
        KHALID,
        BELISARIUS,
        TIMUR,
        CNUT,
        SULEIMAN,
        ALEXIOS,
        JEBE
    }

    string[] public tokenUris;

    constructor(string[10] memory _tokenUris) ERC721("BasicNFTs", "BNFT") {
        tokenCounter = 0;
        tokenUris = _tokenUris;
    }

    function mintNft() public {
        uint256 randomIndex = uint256(keccak256(abi.encode(tokenCounter))) % 10;
        _safeMint(msg.sender, tokenCounter);
        _setTokenURI(tokenCounter, tokenUris[randomIndex]);
        tokenCounter = tokenCounter + 1;
    }

    function getTokenCounter() public view returns (uint256) {
        return tokenCounter;
    }
}
