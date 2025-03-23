import { ethers } from "hardhat";

import path from "path";
import { readConfig, addressToBytes32 } from "./utils";
import { MessagingFeeStruct, SendParamStruct } from "../typechain-types/contracts/MyOFT";
import { Options } from "@layerzerolabs/lz-v2-utilities";

async function main() {
    const currentChainId = (await ethers.provider.getNetwork()).chainId;
    const configPath = path.resolve(__dirname, "../config.json");
    console.log(`Reading config from: ${configPath}`);

    const allNetworks = readConfig(configPath);
    console.log(`Found ${Object.keys(allNetworks).length} networks in config\n`);

    // Get the current network config
    const currentNetworkConfig = allNetworks[Number(currentChainId)];
    if (!currentNetworkConfig) {
        throw new Error(`Current network with chainId ${currentChainId} not found in config\n`);
    }

    const [signer] = await ethers.getSigners();

    // Get the contract instance
    const myOFT = await ethers.getContractAt("MyOFT", currentNetworkConfig.MyOFT, signer);

    const balanceBeforeCall = await myOFT.balanceOf(signer.address);
    console.log(`Balance before call: ${balanceBeforeCall}\n`);

    // Prepare data for sending tokens
    const sendParam: SendParamStruct = {
        dstEid: 40245,
        to: addressToBytes32(signer.address),
        amountLD: ethers.parseEther("1000"),
        minAmountLD: ethers.parseEther("1000"),
        extraOptions: Options.newOptions().addExecutorLzReceiveOption(65000, 0).toBytes(),
        composeMsg: ethers.getBytes("0x"),
        oftCmd: ethers.getBytes("0x")
    };

    // Get the quote for the send operation
    const feeQuote = await myOFT.quoteSend(sendParam, false);
    const nativeFee = feeQuote.nativeFee;

    console.log(`Sending ${ethers.parseEther(sendParam.amountLD.toString())} token(s) to network Base Sepolia \n`);

    const fee: MessagingFeeStruct = {
        nativeFee: nativeFee,
        lzTokenFee: 0
    };

    // Send tokens
    const tx = await myOFT.send(sendParam, fee, signer.address, {
        value: nativeFee
    });
    const rec = await tx.wait();
    console.log(`Hash of the transaction: ${rec?.hash}\n`);

    const balanceAfterCall = await myOFT.balanceOf(signer.address);
    console.log(`Balance after call: ${balanceAfterCall}\n`);
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
