import { bigIntToUint8Array, generatePrivKey, getSecret, objectToHex, packSecret, to32ByteHex, uint8R2bigInt, unpackSecret } from "./Functions";
import { Output, UTXO } from "../model/interfaces";
import { Point } from "circomlibjs";

export const buildOutputs = async (utxos: UTXO[], pubkeys: Point[]): Promise<any[]> => {
  const result: Output[] = [];
  for (let i = 0; i < utxos.length; i ++) {  
    const nonce = BigInt(generatePrivKey());
    const secret = await getSecret(
      utxos[i],
      pubkeys[i],
      nonce
    );      
      // Converter c1 para uma string hexadecimal única
      //const c1Hex0 = secret.c1x;
      //const c1Hex1 = secret.c1y;
      //const c2Hex = secret.c2;
      //console.log("c10",c1Hex0);
      //console.log("c11",c1Hex1);
      //console.log("c2",c2Hex);

      const pack= packSecret(secret);
      //console.log(pack);
      //const unpack= unpackSecret(pack);
      //console.log(unpack);
    
    const out: Output = {
      secret: pack,
    };
    result.push(out);
  }
  return result;
};
