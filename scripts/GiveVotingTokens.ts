import { createPublicClient, http, createWalletClient } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { sepolia } from "viem/chains";
import { abi } from "../artifacts/contracts/MyToken.sol/MyToken.json";
import * as dotenv from "dotenv";


dotenv.config();
const providerApiKey = process.env.ALCHEMY_API_KEY || "";
const senderPrivateKey = process.env.PRIVATE_KEY || "";

async function main() {
    // receiving args
    const parameters = process.argv.slice(2);
    if (!parameters || parameters.length < 2)
        throw new Error("Parameters not provided");
    const contractAddress = parameters[0] as `0x${string}`;
    if (!contractAddress) throw new Error("Contract address not provided");
    if (!/^0x[a-fA-F0-9]{40}$/.test(contractAddress))
        throw new Error("Invalid contract address");
    
    const receiverAddress = parameters[1];
    if (!receiverAddress) throw new Error("Receiver address not provided");
    if (!/^0x[a-fA-F0-9]{40}$/.test(receiverAddress))
        throw new Error("Invalid receiver address");

const amount = parameters[2];
    if (!amount) throw new Error("Amount not provided");

    const account = privateKeyToAccount(`0x${senderPrivateKey}`);
    const senderClient = createWalletClient({
        account,
        chain: sepolia,
        transport: http(`https://eth-sepolia.g.alchemy.com/v2/${providerApiKey}`),
    });

    const publicClient = createPublicClient({
        chain: sepolia,
        transport: http(`https://eth-sepolia.g.alchemy.com/v2/${providerApiKey}`),
    });
      console.log(`\n Transfering ${amount} tokens to ${receiverAddress}`);

    const hash = await senderClient.writeContract({
        address: contractAddress,
        abi,
        functionName: "transfer",
        args: [receiverAddress, amount],
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