import { createPublicClient, http, createWalletClient, formatEther, toHex } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { sepolia } from "viem/chains";
import { abi as abiBallot, bytecode as bytecodeBallot } from "../artifacts/contracts/TokenizedBallot.sol/Ballot.json";
import * as dotenv from "dotenv";

dotenv.config();
const providerApiKey = process.env.ALCHEMY_API_KEY || "";
const deployerPrivateKey = process.env.PRIVATE_KEY || "";

async function main() {
    const args = process.argv.slice(2);


    if (!args || args.length < 1)
        throw new Error("Token address not provided");

    if (!args || args.length < 2)
        throw new Error("Proposals not provided");

    const proposals = args.slice(1)
    const tokenAddress = args[0]

    const publicClient = createPublicClient({
        chain: sepolia,
        transport: http(`https://eth-sepolia.g.alchemy.com/v2/${providerApiKey}`),
    });
    const lastBlockNumber = await publicClient.getBlockNumber();
    console.log("Last block number:", lastBlockNumber);

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
    

    console.log("\nDeploying Ballot contract");
    let hash = await deployer.deployContract({
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
    let receipt = await publicClient.waitForTransactionReceipt({ hash });
    console.log("Ballot contract deployed to:", receipt.contractAddress);

    if (!receipt.contractAddress) throw new Error("Contract address not found");
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});