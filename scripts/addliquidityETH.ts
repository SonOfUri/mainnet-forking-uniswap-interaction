// import { ETHER } from "@uniswap/sdk";
import { ethers } from "hardhat";
const helpers = require("@nomicfoundation/hardhat-toolbox/network-helpers");

const main = async () => {
    // Define the addresses of DAI token and WETH token
    const DAIAddress = "0x6B175474E89094C44Da98b954EedeAC495271d0F";
    const WETHAddress = "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2";

    // Define the Uniswap Router address
    const UNIRouter = "0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D";

    // Define the address of the account to impersonate
    const victim = "0xf584f8728b874a6a5c7a8d4d387c9aae9172d621";

    // Impersonate the account
    await helpers.impersonateAccount(victim);
    const impersonatedSigner = await ethers.getSigner(victim);

    // Define the amount of DAI tokens and ETH to add as liquidity
    const amountDAI = ethers.parseUnits("2", 6);
    const amountETH = ethers.parseEther("1000");

    // Get contract instances for DAI, WETH, and Uniswap Router
    const DAI = await ethers.getContractAt("IERC20", DAIAddress);
    const WETH = await ethers.getContractAt("IERC20", WETHAddress);
    const ROUTER = await ethers.getContractAt("IUniswap", UNIRouter);

    // Get the DAI and ETH balances before adding liquidity
    const daiBal = await DAI.balanceOf(impersonatedSigner.address);
    const ethBal = await impersonatedSigner.provider.getBalance(victim);

    // Print the DAI and ETH balances before adding liquidity
    console.log("DAI Balance:", ethers.formatUnits(daiBal, 18));
    console.log("ETH Balance:", ethers.formatUnits(ethBal, 18));

    // Set the deadline for adding liquidity
    const deadline = Math.floor(Date.now() / 1000) + (60 * 10);

    // Approve the Uniswap Router to spend DAI tokens
    await DAI.connect(impersonatedSigner).approve(UNIRouter, amountDAI);

    // Add liquidity to the DAI-WETH pool
    const addLiquidityTx = await ROUTER.connect(impersonatedSigner).addLiquidityETH(
        DAIAddress,
        amountDAI,
        0, // Min amount of DAI tokens to receive
        0, // Min amount of ETH to receive
        impersonatedSigner.address,
        deadline,
        { value: amountETH, gasLimit: 30000000 } // Adjust gas limit as needed
    );

    // Wait for the add liquidity transaction to be confirmed
    await addLiquidityTx.wait();

    // Get the DAI balance after adding liquidity
    const daiBalAfterLiquidity = await DAI.balanceOf(impersonatedSigner.address);

    // Print a separator and the DAI balance after adding liquidity
    console.log("-----------------------------------------------------------------");
    console.log("DAI balance after adding liquidity:", ethers.formatUnits(daiBalAfterLiquidity, 18));
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
