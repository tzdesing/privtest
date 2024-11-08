import { bigIntToUint8Array, generatePrivKey, getSecret, objectToHex, uint8R2bigInt } from "./Functions";
import { Output, UTXO } from "../model/interfaces";

export const buildOutputs = async (utxos: UTXO[]): Promise<any[]> => {
  const result: Output[] = [];
  for (const utxo of utxos) {
    const nonce = BigInt(generatePrivKey());

    const secret = await getSecret(
      utxo,
      [
        bigIntToUint8Array(BigInt(utxo.owner[0])),
        bigIntToUint8Array(BigInt(utxo.owner[1])),
      ],
      nonce
    );

   
      
      // Converter c1 para uma string hexadecimal única
      const c1Hex0 = secret.c0[0];
      const c1Hex1 = secret.c0[1];
      const c2Hex = secret.c2.toString(16);
      
      // Concatenar c1 e c2 em uma única string hexadecimal
      //const auditSecretHex = c1Hex0 + c1Hex1 + c2Hex;
      const auditSecretHex = "1f9dd0919c21c990e6304f39677d4ddc559d429de7497c15b9f57545dee156b2";
      
      console.log(auditSecretHex);
    
    const out: Output = {
      secret: `0x${auditSecretHex}`,
    };
    result.push(out);
  }
  return result;
};
