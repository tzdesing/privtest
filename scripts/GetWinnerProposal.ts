import { createPublicClient, http, hexToString } from "viem";
import { sepolia } from "viem/chains";
import { abi } from "../artifacts/contracts/TokenizedBallot.sol/Ballot.json";
import * as dotenv from "dotenv";


dotenv.config();
const providerApiKey = process.env.ALCHEMY_API_KEY || "";

async function main() {
    const parameters = process.argv.slice(2);
    if (!parameters || parameters.length < 1)
        throw new Error("Parameters not provided");
    const contractAddress = parameters[0] as `0x${string}`;
    if (!contractAddress) throw new Error("Contract address not provided");
    if (!/^0x[a-fA-F0-9]{40}$/.test(contractAddress))
        throw new Error("Invalid contract address");

    const publicClient = createPublicClient({
        chain: sepolia,
        transport: http(`https://eth-sepolia.g.alchemy.com/v2/${providerApiKey}`),
        });    
    
    const winnerIndex = (await publicClient.readContract({
      address: contractAddress,
      abi,
      functionName: "winningProposal",
      args: [],
    })) as number;

    console.log("Winner proposal index: ", winnerIndex);

    const winnerName = (await publicClient.readContract({
        address: contractAddress,
        abi,
        functionName: "winnerName",
        args: [],
      })) as `0x${string}`;    

    const name = hexToString(winnerName, { size: 32 });
    console.log("Winner Proposal Name: ", name);

    const proposal = (await publicClient.readContract({
        address: contractAddress,
        abi,
        functionName: "proposals",
        args: [BigInt(winnerIndex)],
      })) as any[];
  

    console.log("Winner Proposal Vote Count: ", proposal[1]);

    process.exit();
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});