import * as dotenv from "dotenv";
import { poseidon2 } from 'poseidon-lite/poseidon2'

dotenv.config();

//TODO add validations, 

async function main() {
    const parameters = process.argv.slice(2);

    if (!parameters || parameters.length < 1)
        throw new Error("Parameter not provided");

    const secret = parameters[0];    

    const bigIntArray: bigint[] = [];
    const segmentSize: number = 128;

    // Divide a string em partes menores
    for (let i = 0; i < secret.length; i += segmentSize) {
        const segment = secret.substring(i, i + segmentSize);
        // Converte o segmento hexadecimal para BigInt e adiciona ao array
        bigIntArray.push(BigInt("0x" + segment));
    }          

    console.log("Commitment generated: " + poseidon2(bigIntArray));

}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
