import { ethers } from "hardhat";

// Function to convert an Ethereum address to bytes32
export function addressToBytes32(addr: string): string {
    if (!ethers.isAddress(addr)) {
        throw new Error("Invalid Ethereum address");
    }

    // Convert address to BigInt (representing uint160)
    const addressBigInt = BigInt(addr);

    // In ethers v6, we can pad a hex string to create bytes32
    // First ensure we have a hex string without the '0x' prefix
    const addressAsHex = addressBigInt.toString(16).padStart(64, "0");

    // Return as bytes32 (with 0x prefix)
    return `0x${addressAsHex}`;
}
