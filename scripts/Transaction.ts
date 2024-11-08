import { Transfer } from "../model/interfaces";
import { viem } from "hardhat";
import chalk, { Chalk } from "chalk";

/*
const provider = new ethers.JsonRpcProvider();
const defaultWallet = new ethers.Wallet("" );
const harpoABI = require("./contracts/abi/Harpo.json");
const harpoContract = new ethers.Contract("",harpoABI,provider);*/

export const sendTransaction = async (transfer: Transfer): Promise<any[]> => {
  const readline = require("readline-sync");
  const verifierContract = await viem.deployContract("Groth16Verifier");
  console.log(
    chalk.greenBright(
      " Contrato verificador de prova implantado na rede\n"
    )
  );
  console.log("Address ->",verifierContract.address);
  readline.question("Continua...");

  const publicClient = await viem.getPublicClient();
  //const [deployer, account1] = await viem.getWalletClients();
  //const harpoContract = await viem.deployContract("Harpo",[verifierContract.address]);
  const harpoContract = await viem.deployContract("Harpo",[verifierContract.address]);
  console.log(
    chalk.greenBright(
      " Contrato Harpo implantado na rede\n"
    )
  );
  readline.question("Continua...");
  //console.log("transfer", transfer);
  const hash = await harpoContract.write.processTransfer([transfer]);
  console.log(
    chalk.greenBright(
      " Transação de transferência realizada\n"
    )
  );  
  console.log("hash", hash);
  readline.question("Continua...");

  const receipt = await publicClient.waitForTransactionReceipt({ hash });  
  console.log("Recibo Transação ->", receipt);
  const commEvents = await harpoContract.getEvents.CommitmentGenerated();
  //console.log("commEvents", commEvents);
  return commEvents;
};
