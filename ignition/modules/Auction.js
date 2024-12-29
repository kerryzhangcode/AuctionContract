// This setup uses Hardhat Ignition to manage smart contract deployments.
// Learn more about it at https://hardhat.org/ignition

const { buildModule } = require("@nomicfoundation/hardhat-ignition/modules");

module.exports = buildModule("AuctionModule", (m) => {
  const auctionNFT = m.contract("AuctionNFT", []);

  const auction = m.contract("Auction", [auctionNFT], {
    after: [auctionNFT],
  });

  return { auction };
});
