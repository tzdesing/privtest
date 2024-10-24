// SPDX-License-Identifier: MIT
pragma solidity ^0.8;

import {SparseMerkleTree} from "./SparseMerkleTree.sol";

/// @notice Example SparseMerkleTree consumer
contract SMTConsumer {
    /// @notice Depth of Merkle tree
    uint16 immutable treeDepth;
    /// @notice Merkle root
    bytes32 public root;

    error InvalidProof(
        bytes32 leaf,
        uint256 index,
        uint256 enables,
        bytes32[] path
    );

    constructor(uint16 treeDepth_) {
        treeDepth = treeDepth_;
    }

    function computeRoot(
        bytes32 leaf,
        uint256 index,
        uint256 enables,
        bytes32[] calldata path
    ) public view returns (bytes32) {
        return
            SparseMerkleTree.computeRoot(treeDepth, leaf, index, enables, path);
    }

    /// @notice Update a leaf in the tree, producing a new root.
    /// @param newLeaf New value of leaf
    /// @param oldLeaf Current leaf
    /// @param index Index of leaf in list; determines hashing direction for
    ///     proof path elements
    /// @param enables Each bit determines whether a proof path element should
    ///     be used (1) or a zero-value hash (0)
    /// @param siblings Proof path; elements only need to be defined for non-zero
    ///     siblings
    function updateRoot(
        bytes32 newLeaf,
        bytes32 oldLeaf,
        uint256 index,
        uint256 enables,
        bytes32[] calldata siblings
    ) public returns (bytes32) {
        if (root != computeRoot(oldLeaf, index, enables, siblings)) {
            revert InvalidProof(oldLeaf, index, enables, siblings);
        }
        // Replace with new leaf and compute new root
        return (root = computeRoot(newLeaf, index, enables, siblings));
    }
}