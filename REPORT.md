
## Transactions Report
### 1 - Token contract deployment

**ACCOUNT**: 0x3B340ad8Aa7aa2331a8aBB17A2298d8B50EF2b6D

**Address:** https://sepolia.etherscan.io/address/0xb76d91797000f6f89300e2158411408a608ea42d

**TX:** 
https://sepolia.etherscan.io/tx/0x1fb3ceb700b6271a29bcd2e5dbbbce5d57f387e02e5f1eb560852d843fc2776d

```bash
$ npx ts-node --files ./scripts/DeployToken.ts
Deployer address: 0x3B340ad8Aa7aa2331a8aBB17A2298d8B50EF2b6D
Deployer balance: 0.842311615385008834 ETH

Deploying Token contract
Transaction hash: 0x1fb3ceb700b6271a29bcd2e5dbbbce5d57f387e02e5f1eb560852d843fc2776d
Waiting for confirmations...
Token contract deployed to: 0xb76d91797000f6f89300e2158411408a608ea42d
```


### 1.2 - Tokens minting

**ACCOUNT**: 0x3B340ad8Aa7aa2331a8aBB17A2298d8B50EF2b6D

**TX:** https://sepolia.etherscan.io/tx/0xfe5c1017af48420f98aca20b83bc194adeb48f47f452281262fc99d3c9a82004


```bash
Minting tokens for the deployer
Transaction hash: 0xfe5c1017af48420f98aca20b83bc194adeb48f47f452281262fc99d3c9a82004
Waiting for confirmations...
Transaction finished
```


### 2 - Transfer 10000 tokens to 0x41cff881c9c8db0D053A678b0d7aeBDD05754944

**ACCOUNT**: 0x3B340ad8Aa7aa2331a8aBB17A2298d8B50EF2b6D

**TX:** https://sepolia.etherscan.io/tx/0x02669a12549d590fd4f9c4bdef0cf2ea3e056f4f861252d2abc4b16a161f0f9f

```bash
$ npx ts-node --files ./scripts/GiveVotingTokens.ts 0xb76d91797000f6f89300e2158411408a608ea42d 0x41cff881c9c8db0D053A678b0d7aeBDD05754944 10000
Transfering 10000 tokens to 0x41cff881c9c8db0D053A678b0d7aeBDD05754944
Transaction hash: 0x02669a12549d590fd4f9c4bdef0cf2ea3e056f4f861252d2abc4b16a161f0f9f
Waiting for confirmation...
Transaction finished
```


### 3 - OWNER - Self-delegate

**ACCOUNT**: 0x3B340ad8Aa7aa2331a8aBB17A2298d8B50EF2b6D

**TX:** https://sepolia.etherscan.io/tx/0x74a0312dbd3d48bc3e07463eaf480be0678524a70798353fee7fb77bd4144fe1

```bash
ACCOUNT: 0x3B340ad8Aa7aa2331a8aBB17A2298d8B50EF2b6D
$ npx ts-node --files ./scripts/SelfDelegateVote.ts 0xb76d91797000f6f89300e2158411408a608ea42d
Transaction hash: 0x74a0312dbd3d48bc3e07463eaf480be0678524a70798353fee7fb77bd4144fe1
Waiting for confirmation...
Transaction finished
```

### 4 - OTHER ACCOUNT - Self-delegate

**ACCOUNT**: 0x41cff881c9c8db0D053A678b0d7aeBDD05754944

**TX:** https://sepolia.etherscan.io/tx/0xc43bdcc0a4f94acc1c52cda92246e641a71244bdeb0f68bcf463d2d97dba46fc

```bash
$ npx ts-node --files ./scripts/SelfDelegateVote.ts 0xb76d91797000f6f89300e2158411408a608ea42d
Transaction hash: 0xc43bdcc0a4f94acc1c52cda92246e641a71244bdeb0f68bcf463d2d97dba46fc
Waiting for confirmation...
Transaction finished
```

### 5 - Ballot contract deployment

**ACCOUNT**: 0x3B340ad8Aa7aa2331a8aBB17A2298d8B50EF2b6D

**Address:** https://sepolia.etherscan.io/address/0x28e29fbfc633d64ae3dbd61d79c68b93457cb9f4

**TX:** 
https://sepolia.etherscan.io/tx/0x1421414c223aead28e8e641cbc4bd78a9d62877c09836127391c25c4e358de0a

```bash
$ npx ts-node --files ./scripts/DeployBallot.ts 0xb76d91797000f6f89300e2158411408a608ea42d "proposal1" "proposal2" "proposal3" "proposalN"
Last block number: 6123306n
Deployer address: 0x3B340ad8Aa7aa2331a8aBB17A2298d8B50EF2b6D
Deployer balance: 0.842246560666797026 ETH

Deploying Ballot contract
Transaction hash: 0x1421414c223aead28e8e641cbc4bd78a9d62877c09836127391c25c4e358de0a
Waiting for confirmations...
Ballot contract deployed to: 0x28e29fbfc633d64ae3dbd61d79c68b93457cb9f4
```

### 6 - OTHER ACCOUNT - Vote on proposal3 with 1000 voting power

**ACCOUNT**: 0x41cff881c9c8db0D053A678b0d7aeBDD05754944

**TX:** 
https://sepolia.etherscan.io/tx/0x2a4fa7ed538c987e75a1585759dc280bfe6169daf27094c2b4e4490d877ca078


```bash
$ npx ts-node --files ./scripts/CastVote.ts 0x28e29fbfc633d64ae3dbd61d79c68b93457cb9f4  2 1000
Proposal selected: 
Voting to proposal proposal3
Transaction hash: 0x2a4fa7ed538c987e75a1585759dc280bfe6169daf27094c2b4e4490d877ca078
Waiting for confirmations...
Transaction confirmed
Vote count:  1000n
```

### 7 - OWNER - Vote on proposal3 with 100000 voting power

**ACCOUNT**: 0x3B340ad8Aa7aa2331a8aBB17A2298d8B50EF2b6D

**TX:** 
https://sepolia.etherscan.io/tx/0xde0aee0bc71a5fa6a8657db0cbcde0f0d6218f17ec2de51db3d74015b2bcd976

```bash
$ npx ts-node --files ./scripts/CastVote.ts 0x28e29fbfc633d64ae3dbd61d79c68b93457cb9f4  2 100000
Proposal selected: 
Voting to proposal proposal3
Transaction hash: 0xde0aee0bc71a5fa6a8657db0cbcde0f0d6218f17ec2de51db3d74015b2bcd976
Waiting for confirmations...
Transaction confirmed
Vote count:  101000n
```

### 8 - OWNER - Vote on proposal1 with 1000000 voting power

**ACCOUNT**: 0x3B340ad8Aa7aa2331a8aBB17A2298d8B50EF2b6D

**TX:** 
https://sepolia.etherscan.io/tx/0x32f921ca9b7855fc63057bf1a36906ccbe671321801a6a340d64d755d4eec58a

```bash
$ npx ts-node --files ./scripts/CastVote.ts 0x28e29fbfc633d64ae3dbd61d79c68b93457cb9f4  0 1000000
Proposal selected: 
Voting to proposal proposal1
Transaction hash: 0x32f921ca9b7855fc63057bf1a36906ccbe671321801a6a340d64d755d4eec58a
Waiting for confirmations...
Transaction confirmed
Vote count:  1000000n
```

### 9 - OTHER ACCOUNT - Retrieve voting power

**ACCOUNT**: 0x41cff881c9c8db0D053A678b0d7aeBDD05754944

```bash
$ npx ts-node --files ./scripts/GetVotingPower.ts 0x28e29fbfc633d64ae3dbd61d79c68b93457cb9f4 
0x41cff881c9c8db0D053A678b0d7aeBDD05754944
Voter Voting Power:  9000n
```

### 10 - OWNER - Retrieve voting power

**ACCOUNT**: 0x3B340ad8Aa7aa2331a8aBB17A2298d8B50EF2b6D

```bash
$ npx ts-node --files ./scripts/GetVotingPower.ts 0x28e29fbfc633d64ae3dbd61d79c68b93457cb9f4 
0x3B340ad8Aa7aa2331a8aBB17A2298d8B50EF2b6D
Voter Voting Power:  99999999999998890000n
```


### 10 - OWNER - Retrieve Winner Proposal

**Winner Proposal Name:**  proposal1

```bash
$ npx ts-node --files ./scripts/GetWinnerProposal.ts 0x28e29fbfc633d64ae3dbd61d79c68b93457cb9f4
Winner proposal index:  0n
Winner Proposal Name:  proposal1
Winner Proposal Vote Count:  1000000n
```
Após analisar Verkle tree e Merkle tree

Concluo que a verkle tree seria a estrutura ideal de dados para acomodar os commitments a longo prazo
no entanto é uma tecnologia recente , com pouquissimo material disponivel e pouco uso em produção.
Por isso sugiro seguir com Merkle tree por enquanto, visto que existe amplo material está em produção no ethereum e bitcoin e deverá atender a rede por um bom tempo.

Analisar Sparse Merkle Tree
...


