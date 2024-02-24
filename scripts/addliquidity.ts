import { ethers } from "hardhat";
const helpers = require("@nomicfoundation/hardhat-network-helpers");

const main = async () => {
    const USDCAddress = "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48";
    const DAIAddress = "0x6B175474E89094C44Da98b954EedeAC495271d0F";
    const wethAdress = "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2";

    const UNIRouter = "0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D";

    const USDCHolder = "0xf584f8728b874a6a5c7a8d4d387c9aae9172d621";
    await helpers.impersonateAccount(USDCHolder);
    const impersonatedSigner = await ethers.getSigner(USDCHolder);

    const dAmountA = ethers.parseUnits("10", 6);
    const dAmountB = ethers.parseUnits("10", 18);

    const USDC = await ethers.getContractAt("IERC20", USDCAddress);
    const DAI = await ethers.getContractAt("IERC20", DAIAddress);
    const WETH = await ethers.getContractAt("IERC20", wethAdress);

    const ROUTER = await ethers.getContractAt("IUniswap", UNIRouter);

    const approveTx = await USDC.connect(impersonatedSigner).approve(UNIRouter, dAmountA);
    await approveTx.wait();

    const approveTx2 = await DAI.connect(impersonatedSigner).approve(UNIRouter, dAmountB);
    await approveTx2.wait();

    const usdcBal = await USDC.balanceOf(impersonatedSigner.address);
    const daiBal = await DAI.balanceOf(impersonatedSigner.address);

    console.log("USDC Balance:", usdcBal);
    console.log("Dal Balance:", daiBal);

    const deadline = Math.floor(Date.now() / 1000) + (60 * 10);

    const liquidityTx = await ROUTER.connect(impersonatedSigner).addLiquidity(
        USDCAddress,
        DAIAddress,
        dAmountA,
        dAmountB,
        1,
        1,
        impersonatedSigner.address,
        deadline
    );
    await liquidityTx.wait();

    const usdcBalAfterSwap = await USDC.balanceOf(impersonatedSigner.address);
    const daiBalAfterSwap = await DAI.balanceOf(impersonatedSigner.address);

    console.log("-----------------------------------------------------------------")

    // Uncomment this if you are using the swap tokens for ETH
    // console.log("weth balance before swap", ethers.formatUnits(wethBalAfterSwap, 18));
    // console.log("eth balance after swap", ethers.formatUnits(ethBalAfterSwap, 18));
    
    console.log("usdc balance after adding liquidity", ethers.formatUnits(usdcBalAfterSwap, 6) );
    console.log("dai balance after adding liquidity", ethers.formatUnits(daiBalAfterSwap, 18) );
          
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});