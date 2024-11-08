import { viem } from "hardhat";
import path = require("path");
import chalk, { Chalk } from "chalk";
import { parseEther, formatEther } from "viem";
import { ethers } from "ethers";

import {
  genKeypair,
  genRandomSalt,
} from "maci-crypto";
import {
  BabyJub,
  buildBabyjub,
  Eddsa,
  buildPoseidon,
  Point,
} from "circomlibjs";
import { Input, Output, Proof, Transfer, UTXO } from "../model/interfaces";
import {
  generatePrivKey,
  getSecret,
  getSecretAudit,
  hexToBigInt,
  objectToHex,
  uint8R2bigInt,
} from "./Functions";
import { Circuit } from "./Circuit";
import { buildOutputs } from "./Outputs";
import { buildInputs } from "./Inputs";
import { buildMassConservationProof } from "./MassConservation";
import { genAuditProof } from "./Audit";
import { sendTransaction } from "./Transaction";

async function main() {
  const readline = require('readline-sync');
  const babyJub = await buildBabyjub();

  const privKeyBob: string = generatePrivKey();
  const privKeyAlice: string = generatePrivKey();
  const privKeyAdmin: string = generatePrivKey();

  const publicKeyBob = babyJub.mulPointEscalar(babyJub.Base8, privKeyBob);
  const publicKeyAlice = babyJub.mulPointEscalar(babyJub.Base8, privKeyAlice);
  const publicKeyAdmin = babyJub.mulPointEscalar(babyJub.Base8, privKeyAdmin);

  const utxoA: UTXO = {
    owner: [babyJub.F.toObject(publicKeyAlice[0]).toString(),babyJub.F.toObject(publicKeyAlice[1]).toString()],
    type: "DREX",
    amount: 9,
    nonce: genRandomSalt().toString(),
  };

  const utxoB: UTXO = {
    owner: [babyJub.F.toObject(publicKeyAlice[0]).toString(),babyJub.F.toObject(publicKeyAlice[1]).toString()],
    type: "DREX",
    amount: 11,
    nonce: genRandomSalt().toString(),
  };

  const utxoC: UTXO = {
    owner: [babyJub.F.toObject(publicKeyAlice[0]).toString(),babyJub.F.toObject(publicKeyAlice[1]).toString()],
    type: "DREX",
    amount: 5,
    nonce: genRandomSalt().toString(),
  };

  const utxoD: UTXO = {
    owner: [babyJub.F.toObject(publicKeyBob[0]).toString(),babyJub.F.toObject(publicKeyBob[1]).toString()],
    type: "DREX",
    amount: 15,
    nonce: genRandomSalt().toString(),
  };

  console.log(
    chalk.greenBright(
      " Chave Pública Alice -> \n",babyJub.F.toObject(publicKeyAlice[0]).toString() +"\n"
    )
  );

  readline.question("Continua...");

  console.log(
    chalk.greenBright(
      " Chave Pública Bob -> \n",babyJub.F.toObject(publicKeyBob[0]).toString() +"\n"
    )
  );

  readline.question("Continua...");

  console.log(
    chalk.greenBright(
      " Chave Pública Autoridade do Contrato (Admin) -> \n",babyJub.F.toObject(publicKeyAdmin[0]).toString() +"\n"
    )
  );

  readline.question("Continua...");

  console.log(
    chalk.greenBright(
      " Alice possue 2 UTXO's (9 e 11) deseja transferir 15 para Bob, e receber 5 de troco\n"
    )
  );

  readline.question("Continua...");

  console.log(
    chalk.greenBright(
      " Alice deve gerar os anuladores e as respectivas provas de propriedade, e anexar como Entradas no objeto de transferencia\n"
    )
  );
  
  readline.question("Continua...");
  
  const nonce0 = BigInt(generatePrivKey());  
  const secret0 = await getSecret(utxoA, publicKeyAlice, nonce0);
  const nonce1 = BigInt(genKeypair().privKey.toString());
  const secret1 = await getSecret(utxoB, publicKeyAlice, nonce1);
  const nonce2 = BigInt(generatePrivKey());  
  let transfer0: Partial<Transfer> = {};

  transfer0.inputs = await buildInputs([secret0, secret1], privKeyAlice);  
    
  console.log(
    chalk.greenBright(
      " Eis o objeto preenchido parcialmente ->\n"
    )
  );

  console.log(transfer0);
  readline.question("Continua...");

  console.log(
    chalk.greenBright(
      " Alice deve formular os tokens de saida , assim como os secrets correspondentes, e anexar no objeto de transferencia\n"
    )
  );
  
  readline.question("Continua...");

  transfer0.outputs = await buildOutputs([utxoC, utxoD]);

  console.log(
    chalk.greenBright(
      " Eis o objeto preenchido parcialmente ->\n"
    )
  );

  console.log(transfer0);

  readline.question("Continua...");

  console.log(
    chalk.greenBright(
      " Alice deve incluir no objeto uma prova de conservação de massa, e anexar ao objeto de transferencia\n"
    )
  );
  
  readline.question("Continua...");

  transfer0.massConservationProof = await buildMassConservationProof([utxoA, utxoB, utxoC, utxoD]);

  console.log(
    chalk.greenBright(
      " Eis o objeto preenchido parcialmente ->\n"
    )
  );

  console.log(transfer0);

  readline.question("Continua...");

  console.log(
    chalk.greenBright(
      " Alice deve usar a chave pública da autoridade do contrato e os tokens de entrada e saída para criar o segredo e a prova de auditoria, e anexar ao objeto de transferencia\n"
    )
  );
  const auditSecret = await getSecretAudit([utxoA, utxoB, utxoC, utxoD], publicKeyAdmin,nonce2);
  transfer0.auditSecret = `0x${"1f9dd0919c21c990e6304f39677d4ddc559d429de7497c15b9f57545dee156b2"}`;
  transfer0.auditProof = await genAuditProof(auditSecret, publicKeyAdmin);

  console.log(
    chalk.greenBright(
      " Eis o objeto preenchido, pronto para ser submetido ->\n"
    )
  );

  transfer0.merkleRoot = `0x${"1f9dd0919c21c990e6304f39677d4ddc559d429de7497c15b9f57545dee156b2"}`;

  console.log(transfer0);

  readline.question("Continua...");

  console.log(
    chalk.greenBright(
      " Alice submete a transação ao contrato privado na rede\n"
    )
  );  

  readline.question("Continua...");  

  const events = await sendTransaction(<Transfer>transfer0);

  readline.question("Continua..."); 

  //log do recibo da transação.

  //verificar merkle tree antes e depois
  //verificar mapper nullifier antes e depois

  //listener eventos bob e alice
  //decrifar mensagem e log

  /*const { proof, publicSignals } = await snarkjs.groth16.fullProve(
    { x: x },
    "build/poseidon_hasher_js/poseidon_hasher.wasm",
    "circuits/circuit_0000.zkey"
  );
  console.log(publicSignals);
  console.log(proof);
  const vKey = JSON.parse(fs.readFileSync("circuits/verification_key.json"));
  const res = await snarkjs.groth16.verify(vKey, [commitment], proof);
  res === true ? console.log("Verification OK") : console.log("Invalid proof");*/
  //================================================================================================
 
  //const Pubkey = new Circuit("pubkey");
  //const { proofJson, publicSignals } = await Pubkey.generateProofGrowth16({ sk: privKeyAlice });  
  //console.log(publicSignals);
 //console.log(proofJson);
  //const resPubkey = await Pubkey.verifyProofGrowth16(proofJson, [babyJub.F.toObject(publicKeyAlice[0]).toString(), babyJub.F.toObject(publicKeyAlice[1]).toString()]);

  //resPubkey === true ? console.log("Verification Pubkey OK") : console.log("Invalid Pubkey proof");

  //const C1 = new Circuit("pubkey");
  //const { proofJson, publicSignals } = await C1.generateProofGrowth16({ sk: nonce0.toString() });  
  //console.log(publicSignals);
  //console.log(proofJson);
  //const resC1 = await C1.verifyProofGrowth16(proofJson, [babyJub.F.toObject(secret0.c1[0]).toString(), babyJub.F.toObject(secret0.c1[1]).toString()]);

  //resC1 === true ? console.log("Verification C1 OK") : console.log("Invalid C1 proof");
  const sharedPoint = babyJub.mulPointEscalar(publicKeyAlice, nonce0);
  const C2 = new Circuit("c2_verify");
  const { proofJson, publicSignals } = await C2.generateProofGrowth16(
    { 
      sharedPointX: babyJub.F.toObject(sharedPoint[0]).toString(), message: hexToBigInt(objectToHex(utxoA))
    }
  );  
  console.log(publicSignals);
  console.log(proofJson);
  const resC2 = await C2.verifyProofGrowth16(proofJson, secret0.c2);

  resC2 === true ? console.log("Verification C2 OK") : console.log("Invalid C2 proof");

//=======================================================================
const array = []
const size = 253
for (let i = 0; i < size; i++) {
  array.push(0)
}
  const SecretVerify = new Circuit("secret_verify");
  const { proofJsonV, publicSignalsV } = await SecretVerify.generateProofGrowth16({ 
    pubKeyX: BigInt(babyJub.F.toObject(publicKeyAlice[0]).toString()),
    pubKeyY: BigInt(babyJub.F.toObject(publicKeyAlice[1]).toString()),    
    message: hexToBigInt(objectToHex(utxoA)),
    e:array,
    r: nonce0
   });
  // console.log(publicSignals);
  
  //console.log(proofJsonV);
  //const resSecretVerify = await SecretVerify.verifyProofGrowth16(proofJsonV, [uint8R2bigInt(secret0.c1[0]),uint8R2bigInt(secret0.c1[1]),secret0.c2]);

  //resSecretVerify === true ? console.log("Verification SecretVerify OK") : console.log("Invalid SecretVerify proof");




  //const { privKey, pubKey } = genKeypair();
  //const formattedPrivateKey = formatPrivKeyForBabyJub(privKey);

  //const privateKey = BigInt(privKey.toString());//ff.Scalar.random();  // Chave privada do receptor
  //console.log(`Private Key 2 ${privateKey}\n`);
  //const field = babyJub.F;
  // const publicKey = babyJub.mulPointEscalar(babyJub.Base8, privKey);  // Chave pública correspondente
  //console.log(`Public Key ${publicKey}\n`);

  //console.log(`Public Key other print ${ field.toObject(publicKey[0]).toString(), field.toObject(publicKey[1]).toString() }\n`);
  
  //let keypairAlice = genKeypair();
  //let keypairBob = genKeypair();

  //const publicKeyAlice = babyJub.mulPointEscalar(babyJub.Base8, keypairAlice.privKey.toString());
  //const publicKeyBob = babyJub.mulPointEscalar(babyJub.Base8, keypairBob.privKey.toString());

  //const nonce = BigInt(genKeypair().privKey.toString());
  //const secret = await getSecret(utxo, publicKeyBob, nonce);
  // utxo, secret, chave privada -> secret + hash = commitment, commitment + privKey = nullifier
  
    process.exit(0);  
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});