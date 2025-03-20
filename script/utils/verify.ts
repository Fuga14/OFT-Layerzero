import hre from "hardhat";

export async function verify(address: string, args: any[]) {
    // Verification of the deployed contract.
    if (hre.network.name !== "hardhat" && hre.network.name !== "localhost") {
        console.log("Sleeping before verification...");
        await new Promise((resolve) => setTimeout(resolve, 20000)); // 20 seconds.

        await hre.run("verify:verify", { address: address, constructorArguments: args });
    }
}
