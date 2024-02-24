// import { ETHER } from "@uniswap/sdk";
import { ethers } from "hardhat";
const helpers = require("@nomicfoundation/hardhat-toolbox/network-helpers");

const main = async () => {
    // Define the addresses of DAI token and WETH token
    const DAIAddress = "0x6B175474E89094C44Da98b954EedeAC495271d0F";
    const wethAdress = "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2";

    // Define the Uniswap Router address
    const UNIRouter = "0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D";

    // Define the address of the account to impersonate
    const victim = "0xf584f8728b874a6a5c7a8d4d387c9aae9172d621";

    // Impersonate the account
    await helpers.impersonateAccount(victim);
    const impersonatedSigner = await ethers.getSigner(victim);

    // Define the amount of DAI tokens to receive and the amount of ETH to swap
    const amountOut = ethers.parseUnits("2000", 6);
    const amountIn = ethers.parseEther("9000");

    // Get contract instances for DAI, WETH, and Uniswap Router
    const DAI = await ethers.getContractAt("IERC20", DAIAddress);
    const WETH = await ethers.getContractAt("IERC20", wethAdress);
    const ROUTER = await ethers.getContractAt("IUniswap", UNIRouter);

    // Get the ETH and DAI balances before the swap
    const ethBal = await impersonatedSigner.provider.getBalance(victim);
    const daiBal = await DAI.balanceOf(impersonatedSigner.address);

    // Print the ETH and DAI balances before the swap
    console.log("ETH Balance:", ethers.formatUnits(ethBal, 18));
    console.log("DAI Balance:", ethers.formatUnits(daiBal, 18));

    // Set the deadline for the swap
    const deadline = Math.floor(Date.now() / 1000) + (60 * 10);

    // Perform the swap of exact ETH for DAI tokens
    const swapTx = await ROUTER.connect(impersonatedSigner).swapExactETHForTokens(
        amountOut,
        [wethAdress, DAIAddress],
        impersonatedSigner.address,
        deadline,
        { value: amountIn }
    );

    // Wait for the swap transaction to be confirmed
    await swapTx.wait();

    // Get the DAI balance after the swap
    const daiBalAfterSwap = await DAI.balanceOf(impersonatedSigner.address);
    

    // Print a separator and the DAI balance after the swap
    console.log("-----------------------------------------------------------------");
    console.log("DAI balance after swap:", ethers.formatUnits(daiBalAfterSwap, 18));
    console.log()

}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
