import hexToObject, { decryptMessage, generateCommitment, generateCommitment5, generateNullifier, getSecret, uint8R2bigInt } from "./Functions";
import { Input, Transfer } from "./Interfaces";
import { Circuit } from "./Circuit";

export const buildInputs = async (secrets: any[],privKey: string): Promise<any[]> => {
  const result: Input[] = [];
  const PoseidonHasher = new Circuit("poseidon_hasher");
  for (const secret of secrets) {
    const utxo= await decryptMessage(BigInt(privKey), secret );
    console.log("Decrypted Message:",hexToObject<Transfer>(utxo));
    //TODO senão decriptar quebrar     
    const commitment = await generateCommitment5(secret);
    //console.log("commitment:", commitment);
    const c1 = uint8R2bigInt(secret.c1);
    const x: string[] = [c1, secret.c2];
    //console.log(`x ${x}\n`);    
    const { proofJson, publicSignals } = await PoseidonHasher.generateProofGrowth16({ x: x });
    //console.log(publicSignals);
    //console.log(proofJson);  
    const res = await PoseidonHasher.verifyProofGrowth16(proofJson, [commitment]);
    //TODO se false quebrar
    res === true ? console.log("Verification  OK") : console.log("Invalid  proof");

    //TODO ajustar pra funcionar com 5
    const commitmentErr = await generateCommitment(secret);

    const nullifier = await generateNullifier(commitmentErr, BigInt(privKey));
    console.log("nullifier:", nullifier);
    const input: Input = {
        ownershipProof: proofJson,
        nullifier: nullifier,
    };
    
    result.push(input);
  }
  return result;
};


