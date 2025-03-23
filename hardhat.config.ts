import * as dotenv from "dotenv";
dotenv.config();

import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";

import "./tasks/send-tokens";

const PRIVATE_KEY = process.env.PRIVATE_KEY ? process.env.PRIVATE_KEY : "";

// API keys
const ETHERSCAN_API_KEY = process.env.ETHERSCAN_API_KEY || "";
const BASESCAN_API_KEY = process.env.BASESCAN_API_KEY || "";

// RPC URLs
const SEPOLIA_RPC_URL = process.env.SEPOLIA_RPC_URL || "";
const BASE_RPC_URL = process.env.BASE_RPC_URL || "";

const config: HardhatUserConfig = {
    solidity: {
        compilers: [
            {
                version: "0.8.22",
                settings: {
                    optimizer: {
                        enabled: true,
                        runs: 200
                    }
                }
            }
        ]
    },
    networks: {
        hardhat: {},
        sepolia: {
            url: SEPOLIA_RPC_URL,
            accounts: PRIVATE_KEY !== "" ? [PRIVATE_KEY] : []
        },
        baseSepolia: {
            url: BASE_RPC_URL,
            accounts: PRIVATE_KEY !== "" ? [PRIVATE_KEY] : []
        }
    },
    etherscan: {
        apiKey: {
            sepolia: ETHERSCAN_API_KEY,
            baseSepolia: BASESCAN_API_KEY
        }
    }
};

export default config;
