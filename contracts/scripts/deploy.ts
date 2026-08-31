import { ethers, network } from "hardhat";
import * as fs from "fs";
import * as path from "path";

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log(`Deploying with ${deployer.address} on ${network.name} (${network.config.chainId})`);

  const Card = await ethers.getContractFactory("StarfallCard");
  const card = await Card.deploy();
  await card.waitForDeployment();
  const cardAddress = await card.getAddress();
  console.log(`StarfallCard  ${cardAddress}`);

  const Market = await ethers.getContractFactory("StarfallMarket");
  const market = await Market.deploy(cardAddress, 200);
  await market.waitForDeployment();
  const marketAddress = await market.getAddress();
  console.log(`StarfallMarket ${marketAddress}`);

  const chainId = Number((await ethers.provider.getNetwork()).chainId);
  const deployedPath = path.join(__dirname, "../../frontend/lib/deployed.json");
  let deployed: Record<string, { card: string; market: string }> = {};
  if (fs.existsSync(deployedPath)) {
    deployed = JSON.parse(fs.readFileSync(deployedPath, "utf8"));
  }
  deployed[String(chainId)] = { card: cardAddress, market: marketAddress };
  fs.mkdirSync(path.dirname(deployedPath), { recursive: true });
  fs.writeFileSync(deployedPath, JSON.stringify(deployed, null, 2) + "\n");
  console.log(`Wrote addresses to frontend/lib/deployed.json for chain ${chainId}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
