import { viem } from "hardhat";

import { parseEther, formatEther } from "viem";
import { ethers } from "ethers";

import {
  genKeypair,
  formatPrivKeyForBabyJub
} from "maci-crypto";
import { poseidonEncrypt, poseidonDecrypt, poseidonDecryptWithoutCheck } from "@zk-kit/poseidon-cipher"
import { BabyJub,buildBabyjub, Eddsa, buildPoseidon } from "circomlibjs";
import { Input, Output, Proof, Transfer } from "../model/interfaces";
//import { Scalar } from "@toruslabs/ffjavascript";

const MINT_VALUE = 1000n;

async function main() {
  const ff = require('ffjavascript')
  const { privKey, pubKey } = genKeypair();
  const formattedPrivateKey = formatPrivKeyForBabyJub(privKey);

  console.log(`Private Key ${privKey}\n`);
  console.log(`Public Key ${pubKey}\n`);
  console.log(`Formatted Private Key ${formattedPrivateKey}\n`);

  const babyJub = await buildBabyjub();

  //const privateKey = BigInt(privKey.toString());//ff.Scalar.random();  // Chave privada do receptor
  //console.log(`Private Key 2 ${privateKey}\n`);
  const publicKey = babyJub.mulPointEscalar(babyJub.Base8, BigInt(privKey.toString()));  // Chave pública correspondente
  console.log(`Public Key 2 ${publicKey}\n`);

  const proofE1: Proof = {
    proofType: "ownership",
    proofValue: "proofOwnershipE1",
  };

  const inputE1: Input = {
    secret: "secretE1",
    proof: proofE1,
  };

  const proofE2: Proof = {
    proofType: "ownership",
    proofValue: "proofOwnershipE2",
  };

  const inputE2: Input = {
    secret: "secretE2",
    proof: proofE2,
  };

  let transfer: Partial<Transfer> = {};
  transfer.inputs = [];
  transfer.outputs = [];

  transfer.inputs?.push(inputE1);
  transfer.inputs?.push(inputE2);

  const outputE7: Output = {
    secret: "secretE7",
    rangeOrigin: "rangeOrigin",
    rangeDestiny: "rangeDestiny",
  };

  const outputE8: Output = {
    secret: "secretE8",
    rangeOrigin: "rangeOrigin",
    rangeDestiny: "rangeOrigin",
  };

  transfer.outputs?.push(outputE7);
  transfer.outputs?.push(outputE8);

  transfer.secretAudit = "teste";
  transfer.massConservationProof = proofE2;
  transfer.nonRepudiationProof = proofE2;

  const transferHex = objectToHex(transfer);
  console.log("Transfer em Hexadecimal:", transferHex);

  const transferBigInt = hexToBigInt(transferHex);
  console.log("Transfer em BigInt:", transferBigInt);  

  const encrypted = await encryptMessage(publicKey, transferBigInt);
  console.log("Encrypted:", encrypted);

  const decryptedMessage = await decryptMessage(BigInt(privKey.toString()), encrypted);
  console.log("Decrypted Message:", decryptedMessage.toString());

  const hexFromBigInt = bigIntToHex(decryptedMessage);
  const originalTransfer = hexToObject<Transfer>(hexFromBigInt);

  console.log("Objeto original:", originalTransfer);

}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});

function objectToHex(obj: object): string {
  const jsonString = JSON.stringify(obj);
  const hexString = Array.from(jsonString)
      .map(char => char.charCodeAt(0).toString(16).padStart(2, '0'))
      .join('');
  return `0x${hexString}`;
}

function hexToBigInt(hexString: string): bigint {
  return BigInt(hexString);
}

function bigIntToHex(bigInt: bigint): string {
  let hexString = bigInt.toString(16);
  if (hexString.length % 2 !== 0) {
      hexString = '0' + hexString;
  }
  return `0x${hexString}`;
}

function hexToObject<T>(hexString: string): T {
  const strippedHex = hexString.startsWith("0x") ? hexString.slice(2) : hexString;

  const jsonString = Array.from({ length: strippedHex.length / 2 }, (_, i) =>
      String.fromCharCode(parseInt(strippedHex.slice(i * 2, i * 2 + 2), 16))
  ).join('');
  return JSON.parse(jsonString);
}

async function encryptMessage(publicKey: any, message: bigint): Promise<any> {
  console.log(`message -> ${message}\n`);
  const ff = require('ffjavascript')
 
  const poseidon = await buildPoseidon();
  const babyJub = await buildBabyjub();
  // Gera um nonce aleatório
  const r = BigInt(genKeypair().privKey.toString());
  console.log(`R -> ${r}\n`);
  // c1 = r * G, onde G é o gerador da BabyJubJub
  const c1 = babyJub.mulPointEscalar(babyJub.Base8, r);
  console.log(`C1 -> ${c1}\n`);
  // P = r * PublicKey
  const sharedPoint = babyJub.mulPointEscalar(publicKey, r);
  console.log(`sharedPoint -> ${sharedPoint}\n`);
  // Usa a coordenada x do ponto compartilhado como uma "chave" e a mistura com a mensagem
  const sharedKey = poseidon([sharedPoint[0]]);
  console.log(`sharedKey -> ${sharedKey}\n`);

  let bigint = method1(sharedKey); // 42n

  const c2 = ff.Scalar.add(message, bigint);

  return { c1, c2 };
}

// Função de decriptação
async function decryptMessage(privateKey: bigint, ciphertext: any): Promise<bigint> {
  const ff = require('ffjavascript')
  const poseidon = await buildPoseidon();
  const babyJub = await buildBabyjub();
  // P = privateKey * c1
  const sharedPoint = babyJub.mulPointEscalar(ciphertext.c1, privateKey);

  // Usa a coordenada x do ponto compartilhado como a "chave"
  const sharedKey = poseidon([sharedPoint[0]]);
  console.log(`sharedKey -> ${sharedKey}\n`);

  let bigint = method1(sharedKey);
  // Recupera a mensagem original
  const message = ff.Scalar.sub(ciphertext.c2, bigint);

  return message;
}

function method1(arr: any) {
  let buf = arr.buffer
  let bits = 8n
  if (ArrayBuffer.isView(buf)) {
    bits = BigInt(64)
  } else {
    buf = new Uint8Array(buf)
  }

  let ret = 0n
  for (const i of buf.values()) {
    const bi = BigInt(i)
    ret = (ret << bits) + bi
  }
  return ret
}