import { genKeypair } from "maci-crypto";
import { getSecret } from "./Functions";
import { UTXO } from "./Interfaces";

/*
- devemos gerar uma prova que a soma das entradas corresponde a soma das saidas 
*/
export const buildMassConservationProof = async (utxos: UTXO[]): Promise<any> => {
  
  for (const utxo of utxos) {
    const nonce = BigInt(genKeypair().privKey.toString());
    
  }
  return "result";
};
