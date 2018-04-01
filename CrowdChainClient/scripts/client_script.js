window.addEventListener('load', function() {

  // Checking if Web3 has been injected by the browser (Mist/MetaMask)
  if (typeof web3 !== 'undefined') {
    // Use Mist/MetaMask's provider
    web3 = new Web3(web3.currentProvider);
  } else {
    console.log('No web3? You should consider trying MetaMask!')
    // fallback - use your fallback strategy (local node / hosted node + in-dapp id mgmt / fail)
    web3 = new Web3(new Web3.providers.HttpProvider("http://localhost:8545"));
  }
  CrowdChainContract = web3.eth.contract(abiDefinition);
  userAddress = web3.eth.accounts[0];
  getAllContracts()
  .then(contractAddresses => {
    if (contractAddresses.length > 0) {
      currentContractAddress = contractAddresses[contractAddresses.length - 1];
      currentContractInstance = CrowdChainContract.at(currentContractAddress);
      initializeListeners(currentContractInstance);
    }
    return Promise.resolve();
  })
});

let currentContractAddress = null;
let currentContractInstance = null;
let currentListenerList = [];

const abiDefinition = JSON.parse('[{"constant":true,"inputs":[{"name":"","type":"address"}],"name":"funders","outputs":[{"name":"funding","type":"uint256"},{"name":"initialized","type":"bool"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[],"name":"renege","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[],"name":"chairperson","outputs":[{"name":"","type":"address"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"statusUpdate","outputs":[{"components":[{"name":"numJoined","type":"uint256"},{"name":"numThreshold","type":"uint256"},{"name":"bounty","type":"uint256"},{"name":"proposal","type":"string"},{"name":"isFulfilled","type":"bool"},{"name":"stakeAmount","type":"uint256"}],"name":"","type":"tuple"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"isFulfilled","outputs":[{"name":"","type":"bool"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"findVerifier","outputs":[{"components":[{"name":"isTrusted","type":"bool"},{"name":"initialized","type":"bool"}],"name":"","type":"tuple"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[],"name":"promise","outputs":[],"payable":true,"stateMutability":"payable","type":"function"},{"constant":true,"inputs":[],"name":"findFunder","outputs":[{"components":[{"name":"funding","type":"uint256"},{"name":"initialized","type":"bool"}],"name":"","type":"tuple"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"findAgent","outputs":[{"components":[{"name":"verified","type":"bool"},{"name":"paid","type":"bool"},{"name":"initialized","type":"bool"}],"name":"","type":"tuple"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"_verifierAddress","type":"address"}],"name":"deleteVerifier","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[],"name":"numThreshold","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[],"name":"refund","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[],"name":"stakeAmount","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"_agentAddress","type":"address"}],"name":"verify","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[{"name":"","type":"address"}],"name":"verifiers","outputs":[{"name":"isTrusted","type":"bool"},{"name":"initialized","type":"bool"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"proposal","outputs":[{"name":"","type":"string"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"_verifierAddress","type":"address"}],"name":"addVerifier","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[],"name":"bounty","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"numJoined","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[],"name":"disburse","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[],"name":"fund","outputs":[],"payable":true,"stateMutability":"payable","type":"function"},{"constant":true,"inputs":[],"name":"getProposal","outputs":[{"name":"","type":"string"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[{"name":"","type":"address"}],"name":"agents","outputs":[{"name":"verified","type":"bool"},{"name":"paid","type":"bool"},{"name":"initialized","type":"bool"}],"payable":false,"stateMutability":"view","type":"function"},{"inputs":[{"name":"_proposal","type":"string"},{"name":"_numThreshold","type":"uint256"},{"name":"_stakeAmount","type":"uint256"},{"name":"_verifiers","type":"address[]"}],"payable":true,"stateMutability":"payable","type":"constructor"},{"anonymous":false,"inputs":[{"indexed":false,"name":"addr","type":"address"},{"indexed":false,"name":"amount","type":"uint256"}],"name":"PaymentReceived","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"name":"addr","type":"address"},{"indexed":false,"name":"amount","type":"uint256"}],"name":"PaymentGiven","type":"event"},{"anonymous":false,"inputs":[],"name":"ProposalFulfilled","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"name":"addr","type":"address"}],"name":"PromiseMade","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"name":"addr","type":"address"},{"indexed":false,"name":"amount","type":"uint256"}],"name":"FundingGiven","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"name":"verifier","type":"address"},{"indexed":false,"name":"verified","type":"address"}],"name":"AgentVerified","type":"event"}]');
const bytecode = '60606040526040516200231338038062002313833981016040526200002e9067800000000000000090620003bc565b600080336000806101000a81548173ffffffffffffffffffffffffffffffffffffffff021916908373ffffffffffffffffffffffffffffffffffffffff160217905550856007908051906020019062000089929190620001f4565b50600060048190555084600581905550836009819055506000600860006101000a81548160ff021916908315150217905550346006819055507fb741f30322e51134d94cb3c8e4d323dfbcfd60a7a86243f62faa4ae60528f8b03334604051620000f59291906200047c565b60405180910390a17f6ef95f06320e7a25a04a175ca677b7052bdd97131872c2192525a629f51be7703334604051620001309291906200047c565b60405180910390a1600091505b8251821015620001e8576002600084848151811015156200015a57fe5b9060200190602002015173ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff168152602001908152602001600020905060018160000160006101000a81548160ff02191690831515021790555060018160000160016101000a81548160ff02191690831515021790555081806001019250506200013d565b505050505050620005b7565b828054600181600116156101000203166002900490600052602060002090601f016020900481019282601f106200023757805160ff191683800117855562000268565b8280016001018555821562000268579182015b82811115620002675782518255916020019190600101906200024a565b5b5090506200027791906200027b565b5090565b620002a091905b808211156200029c57600081600090555060010162000282565b5090565b90565b6000620002b1825162000557565b905092915050565b600082601f8301121515620002cd57600080fd5b8151620002e4620002de82620004d7565b620004a9565b915081818352602084019350602081019050838560208402820111156200030a57600080fd5b60005b838110156200033e5781620003238882620002a3565b8452602084019350602083019250506001810190506200030d565b5050505092915050565b600082601f83011215156200035c57600080fd5b8151620003736200036d8262000500565b620004a9565b915080825260208301602083018583830111156200039057600080fd5b6200039d83828462000581565b50505092915050565b6000620003b4825162000577565b905092915050565b60008060008060808587031215620003d357600080fd5b600085015167ffffffffffffffff811115620003ee57600080fd5b620003fc8782880162000348565b94505060206200040f87828801620003a6565b93505060406200042287828801620003a6565b925050606085015167ffffffffffffffff8111156200044057600080fd5b6200044e87828801620002b9565b91505092959194509250565b62000465816200052d565b82525050565b62000476816200054d565b82525050565b60006040820190506200049360008301856200045a565b620004a260208301846200046b565b9392505050565b6000604051905081810181811067ffffffffffffffff82111715620004cd57600080fd5b8060405250919050565b600067ffffffffffffffff821115620004ef57600080fd5b602082029050602081019050919050565b600067ffffffffffffffff8211156200051857600080fd5b601f19601f8301169050602081019050919050565b600073ffffffffffffffffffffffffffffffffffffffff82169050919050565b6000819050919050565b600073ffffffffffffffffffffffffffffffffffffffff82169050919050565b6000819050919050565b60005b83811015620005a157808201518184015260208101905062000584565b83811115620005b1576000848401525b50505050565b611d4c80620005c76000396000f300606060405260043610610133576000357c0100000000000000000000000000000000000000000000000000000000900463ffffffff168063031b367714610138578063086865351461016f5780632e4176cf146101985780632e7502b9146101c1578063385a9c37146101ea578063425765f81461021357806344ac21ee1461023c5780634ed981ea146102465780635064ef4e1461026f57806355f328171461029857806358e733b4146102ba578063590e1ae3146102e357806360c7dc47146102f857806363a9c3d7146103215780636c82448714610343578063753ec1031461037a5780639000b3d6146103a3578063943dfef1146103c55780639dfd0f8c146103ee578063abc6fd0b14610417578063b60d428814610440578063b9e2bea01461044a578063fd66091e14610473575b600080fd5b341561014357600080fd5b6101586004610153903690611894565b6104ab565b604051610166929190611c39565b60405180910390f35b341561017a57600080fd5b6101826104dc565b60405161018f9190611c1e565b60405180910390f35b34156101a357600080fd5b6101ab610671565b6040516101b89190611a7f565b60405180910390f35b34156101cc57600080fd5b6101d4610696565b6040516101e19190611be1565b60405180910390f35b34156101f557600080fd5b6101fd610790565b60405161020a9190611aec565b60405180910390f35b341561021e57600080fd5b6102266107a3565b6040516102339190611c03565b60405180910390f35b61024461088b565b005b341561025157600080fd5b610259610a52565b6040516102669190611bc6565b60405180910390f35b341561027a57600080fd5b610282610b29565b60405161028f9190611bab565b60405180910390f35b34156102a357600080fd5b6102b860046102b3903690611894565b610c2d565b005b34156102c557600080fd5b6102cd610cf5565b6040516102da9190611c1e565b60405180910390f35b34156102ee57600080fd5b6102f6610cfb565b005b341561030357600080fd5b61030b610f29565b6040516103189190611c1e565b60405180910390f35b341561032c57600080fd5b610341600461033c903690611894565b610f2f565b005b341561034e57600080fd5b610363600461035e903690611894565b61109f565b604051610371929190611b07565b60405180910390f35b341561038557600080fd5b61038d6110dd565b60405161039a9190611b67565b60405180910390f35b34156103ae57600080fd5b6103c360046103be903690611894565b61117b565b005b34156103d057600080fd5b6103d8611257565b6040516103e59190611c1e565b60405180910390f35b34156103f957600080fd5b61040161125d565b60405161040e9190611c1e565b60405180910390f35b341561042257600080fd5b61042a611263565b6040516104379190611c1e565b60405180910390f35b6104486114aa565b005b341561045557600080fd5b61045d6116a1565b60405161046a9190611b89565b60405180910390f35b341561047e57600080fd5b610493600461048e903690611894565b611749565b6040516104a293929190611b30565b60405180910390f35b60036020528060005260406000206000915090508060000154908060010160009054906101000a900460ff16905082565b6000600160003373ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200190815260200160002060000160029054906101000a900460ff16151561053957600080fd5b6000801515600860009054906101000a900460ff16151514151561055c57600080fd5b3373ffffffffffffffffffffffffffffffffffffffff166108fc6009549081150290604051600060405180830381858888f19350505050151561059e57600080fd5b600160003373ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff168152602001908152602001600020600080820160006101000a81549060ff02191690556000820160016101000a81549060ff02191690556000820160026101000a81549060ff0219169055505060016004600082825403925050819055507f35ba8ca075cd0754614c2383cd0c631496b4cb0c7e3457f5438870e8563a4ce233600954604051610660929190611ac3565b60405180910390a160095491505090565b6000809054906101000a900473ffffffffffffffffffffffffffffffffffffffff1681565b61069e6117b7565b6106a66117b7565b60c06040519081016040528060045481526020016005548152602001600654815260200160078054600181600116156101000203166002900480601f0160208091040260200160405190810160405280929190818152602001828054600181600116156101000203166002900480156107605780601f1061073557610100808354040283529160200191610760565b820191906000526020600020905b81548152906001019060200180831161074357829003601f168201915b50505050508152602001600860009054906101000a900460ff161515815260200160095481525090508091505090565b600860009054906101000a900460ff1681565b6107ab6117f6565b600260003373ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200190815260200160002060000160019054906101000a900460ff16151561080657600080fd5b600260003373ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff1681526020019081526020016000206040805190810160405290816000820160009054906101000a900460ff161515151581526020016000820160019054906101000a900460ff161515151581525050905090565b6000600160003373ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200190815260200160002060000160029054906101000a900460ff161515156108e957600080fd5b6000801515600860009054906101000a900460ff16151514151561090c57600080fd5b600954341015151561091d57600080fd5b600160003373ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff168152602001908152602001600020915060008260000160006101000a81548160ff02191690831515021790555060008260000160016101000a81548160ff02191690831515021790555060018260000160026101000a81548160ff02191690831515021790555060016004600082825401925050819055506005546004541015156109de576109dd600161179a565b5b7f6ef95f06320e7a25a04a175ca677b7052bdd97131872c2192525a629f51be7703334604051610a0f929190611ac3565b60405180910390a17fe8e64efa152b0687423964818a6fea8bc970ef0e74819068392b04bdac7f6a4e33604051610a469190611a7f565b60405180910390a15050565b610a5a611814565b600360003373ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200190815260200160002060010160009054906101000a900460ff161515610ab557600080fd5b600360003373ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff168152602001908152602001600020604080519081016040529081600082015481526020016001820160009054906101000a900460ff161515151581525050905090565b610b31611830565b600160003373ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200190815260200160002060000160029054906101000a900460ff161515610b8c57600080fd5b600160003373ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff168152602001908152602001600020606060405190810160405290816000820160009054906101000a900460ff161515151581526020016000820160019054906101000a900460ff161515151581526020016000820160029054906101000a900460ff161515151581525050905090565b6000809054906101000a900473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff163373ffffffffffffffffffffffffffffffffffffffff16141515610c8857600080fd5b600260008273ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff168152602001908152602001600020600080820160006101000a81549060ff02191690556000820160016101000a81549060ff0219169055505050565b60055481565b600360003373ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200190815260200160002060010160009054906101000a900460ff161515610d5657600080fd5b6000801515600860009054906101000a900460ff161515141515610d7957600080fd5b3373ffffffffffffffffffffffffffffffffffffffff166108fc600360003373ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff168152602001908152602001600020600001549081150290604051600060405180830381858888f193505050501515610dfb57600080fd5b7f35ba8ca075cd0754614c2383cd0c631496b4cb0c7e3457f5438870e8563a4ce233600360003373ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200190815260200160002060000154604051610e6e929190611ac3565b60405180910390a1600360003373ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200190815260200160002060000154600660008282540392505081905550600360003373ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff1681526020019081526020016000206000808201600090556001820160006101000a81549060ff0219169055505050565b60095481565b600260003373ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200190815260200160002060000160019054906101000a900460ff161515610f8a57600080fd5b6001801515600860009054906101000a900460ff161515141515610fad57600080fd5b600160008373ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200190815260200160002060000160029054906101000a900460ff16151561100857600080fd5b60018060008473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200190815260200160002060000160006101000a81548160ff0219169083151502179055507f4968ab6b9bcf514b7b2c4ff84d96f741ceebd7d69c55cab481f8e0da8fddbb973383604051611093929190611a9a565b60405180910390a15050565b60026020528060005260406000206000915090508060000160009054906101000a900460ff16908060000160019054906101000a900460ff16905082565b60078054600181600116156101000203166002900480601f0160208091040260200160405190810160405280929190818152602001828054600181600116156101000203166002900480156111735780601f1061114857610100808354040283529160200191611173565b820191906000526020600020905b81548152906001019060200180831161115657829003601f168201915b505050505081565b60008060009054906101000a900473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff163373ffffffffffffffffffffffffffffffffffffffff161415156111d857600080fd5b600260008373ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff168152602001908152602001600020905060018160000160006101000a81548160ff02191690831515021790555060018160000160016101000a81548160ff0219169083151502179055505050565b60065481565b60045481565b6000600160003373ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200190815260200160002060000160029054906101000a900460ff1615156112c057600080fd5b6001801515600860009054906101000a900460ff1615151415156112e357600080fd5b600160003373ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200190815260200160002060000160029054906101000a900460ff16801561138c5750600160003373ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200190815260200160002060000160019054906101000a900460ff16155b151561139757600080fd5b3373ffffffffffffffffffffffffffffffffffffffff166108fc6009546004546006548115156113c357fe5b04019081150290604051600060405180830381858888f1935050505015156113ea57600080fd5b60018060003373ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200190815260200160002060000160016101000a81548160ff0219169083151502179055507f35ba8ca075cd0754614c2383cd0c631496b4cb0c7e3457f5438870e8563a4ce23360095460045460065481151561147857fe5b0401604051611488929190611ac3565b60405180910390a16009546004546006548115156114a257fe5b040191505090565b600080801515600860009054906101000a900460ff1615151415156114ce57600080fd5b600360003373ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff1681526020019081526020016000209150600360003373ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200190815260200160002060010160009054906101000a900460ff1615156115cb576000600360003373ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff1681526020019081526020016000206000018190555060018260010160006101000a81548160ff0219169083151502179055505b34600360003373ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200190815260200160002060000160008282540192505081905550346006600082825401925050819055507fb741f30322e51134d94cb3c8e4d323dfbcfd60a7a86243f62faa4ae60528f8b0333460405161165c929190611ac3565b60405180910390a17f6ef95f06320e7a25a04a175ca677b7052bdd97131872c2192525a629f51be7703334604051611695929190611ac3565b60405180910390a15050565b6116a9611858565b60078054600181600116156101000203166002900480601f01602080910402602001604051908101604052809291908181526020018280546001816001161561010002031660029004801561173f5780601f106117145761010080835404028352916020019161173f565b820191906000526020600020905b81548152906001019060200180831161172257829003601f168201915b5050505050905090565b60016020528060005260406000206000915090508060000160009054906101000a900460ff16908060000160019054906101000a900460ff16908060000160029054906101000a900460ff16905083565b80600860006101000a81548160ff02191690831515021790555050565b60c0604051908101604052806000815260200160008152602001600081526020016117e061186c565b8152602001600015158152602001600081525090565b60408051908101604052806000151581526020016000151581525090565b6040805190810160405280600081526020016000151581525090565b6060604051908101604052806000151581526020016000151581526020016000151581525090565b602060405190810160405280600081525090565b602060405190810160405280600081525090565b600061188c8235611cae565b905092915050565b6000602082840312156118a657600080fd5b60006118b484828501611880565b91505092915050565b6118c681611c78565b82525050565b6118d581611c98565b82525050565b60006118e682611c6d565b8084526118fa816020860160208601611cce565b61190381611d01565b602085010191505092915050565b600061191c82611c62565b808452611930816020860160208601611cce565b61193981611d01565b602085010191505092915050565b60608201600082015161195d60008501826118cc565b50602082015161197060208501826118cc565b50604082015161198360408501826118cc565b50505050565b60408201600082015161199f6000850182611a70565b5060208201516119b260208501826118cc565b50505050565b600060c0830160008301516119d06000860182611a70565b5060208301516119e36020860182611a70565b5060408301516119f66040860182611a70565b5060608301518482036060860152611a0e8282611911565b9150506080830151611a2360808601826118cc565b5060a0830151611a3660a0860182611a70565b508091505092915050565b604082016000820151611a5760008501826118cc565b506020820151611a6a60208501826118cc565b50505050565b611a7981611ca4565b82525050565b6000602082019050611a9460008301846118bd565b92915050565b6000604082019050611aaf60008301856118bd565b611abc60208301846118bd565b9392505050565b6000604082019050611ad860008301856118bd565b611ae56020830184611a70565b9392505050565b6000602082019050611b0160008301846118cc565b92915050565b6000604082019050611b1c60008301856118cc565b611b2960208301846118cc565b9392505050565b6000606082019050611b4560008301866118cc565b611b5260208301856118cc565b611b5f60408301846118cc565b949350505050565b60006020820190508181036000830152611b818184611911565b905092915050565b60006020820190508181036000830152611ba381846118db565b905092915050565b6000606082019050611bc06000830184611947565b92915050565b6000604082019050611bdb6000830184611989565b92915050565b60006020820190508181036000830152611bfb81846119b8565b905092915050565b6000604082019050611c186000830184611a41565b92915050565b6000602082019050611c336000830184611a70565b92915050565b6000604082019050611c4e6000830185611a70565b611c5b60208301846118cc565b9392505050565b600081519050919050565b600081519050919050565b600073ffffffffffffffffffffffffffffffffffffffff82169050919050565b60008115159050919050565b6000819050919050565b600073ffffffffffffffffffffffffffffffffffffffff82169050919050565b60005b83811015611cec578082015181840152602081019050611cd1565b83811115611cfb576000848401525b50505050565b6000601f19601f83011690509190505600a265627a7a723058203f539f0dc92814259fb9e42d92999c811792e43775a07a0629adbec9ec0a9f766c6578706572696d656e74616cf50037';
let CrowdChainContract = null;
let userAddress = null;


function getTransactionReceiptPromise(hash) {
    return new Promise((resolve, reject) => {
        web3.eth.getTransactionReceipt(hash, (err, result) => {
            if (err) {
                return reject(err);
            }
            return resolve(result);
        });
    });

}

function getBlockPromise(index) {
    return new Promise((resolve, reject) => {
        web3.eth.getBlock(index, (err, result) => {
            if (err) {
                return reject(err);
            }
            return resolve(result);
        });
    });
}

function getAllTransactionReceipts(index) {
    return getBlockPromise(index)
    .then(block => {
        const trPromises = [];
        for (let i = 0; i < block.transactions.length; i += 1) {
            trPromises.push(getTransactionReceiptPromise(block.transactions[i]));
        }
        return Promise.all(trPromises);
    })
    .then(transactionReceipts => {
        let contractAddresses = [];
        for (let i = 0; i < transactionReceipts.length; i += 1) {
            if (transactionReceipts[i].contractAddress !== null) {
                contractAddresses.push(transactionReceipts[i].contractAddress);
            }
        }
        return contractAddresses;
    })
    .catch(err => {
        return Promise.reject(err);
    })
}

function getAllContracts() {
    console.log('getting all contracts');
    return getBlockPromise('latest')
    .then(latestBlock => {
        const latestIndex = latestBlock.number;


        const blocksPromises = [];
        for (let i = 0; i <= latestIndex; i += 1) {
            blocksPromises.push(getAllTransactionReceipts(i));
        }

        localStorage.setItem('latestIndex', JSON.stringify(latestIndex));
        return Promise.all(blocksPromises);
    })
    .then(contractAddressLists => {
        let contractAddresses = [];
        for (let i = 0; i < contractAddressLists.length; i += 1) {
            if (contractAddressLists[i].length > 0) {
                contractAddresses.push(...contractAddressLists[i]);
            }
        }
        console.log('got all contracts');
        localStorage.setItem('contractAddreses', JSON.stringify(contractAddreses));

        return contractAddresses;
    })
    .catch(err => {
        return Promise.reject(err);
    });
}

function checkForContracts(index='latest') {
    const block = web3.eth.getBlock(index);
    for (let i = 0; i < block.transactions.length; i += 1) {
        let transaction = web3.eth.getTransactionReceipt(block.transactions[i]);
        if (transaction.contractAddress !== null) {
            return contractAddress;
        }
    }
}

function createContract(chairperson, proposal, numThreshold=2, stakeAmount=1,
    verifiers=[], gas=4700000) {
    const deployedContract = CrowdChainContract.new([
        proposal,
        numThreshold,
        stakeAmount,
        verifiers
    ], {
        data: byteCode, from: chairperson, gas: gas
    });
    contractInstance = CrowdChainContract.at(deployedContract.address)
    currentContractInstance = contractInstance;
    currentContractAddress = deployedContract.address;
    initializeListeners(contractInstance);
    return deployedContract.address;
}

function initializeListeners(contractInstance) {
    const listenerList = ['PaymentReceived', 'PaymentGiven',
        'ProposalFulfilled', 'PromiseMade', 'FundingGiven', 'AgentVerified'];

    for (let i = 0; i < listenerList.length; i += 1) {
        let listener = currentContractInstance[listenerList[i]]();
        listener.watch((err, result) => {
            console.log(listenerList[i], err, result);
        });
        currentListenerList.push(listener);
    }
    /*
    const paymentReceived = currentContractInstance.PaymentReceived();
    paymentReceived.watch(function(err, result) {
        console.log(err, result);
    });
    const paymentGiven = currentContractInstance.PaymentGiven();
    paymentGiven.watch(function(err, result) {
        console.log(err, result);
    });
    const proposalFulfilled = currentContractInstance.ProposalFulfilled();
    proposalFulfilled.watch(function(err, result) {
        console.log(err, result);
    });
    const promiseMade = currentContractInstance.PromiseMade();
    promiseMade.watch(function(err, result) {
        console.log(err, result);
    });
    const fundingGiven = currentContractInstance.FundingGiven();
    fundingGiven.watch(function(err, result) {
        console.log(err, result);
    });
    const agentVerified = currentContractInstance.AgentVerified();
    agentVerified.watch(function(err, result) {
        console.log(err, result);
    });
    */
}

/*
 * Eric's four functions here. Interfaces with four kind of users.
 * Each use case attaches to some of CDot's functions that interact with the blockchain. 
*/
function addAgent(){
    promise(userAddress);
    console.log(userAddress);
}

function addVerifier(){
    fund = $("#fundsAdded").val();
    alert("A verifier is added");
}

function addChairperson(){
    alert("A chairperson is added");
}

function getFund(){
    fund = $("#fundsAdded").val();
    alert(fund);
}

function fund(userAddress, funding, gas=100000) {
    currentContractInstance.fund({ from: userAddress, gas },
        function(err, result) {
        console.log(err, result);
    });
}

function promise(userAddress, gas=100000) {
    currentContractInstance.promise({ from: userAddress, gas },
        function(err, result) {
        console.log(err, result);
    });
}

function verify(userAddress, verifiedAddress, gas=100000) {
    currentContractInstance.verify(verifiedAddress, { from: userAddress, gas },
        function(err, result) {
        console.log(err, result);
    });

}

function disburse(userAddress, gas=100000) {
    currentContractInstance.disburse({ from: userAddress, gas },
        function(err, result) {
        console.log(err, result);
    });
}

function getStatus() {
    return currentContractInstance.statusUpdate.call();
}

function getProposal() {
    return currentContractInstance.getProposal.call().toLocaleString();
}

function getAgent(userAddress) {
    return currentContractInstance.findAgent({ from: userAddress, gas },
        function(err, result) {
        console.log(err, result);
    });
}

function getFunder(userAddress) {
    return currentContractInstance.findFunder({ from: userAddress, gas },
        function(err, result) {
        console.log(err, result);
    });
}

function getVerifier(userAddress) {
    return currentContractInstance.findVerifier({ from: userAddress, gas },
        function(err, result) {
        console.log(err, result);
    });
}


function getUserAddress(index) {
    return web3.eth.accounts[index];
}

