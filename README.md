# Starfall Codex

A local-first NFT marketplace for unique celestial game cards. Users mint ERC-721 relics (image, name, description, rarity, and other traits), store art and metadata on IPFS, then list and buy them with a connected wallet.

This repo is a teaching build. The stack is the same core as popular open-source marketplaces such as [Nexus NFT Marketplace](https://github.com/hyrumpro/Nexus-NFT-Marketplace) (Hardhat + OpenZeppelin + Next.js + wagmi + Pinata), simplified so you can run everything on a laptop before touching a public testnet. Wallet connect uses MetaMask directly (wagmi `injected`) instead of RainbowKit, so you do not need a WalletConnect project ID to start.

## What you will have

- Unique token IDs (ERC-721, minted from 1 upward)
- Card metadata: image, name, description, rarity / element / affinity / power
- IPFS pinning through Pinata, with a local data-URI fallback so the app works without API keys
- List at a fixed ETH price, cancel, update, and buy
- Wallet connect (MetaMask)
- Marketplace cabinet + “my relics” collection
- Hardhat tests for mint, list, buy, cancel, and payment/fee math

## Stack (and why)

| Layer | Choice | Role |
| --- | --- | --- |
| Contracts | Solidity 0.8.24, Hardhat 2, OpenZeppelin 5 | Compile, test, and deploy ERC-721 + marketplace |
| Token standard | ERC-721 (`ERC721URIStorage`) | One unique card per token ID, `tokenURI` points at metadata |
| Frontend | Next.js 15 (App Router), TypeScript, Tailwind 4 | UI, API route for IPFS |
| Wallet | wagmi v2, viem, MetaMask (injected) | Connect wallet, read chain, send txs |
| Storage | Pinata → IPFS | Pin image + JSON; fallback: `data:` URIs |
| Networks | Hardhat localhost (31337), Ethereum Sepolia | Develop free locally, then a public testnet |

Thirdweb-based templates (for example [t9fiction/nft-marketplace](https://github.com/t9fiction/nft-marketplace)) are faster to click together but hide the contracts. This project keeps the Solidity in-repo so you can read every mint/list/buy check.

---

## Step 0 — Tools on your machine

You already need these. If a command is missing, install it before continuing.

1. **Node.js 20 or 22** (this machine has v22.15.0)  
   Download: [https://nodejs.org](https://nodejs.org)  
   Check:

   ```powershell
   node -v
   npm -v
   ```

2. **Git**  
   Download: [https://git-scm.com](https://git-scm.com)

3. **A code editor** — Cursor / VS Code.

4. **MetaMask** browser extension  
   [https://metamask.io/download](https://metamask.io/download)  
   Create a wallet. You will import extra *test* accounts later. Never paste a Hardhat private key into a wallet that holds real funds.

Optional later (not required for local mode):

- Free [Pinata](https://app.pinata.cloud) account (IPFS pinning)
- Free [Alchemy](https://www.alchemy.com/) or Infura account (Sepolia RPC)
- Sepolia ETH from a faucet such as [Google Cloud Web3 faucet](https://cloud.google.com/application/web3/faucet/ethereum/sepolia)

---

## Step 1 — Install dependencies

In PowerShell, from this project folder:

```powershell
cd "C:\Users\priya\OneDrive\Desktop\Priyanshu Admin\Computer Science\Projects\Sreeya-Blockchain"
npm install
```

This uses npm workspaces. It installs Hardhat under `contracts/` and Next.js under `frontend/`.

---

## Step 2 — Run the contract tests

```powershell
npm test
```

You should see the Starfall Codex suite pass: unique token IDs, listing rules, purchase + 2% fee, cancel, and stale listings after transfer.

---

## Step 3 — Start a local blockchain

Leave this terminal running. It is your private testnet.

```powershell
npm run node
```

Hardhat prints 20 funded accounts. You will import **Account #0** (seller/minter) and **Account #1** (buyer) into MetaMask.

Keep this process alive. If you stop it, the chain resets and you must deploy again.

---

## Step 4 — Deploy the contracts

Open a **second** terminal in the same project folder:

```powershell
npm run deploy:local
```

This deploys `StarfallCard` and `StarfallMarket` (2% fee) to localhost and writes addresses into `frontend/lib/deployed.json` for chain id `31337`.

---

## Step 5 — Point MetaMask at localhost

1. MetaMask → Networks → Add a network manually:

   | Field | Value |
   | --- | --- |
   | Network name | Hardhat Localhost |
   | RPC URL | http://127.0.0.1:8545 |
   | Chain ID | 31337 |
   | Currency symbol | ETH |

2. Import a test account: MetaMask → account menu → Import account → private key.

   Hardhat Account #0 (use this to mint and list):

   `0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80`

   Hardhat Account #1 (use this to buy):

   `0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d`

   These keys are public and worthless outside the local node. Do not use them on Sepolia or mainnet.

3. Switch MetaMask to **Hardhat Localhost**. The balance should be 10000 ETH.

---

## Step 6 — Run the app

Third terminal:

```powershell
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

Click **Connect**, pick MetaMask, approve Hardhat Localhost.

Walk through the product:

1. **Create** — name, description, traits, optional image. Mint.
2. **Inventory** — cards `ownerOf` maps to your address.
3. Open a card → **Approve marketplace** → set a price → **List for sale**.
4. Switch MetaMask to Account #1 → **Market** → buy the listing.

Without a Pinata JWT, metadata is stored as a `data:` URI on the token. That is enough for local demos. Add Pinata when you want real IPFS CIDs.

---

## Step 7 — Optional: real IPFS via Pinata

1. Create an account at [https://app.pinata.cloud](https://app.pinata.cloud)
2. API Keys → New Key → enable pinning → copy the **JWT**
3. In `frontend/.env.local`:

   ```
   PINATA_JWT=eyJ...
   ```

4. Restart `npm run dev`

The Next.js route `app/api/ipfs/route.ts` pins files and JSON on the server so the JWT never sits in the browser.

---

## Step 8 — Optional: Ethereum Sepolia testnet

1. Copy `contracts/.env.example` to `contracts/.env` and fill:

   ```
   PRIVATE_KEY=0xYOUR_SEPOLIA_ACCOUNT_PRIVATE_KEY
   SEPOLIA_RPC_URL=https://eth-sepolia.g.alchemy.com/v2/YOUR_KEY
   ```

   Export the private key from MetaMask (Account details → Show private key). Use a throwaway account.

2. Get Sepolia ETH from a faucet.

3. Deploy:

   ```powershell
   npm run deploy:sepolia
   ```

   Addresses are merged into `frontend/lib/deployed.json` under `"11155111"`.

4. In MetaMask, switch to Sepolia. Restart the frontend if it was already running.

5. For a dedicated Sepolia RPC, set `NEXT_PUBLIC_SEPOLIA_RPC_URL` in `frontend/.env.local` (Alchemy or Infura). Public RPCs work for light testing.

---

## Project map

```
contracts/
  contracts/StarfallCard.sol      ERC-721 mint + tokenURI
  contracts/StarfallMarket.sol    list / buy / cancel / fee
  test/Starfall.test.ts           core behavior
  scripts/deploy.ts               localhost + Sepolia
frontend/
  app/page.tsx                    marketplace cabinet
  app/mint/page.tsx               mint form
  app/collection/page.tsx         owned cards
  app/card/[id]/page.tsx          details + list/buy
  app/api/ipfs/route.ts           Pinata (or data-URI fallback)
  lib/                          ABIs, wagmi config, IPFS helpers
```

On-chain flow:

1. `mintCard(tokenURI)` → unique `tokenId`, metadata at that URI  
2. `setApprovalForAll(market, true)` so the market can transfer on sale  
3. `listCard(tokenId, priceWei)` — NFT stays in the seller wallet  
4. `buyCard(tokenId)` with `msg.value == price` — NFT moves, seller is paid minus 2%

---

## Scripts

| Command | What it does |
| --- | --- |
| `npm install` | Install contracts + frontend |
| `npm test` | Hardhat tests |
| `npm run compile` | Compile Solidity |
| `npm run node` | Local chain |
| `npm run deploy:local` | Deploy to the running node |
| `npm run deploy:sepolia` | Deploy to Sepolia |
| `npm run dev` | Next.js at http://localhost:3000 |

## License

MIT
