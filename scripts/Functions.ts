import { buildBabyjub, buildPoseidon, Point } from "circomlibjs";
import { randomBytes } from "crypto";
import { poseidon2, poseidon3 } from "poseidon-lite";

export const getSecret = async (
  utxo: object,
  pubkey: Point,
  nonce: bigint
): Promise<any> => {
  return await encryptMessage(
    pubkey,
    hexToBigInt(objectToHex(utxo)), //fazer isso fora e ja receber bigint
    nonce
  );
};

export const getSecretAudit = async (
  utxos: object[],
  pubkey: Point,
  nonce: bigint
): Promise<any> => {
  return await encryptMessage(
    pubkey,
    hexToBigInt(objectToHex(utxos)), //fazer isso fora e ja receber bigint
    nonce
  );
};

export const generatePrivKey = (): string => {
  const ff = require("ffjavascript");
  return ff.Scalar.e(
    BigInt(`0x${randomBytes(31).toString("hex")}`).toString()
  ).toString();
};

export const generateCommitment = async (secret: any) => {
  const poseidon = await buildPoseidon();
  return bigIntToHex(
    uint8R2bigInt(
      poseidon([
        uint8R2bigInt(secret.c1[0].buffer),
        uint8R2bigInt(secret.c1[1].buffer),
        secret.c2,
      ])
    )
  );
};

export const generateCommitment5 = async (secret: any) => {
  return poseidon3([
    hexToBigInt(secret.c0[0]),
    hexToBigInt(secret.c0[1]),
    secret.c2,
  ]);
};

export const encryptMessage = async (
  publicKey: any,
  message: bigint,
  nonce: bigint
): Promise<any> => {
  //console.log(`message -> ${message}\n`);
  const ff = require("ffjavascript");

  const poseidon = await buildPoseidon();
  const babyJub = await buildBabyjub();

  // c1 = nonce * G, onde G é o gerador da BabyJubJub
  const c1 = babyJub.mulPointEscalar(babyJub.Base8, nonce);

  //console.log(`c10 -> ${c1[0]}\n`);

  const c1x = bigIntToHex(uint8R2bigInt(c1[0]));
  //console.log(`c1x -> ${c1x}\n`);
  const c1y = bigIntToHex(uint8R2bigInt(c1[1]));

  //const c1bx = bigIntToUint8Array(hexToBigInt(c1x));
  //console.log(`c1bx -> ${c1bx}\n`);

  //const c3x = babyJub.F.bigIntToUint8ArrayObject(c1[0]).toString();

  const c0 = [c1x, c1y];

  //console.log(`C1 -> ${c1}\n`);
  // P = nonce * PublicKey não circom ainda
  const sharedPoint = babyJub.mulPointEscalar(publicKey, nonce);
  //console.log(`sharedPoint -> ${sharedPoint}\n`);
  // Usa a coordenada x do ponto compartilhado como uma "chave" e a mistura com a mensagem
  const sharedKey = poseidon([sharedPoint[0]]);
  //console.log(`sharedKey -> ${sharedKey}\n`);

  let bigint = uint8R2bigInt(sharedKey);

  const c2 = ff.Scalar.add(message, bigint);

  return { c0, c2 };
};

export const bigIntToHex = (bigInt: bigint): string => {
  let hexString = bigInt.toString(16);
  if (hexString.length % 2 !== 0) {
    hexString = "0" + hexString;
  }
  return `0x${hexString}`;
};

export const stringToHex = (str: string): string => {
  const hexString = Array.from(str)
    .map((char) => char.charCodeAt(0).toString(16).padStart(2, "0"))
    .join("");
  return `0x${hexString}`;
};

export const to32ByteHex = (input: string): string => {
  // Convert the input string to a Buffer
  let buffer = Buffer.from(input);

  // Ensure the buffer is exactly 32 bytes long
  if (buffer.length > 32) {
    // If the input is too long, truncate it to 32 bytes
    buffer = buffer.slice(0, 32);
  } else if (buffer.length < 32) {
    // If the input is too short, pad it with zeros (on the left)
    const padding = Buffer.alloc(32 - buffer.length);
    buffer = Buffer.concat([padding, buffer]);
  }

  // Convert the buffer to a hex string
  return buffer.toString("hex");
}

export const objectToHex = (obj: object): string => {
  const jsonString = JSON.stringify(obj);
  const hexString = Array.from(jsonString)
    .map((char) => char.charCodeAt(0).toString(16).padStart(2, "0"))
    .join("");
  return `0x${hexString}`;
};

export const hexToBigInt = (hexString: string): bigint => {
  return BigInt(hexString);
};

export const decryptMessage = async (
  privateKey: bigint,
  ciphertext: any
): Promise<string> => {
  const ff = require("ffjavascript");
  const poseidon = await buildPoseidon();
  const babyJub = await buildBabyjub();
  const c1 = [
    bigIntToUint8Array(hexToBigInt(ciphertext.c0[0])),
    bigIntToUint8Array(hexToBigInt(ciphertext.c0[1])),
  ] as Point;
  // P = privateKey * c1
  const sharedPoint = babyJub.mulPointEscalar(c1, privateKey);
  // Usa a coordenada x do ponto compartilhado como a "chave"
  const sharedKey = poseidon([sharedPoint[0]]);
  //console.log(`sharedKey -> ${sharedKey}\n`);
  let bigint = uint8R2bigInt(sharedKey);
  // Recupera a mensagem original
  const message = ff.Scalar.sub(ciphertext.c2, bigint);

  return bigIntToHex(message);
};

export default function hexToObject<T>(hexString: string): T {
  try {
    const strippedHex = hexString.startsWith("0x")
      ? hexString.slice(2)
      : hexString;
    // Converte cada par de caracteres hexadecimais em um caractere ASCII, ignorando caracteres de controle
    const jsonString = Array.from(
      { length: strippedHex.length / 2 },
      (_, i) => {
        const charCode = parseInt(strippedHex.slice(i * 2, i * 2 + 2), 16);
        return charCode >= 32 && charCode <= 126 // ASCII imprimível
          ? String.fromCharCode(charCode)
          : ""; // Ignora caracteres de controle
      }
    ).join("");

    // Tenta fazer o parse da string JSON
    return JSON.parse(jsonString) as T;
  } catch (error) {
    console.error("Erro ao converter hexadecimal para objeto JSON:", error);
    return {} as T;
  }
}

export const generateNullifier = async (
  commitment: bigint,
  privKey: BigInt
) => {
  const poseidon = await buildPoseidon();
  return bigIntToHex(
    uint8R2bigInt(poseidon([commitment, BigInt(privKey.toString())]))
  ).slice(2);
};

export const uint8R2bigInt = (arr: any) => {
  let buf = arr.buffer;
  let bits = 8n;
  if (ArrayBuffer.isView(buf)) {
    bits = BigInt(64);
  } else {
    buf = new Uint8Array(buf);
  }

  let ret = 0n;
  for (const i of buf.values()) {
    const bi = BigInt(i);
    ret = (ret << bits) + bi;
  }
  return ret;
};

export const bigIntToUint8Array = (num: bigint) => {
  const bytes = [];
  // Enquanto o número for maior que zero, separe os bytes
  while (num > 0n) {
    bytes.push(Number(num & 0xffn)); // Pega o último byte
    num >>= 8n; // Move 8 bits para a direita
  }
  // Cria o Uint8Array e inverte os bytes (para ordem correta)
  return new Uint8Array(bytes.reverse());
};
