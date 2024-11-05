import { viem } from "hardhat";
import path = require("path");

import { parseEther, formatEther } from "viem";
import { ethers } from "ethers";

import {
  genKeypair,
  formatPrivKeyForBabyJub,
  genRandomSalt,
} from "maci-crypto";
import {
  poseidonEncrypt,
  poseidonDecrypt,
  poseidonDecryptWithoutCheck,
} from "@zk-kit/poseidon-cipher";
import {
  BabyJub,
  buildBabyjub,
  Eddsa,
  buildPoseidon,
  Point,
} from "circomlibjs";
import { Input, Output, Proof, Transfer, UTXO } from "../model/interfaces";
import {
  BabyJubJubPoint,
  bigIntToHex,
  decryptMessage,
  generateCommitment,
  generateNullifier,
  generatePrivKey,
  getSecret,
  pointMulBase,
  uint8R2bigInt,
} from "./Functions";
//import { Scalar } from "@toruslabs/ffjavascript";
import { expect, assert } from "chai";
import { poseidon2 } from "poseidon-lite/poseidon2";
import { Circuit } from "./Circuit";
import { buildOutputs } from "./Outputs";
import { buildInputs } from "./Inputs";
const circom_tester = require("circom_tester");
const wasm_tester = circom_tester.wasm;

async function main() { 
  const babyJub = await buildBabyjub();

  const privKeyBob: string = generatePrivKey();
  const privKeyAlice: string = generatePrivKey();

  const publicKeyBob = babyJub.mulPointEscalar(babyJub.Base8, privKeyBob); // Chave pública correspondente
  const publicKeyAlice = babyJub.mulPointEscalar(babyJub.Base8, privKeyAlice);
  
  const utxo = {
    owner: publicKeyAlice.toString(),
    type: "DREX",
    amount: 15,
    nonce: genRandomSalt().toString(),
  };

  const utxoA: UTXO = {
    owner: publicKeyAlice.toString(),
    type: "DREX",
    amount: 10,
    nonce: genRandomSalt().toString(),
  };

  const utxoB: UTXO = {
    owner: publicKeyAlice.toString(),
    type: "DREX",
    amount: 10,
    nonce: genRandomSalt().toString(),
  };

  const utxoC: UTXO = {
    owner: publicKeyAlice.toString(),
    type: "DREX",
    amount: 5,
    nonce: genRandomSalt().toString(),
  };

  const utxoD: UTXO = {
    owner: publicKeyBob.toString(),
    type: "DREX",
    amount: 15,
    nonce: genRandomSalt().toString(),
  };
  let transfer0: Partial<Transfer> = {};
  const nonce0 = BigInt(genKeypair().privKey.toString());
  const secret0 = await getSecret(utxoA, publicKeyAlice, nonce0);
  const nonce1 = BigInt(genKeypair().privKey.toString());
  const secret1 = await getSecret(utxoB, publicKeyAlice, nonce1);
  transfer0.inputs = await buildInputs([secret0,secret1],privKeyAlice);
  console.log(transfer0);
  transfer0.outputs = await buildOutputs([utxoC,utxoD]);
  console.log(transfer0);
  
    
  const commitment = await generateCommitment5(secret0);

  const c1 = uint8R2bigInt(secret0.c1);

  console.log(`commitment ${commitment}\n`);
  const x: string[] = [c1, secret0.c2];
  console.log(`x ${x}\n`);
  const PoseidonHasher = new Circuit("poseidon_hasher");
  const { proofJson, publicSignals } = await PoseidonHasher.generateProofGrowth16({ x: x });
  console.log(publicSignals);
  console.log(proofJson);  
  const res = await PoseidonHasher.verifyProofGrowth16(proofJson, [commitment]);
  res === true ? console.log("Verification  OK") : console.log("Invalid  proof");

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

  const sk: string = generatePrivKey();
  const pk: BabyJubJubPoint = await pointMulBase(sk);
  const Pubkey = new Circuit("pubkey");
  //const { proofJson, publicSignals } = await Pubkey.generateProofPlonk({ sk: sk });
 // console.log(publicSignals);
  //console.log(proofJson);  
  //const resPubkey = await Pubkey.verifyProofPlonk(proofJson, [pk.x, pk.y]);

  //resPubkey === true ? console.log("Verification Pubkey OK") : console.log("Invalid Pubkey proof");

  //const { privKey, pubKey } = genKeypair();
  //const formattedPrivateKey = formatPrivKeyForBabyJub(privKey);

  //const privateKey = BigInt(privKey.toString());//ff.Scalar.random();  // Chave privada do receptor
  //console.log(`Private Key 2 ${privateKey}\n`);
  const field = babyJub.F;
  // const publicKey = babyJub.mulPointEscalar(babyJub.Base8, privKey);  // Chave pública correspondente
  //console.log(`Public Key ${publicKey}\n`);

  //console.log(`Public Key other print ${ field.toObject(publicKey[0]).toString(), field.toObject(publicKey[1]).toString() }\n`);

  const publicKeyAliceFormatted =
    field.toObject(publicKeyAlice[0]).toString() +
    field.toObject(publicKeyBob[1]).toString();
  console.log(`Public Key other other ${publicKeyAliceFormatted}\n`);

  const proofE1: Proof = {
    proofType: "ownership",
    proofValue: "proofOwnershipE1",
  };
  const inputE1: Input = {
    secret: "secretE1",
    proof: proofE1,
  };
  const inputE2: Input = {
    secret: "secretE2",
    proof: proofE1,
  };
  let transfer: Partial<Transfer> = {};
  transfer.inputs = [];
  transfer.outputs = [];
  transfer.inputs?.push(inputE1);
  transfer.inputs?.push(inputE2); 
  transfer.secretAudit = "teste";
  transfer.massConservationProof = proofE1;
  transfer.nonRepudiationProof = proofE1;

  //let keypairAlice = genKeypair();
  //let keypairBob = genKeypair();

  //const publicKeyAlice = babyJub.mulPointEscalar(babyJub.Base8, keypairAlice.privKey.toString());
  //const publicKeyBob = babyJub.mulPointEscalar(babyJub.Base8, keypairBob.privKey.toString());

  console.log("UTXO:", utxo);
  const nonce = BigInt(genKeypair().privKey.toString());
  const secret = await getSecret(utxo, publicKeyBob, nonce);
  console.log("Secret:", secret);

  const decryptedMessage = await decryptMessage(BigInt(privKeyBob), secret);
  console.log("Decrypted Message:", decryptedMessage.toString());

  //const originalTransfer = hexToObject<Transfer>(bigIntToHex(decryptedMessage));

 // console.log("Objeto original:", originalTransfer);

  const commitment0 = await generateCommitment(secret);
  console.log("commitment:", commitment0);

  const commitment2 = await generateCommitment2(secret);
  console.log("commitment2:", commitment2);

  //const commitment3 = await generateCommitment3(secret.toString());
  //console.log("commitment3:", commitment3);

  const commitment4 = await generateCommitment4(secret);
  console.log("commitment4:", commitment4);

  // utxo, secret, chave privada -> secret + hash = commitment, commitment + privKey = nullifier
  /*  1 - dado o utxo o circuito deve verificar se a chave privada corresponde a chave publica
    2 - o circuito deve verificar se o nullifier informado corresponde ao gerado
 */
  const nullifier = await generateNullifier(commitment0, BigInt(privKeyAlice));
  console.log("nullifier:", nullifier);

  // const nullifier2 = await generateNullifier("0x05a8bb43bc12094a558d07b616dbd67fd2bd9424bfbc63fc0e153f5319d14824"
  //  ,8551855048008782979107013480347516135469250250593118959707731087375201543621n);
  //console.log("nullifier2:", nullifier2);
  //commitment: 0x05a8bb43bc12094a558d07b616dbd67fd2bd9424bfbc63fc0e153f5319d14824
  //nullifier: 0x39c643136780b6c7832c849e7d97770605e09768366ad464a5cd6a15ef399829

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

async function generateCommitment5(secret: any) {
  const poseidon = await buildPoseidon();
  return poseidon2([
    uint8R2bigInt(secret.c1),
    //0,
    secret.c2,
  ]);
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

async function encryptMessage(publicKey: any, message: bigint): Promise<any> {
  console.log(`message -> ${message}\n`);
  const ff = require("ffjavascript");

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

  let bigint = uint8R2bigInt(sharedKey); // 42n

  const c2 = ff.Scalar.add(message, bigint);

  return { c1, c2 };
}