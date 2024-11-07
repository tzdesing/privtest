import hexToObject, { decryptMessage, generateCommitment, generateCommitment5, generateNullifier, getSecret, uint8R2bigInt } from "./Functions";
import { Input, Transfer, UTXO } from "./Interfaces";
import { Circuit } from "./Circuit";
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

    const ownProof = genOwnershipProof(utxo,privKey);
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
    //console.log(proofCalldata);  
    //const res = await PoseidonHasher.verifyProofGrowth16(proofJson, [commitment]);
    //TODO se false quebrar
    //res === true ? console.log("Verification  OK") : console.log("Invalid  proof");
    
    const nullifier = await generateNullifier(commitment, BigInt(privKey));
    //console.log("nullifier:", nullifier);
    const input: Input = {
        ownershipProof: ownProof,
        nullifier: nullifier,
    };
    
    result.push(input);
  }
  return result;
};


