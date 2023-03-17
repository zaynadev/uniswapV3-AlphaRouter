# Uniswap V3 Aplha Router

Swap tokens (1 WETH to UNI) using AlphaRouter, uniswap v3 sdk, ethers and hardhat mainnet fork

#### 1. Install dependencies

First you need to install project dependencies by running this command:

```shell
npm install
```

#### 2. Add your Alchemy mainnet and Etherscan as an environment variable for the project

Create an empty `.env` file in the base directory of this project.

Add the following line to the `.env` file replacing `YOUR_ALCHEMY_URL_MAINNET` with your url.

```sh
ALCHEMY_URL_MAINNET=YOUR_ALCHEMY_URL_MAINNET
```

#### 2. Run hardhat node

Run hardhat node using this command:

```shell
npx hardhat node
```

#### 3. Execute the script

In another terminal, run this command to get the balance before andafter the swap (1 WETH to UNI)

```shell
 node runRouter.js
```
