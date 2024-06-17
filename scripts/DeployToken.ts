import { createPublicClient, http, createWalletClient, formatEther } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { sepolia } from "viem/chains";
import { abi as abiToken, bytecode as bytecodeToken } from "../artifacts/contracts/MyToken.sol/MyToken.json";
import * as dotenv from "dotenv";

dotenv.config();
const providerApiKey = process.env.ALCHEMY_API_KEY || "";
const deployerPrivateKey = process.env.PRIVATE_KEY || "";

const MINT_VALUE = 100000000000000000000n

async function main() {
    const publicClient = createPublicClient({
        chain: sepolia,
        transport: http(`https://eth-sepolia.g.alchemy.com/v2/${providerApiKey}`),
    });

    const account = privateKeyToAccount(`0x${deployerPrivateKey}`);
    const deployer = createWalletClient({
        account,
        chain: sepolia,
        transport: http(`https://eth-sepolia.g.alchemy.com/v2/${providerApiKey}`),
    });
    console.log("Deployer address:", deployer.account.address);
    const balance = await publicClient.getBalance({
        address: deployer.account.address,
    });
    console.log(
        "Deployer balance:",
        formatEther(balance),
        deployer.chain.nativeCurrency.symbol
    );

    console.log("\nDeploying Token contract");
    let hash = await deployer.deployContract({
        abi: abiToken,
        bytecode: bytecodeToken as `0x${string}`,
        args: [],
    });

    console.log("Transaction hash:", hash);
    console.log("Waiting for confirmations...");
    let receipt = await publicClient.waitForTransactionReceipt({ hash });
    const tokenAddress = receipt.contractAddress;
    console.log("Token contract deployed to:", tokenAddress);

    if (!tokenAddress) throw new Error("Contract address not found");

    console.log("Minting tokens for the deployer")
    hash = await deployer.writeContract({
        address: tokenAddress,
        abi: abiToken,
        functionName: "mint",
        args: [deployer.account.address, MINT_VALUE],
    });
    console.log("Transaction hash:", hash);
    console.log("Waiting for confirmations...");
    await publicClient.waitForTransactionReceipt({ hash });


    if (!receipt.contractAddress) throw new Error("Contract address not found");
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});