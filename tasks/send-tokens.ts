import { task } from "hardhat/config";
import path from "path";
import { readConfig, addressToBytes32 } from "../script/utils";
import { Options } from "@layerzerolabs/lz-v2-utilities";
import { MessagingFeeStruct, SendParamStruct } from "../typechain-types/contracts/MyOFT";

interface Args {
    amount: string;
    to: string;
    toChainId: string;
}

task("send-tokens", "Send OFT tokens from one chain to destination chain")
    .addParam("to", "Recipient address of the tokens on the destination chain")
    .addParam("amount", "Amount of tokens to send")
    .addParam("chainid", "Chain ID of the destination chain")
    .setAction(async (taskArgs: Args, hre) => {
        const { ethers } = hre;
        const currentChainId = (await ethers.provider.getNetwork()).chainId;
        const configPath = path.resolve(__dirname, "../config.json");
        const allNetworks = readConfig(configPath);
        const currentNetworkConfig = allNetworks[Number(currentChainId)];
        if (!currentNetworkConfig) {
            throw new Error(`Current network with chainId ${currentChainId} not found in config\n`);
        } else {
            console.log(`Network is found, preparing to send...\n`);
        }

        // Get the signer
        const [signer] = await ethers.getSigners();

        // Get the instance of the contract
        const myOFT = await ethers.getContractAt("MyOFT", currentNetworkConfig.MyOFT, signer);

        const decimals = await myOFT.decimals();
        const amount = ethers.parseUnits(taskArgs.amount, decimals);
        let options = Options.newOptions().addExecutorLzReceiveOption(65000, 0).toBytes();

        // Prepare data for sending tokens
        const sendParam: SendParamStruct = {
            dstEid: allNetworks[taskArgs.toChainId].endpointId,
            to: addressToBytes32(signer.address),
            amountLD: amount,
            minAmountLD: amount,
            extraOptions: options,
            composeMsg: ethers.getBytes("0x"),
            oftCmd: ethers.getBytes("0x")
        };

        // Get the quote for the send operation
        const feeQuote = await myOFT.quoteSend(sendParam, false);
        const messagingFee: MessagingFeeStruct = {
            nativeFee: feeQuote.nativeFee,
            lzTokenFee: 0
        };

        console.log(`Sending ${taskArgs.amount} to ${taskArgs.to} to chain ${taskArgs.toChainId}\n`);

        // Send the tokens
        const sendTx = await myOFT.send(sendParam, messagingFee, signer.address, {
            value: messagingFee.nativeFee
        });

        console.log(`Transaction sent, waiting for confirmation...\n`);

        // Wait for the transaction to be mined
        const receipt = await sendTx.wait();

        console.log(`Transaction status: ${receipt?.status}\n`);
        console.log(`Transaction confirmed, gas used: ${receipt?.gasUsed}\n`);
        console.log(`Transaction hash: ${receipt?.hash}\n`);
    });
