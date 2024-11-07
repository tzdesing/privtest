import { genKeypair } from "maci-crypto";
import { bigIntToUint8Array, generatePrivKey, getSecret } from "./Functions";
import { UTXO } from "./Interfaces";

export const buildOutputs = async (utxos: UTXO[]): Promise<any[]> => {
  const result: any[] = [];
  for (const utxo of utxos) {
    const nonce = BigInt(generatePrivKey());
    result.push(
      await getSecret(
        utxo,
        [
          bigIntToUint8Array(BigInt(utxo.owner[0])),
          bigIntToUint8Array(BigInt(utxo.owner[1])),
        ],
        nonce
      )
    );
  }
  return result;
};
