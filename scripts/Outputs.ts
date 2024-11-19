import { generatePrivKey, getSecret, packSecret } from "./Functions";
import { Output, UTXO } from "../model/interfaces";
import { Point } from "circomlibjs";

export const buildOutputs = async (
  utxos: UTXO[],
  pubkeys: Point[]
): Promise<any[]> => {
  const result: Output[] = [];
  for (let i = 0; i < utxos.length; i++) {
    const nonce = BigInt(generatePrivKey());
    const secret = await getSecret(utxos[i], pubkeys[i], nonce);

    const pack = packSecret(secret);

    const out: Output = {
      secret: pack,
    };

    result.push(out);
  }
  return result;
};
