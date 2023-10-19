const HDWalletProvider = require("@truffle/hdwallet-provider");
const { Web3 } = require("web3");
const { abi, evm } = require("./compile");
require("dotenv").config();

const provider = new HDWalletProvider(
  process.env.SEED,
  process.env.NETWORK_URL
);
const web3 = new Web3(provider);

(async () => {
  const accounts = await web3.eth.getAccounts();

  console.log(`Deploying from account ${accounts[0]}`);

  const result = await new web3.eth.Contract(abi)
    .deploy({ data: evm.bytecode.object, arguments: ["Hi there!"] })
    .send({ gas: web3.utils.toWei(1, "mwei"), from: accounts[0] });

  console.log(`Contract deployed to ${result.options.address}`);
  provider.engine.stop();
})();
// 0x0a73F0096aE6c651D12d25178e941eE8d23340cb sepolia
// 0x5022262FdB7938C6fBC06Ad39d8d04091f175479
