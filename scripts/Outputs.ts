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

      console.log("c1Hex0",c1Hex0);
      console.log("c1Hex1",c1Hex1);

      console.log("c2Hex",c2Hex);
        console.log("\n");
      console.log("secret.c2",secret.c2);

      function splitBigIntTo32ByteChunks(bigInt: bigint): string[] {
        // Convert BigInt to a hex string
        let hex = bigInt.toString(16);
        // Ensure the hex string has an even length
        if (hex.length % 2 !== 0) {
          hex = '0' + hex;
        }
        // Pad the string to a multiple of 64 characters (32 bytes)
        while (hex.length % 64 !== 0) {
          hex = '0' + hex;
        }
        // Split into 32-byte chunks (64 hex characters)
        const chunks: string[] = [];
        for (let i = 0; i < hex.length; i += 64) {
          chunks.push(hex.slice(i, i + 64));
        }
        return chunks;
      }
      
      function reassembleBigIntFromChunks(chunks: string[]): bigint {
        // Concatenate all chunks into one hex string
        const fullHex = chunks.join('');
        // Convert the hex string back to a BigInt
        return BigInt('0x' + fullHex);
      }
      
      // Example usage:
      const bigIntValue = 6394550933356391368131332745248541923827758899347826214422047947351663992693752084813709516247648665899584078899389545645645980652498297061283922880831866631637463318451989711302368569998229090109193833363086315885565453198160868949429168311535056760877202693619978159132472030489457539986547133384535409075671118753753836887916349437698057936853313739063057523946800679788939073646084223836712097995502418639128234823744392583772907800035674859174457883407949155153384709284514538220060213666843141851444936187849058953064838183143197429056693943097775847648255891209136778432174710193854238955567242230365358422597018643057400397371100485548434199900719496390116629985351394218n;
      const chunks = splitBigIntTo32ByteChunks(bigIntValue);
      console.log('Chunks:', chunks);
      
      const reassembledBigInt = reassembleBigIntFromChunks(chunks);
      console.log('Reassembled BigInt:', reassembledBigInt);
      
      // Verify that the original and reassembled BigInt are the same
      console.log('Are they equal?', bigIntValue === reassembledBigInt);
     
      
      const auditSecretHex = "1f9dd0919c21c990e6304f39677d4ddc559d429de7497c15b9f57545dee156b2";
      
      console.log("auditSecretHex",auditSecretHex);
    
    const out: Output = {
      secret: `0x${chunks[0]}`,
    };
    result.push(out);
  }
  return result;
};
