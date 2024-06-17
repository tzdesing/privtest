import { createPublicClient, http, createWalletClient, hexToString } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { sepolia } from "viem/chains";
import { abi } from "../artifacts/contracts/TokenizedBallot.sol/Ballot.json";
import * as dotenv from "dotenv";


dotenv.config();
const providerApiKey = process.env.ALCHEMY_API_KEY || "";
const deployerPrivateKey = process.env.PRIVATE_KEY || "";

async function main() {
    const parameters = process.argv.slice(2);

    if (!parameters || parameters.length < 3)
        throw new Error("Parameters not provided");

    const contractAddress = parameters[0] as `0x${string}`;

    if (!contractAddress) throw new Error("Contract address not provided");

    if (!/^0x[a-fA-F0-9]{40}$/.test(contractAddress))
        throw new Error("Invalid contract address");

    const proposalIndex = parameters[1];
    
    if (isNaN(Number(proposalIndex))) throw new Error("Invalid proposal index");

    const amount = parameters[2];

    if (isNaN(Number(amount))) throw new Error("Invalid amount");


    const account = privateKeyToAccount(`0x${deployerPrivateKey}`);
    const voter = createWalletClient({
        account,
        chain: sepolia,
        transport: http(`https://eth-sepolia.g.alchemy.com/v2/${providerApiKey}`),
    });

    console.log("Proposal selected: ");
    const publicClient = createPublicClient({
        chain: sepolia,
        transport: http(`https://eth-sepolia.g.alchemy.com/v2/${providerApiKey}`),
        });    
    
    const proposal = (await publicClient.readContract({
      address: contractAddress,
      abi,
      functionName: "proposals",
      args: [BigInt(proposalIndex)],
    })) as any[];

    const name = hexToString(proposal[0], { size: 32 });
    console.log("Voting to proposal", name);

    const hash = await voter.writeContract({
        address: contractAddress,
        abi,
        functionName: "vote",
        args: [BigInt(proposalIndex), BigInt(amount)],
    });
    console.log("Transaction hash:", hash);
    console.log("Waiting for confirmations...");
    await publicClient.waitForTransactionReceipt({ hash });
    console.log("Transaction confirmed");

        
    const proposalAfter = (await publicClient.readContract({
        address: contractAddress,
        abi,
        functionName: "proposals",
        args: [BigInt(proposalIndex)],
      })) as any[];

    console.log("Vote count: ", proposalAfter[1]);
    process.exit();
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
