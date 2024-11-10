import { Input, UTXO } from "../model/interfaces";
import hexToObject, { decryptMessage, generateCommitment5, generateNullifier, getSecret, uint8R2bigInt } from "./Functions";

import { genOwnershipProof } from "./Ownership";

export const buildInputs = async (secrets: any[],privKey: string): Promise<any[]> => {
  const result: Input[] = [];
  //const PoseidonHasher = new Circuit("poseidon_hasher");
  for (const secret of secrets) {
    const utxo : UTXO = hexToObject<UTXO>(await decryptMessage(BigInt(privKey), secret ));
    console.log("Decrypted Message Hex:",utxo);

    const ownProof = await genOwnershipProof(utxo,privKey);
    //console.log("prova conhecimento chave privada:",ownProof);
    //TODO senão decriptar quebrar     
    const commitment = await generateCommitment5(secret);
    //console.log("commitment:", commitment);
    //const c1 = uint8R2bigInt(secret.c1);
    //const x: string[] = [c1, secret.c2];
    //console.log(`x ${x}\n`);    
    //const { proofJson, publicSignals,proofCalldata } = await PoseidonHasher.generateProofGrowth16({ x: x });
    //console.log(publicSignals);
    //console.log(proofJson); 
    //console.log("calldata");   
    //console.log(proofCalldata);  
    //const res = await PoseidonHasher.verifyProofGrowth16(proofJson, [commitment]);
    //TODO se false quebrar
    //res === true ? console.log("Verification  OK") : console.log("Invalid  proof");
    
    const nullifier = await generateNullifier(commitment, BigInt(privKey));
    //console.log("nullifier:", nullifier);
    const argv = ownProof
    .replace(/["[\]\s]/g, "")
    .split(",")
    .map((x: string | number | bigint | boolean) => BigInt(x).toString());

    const a = [argv[0], argv[1]];
    const b = [
      [argv[2], argv[3]],
      [argv[4], argv[5]],
    ];
    const c = [argv[6], argv[7]];
    const inR = [];

    for (let i = 8; i < argv.length; i++) {
      inR.push(argv[i]);
    }

    //console.log("pA:", a);
    //console.log("pB:", b);
    //console.log("pC:", c);
    //console.log("inR:", inR);
    
    const input: Input = {
        ownershipProof: {
            pA: a as [bigint, bigint],
            pB: b as [[bigint, bigint], [bigint, bigint]],
            pC: c as [bigint, bigint],
            inR: inR as [bigint, bigint]
        },
        nullifier: `0x${nullifier}`
    };
    
    result.push(input);
  }
  return result;
};


