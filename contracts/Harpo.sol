// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8;

import {Groth16Verifier} from "./VerifierPubKey.sol";
import {SparseMerkleTree} from "./SparseMerkleTree.sol";


interface IPoseidon {
    function hash(bytes32[1] memory input) external view returns (bytes32);
}

contract Harpo {

    Groth16Verifier internal verifier;

    struct Proof {
        uint[2] pA;
        uint[2][2] pB;
        uint[2] pC;
    }
    
    struct Input {
        bytes32 nullifier;
        Proof ownershipProof;  // Usando `bytes` para representar dados genéricos
    }
   
    struct Output {
        bytes32 secret;
    }

    
    
    struct Transfer {
        Input[] inputs;             // Lista de `Input`
        bytes32 merkleRoot;         // Merkle root como `bytes32`
        Output[] outputs;           // Lista de `Output`
        bytes massConservationProof; // Dados arbitrários
        bytes auditSecret;           // Dados arbitrários
        bytes auditProof;            // Dados arbitrários
    }

    event CommitmentGenerated(bytes32 secret, bytes32 commitment);

    error InvalidProof(
        bytes32 leaf,
        uint256 index,
        uint256 enables,
        bytes32[] path
    );

    mapping(bytes32 => bool) public nullifiersUsed;
    mapping(bytes32 => bool) public commitments;
   
    IPoseidon public poseidon;    
   
    function processTransfer(Transfer memory transfer) public {
        
        for (uint i = 0; i < transfer.inputs.length; i++) {
            bytes32 nullifier = transfer.inputs[i].nullifier;
            require(!nullifiersUsed[nullifier], "Nullifier ja utilizado");
            nullifiersUsed[nullifier] = true; 
        }
        
        uint256[2] memory fixedSizeInputs;

        for (uint i = 0; i < transfer.inputs.length; i++) {
            require(
                verifier.verifyProof(
                    transfer.inputs[i].ownershipProof.pA,
                    transfer.inputs[i].ownershipProof.pB,
                    transfer.inputs[i].ownershipProof.pC,
                    fixedSizeInputs
                ), "Ownership proof invalida");
        }

        for (uint i = 0; i < transfer.outputs.length; i++) {            
            generateCommitment( transfer.outputs[i].secret);
        }
        //require(proofVerifier.verify(transfer.massConservationProof), "Mass conservation proof invalida");

    }

    function isNullifierUsed(bytes32 nullifier) public view returns (bool) {
        return nullifiersUsed[nullifier];
    }

    function commitmentExixts(bytes32 commitment) public view returns (bool) {
        return commitments[commitment];
    }

    function generateCommitment(bytes32 secret) public {
        bytes32 commitment = poseidon.hash([secret]);
        commitments[commitment] = true; 
        emit CommitmentGenerated(secret, commitment);
    }
}
