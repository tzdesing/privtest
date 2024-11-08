import { createPublicClient, http } from "viem";
import { sepolia } from "viem/chains";
//import { abi } from "../artifacts/contracts/TokenizedBallot.sol/Ballot.json";
import * as dotenv from "dotenv";


dotenv.config();
const providerApiKey = process.env.ALCHEMY_API_KEY || "";

async function main() {
    /*const parameters = process.argv.slice(2);
    if (!parameters || parameters.length < 2)
        throw new Error("Parameters not provided");

    const contractAddress = parameters[0] as `0x${string}`;
    if (!contractAddress) throw new Error("Contract address not provided");
    if (!/^0x[a-fA-F0-9]{40}$/.test(contractAddress))
        throw new Error("Invalid contract address");

    const voterAddress = parameters[1];
    if (!voterAddress) throw new Error("Voter address not provided");
    if (!/^0x[a-fA-F0-9]{40}$/.test(voterAddress))
        throw new Error("Invalid voter address");

    const publicClient = createPublicClient({
        chain: sepolia,
        transport: http(`https://eth-sepolia.g.alchemy.com/v2/${providerApiKey}`),
        });    
    
    const voteCount = (await publicClient.readContract({
        address: contractAddress,
        "",
        functionName: "getVotePower",
        args: [voterAddress],
      })) as `0x${string}`;    

    console.log("Voter Voting Power: ", voteCount);

    process.exit();*/
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});