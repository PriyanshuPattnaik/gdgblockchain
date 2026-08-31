// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {IERC721} from "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import {ReentrancyGuard} from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";

/// @title Fixed-price marketplace for Starfall Codex cards
/// @notice Sellers keep the NFT until a sale. The marketplace must be approved
///         (`setApprovalForAll` or `approve`) before listing.
contract StarfallMarket is ReentrancyGuard, Ownable {
    struct Listing {
        address seller;
        uint256 price;
        bool active;
    }

    IERC721 public immutable card;
    uint96 public feeBps;
    mapping(uint256 => Listing) public listings;

    event CardListed(uint256 indexed tokenId, address indexed seller, uint256 price);
    event CardSold(
        uint256 indexed tokenId,
        address indexed seller,
        address indexed buyer,
        uint256 price
    );
    event ListingCancelled(uint256 indexed tokenId, address indexed seller);
    event ListingPriceUpdated(uint256 indexed tokenId, uint256 price);
    event FeeUpdated(uint96 feeBps);

    error NotCardOwner();
    error NotApproved();
    error InvalidPrice();
    error NotListed();
    error NotSeller();
    error CannotBuyOwnCard();
    error WrongPayment();
    error FeeTooHigh();
    error PayFailed();

    constructor(address cardAddress, uint96 initialFeeBps) Ownable(msg.sender) {
        require(cardAddress != address(0), "StarfallMarket: zero card");
        if (initialFeeBps > 1000) revert FeeTooHigh(); // max 10%
        card = IERC721(cardAddress);
        feeBps = initialFeeBps;
    }

    function listCard(uint256 tokenId, uint256 price) external {
        if (price == 0) revert InvalidPrice();
        if (card.ownerOf(tokenId) != msg.sender) revert NotCardOwner();
        if (!_isApproved(msg.sender, tokenId)) revert NotApproved();

        listings[tokenId] = Listing({seller: msg.sender, price: price, active: true});
        emit CardListed(tokenId, msg.sender, price);
    }

    function updatePrice(uint256 tokenId, uint256 price) external {
        if (price == 0) revert InvalidPrice();
        Listing storage listing = listings[tokenId];
        if (!listing.active) revert NotListed();
        if (listing.seller != msg.sender) revert NotSeller();
        listing.price = price;
        emit ListingPriceUpdated(tokenId, price);
    }

    function cancelListing(uint256 tokenId) external {
        Listing storage listing = listings[tokenId];
        if (!listing.active) revert NotListed();
        if (listing.seller != msg.sender) revert NotSeller();
        listing.active = false;
        emit ListingCancelled(tokenId, msg.sender);
    }

    function buyCard(uint256 tokenId) external payable nonReentrant {
        Listing memory listing = listings[tokenId];
        if (!listing.active) revert NotListed();
        if (msg.sender == listing.seller) revert CannotBuyOwnCard();
        if (msg.value != listing.price) revert WrongPayment();
        if (card.ownerOf(tokenId) != listing.seller) revert NotCardOwner();

        listings[tokenId].active = false;

        card.safeTransferFrom(listing.seller, msg.sender, tokenId);

        uint256 fee = (listing.price * feeBps) / 10_000;
        uint256 proceeds = listing.price - fee;

        _pay(listing.seller, proceeds);
        emit CardSold(tokenId, listing.seller, msg.sender, listing.price);
    }

    function setFeeBps(uint96 nextFeeBps) external onlyOwner {
        if (nextFeeBps > 1000) revert FeeTooHigh();
        feeBps = nextFeeBps;
        emit FeeUpdated(nextFeeBps);
    }

    function withdrawFees(address payable to) external onlyOwner {
        _pay(to, address(this).balance);
    }

    function getListing(uint256 tokenId)
        external
        view
        returns (address seller, uint256 price, bool active)
    {
        Listing memory listing = listings[tokenId];
        seller = listing.seller;
        price = listing.price;
        active = listing.active && card.ownerOf(tokenId) == listing.seller;
    }

    function _isApproved(address owner, uint256 tokenId) internal view returns (bool) {
        return card.getApproved(tokenId) == address(this) || card.isApprovedForAll(owner, address(this));
    }

    function _pay(address to, uint256 amount) internal {
        if (amount == 0) return;
        (bool ok, ) = payable(to).call{value: amount}("");
        if (!ok) revert PayFailed();
    }
}
