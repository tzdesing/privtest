import { createPublicClient, http, createWalletClient, formatEther, parseEther, toHex } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { sepolia } from "viem/chains";
import { abi as abiBallot, bytecode as bytecodeBallot } from "../artifacts/contracts/TokenizedBallot.sol/Ballot.json";
import { abi as abiToken, bytecode as bytecodeToken } from "../artifacts/contracts/MyToken.sol/MyToken.json";
import * as dotenv from "dotenv";

dotenv.config();
const providerApiKey = process.env.ALCHEMY_API_KEY || "";
const deployerPrivateKey = process.env.PRIVATE_KEY || "";

const MINT_VALUE = 1000n

async function main() {
    const proposals = process.argv.slice(2);
    if (!proposals || proposals.length < 1)
        throw new Error("Proposals not provided");

    const publicClient = createPublicClient({
        chain: sepolia,
        transport: http(`https://eth-sepolia.g.alchemy.com/v2/${providerApiKey}`),
    });
    const blockNumber = await publicClient.getBlockNumber();
    console.log("Last block number:", blockNumber);

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

    console.log("Delegating the voting power to the deployer")
    hash = await deployer.writeContract({
        address: tokenAddress,
        abi: abiToken,
        functionName: "delegate",
        args: [deployer.account.address],
    });
    console.log("Transaction hash:", hash);
    console.log("Waiting for confirmations...");
    await publicClient.waitForTransactionReceipt({ hash });

    const lastBlockNumber = await publicClient.getBlockNumber();
    
    console.log("\nDeploying Ballot contract");
    hash = await deployer.deployContract({
        abi: abiBallot,
        bytecode: bytecodeBallot as `0x${string}`,
        args: [
            proposals.map((prop) => toHex(prop, { size: 32 })),
            tokenAddress,
            lastBlockNumber
        ],
        
    });
    console.log("Transaction hash:", hash);
    console.log("Waiting for confirmations...");
    receipt = await publicClient.waitForTransactionReceipt({ hash });
    console.log("Ballot contract deployed to:", receipt.contractAddress);

    if (!receipt.contractAddress) throw new Error("Contract address not found");
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});