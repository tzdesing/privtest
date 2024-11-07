import { genKeypair } from "maci-crypto";
import { bigIntToUint8Array, generatePrivKey, getSecret } from "./Functions";
import { UTXO } from "./Interfaces";
import { Transfer } from "../model/interfaces";
import { ethers } from "ethers";
import { viem } from "hardhat";
 /*
const provider = new ethers.JsonRpcProvider();
const defaultWallet = new ethers.Wallet("" );
const harpoABI = require("./contracts/abi/Harpo.json");
const harpoContract = new ethers.Contract("",harpoABI,provider);*/

export const sendTransaction = async (transfer: Transfer): Promise<any[]> => {
    const tokenContract = await viem.deployContract("MyToken");
    const publicClient = await viem.getPublicClient();
    const [deployer, account1] = await viem.getWalletClients();
    const hash = await tokenContract.write.transfer([account1.account.address, 1n]);
    console.log("hash",hash);
    await publicClient.waitForTransactionReceipt({ hash });
    const withdrawalEvents = await tokenContract.getEvents.Transfer();
    return [""];
};
