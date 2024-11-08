import { Point } from "circomlibjs";



export interface Proof {
  proofType: string;
  proofValue: any;
}

export interface Input {
  nullifier: `0x${string}`;
  ownershipProof: {
    pA: readonly [any, any];
    pB: readonly [readonly [any, any], readonly [any, any]];
    pC: readonly [any, any];
  };
}

export interface UTXO {
  owner: any;
  type: string;
  amount: number;
  nonce: string;
}

export interface Output {
  secret: `0x${string}`;
}


export interface Transfer {
  inputs: ReadonlyArray<Input>;
  merkleRoot: `0x${string}`;
  outputs: ReadonlyArray<Output>;
  massConservationProof: `0x${string}`;
  auditSecret: any;
  auditProof: any;
}

export interface PublicKey {
  packed: bigint,
  //unpacked: Point<bigint>
}

export interface KeyPair {
  privateKey: bigint
  publicKey: PublicKey
}