import { Transfer } from "../model/interfaces";
import { viem } from "hardhat";
import chalk, { Chalk } from "chalk";

export const sendTransaction = async (
  harpoContract: any,
  transfer: Transfer
): Promise<any[]> => {
  const readline = require("readline-sync");

  const publicClient = await viem.getPublicClient();

  const nullifierUsedAntes = await publicClient.readContract({
    address: harpoContract.address,
    abi: harpoContract.abi,
    functionName: "isNullifierUsed",
    args: [transfer.inputs[0].nullifier],
  });
  console.log(chalk.greenBright(" Consulta nullifier antes da transação\n"));
  console.log(" Nullifier usado?", nullifierUsedAntes);

  const hash = await harpoContract.write.processTransfer([transfer]);
  console.log(chalk.greenBright(" Transação de transferência realizada\n"));
  console.log("hash", hash);

  const nullifierUsed = await publicClient.readContract({
    address: harpoContract.address,
    abi: harpoContract.abi,
    functionName: "isNullifierUsed",
    args: [transfer.inputs[0].nullifier],
  });
  console.log(chalk.greenBright("Consulta Nuliffier após a transação\n"));
  console.log(" Nullifier usado?", nullifierUsed);
  readline.question("Continua...");

  const receipt = await publicClient.waitForTransactionReceipt({ hash });
  console.log("Recibo Transação ->", receipt);
  const commEvents = await harpoContract.getEvents.CommitmentGenerated();

  return commEvents;
};
