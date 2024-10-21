pragma solidity ^0.8.0;
library Pairing {
    struct G1Point {
        uint X;
        uint Y;
    }
    // Encoding of field elements is: X[0] * z + X[1]
    struct G2Point {
        uint[2] X;
        uint[2] Y;
    }
    /// @return the generator of G1
    function P1() pure internal returns (G1Point memory) {
        return G1Point(1, 2);
    }
    /// @return the generator of G2
    function P2() pure internal returns (G2Point memory) {
        return G2Point(
            [10857046999023057135944570762232829481370756359578518086990519993285655852781,
             11559732032986387107991004021392285783925812861821192530917403151452391805634],
            [8495653923123431417604973247489272438418190587263600148770280649306958101930,
             4082367875863433681332203403145435568316851327593401208105741076214120093531]
        );
    }
    /// @return the negation of p, i.e. p.addition(p.negate()) should be zero.
    function negate(G1Point memory p) pure internal returns (G1Point memory) {
        // The prime q in the base field F_q for G1
        uint q = 21888242871839275222246405745257275088696311157297823662689037894645226208583;
        if (p.X == 0 && p.Y == 0)
            return G1Point(0, 0);
        return G1Point(p.X, q - (p.Y % q));
    }
    /// @return r the sum of two points of G1
    function addition(G1Point memory p1, G1Point memory p2) internal view returns (G1Point memory r) {
        uint[4] memory input;
        input[0] = p1.X;
        input[1] = p1.Y;
        input[2] = p2.X;
        input[3] = p2.Y;
        bool success;
        assembly {
            success := staticcall(sub(gas(), 2000), 6, input, 0xc0, r, 0x60)
            // Use "invalid" to make gas estimation work
            switch success case 0 { invalid() }
        }
        require(success);
    }


    /// @return r the product of a point on G1 and a scalar, i.e.
    /// p == p.scalar_mul(1) and p.addition(p) == p.scalar_mul(2) for all points p.
    function scalar_mul(G1Point memory p, uint s) internal view returns (G1Point memory r) {
        uint[3] memory input;
        input[0] = p.X;
        input[1] = p.Y;
        input[2] = s;
        bool success;
        assembly {
            success := staticcall(sub(gas(), 2000), 7, input, 0x80, r, 0x60)
            // Use "invalid" to make gas estimation work
            switch success case 0 { invalid() }
        }
        require (success);
    }
    /// @return the result of computing the pairing check
    /// e(p1[0], p2[0]) *  .... * e(p1[n], p2[n]) == 1
    /// For example pairing([P1(), P1().negate()], [P2(), P2()]) should
    /// return true.
    function pairing(G1Point[] memory p1, G2Point[] memory p2) internal view returns (bool) {
        require(p1.length == p2.length);
        uint elements = p1.length;
        uint inputSize = elements * 6;
        uint[] memory input = new uint[](inputSize);
        for (uint i = 0; i < elements; i++)
        {
            input[i * 6 + 0] = p1[i].X;
            input[i * 6 + 1] = p1[i].Y;
            input[i * 6 + 2] = p2[i].X[1];
            input[i * 6 + 3] = p2[i].X[0];
            input[i * 6 + 4] = p2[i].Y[1];
            input[i * 6 + 5] = p2[i].Y[0];
        }
        uint[1] memory out;
        bool success;
        assembly {
            success := staticcall(sub(gas(), 2000), 8, add(input, 0x20), mul(inputSize, 0x20), out, 0x20)
            // Use "invalid" to make gas estimation work
            switch success case 0 { invalid() }
        }
        require(success);
        return out[0] != 0;
    }
    /// Convenience method for a pairing check for two pairs.
    function pairingProd2(G1Point memory a1, G2Point memory a2, G1Point memory b1, G2Point memory b2) internal view returns (bool) {
        G1Point[] memory p1 = new G1Point[](2);
        G2Point[] memory p2 = new G2Point[](2);
        p1[0] = a1;
        p1[1] = b1;
        p2[0] = a2;
        p2[1] = b2;
        return pairing(p1, p2);
    }
    /// Convenience method for a pairing check for three pairs.
    function pairingProd3(
            G1Point memory a1, G2Point memory a2,
            G1Point memory b1, G2Point memory b2,
            G1Point memory c1, G2Point memory c2
    ) internal view returns (bool) {
        G1Point[] memory p1 = new G1Point[](3);
        G2Point[] memory p2 = new G2Point[](3);
        p1[0] = a1;
        p1[1] = b1;
        p1[2] = c1;
        p2[0] = a2;
        p2[1] = b2;
        p2[2] = c2;
        return pairing(p1, p2);
    }
    /// Convenience method for a pairing check for four pairs.
    function pairingProd4(
            G1Point memory a1, G2Point memory a2,
            G1Point memory b1, G2Point memory b2,
            G1Point memory c1, G2Point memory c2,
            G1Point memory d1, G2Point memory d2
    ) internal view returns (bool) {
        G1Point[] memory p1 = new G1Point[](4);
        G2Point[] memory p2 = new G2Point[](4);
        p1[0] = a1;
        p1[1] = b1;
        p1[2] = c1;
        p1[3] = d1;
        p2[0] = a2;
        p2[1] = b2;
        p2[2] = c2;
        p2[3] = d2;
        return pairing(p1, p2);
    }
}

contract Verifier {
    using Pairing for *;
    struct VerifyingKey {
        Pairing.G1Point alpha;
        Pairing.G2Point beta;
        Pairing.G2Point gamma;
        Pairing.G2Point delta;
        Pairing.G1Point[] gamma_abc;
    }
    struct Proof {
        Pairing.G1Point a;
        Pairing.G2Point b;
        Pairing.G1Point c;
    }
    function verifyingKey() pure internal returns (VerifyingKey memory vk) {
        vk.alpha = Pairing.G1Point(uint256(0x014919830d401fc2fbfc8d5757699a755354728caf44a56dd9d31aad24cc8f44), uint256(0x26078ad2e0d0e1acc2d604080c1a0df2cfef3fae4068a0473131d571febfd0f4));
        vk.beta = Pairing.G2Point([uint256(0x2a00690a6da6408d9818af5f6a9a3a26b22873f109c031b2bb5cc591ad0e6e97), uint256(0x12accda94bb145ffb1f6eed5f440ae4b5451b9ffae99b060d789a2f4dfb5b3c2)], [uint256(0x0d9fd6e84b96d64b7177e7ca75266e560c6e0e995997f7169ece4035c40f5607), uint256(0x2664bfa7a06e4dc0ca271936bd75f6316817b9df6ea6b18c7834f931e3b8c78d)]);
        vk.gamma = Pairing.G2Point([uint256(0x104ef6bbf1ad5b021860d00b714a173f90447c2844408308cab1b99f74a1083c), uint256(0x289516d449cce6565b88bfdb9a29c322692d5c14f2b32c3e14649c66a7fc13d8)], [uint256(0x25f4a71bc3b88d28334d775b5a6c009cc7ef4fd7bba2a7e148921b5b51165ecc), uint256(0x0b3a2aa0b91a2f415ca1ebe9b67441b8d5b8be8ee2396855621067c3428a3ea4)]);
        vk.delta = Pairing.G2Point([uint256(0x15dcaf6fa74a79b329b73cfdf43e20d693f601bf6ccf119ea0fd5218cb0a7185), uint256(0x26097b264170c12465efeb62f0114cb9eef1cd5586ad29aa113784a48f6bfc3e)], [uint256(0x05ccca7d0b7071895347a3209efccbc339719aa8131b05cfef07095a72297592), uint256(0x2a4f465791babb9ddb64616cec9e7d600eb190d7ffb12b68455efe8c84fc857a)]);
        vk.gamma_abc = new Pairing.G1Point[](5);
        vk.gamma_abc[0] = Pairing.G1Point(uint256(0x0061d1cb01161df406a4153f1486d4c3c7670abb2a8b523fafd02022190fdf42), uint256(0x05af8e118b84c15f48f7887d366135735a210aa5328debf93efd237e11ae451c));
        vk.gamma_abc[1] = Pairing.G1Point(uint256(0x1c67afc6f6275b0ede4bc7642222335e3ee3075e61fadab2a8d65bfa970a725d), uint256(0x008b80834442c417bbeb2738d2a49969d29da4f92abecf906ec7b2fe80f50501));
        vk.gamma_abc[2] = Pairing.G1Point(uint256(0x1c524f83c8a7f3b69b09a7414fe8d2d9ceb161134e115505fb45f69dc5de7a72), uint256(0x152f493ef1ea93882256e5674ab240d71171e4348f3056f7c62c9e7229d9f10e));
        vk.gamma_abc[3] = Pairing.G1Point(uint256(0x17ab0776481f4367f322f30f723d548a7968707c06b91dbc876bec916c2b3fdc), uint256(0x221afc7311035f219c1cba4cc70a13cec8adf01b4c623b66f4a88ab2478c9276));
        vk.gamma_abc[4] = Pairing.G1Point(uint256(0x2476ad47780065ee69194f47fbe1e895b0b8a59b6dd6ce0b62bd33b83b3f469b), uint256(0x0adb444cd0e5efab82ab98595b6f1fd53803bfd9f960e8d6051db6bb4388c8aa));
    }
    function verify(uint[] memory input, Proof memory proof) internal view returns (uint) {
        uint256 snark_scalar_field = 21888242871839275222246405745257275088548364400416034343698204186575808495617;
        VerifyingKey memory vk = verifyingKey();
        require(input.length + 1 == vk.gamma_abc.length);
        // Compute the linear combination vk_x
        Pairing.G1Point memory vk_x = Pairing.G1Point(0, 0);
        for (uint i = 0; i < input.length; i++) {
            require(input[i] < snark_scalar_field);
            vk_x = Pairing.addition(vk_x, Pairing.scalar_mul(vk.gamma_abc[i + 1], input[i]));
        }
        vk_x = Pairing.addition(vk_x, vk.gamma_abc[0]);
        if(!Pairing.pairingProd4(
             proof.a, proof.b,
             Pairing.negate(vk_x), vk.gamma,
             Pairing.negate(proof.c), vk.delta,
             Pairing.negate(vk.alpha), vk.beta)) return 1;
        return 0;
    }
    function verifyTx(
            Proof memory proof, uint[4] memory input
        ) public view returns (bool r) {
        uint[] memory inputValues = new uint[](4);
        
        for(uint i = 0; i < input.length; i++){
            inputValues[i] = input[i];
        }
        if (verify(inputValues, proof) == 0) {
            return true;
        } else {
            return false;
        }
    }
}