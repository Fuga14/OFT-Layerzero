import { ethers } from "hardhat";
import { verify } from "./utils";
import fs from "fs";
import path from "path";

import config from "../config.json";

// Define the type for the network configuration
type NetworkConfig = {
    MyOFT: string;
    name: string;
    symbol: string;
    LZEndpoint: string;
    owner: string;
};

// Define the type for the entire config
type Config = {
    [chainId: string]: NetworkConfig;
};

async function main() {
    const [deployer] = await ethers.getSigners();

    const network = await ethers.provider.getNetwork();
    const chainId = String(network.chainId);

    // Cast the config to the proper type
    const typedConfig = config as Config;
    const networkConfig = typedConfig[chainId];

    if (!networkConfig) {
        throw new Error(`No configuration found for chainId: ${chainId}`);
    }

    const args = [networkConfig.name, networkConfig.symbol, networkConfig.LZEndpoint, networkConfig.owner];

    console.log("Deploying MyOFT with the following arguments:", args);
    console.log("Deployer address:", deployer.address);
    console.log("Starting deployment...");

    // Deploy the contract MyOFT
    const myOFT = await ethers.deployContract("MyOFT", [...args], deployer);
    await myOFT.waitForDeployment();

    const myOFTAddress = myOFT.target.toString();

    console.log("MyOFT deployed to:", myOFTAddress);

    // Verify the contract
    console.log("Starting verification of the contract...");
    try {
        await verify(myOFTAddress, args);
        console.log("Contract verification successful");
    } catch (error) {
        console.log("Contract verification failed:", error);
    }

    // Update config with the deployed contract address
    typedConfig[chainId].MyOFT = myOFTAddress;

    // Write the updated config back to the file
    const configPath = path.resolve(__dirname, "../config.json");
    fs.writeFileSync(configPath, JSON.stringify(typedConfig, null, 2), "utf8");
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
