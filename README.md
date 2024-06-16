# Encode-Club-Solidity-Bootcamp-Week3
Week 3 assignment from Encode Club Solidity Bootcamp

## Install

Create a `.env` file with your private key and desired RPC provider information:
```bash
MNEMONIC="here is where your extracted twelve words mnemonic phrase should be put"
PRIVATE_KEY="YOUR_WALLET_PRIVATE_KEY"
POKT_API_KEY="********************************"
INFURA_API_KEY="********************************"
INFURA_API_SECRET="********************************"
ALCHEMY_API_KEY="="********************************""
ETHERSCAN_API_KEY="********************************"
```

Install the dependencies
```bash
npm install
```

## Usage
The scripts are supposed to be run with `npx ts-node`. 

Deploying the Ballot contract:
```bash
npx ts-node --files ./scripts/DeployWithViem.ts "proposal1" "proposal2" "proposal3" "proposalN"
```

Voting for proposal `0` where `0` is the proposal number of the proposal you want to vote, using `amount` tokens to vote:
```bash
npx ts-node --files ./scripts/CastVote.ts "CONTRACT_ADDRESS" 0 amount
```


Giving `amount` voting tokens to an voter address:
```bash
npx ts-node --files ./scripts/GiveVotingTokens.ts "CONTRACT_ADDRESS" "VOTER_ADDRESS" amount
```

Delegating `amount` voting power for some other address:
```bash
npx ts-node --files ./scripts/DelegateVote.ts "CONTRACT_ADDRESS" "DEGELATE_ADDRESS" amount
```

Querying the vote power :
```bash
npx ts-node --files ./scripts/GetVotingPower.ts "CONTRACT_ADDRESS" "VOTER_ADDRESS"
```

Querying the winner proposal:
```bash
npx ts-node --files ./scripts/GetWinnerProposal.ts "CONTRACT_ADDRESS"
```

## Contributors
This project was made by the Team 1 of the Encode Club Solidity Bootcamp: 
- [Rubikkz](https://github.com/frosimanuel)
- [dutra](https://github.com/dutragustavo)
- [Huelder](https://github.com/hueldera)
- [Juliano Sales](https://github.com/tzdesing)
