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
  const auditSecret = getSecretAudit([utxoA, utxoB, utxoC, utxoD], publicKeyAdmin,nonce2);
  transfer0.auditSecret = auditSecret;
  transfer0.auditProof = genAuditProof(auditSecret, publicKeyAdmin);

  console.log(
    chalk.greenBright(
      " Eis o objeto preenchido, pronto para ser submetido ->\n"
    )
  );

  console.log(transfer0);

  readline.question("Continua...");

  console.log(
    chalk.greenBright(
      " Alice submete a transação ao contrato privado na rede\n"
    )
  );

  //log do payload

  readline.question("Continua...");  

  sendTransaction(<Transfer>transfer0);

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
  // console.log(publicSignals);
  console.log(proofJsonV);
  const resSecretVerify = await SecretVerify.verifyProofGrowth16(proofJsonV, [uint8R2bigInt(secret0.c1[0]),uint8R2bigInt(secret0.c1[1]),secret0.c2]);

  resSecretVerify === true ? console.log("Verification SecretVerify OK") : console.log("Invalid SecretVerify proof");




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
  /* describe("ECDSAPrivToPub", function () {
    this.timeout(1000 * 1000);

    // runs circom compilation
    let circuit: any;
    before(async function () {
        circuit = await wasm_tester(path.join(__dirname, "circuits", "test_ecdsa.circom"));
    });

    // privkey, pub0, pub1
    var test_cases: Array<[bigint, bigint, bigint]> = [];

    // 4 randomly generated privkeys
    var privkeys: Array<bigint> = [88549154299169935420064281163296845505587953610183896504176354567359434168161n,
                                   37706893564732085918706190942542566344879680306879183356840008504374628845468n,
                                   90388020393783788847120091912026443124559466591761394939671630294477859800601n,
                                   110977009687373213104962226057480551605828725303063265716157300460694423838923n];
     

    var test_ecdsa_instance = function (keys: [bigint, bigint, bigint]) {
        let privkey = keys[0];
        let pub0 = keys[1];
        let pub1 = keys[2];

        var priv_tuple: [bigint, bigint, bigint, bigint] = bigint_to_tuple(privkey);
        var pub0_tuple: [bigint, bigint, bigint, bigint] = bigint_to_tuple(pub0);
        var pub1_tuple: [bigint, bigint, bigint, bigint] = bigint_to_tuple(pub1);

        it('Testing privkey: ' + privkey + ' pubkey.x: ' + pub0 + ' pubkey.y: ' + pub1, async function() {
            let witness = await circuit.calculateWitness({"privkey": priv_tuple});
            expect(witness[1]).to.equal(pub0_tuple[0]);
            expect(witness[2]).to.equal(pub0_tuple[1]);
            expect(witness[3]).to.equal(pub0_tuple[2]);
            expect(witness[4]).to.equal(pub0_tuple[3]);
            expect(witness[5]).to.equal(pub1_tuple[0]);
            expect(witness[6]).to.equal(pub1_tuple[1]);
            expect(witness[7]).to.equal(pub1_tuple[2]);
            expect(witness[8]).to.equal(pub1_tuple[3]);
            await circuit.checkConstraints(witness);
        });
    }

    test_cases.forEach(test_ecdsa_instance);
  });*/
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});

async function generateCommitment2(secret: any) {
  const poseidon = await buildPoseidon();
  return poseidon([
    uint8R2bigInt(secret.c1[0].buffer),
    uint8R2bigInt(secret.c1[1].buffer),
    secret.c2,
  ]);
}

async function generateCommitment3(secret: string[]) {
  const poseidon = await buildPoseidon();
  const field = poseidon.F;
  const result = poseidon(secret);
  return field.toObject(result).toString();
}

async function generateCommitment4(secret: any) {
  const poseidon = await buildPoseidon();
  return uint8R2bigInt(
    poseidon([
      uint8R2bigInt(secret.c1[0].buffer),
      uint8R2bigInt(secret.c1[1].buffer),
      secret.c2,
    ])
  );
}

function hexToObject<T>(hexString: string): T {
  const strippedHex = hexString.startsWith("0x")
    ? hexString.slice(2)
    : hexString;

  const jsonString = Array.from({ length: strippedHex.length / 2 }, (_, i) =>
    String.fromCharCode(parseInt(strippedHex.slice(i * 2, i * 2 + 2), 16))
  ).join("");
  return JSON.parse(jsonString);
}

