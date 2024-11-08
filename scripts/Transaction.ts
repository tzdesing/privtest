import { Transfer } from "../model/interfaces";
import { viem } from "hardhat";
/*
const provider = new ethers.JsonRpcProvider();
const defaultWallet = new ethers.Wallet("" );
const harpoABI = require("./contracts/abi/Harpo.json");
const harpoContract = new ethers.Contract("",harpoABI,provider);*/

export const sendTransaction = async (transfer: Transfer): Promise<any[]> => {
  const readline = require("readline-sync");
  const tokenContract = await viem.deployContract("Harpo");
  const publicClient = await viem.getPublicClient();
  const [deployer, account1] = await viem.getWalletClients();
  readline.question("deployed...");
  console.log("transfer", transfer);
  const hash = await tokenContract.write.processTransfer([transfer]);
  console.log("hash", hash);
  const receipt = await publicClient.waitForTransactionReceipt({ hash });
  console.log("receipt", receipt);
  const withdrawalEvents = await tokenContract.getEvents.CommitmentGenerated();
  return [""];
};
