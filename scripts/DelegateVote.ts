import { createPublicClient, http, createWalletClient } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { sepolia } from "viem/chains";
import { abi as abiBallot, bytecode as bytecodeBallot } from "../artifacts/contracts/TokenizedBallot.sol/Ballot.json";
import { abi as abiToken, bytecode as bytecodeToken } from "../artifacts/contracts/MyToken.sol/MyToken.json";
import * as dotenv from "dotenv";


dotenv.config();
const providerApiKey = process.env.ALCHEMY_API_KEY || "";
const chairPersonPrivateKey = process.env.PRIVATE_KEY || "";

async function main() {
    const parameters = process.argv.slice(2);
    if (!parameters || parameters.length < 3)
        throw new Error("Parameters not provided");
    const contractAddress = parameters[0] as `0x${string}`;
    if (!contractAddress) throw new Error("Contract address not provided");
    if (!/^0x[a-fA-F0-9]{40}$/.test(contractAddress))
        throw new Error("Invalid contract address");

    const delegateToAddress = parameters[1];
    if (!delegateToAddress) throw new Error("Delegate address not provided");
    if (!/^0x[a-fA-F0-9]{40}$/.test(delegateToAddress))
        throw new Error("Invalid delegate address");

    const amount = parseInt(parameters[2]);

    const account = privateKeyToAccount(`0x${chairPersonPrivateKey}`);
    const delegatorClient = createWalletClient({
        account,
        chain: sepolia,
        transport: http(`https://eth-sepolia.g.alchemy.com/v2/${providerApiKey}`),
    });

    const publicClient = createPublicClient({
        chain: sepolia,
        transport: http(`https://eth-sepolia.g.alchemy.com/v2/${providerApiKey}`),
    });

    const tokenAddress = (await publicClient.readContract({
        address: contractAddress,
        abi: abiBallot,
        functionName: "tokenContract",
        args: [],
    })) as `0x${string}`;

    
    console.log("Transfering tokens")
    let hash = await delegatorClient.writeContract({
        address: tokenAddress,
        abi: abiToken,
        functionName: "transfer",
        args: [delegateToAddress, amount],
    });

    console.log("Transaction hash:", hash);
    console.log("Waiting for confirmation...");
    await publicClient.waitForTransactionReceipt({ hash });
    console.log("Transaction finished");

    console.log("Delegating voting power")
    hash = await delegatorClient.writeContract({
        address: tokenAddress,
        abi: abiToken,
        functionName: "delegate",
        args: [delegateToAddress],
    });

    console.log("Transaction hash:", hash);
    console.log("Waiting for confirmation...");
    await publicClient.waitForTransactionReceipt({ hash });
    console.log("Transaction finished");

    process.exit();
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});