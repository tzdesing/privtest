# Harpo

**Harpo** é uma solução que utiliza o conceito de *Zero Knowledge* (conhecimento zero) e o modelo *UTXO* (Unspent Transaction Output) para garantir a privacidade e anonimidade das transações em uma rede privada. Além disso, Harpo utiliza um *map de Nullifiers* para verificar UTXOs gastos, assegurando que uma transação seja única e não reutilizável.

## Visão Geral

Harpo foi projetado para resolver problemas de privacidade em redes de transações descentralizadas, aproveitando duas tecnologias principais:

- **Zero Knowledge Proofs**: Garante que transações possam ser verificadas sem revelar as informações privadas dos participantes.
- **Modelo UTXO**: Controla a movimentação de ativos entre as partes sem expor dados sensíveis.
- **Nullifiers Map**: Um mapa que rastreia e valida UTXOs já gastos, impedindo a reutilização de outputs e evitando ataques de gasto duplo.

## Funcionalidades

- **Privacidade total nas transações**: Assegurada pelo uso de provas de conhecimento zero.
- **Verificação de gasto único**: Implementada através de um mapa de Nullifiers, que monitora e invalida UTXOs gastos.
- **Modelo UTXO seguro**: Permite a movimentação de ativos em uma rede privada sem sacrificar a segurança e o anonimato.
  
## Arquitetura

1. **Zero Knowledge Proofs**: Usa um sistema de prova que permite verificar a validade de uma transação sem expor os detalhes, garantindo a privacidade dos dados dos usuários.
2. **Modelo UTXO**: Cada transação consome um ou mais UTXOs e cria novos UTXOs, com um conjunto de chaves privadas garantindo o controle sobre os ativos.
3. **Nullifiers**: Quando um UTXO é consumido em uma transação, ele é marcado como "gasto" através de um *nullifier* que é adicionado ao mapa de Nullifiers, garantindo que o mesmo UTXO não possa ser reutilizado.

## Como Funciona

- O usuário inicia uma transação fornecendo um UTXO e prova de conhecimento zero.
- O sistema valida a transação sem revelar detalhes sensíveis e marca o UTXO como gasto no *nullifier map*.
- Novos UTXOs são gerados e enviados aos respectivos destinatários de forma privada e segura.

## Requisitos

- [Linguagem/Plataforma] Node 20.11.1

## Instalação

1. Clone este repositório:

```bash
git clone https://github.com/seu_usuario/harpo.git


## Install

Create a `.env` file with your private key and desired RPC provider information:
```bash

PRIVATE_KEY="YOUR_WALLET_PRIVATE_KEY"
```

Install the dependencies
```bash
npm install
```

Compile contracts
```bash
npx hardhat compile
```

## Usage
The scripts are supposed to be run with `npx ts-node`. 

Run test script:
```bash
npx ts-node --files ./scripts/SimpleTransferScriptTest.ts 
```

## Contributors
This project was made by : 
- [Juliano Sales](https://github.com/tzdesing)
- [AAAA](https://github.com/AAAA)
- [BBBB](https://github.com/BBBB)

Comandos úteis

1 - circom c2_verify.circom --wasm --r1cs --sym -o ../build
2 - snarkjs groth16 setup ../build/circuits/c2_verify/c2_verify.r1cs powersOfTau28_hez_final_15.ptau c2_verify.zkey
3 - npx snarkjs zkey export verificationkey ./build/circuits/c2_verify/c2_verify.zkey c2_verify.vkey.json
4 - snarkjs zkey export solidityverifier multiplier2_0001.zkey verifier.sol
5 - compilar contrato -> npx hardhat compile
6 - limpar cache -> npx hardhat clean
7 - npx ts-node --files ./scripts/SimpleTransferScriptTest.ts