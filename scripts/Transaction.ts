import { Transfer } from "../model/interfaces";
import { viem } from "hardhat";
/*
const provider = new ethers.JsonRpcProvider();
const defaultWallet = new ethers.Wallet("" );
const harpoABI = require("./contracts/abi/Harpo.json");
const harpoContract = new ethers.Contract("",harpoABI,provider);*/

export const sendTransaction = async (transfer: Transfer): Promise<any[]> => {
  const readline = require("readline-sync");
  const verifierContract = await viem.deployContract("Groth16Verifier");
  console.log("Address verifier",verifierContract.address);
  readline.question("deployed verifier...");

  const publicClient = await viem.getPublicClient();
  const [deployer, account1] = await viem.getWalletClients();
  //const harpoContract = await viem.deployContract("Harpo",[verifierContract.address]);
  const harpoContract = await viem.deployContract("Harpo",[verifierContract.address]);
  readline.question("deployed...");
  console.log("transfer", transfer);
  const hash = await harpoContract.write.processTransfer([transfer]);
  console.log("hash", hash);
  const receipt = await publicClient.waitForTransactionReceipt({ hash });
  console.log("receipt", receipt);
  const commEvents = await harpoContract.getEvents.CommitmentGenerated();
  console.log("commEvents", commEvents);
  return [""];
};
