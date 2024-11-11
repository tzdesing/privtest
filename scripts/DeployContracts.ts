import { viem } from "hardhat";
import chalk, { Chalk } from "chalk";

export const deployContracts = async (): Promise<any> => {
  const readline = require("readline-sync");

  const verifierContract = await viem.deployContract("Groth16Verifier");
  console.log(
    chalk.greenBright(
      " Contrato verificador de prova implantado na rede\n"
    )
  );
  console.log("Address Verifier ->",verifierContract.address);
  readline.question("\nContinua...");

  const harpoContract = await viem.deployContract("Harpo",[verifierContract.address]);
  console.log(
    chalk.greenBright(
      "\n Contrato Harpo implantado na rede\n"
    )
  );
  console.log("Address Harpo ->",verifierContract.address);
  readline.question("\nContinua...");
  
  return harpoContract;
};
