import { ethers } from "hardhat";

async function main() {
  const to = process.env.FUND_TO;
  if (!to) {
    throw new Error("Set FUND_TO to the MetaMask address you want to fund");
  }
  const amount = process.env.FUND_AMOUNT ?? "100";
  const [funder] = await ethers.getSigners();
  const tx = await funder.sendTransaction({
    to,
    value: ethers.parseEther(amount),
  });
  await tx.wait();
  console.log(`Sent ${amount} ETH from ${funder.address} to ${to}`);
  console.log(`tx ${tx.hash}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
