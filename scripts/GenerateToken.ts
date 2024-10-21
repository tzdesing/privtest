import * as dotenv from "dotenv";
import { Token } from "./Interfaces";

dotenv.config();
const crypto = require('crypto')

//TODO add validations, type should be a ENUM?

async function main() {
    const parameters = process.argv.slice(2);

    if (!parameters || parameters.length < 3)
        throw new Error("Parameters not provided");

    const ownerAddress = parameters[0] as `0x${string}`;
    const tokenType = parameters[1];
    const amount = parameters[2];

    if (!ownerAddress) throw new Error("Owner address not provided");
    
    if (isNaN(Number(amount))) throw new Error("Invalid amount");

    const token: Token = {
        ownerAddress: ownerAddress,
        type: tokenType,
        amount: amount,
        nonce: crypto.randomUUID()
    }

    console.log("Token generated: " + JSON.stringify(token));

}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
