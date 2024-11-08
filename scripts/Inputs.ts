import { Input, UTXO } from "../model/interfaces";
import hexToObject, { decryptMessage, generateCommitment, generateCommitment5, generateNullifier, getSecret, uint8R2bigInt } from "./Functions";

import { genOwnershipProof } from "./Ownership";
/*
os secrets recebecidos em transações anteriores

*/
export const buildInputs = async (secrets: any[],privKey: string): Promise<any[]> => {
  const result: Input[] = [];
  //const PoseidonHasher = new Circuit("poseidon_hasher");
  for (const secret of secrets) {
    const utxo : UTXO = hexToObject<UTXO>(await decryptMessage(BigInt(privKey), secret ));
    console.log("Decrypted Message Hex:",utxo);

    const ownProof = await genOwnershipProof(utxo,privKey);
    console.log("prova conhecimento chave privada:",ownProof);
    //TODO senão decriptar quebrar     
    const commitment = await generateCommitment5(secret);
    //console.log("commitment:", commitment);
    const c1 = uint8R2bigInt(secret.c1);
    const x: string[] = [c1, secret.c2];
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

    console.log("pA:", ownProof[0]);
    console.log("pB:", ownProof[1]);
    console.log("pC:", ownProof[2]);

    /* pA: ownProof[0] as [bigint, bigint],
            pB: ownProof[1] as [[bigint, bigint], [bigint, bigint]],
            pC: ownProof[2] as [bigint, bigint] */

    const input: Input = {
        ownershipProof: {
            pA: ["0x160d62836c82a44fbfef0bcd60b0f933036f17b97121c3147cdca8e4c68a4c88", "0x01c1529b29462a0d6c18f8f9c2bda2dd5874382d03d2a1f70dc4f448378e88c3"],
            pB: [["0x1803dc3409bee34b8f2275b99953fdb691e31692e81a8f701c9b89fe6e95b490", "0x267942ab6f6ac41a2fc493bbdf1c598a946f2e3f8abcd354130b3997b7bf7d6a"],["0x21b1dd9b38a94213286b5353acfb085c2d272282e727851403f3dc1ba309234a", "0x1dcba9a67f57391c2485a56310991f0007dc7d06b4db83d92ba985df0b6c3b87"]],
            pC: ["0x1f9dd0919c21c990e6304f39677d4ddc559d429de7497c15b9f57545dee156b2", "0x0f16378e263c91d12f830c2139d16848715d9b6ce45b9f1aee882d0617175d67"]
        },
        nullifier: `0x${nullifier}`
    };
    
    result.push(input);
  }
  return result;
};


