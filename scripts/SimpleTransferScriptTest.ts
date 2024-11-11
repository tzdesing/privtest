import path = require("path");
import chalk, { Chalk } from "chalk";

import { genKeypair, genRandomSalt } from "maci-crypto";
import { buildBabyjub } from "circomlibjs";
import { Secret, Transfer, UTXO } from "../model/interfaces";
import hexToObject, {
  decryptMessage,
  generatePrivKey,
  getSecret,
  getSecretAudit,
  hexToBigInt,
  objectToHex,
  to32ByteHex,
  unpackSecret,
} from "./Functions";
import { Circuit } from "./Circuit";
import { buildOutputs } from "./Outputs";
import { buildInputs } from "./Inputs";
import { buildMassConservationProof } from "./MassConservation";
import { genAuditProof } from "./Audit";
import { sendTransaction } from "./Transaction";
import { deployContracts } from "./DeployContracts";

async function main() {
  const readline = require("readline-sync");
  const babyJub = await buildBabyjub();

  const privKeyBob: string = generatePrivKey();
  const privKeyAlice: string = generatePrivKey();
  const privKeyAdmin: string = generatePrivKey();

  const publicKeyBob = babyJub.mulPointEscalar(babyJub.Base8, privKeyBob);
  const publicKeyAlice = babyJub.mulPointEscalar(babyJub.Base8, privKeyAlice);
  const publicKeyAdmin = babyJub.mulPointEscalar(babyJub.Base8, privKeyAdmin);

  const utxoA: UTXO = {
    owner: [
      babyJub.F.toObject(publicKeyAlice[0]).toString(),
      babyJub.F.toObject(publicKeyAlice[1]).toString(),
    ],
    type: "DREX",
    amount: 9,
    nonce: genRandomSalt().toString(),
  };

  const utxoB: UTXO = {
    owner: [
      babyJub.F.toObject(publicKeyAlice[0]).toString(),
      babyJub.F.toObject(publicKeyAlice[1]).toString(),
    ],
    type: "DREX",
    amount: 11,
    nonce: genRandomSalt().toString(),
  };

  const utxoC: UTXO = {
    owner: [
      babyJub.F.toObject(publicKeyAlice[0]).toString(),
      babyJub.F.toObject(publicKeyAlice[1]).toString(),
    ],
    type: "DREX",
    amount: 5,
    nonce: genRandomSalt().toString(),
  };

  const utxoD: UTXO = {
    owner: [
      babyJub.F.toObject(publicKeyBob[0]).toString(),
      babyJub.F.toObject(publicKeyBob[1]).toString(),
    ],
    type: "DREX",
    amount: 15,
    nonce: genRandomSalt().toString(),
  };

  console.log(
    chalk.greenBright(
      "\n Esse script demonstra a transferência simples privada de valores entre Alice e Bob\n"
    )
  );
  console.log(
    chalk.greenBright(
      " Primeiro iremos implantar os contratos inteligentes na rede\n"
    )
  );

  const harpoContract = await deployContracts();

  console.log(
    chalk.greenBright(
      "\n Agora criaremos um par de chaves para os envolvidos\n"
    )
  );

  console.log(
    chalk.greenBright(
      " Chave Pública Alice -> \n",
      babyJub.F.toObject(publicKeyAlice[0]).toString() + "\n"
    )
  );

  readline.question("Continua...");

  console.log(
    chalk.greenBright(
      " Chave Pública Bob -> \n",
      babyJub.F.toObject(publicKeyBob[0]).toString() + "\n"
    )
  );

  readline.question("Continua...");

  console.log(
    chalk.greenBright(
      " Chave Pública Autoridade do Contrato (Admin) -> \n",
      babyJub.F.toObject(publicKeyAdmin[0]).toString() + "\n"
    )
  );

  readline.question("Continua...");

  console.log(
    chalk.greenBright(
      " Alice possui 2 UTXO's (9 e 11) deseja transferir 15 para Bob, e receber 5 de troco\n"
    )
  );

  readline.question("Continua...");

  console.log(
    chalk.greenBright(
      " Alice deve gerar os anuladores e as respectivas provas de propriedade, e anexar como Entradas no objeto de transferência\n"
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

  console.log(chalk.greenBright(" Eis o objeto preenchido parcialmente ->\n"));

  console.log(chalk.cyanBright(JSON.stringify(transfer0, null, 2)));
  readline.question("Continua...");

  console.log(
    chalk.greenBright(
      " Alice deve formular os tokens de saida, assim como os secrets correspondentes, e anexar no objeto de transferência\n"
    )
  );

  readline.question("Continua...");

  transfer0.outputs = await buildOutputs(
    [utxoC, utxoD],
    [publicKeyAlice, publicKeyBob]
  );

  console.log(chalk.greenBright(" Eis o objeto preenchido parcialmente ->\n"));

  console.log(chalk.cyanBright(JSON.stringify(transfer0, null, 2)));

  readline.question("Continua...");

  console.log(
    chalk.greenBright(
      " Alice deve incluir no objeto uma prova de conservação de massa, e anexar ao objeto de transferência\n"
    )
  );

  readline.question("Continua...");

  transfer0.massConservationProof = await buildMassConservationProof([
    utxoA,
    utxoB,
    utxoC,
    utxoD,
  ]);

  console.log(chalk.greenBright(" Eis o objeto preenchido parcialmente ->\n"));

  console.log(chalk.cyanBright(JSON.stringify(transfer0, null, 2)));

  readline.question("Continua...");

  console.log(
    chalk.greenBright(
      " Alice deve usar a chave pública da autoridade do contrato e os tokens de entrada e saída para criar o segredo e a prova de auditoria, e anexar ao objeto de transferência\n"
    )
  );
  
  const auditSecret = await getSecretAudit(
    [utxoA, utxoB, utxoC, utxoD],
    publicKeyAdmin,
    nonce2
  );
  transfer0.auditSecret = `0x${to32ByteHex("mocka")}`;
  transfer0.auditProof = await genAuditProof(auditSecret, publicKeyAdmin);

  console.log(
    chalk.greenBright(
      " Eis o objeto preenchido, pronto para ser submetido ->\n"
    )
  );

  transfer0.merkleRoot = `0x${to32ByteHex("mockroota")}`;

  console.log(chalk.cyanBright(JSON.stringify(transfer0, null, 2)));

  readline.question("Continua...");

  console.log(
    chalk.greenBright(
      " Alice deve submeter a transação ao contrato privado na rede\n"
    )
  );

  readline.question("Continua...");

  const events = await sendTransaction(harpoContract, <Transfer>transfer0);

  readline.question("Continua...");

  console.log(chalk.greenBright(" Eventos recebidos pela rede\n"));

  console.log("Eventos -> ", events);

  const receivedSecret0: Secret = {
    c1x: events[0].args.secret.c1x,
    c1y: events[0].args.secret.c1y,
    c2: events[0].args.secret.c2,
  };

  const receivedSecret1: Secret = {
    c1x: events[1].args.secret.c1x,
    c1y: events[1].args.secret.c1y,
    c2: events[1].args.secret.c2,
  };

  console.log(
    chalk.greenBright(
      " Bob e Alice escutam eventos na rede e tentam decriptar com suas respectivas chaves privadas\n"
    )
  );

  try{
    const decrpMsgBob = await decryptMessage(
      BigInt(privKeyBob),
      unpackSecret(receivedSecret0)
    );  
    console.log("Evento 1, decriptado por Bob ->\n", hexToObject<UTXO>(decrpMsgBob));
  }catch(e){
    console.log("Bob não conseguiu decriptar o Evento 1\n");
  }

  try{
    const decrpMsgBob = await decryptMessage(
      BigInt(privKeyBob),
      unpackSecret(receivedSecret1)
    );  
    console.log("Evento 2, decriptado por Bob ->\n", hexToObject<UTXO>(decrpMsgBob));
  }catch(e){
    console.log("Bob não conseguiu decriptar o Evento 2\n");
  }

  try{
    const decrpMsgAlice = await decryptMessage(
      BigInt(privKeyAlice),
      unpackSecret(receivedSecret0)
    );  
    console.log("Evento 1, decriptado por Alice ->\n", hexToObject<UTXO>(decrpMsgAlice));
  }catch(e){
    console.log("Alice não conseguiu decriptar o Evento 1\n");
  }

  try{
    const decrpMsgAlice = await decryptMessage(
      BigInt(privKeyAlice),
      unpackSecret(receivedSecret1)
    );  
    console.log("Evento 2, decriptado por Alice ->\n", hexToObject<UTXO>(decrpMsgAlice));
  }catch(e){
    console.log("Alice não conseguiu decriptar o Evento 2\n");
  }

  /*const { proof, publicSignals } = await snarkjs.groth16.fullProve(
    { x: x },
    "build/poseidon_hasher_js/poseidon_hasher.wasm",
    "circuits/circuit_0000.zkey"
  ); 
  const vKey = JSON.parse(fs.readFileSync("circuits/verification_key.json"));
  const res = await snarkjs.groth16.verify(vKey, [commitment], proof);
  res === true ? console.log("Verification OK") : console.log("Invalid proof");*/
  //================================================================================================

  //const Pubkey = new Circuit("pubkey");
  //const { proofJson, publicSignals } = await Pubkey.generateProofGrowth16({ sk: privKeyAlice });
  //const resPubkey = await Pubkey.verifyProofGrowth16(proofJson, [babyJub.F.toObject(publicKeyAlice[0]).toString(), babyJub.F.toObject(publicKeyAlice[1]).toString()]);

  //resPubkey === true ? console.log("Verification Pubkey OK") : console.log("Invalid Pubkey proof");

  //const C1 = new Circuit("pubkey");
  //const { proofJson, publicSignals } = await C1.generateProofGrowth16({ sk: nonce0.toString() });
  //const resC1 = await C1.verifyProofGrowth16(proofJson, [babyJub.F.toObject(secret0.c1[0]).toString(), babyJub.F.toObject(secret0.c1[1]).toString()]);

  //resC1 === true ? console.log("Verification C1 OK") : console.log("Invalid C1 proof");
  /*const sharedPoint = babyJub.mulPointEscalar(publicKeyAlice, nonce0);
  const C2 = new Circuit("c2_verify");
  const { proofJson, publicSignals } = await C2.generateProofGrowth16(
    { 
      sharedPointX: babyJub.F.toObject(sharedPoint[0]).toString(), message: hexToBigInt(objectToHex(utxoA))
    }
  );   
  const resC2 = await C2.verifyProofGrowth16(proofJson, secret0.c2);
  resC2 === true ? console.log("Verification C2 OK") : console.log("Invalid C2 proof");*/

  /* const SecretVerify = new Circuit("secret_verify");
  const { proofJsonV, publicSignalsV } = await SecretVerify.generateProofGrowth16({ 
    pubKeyX: BigInt(babyJub.F.toObject(publicKeyAlice[0]).toString()),
    pubKeyY: BigInt(babyJub.F.toObject(publicKeyAlice[1]).toString()),    
    message: hexToBigInt(objectToHex(utxoA)),
    //e:array,
    r: nonce0
   }); */
  //const resSecretVerify = await SecretVerify.verifyProofGrowth16(proofJsonV, [uint8R2bigInt(secret0.c1[0]),uint8R2bigInt(secret0.c1[1]),secret0.c2]);
  //resSecretVerify === true ? console.log("Verification SecretVerify OK") : console.log("Invalid SecretVerify proof");
  //const { privKey, pubKey } = genKeypair();
  //const formattedPrivateKey = formatPrivKeyForBabyJub(privKey);
  //const privateKey = BigInt(privKey.toString());//ff.Scalar.random();  // Chave privada do receptor
  //const field = babyJub.F;
  //const publicKey = babyJub.mulPointEscalar(babyJub.Base8, privKey);  // Chave pública correspondente
  //const publicKeyAlice = babyJub.mulPointEscalar(babyJub.Base8, keypairAlice.privKey.toString());
  //const publicKeyBob = babyJub.mulPointEscalar(babyJub.Base8, keypairBob.privKey.toString());
  //const nonce = BigInt(genKeypair().privKey.toString());
  //const secret = await getSecret(utxo, publicKeyBob, nonce);
  // utxo, secret, chave privada -> secret + hash = commitment, commitment + privKey = nullifier

  process.exit();
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
