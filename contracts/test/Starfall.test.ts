import { expect } from "chai";
import { ethers } from "hardhat";

const URI_A = "ipfs://bafybeicardmetadataaaa";
const URI_B = "ipfs://bafybeicardmetadatabbb";

describe("Starfall Codex", function () {
  async function deploy() {
    const [, seller, buyer, outsider] = await ethers.getSigners();
    const card = await ethers.deployContract("StarfallCard");
    const market = await ethers.deployContract("StarfallMarket", [await card.getAddress(), 200]);
    return { card, market, seller, buyer, outsider };
  }

  describe("StarfallCard", function () {
    it("mints unique sequential token IDs starting at 1", async function () {
      const { card, seller, buyer } = await deploy();
      await card.connect(seller).mintCard(URI_A);
      await card.connect(buyer).mintCard(URI_B);

      expect(await card.ownerOf(1)).to.equal(seller.address);
      expect(await card.ownerOf(2)).to.equal(buyer.address);
      expect(await card.totalMinted()).to.equal(2n);
      expect(await card.tokenURI(1)).to.equal(URI_A);
      expect(await card.tokenURI(2)).to.equal(URI_B);
    });

    it("rejects an empty metadata URI", async function () {
      const { card, seller } = await deploy();
      await expect(card.connect(seller).mintCard("")).to.be.revertedWith("StarfallCard: empty URI");
    });

    it("emits CardMinted with the minter and URI", async function () {
      const { card, seller } = await deploy();
      await expect(card.connect(seller).mintCard(URI_A))
        .to.emit(card, "CardMinted")
        .withArgs(1n, seller.address, URI_A);
    });
  });

  describe("StarfallMarket", function () {
    const price = ethers.parseEther("1");

    async function listed() {
      const ctx = await deploy();
      await ctx.card.connect(ctx.seller).mintCard(URI_A);
      await ctx.card.connect(ctx.seller).setApprovalForAll(await ctx.market.getAddress(), true);
      await ctx.market.connect(ctx.seller).listCard(1, price);
      return ctx;
    }

    it("lists a card the seller owns after approval", async function () {
      const { card, market, seller } = await deploy();
      await card.connect(seller).mintCard(URI_A);
      await card.connect(seller).setApprovalForAll(await market.getAddress(), true);

      await expect(market.connect(seller).listCard(1, price))
        .to.emit(market, "CardListed")
        .withArgs(1n, seller.address, price);

      const listing = await market.getListing(1);
      expect(listing.seller).to.equal(seller.address);
      expect(listing.price).to.equal(price);
      expect(listing.active).to.equal(true);
    });

    it("reverts listing if the caller is not the owner", async function () {
      const { card, market, seller, outsider } = await deploy();
      await card.connect(seller).mintCard(URI_A);
      await expect(market.connect(outsider).listCard(1, price)).to.be.revertedWithCustomError(
        market,
        "NotCardOwner"
      );
    });

    it("reverts listing without marketplace approval", async function () {
      const { card, market, seller } = await deploy();
      await card.connect(seller).mintCard(URI_A);
      await expect(market.connect(seller).listCard(1, price)).to.be.revertedWithCustomError(
        market,
        "NotApproved"
      );
    });

    it("reverts listing at price 0", async function () {
      const { card, market, seller } = await deploy();
      await card.connect(seller).mintCard(URI_A);
      await card.connect(seller).setApprovalForAll(await market.getAddress(), true);
      await expect(market.connect(seller).listCard(1, 0)).to.be.revertedWithCustomError(
        market,
        "InvalidPrice"
      );
    });

    it("lets a buyer purchase a listed card and pays the seller minus the fee", async function () {
      const { card, market, seller, buyer } = await listed();
      const fee = price / 50n;
      const proceeds = price - fee;
      const sellerBefore = await ethers.provider.getBalance(seller.address);

      await expect(market.connect(buyer).buyCard(1, { value: price }))
        .to.emit(market, "CardSold")
        .withArgs(1n, seller.address, buyer.address, price);

      expect(await card.ownerOf(1)).to.equal(buyer.address);
      expect((await market.getListing(1)).active).to.equal(false);
      expect(await ethers.provider.getBalance(seller.address)).to.equal(sellerBefore + proceeds);
      expect(await ethers.provider.getBalance(await market.getAddress())).to.equal(fee);
    });

    it("reverts if the buyer sends the wrong amount", async function () {
      const { market, buyer } = await listed();
      await expect(
        market.connect(buyer).buyCard(1, { value: ethers.parseEther("0.5") })
      ).to.be.revertedWithCustomError(market, "WrongPayment");
    });

    it("reverts if the seller tries to buy their own card", async function () {
      const { market, seller } = await listed();
      await expect(
        market.connect(seller).buyCard(1, { value: price })
      ).to.be.revertedWithCustomError(market, "CannotBuyOwnCard");
    });

    it("cancels an active listing", async function () {
      const { market, seller, buyer } = await listed();
      await expect(market.connect(seller).cancelListing(1))
        .to.emit(market, "ListingCancelled")
        .withArgs(1n, seller.address);
      await expect(
        market.connect(buyer).buyCard(1, { value: price })
      ).to.be.revertedWithCustomError(market, "NotListed");
    });

    it("updates the listing price", async function () {
      const { market, seller } = await listed();
      const next = ethers.parseEther("2");
      await market.connect(seller).updatePrice(1, next);
      expect((await market.getListing(1)).price).to.equal(next);
    });

    it("treats a listing as inactive if the seller no longer owns the card", async function () {
      const { card, market, seller, outsider } = await listed();
      await card.connect(seller).transferFrom(seller.address, outsider.address, 1);
      expect((await market.getListing(1)).active).to.equal(false);
    });
  });
});
