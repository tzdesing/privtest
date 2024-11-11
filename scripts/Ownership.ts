import { UTXO } from "../model/interfaces";
import { Circuit } from "./Circuit";

/*
- Devemos criar o commitment e provar q ele existe na SMT
- Devemos provar que o commitment foi gerado pelo secret
- Devemos provar que o a chave privada corresponde a chave publica do owner que consta no secret decriptado
- Devemos provar que o nullifier foi gerado através do commitment existente

*/
export const genOwnershipProof = async (utxo: UTXO, privKey: string): Promise<any> => {
  
  const Pubkey = new Circuit("pubkey");
  const { proofJson, publicSignals, proofCalldata } = await Pubkey.generateProofGrowth16({ sk: privKey });  
  //console.log(publicSignals);
  //console.log(proofJson);
  //TODO remover verificação local
  const resPubkey = await Pubkey.verifyProofGrowth16(proofJson, [utxo.owner[0],utxo.owner[1]]);

  
  //resPubkey === true ? console.log("Verification Pubkey OK") : console.log("Invalid Pubkey proof");

  /*
  const commitmentExists: boolean = verifyCommitmentXSMT( commitmentO);
  const commitmentOk: boolean = verifySecretXCommitment( secret, commitment);
  const nullifierOk: boolean = verifySecretXCommitment( privkey, commitment);
  const knowPrivOfPub: boolean = verifyPrivXPub( priv, secret );
  */
  return proofCalldata;
};
