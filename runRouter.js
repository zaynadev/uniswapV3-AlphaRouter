const {
  AlphaRouter,
  ChainId,
  SwapType,
} = require("@uniswap/smart-order-router");

const {
  Token,
  Percent,
  CurrencyAmount,
  TradeType,
} = require("@uniswap/sdk-core");

const { ethers } = require("hardhat");
const { BigNumber } = ethers;
const JSBI = require("jsbi");
const ERC20ABI = require("./erc20Abi.json");

const V3_SWAP_ROUTER_ADDRESS = "0x68b3465833fb72A70ecDF485E0e4C7bD8665Fc45";

// hardhat netwoork (mainnet fork)
const provider = new ethers.providers.JsonRpcProvider("http://127.0.0.1:8545/");

const chainId = ChainId.MAINNET;

const router = new AlphaRouter({ chainId, provider });

const name0 = "Wrapped Ether";
const symbol0 = "WETH";
const decimals0 = 18;
const address0 = "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2";

const name1 = "Uniswap Token";
const symbol1 = "UNI";
const decimals1 = 18;
const address1 = "0x1f9840a85d5af5bf1d1762f925bdaddc4201f984";

const WETH = new Token(chainId, address0, decimals0, symbol0, name0);
const UNI = new Token(chainId, address1, decimals1, symbol1, name1);

const wei = ethers.utils.parseEther("1");
const inputAmount = CurrencyAmount.fromRawAmount(WETH, JSBI.BigInt(wei));

const main = async () => {
  const [signer] = await ethers.getSigners();
  const WALLET_ADDRESS = signer.address;

  await sendFaucetWETH(WALLET_ADDRESS);

  const route = await router.route(inputAmount, UNI, TradeType.EXACT_INPUT, {
    recipient: WALLET_ADDRESS,
    slippageTolerance: new Percent(5, 100),
    deadline: Math.floor(Date.now() / 1000) + 600,
    type: SwapType.SWAP_ROUTER_02,
  });

  const amoutOut = route.quote.toFixed(10);
  console.log({ amoutOut });

  const transaction = {
    data: route.methodParameters.calldata,
    to: V3_SWAP_ROUTER_ADDRESS,
    value: BigNumber.from(route.methodParameters.value),
    from: WALLET_ADDRESS,
    gasPrice: BigNumber.from(route.gasPriceWei),
    gasLimit: ethers.utils.hexlify(1000000),
  };

  //   const wallet = new ethers.Wallet(WALLET_SECRET);
  //   const connectWallet = wallet.connect(provider);

  const approvalAmount = ethers.utils.parseEther("1");

  const wethContract = await ethers.getContractAt(ERC20ABI, address0);

  const uniContract = await ethers.getContractAt(ERC20ABI, address1);

  wethContract.connect(signer).approve(V3_SWAP_ROUTER_ADDRESS, approvalAmount);

  const ethBefore = ethers.utils.formatEther(
    await wethContract.balanceOf(WALLET_ADDRESS)
  );
  const uniBefore = ethers.utils.formatEther(
    await uniContract.balanceOf(WALLET_ADDRESS)
  );

  console.log(
    `Before trade => ${symbol0}: ${ethBefore} and ${symbol1}: ${uniBefore}`
  );

  const trade = await signer.sendTransaction(transaction);
  await trade.wait();

  const ethAfter = ethers.utils.formatEther(
    await wethContract.balanceOf(WALLET_ADDRESS)
  );
  const uniAfter = ethers.utils.formatEther(
    await uniContract.balanceOf(WALLET_ADDRESS)
  );

  console.log(
    `After trade => ${symbol0}: ${ethAfter} and ${symbol1}: ${uniAfter}`
  );
};

const sendFaucetWETH = async (WALLET_ADDRESS) => {
  const wethContract = await ethers.getContractAt(ERC20ABI, address0);
  const impersonatedSigner = await ethers.getImpersonatedSigner(
    "0x56178a0d5F301bAf6CF3e1Cd53d9863437345Bf9"
  );
  await wethContract
    .connect(impersonatedSigner)
    .transfer(WALLET_ADDRESS, ethers.utils.parseEther("2"));
};

main();
