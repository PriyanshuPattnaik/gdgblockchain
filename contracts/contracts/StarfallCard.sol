// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {ERC721} from "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import {ERC721URIStorage} from "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";

/// @title Starfall Codex game cards
/// @notice Each mint creates a unique ERC-721 token whose metadata (image, name,
///         description, attributes) lives off-chain at `tokenURI` (IPFS or data URI).
contract StarfallCard is ERC721URIStorage {
    uint256 private _nextTokenId = 1;

    event CardMinted(uint256 indexed tokenId, address indexed minter, string tokenURI);

    constructor() ERC721("Starfall Codex", "STAR") {}

    /// @notice Mint a unique card to the caller. Token IDs start at 1 and never reuse.
    /// @param uri Metadata URI (ipfs://... or data:application/json;base64,...)
    /// @return tokenId The newly assigned unique token ID
    function mintCard(string calldata uri) external returns (uint256 tokenId) {
        require(bytes(uri).length > 0, "StarfallCard: empty URI");
        tokenId = _nextTokenId;
        unchecked {
            _nextTokenId = tokenId + 1;
        }
        _safeMint(msg.sender, tokenId);
        _setTokenURI(tokenId, uri);
        emit CardMinted(tokenId, msg.sender, uri);
    }

    /// @notice Number of cards that have been minted (also the last token id if > 0).
    function totalMinted() external view returns (uint256) {
        return _nextTokenId - 1;
    }
}
