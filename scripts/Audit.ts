import { genKeypair } from "maci-crypto";
import { getSecret } from "./Functions";
import { UTXO } from "./Interfaces";
import { Point } from "circomlibjs";


/*
Devemos provar que o auditSecret foi criado com conteudo da transação (preimage)
*/
export const genAuditProof = async (auditSecret: any, pubKey: Point): Promise<any> => {
  
  
  return "result";
};
