import { ethers } from "hardhat";

import config from "../config.json";
import { addressToBytes32, readConfig } from "./utils";

import path from "path";

import { PeerSetting } from "./types";

async function main() {
    const currentChainId = (await ethers.provider.getNetwork()).chainId;
    const configPath = path.resolve(__dirname, "../config.json");
    console.log(`Reading config from: ${configPath}`);

    const allNetworks = readConfig(configPath);
    console.log(`Found ${Object.keys(allNetworks).length} networks in config\n`);

    // Get the current network config
    const currentNetworkConfig = allNetworks[Number(currentChainId)];
    if (!currentNetworkConfig) {
        throw new Error(`Current network with chainId ${currentChainId} not found in config`);
    }

    const [caller] = await ethers.getSigners();

    // Get the contract instance
    const myOFT = await ethers.getContractAt("MyOFT", currentNetworkConfig.MyOFT, caller);

    // Create a mapping of chain IDs to endpoint IDs (excluding current network)
    let peerSettings: PeerSetting[] = [];

    for (const [chainId, networkConfig] of Object.entries(allNetworks)) {
        // Skip the current network
        if (chainId === Number(currentChainId).toString()) {
            continue;
        }

        // Add to peer settings in the exact format required
        peerSettings.push({
            oftAddress: networkConfig.MyOFT,
            endpointId: networkConfig.endpointId
        });
    }

    console.log("Start setting peers...");

    for (const peerSetting of peerSettings) {
        console.log("1");
        await myOFT.setPeer(peerSetting.endpointId, addressToBytes32(peerSetting.oftAddress));
    }

    console.log("Finished setting peers");
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
