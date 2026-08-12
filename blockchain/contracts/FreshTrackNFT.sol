// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract FreshTrackNFT is ERC721, ERC721URIStorage, Ownable {
    uint256 private _nextTokenId;

    // Mapping from producer address to their achieved milestones
    // Milestone IDs: 1 (Pionero), 2 (Bronce), 3 (Maestro)
    mapping(address => mapping(uint256 => bool)) public hasMilestone;

    event MilestoneMinted(address indexed producer, uint256 milestoneId, uint256 tokenId);

    constructor() ERC721("FreshTrack Achievements", "FTNFT") Ownable(msg.sender) {}

    /**
     * @dev Mints an NFT for a specific milestone to a producer. 
     * Can only be called by the contract owner (admin/backend).
     * @param to The address of the producer
     * @param milestoneId The ID of the milestone (1, 2, or 3)
     * @param uri The metadata URI for the NFT
     */
    function safeMint(address to, uint256 milestoneId, string memory uri) public onlyOwner {
        require(!hasMilestone[to][milestoneId], "FreshTrackNFT: Producer already has this milestone NFT");
        
        uint256 tokenId = _nextTokenId++;
        hasMilestone[to][milestoneId] = true;
        
        _safeMint(to, tokenId);
        _setTokenURI(tokenId, uri);
        
        emit MilestoneMinted(to, milestoneId, tokenId);
    }

    // The following functions are overrides required by Solidity.

    function tokenURI(uint256 tokenId)
        public
        view
        override(ERC721, ERC721URIStorage)
        returns (string memory)
    {
        return super.tokenURI(tokenId);
    }

    function supportsInterface(bytes4 interfaceId)
        public
        view
        override(ERC721, ERC721URIStorage)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }
}
