import { genKeypair } from "maci-crypto";
import { UTXO } from "../model/interfaces";

/*
- devemos gerar uma prova que a soma das entradas corresponde a soma das saidas 
*/
export const buildMassConservationProof = async (utxos: UTXO[]): Promise<any> => {
  
  for (const utxo of utxos) {
    const nonce = BigInt(genKeypair().privKey.toString());
    
  }
  return "0x1f9dd0919c21c990e6304f39677d4ddc559d429de7497c15b9f57545dee156b2";

};
