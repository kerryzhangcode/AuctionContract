const { ethers, network } = require("hardhat")


const auctionSec = 60 * 10

const advanceBlockAtTime = async (time) => {
    const provider = new ethers.JsonRpcProvider(network.config.url)
    const currentBlock = await provider.getBlock("latest")
    console.log("Current block timestamp:", currentBlock.timestamp)

    const nextTimestamp = currentBlock.timestamp + auctionSec + 1
    await provider.send("evm_setNextBlockTimestamp", [nextTimestamp])
    await provider.send("evm_mine")
};

async function main() {
    const [deployer, adr1, adr2, adr3] = await ethers.getSigners()

    const auctionNFT = await ethers.getContractAt("AuctionNFT", "0x959922bE3CAee4b8Cd9a407cc3ac1C251C2007B1")
    const auction = await ethers.getContractAt("Auction", "0x9A9f2CCfdE556A7E9Ff0848998Aa4a0CFD8863AE")

    const tx1 = await auctionNFT.connect(deployer).mint(adr1, "https://ipfs.io/ipfs/QmX3v1v8t9Qj7ZvQ6ZGpJ2X1PZ3c2YX2b5f5b6q8K4v3j9")
    const rc1 = await tx1.wait()
    const transferEvent = rc1.logs.find(log => {
        return log.topics[0] === ethers.id("Transfer(address,address,uint256)")
    });


    if (!transferEvent) {
        console.log("Transfer event not found.");
        return;
      }

    const tokenId = transferEvent.topics[3];   
    console.log("Minted tokenId:", tokenId.toString());
    console.log("NFT Owner: ", adr1.address)

    await auctionNFT.connect(adr1).safeTransferFrom(adr1, auction, tokenId)
    console.log("Token transferred to auction contract")

    const provider = new ethers.JsonRpcProvider(network.config.url)
    const currentBlock = await provider.getBlock("latest")
    const endTime = currentBlock.timestamp + auctionSec
    console.log("End Time: ", endTime)
    await auction.connect(adr1).startAuction(tokenId, 1000, 100, endTime)
    console.log(`${adr1.address.toString()} Auction started`)

    await auction.connect(adr2).incrementBid(tokenId, {value: 1000})
    console.log(`${adr2.address.toString()} Bid incremented`)
    console.log(`${adr2.address.toString()} balance: ${await ethers.provider.getBalance(adr2.address)}`)

    await auction.connect(adr3).incrementBid(tokenId, {value: 2000})
    console.log(`${adr3.address.toString()} Bid incremented`)
    console.log(`${adr3.address.toString()} balance: ${await ethers.provider.getBalance(adr3.address)}`)

    await advanceBlockAtTime(auctionSec + 1);
    console.log("Time advanced")

    const record = await auction.getAuctionRecord(tokenId)
    console.log("Auction Record: ", record)

    await auction.connect(adr1).endAuction(tokenId)
    console.log("Auction ended")

    await auction.connect(adr2).withdraw(tokenId)
    console.log("Adr2 Withdrawn")

    const nftOwner = await auctionNFT.ownerOf(tokenId)
    console.log("NFT Owner: ", nftOwner)
    console.log(`${adr2.address.toString()} balance: ${await ethers.provider.getBalance(adr2.address)}`)
    console.log(`${adr3.address.toString()} balance: ${await ethers.provider.getBalance(adr3.address)}`)
}

// 执行脚本
main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});