const path = require("path");
const fs = require("fs");
const solc = require("solc");

const lotteryPath = path.resolve(__dirname, "contracts", "Lottery.sol");
const source = fs.readFileSync(lotteryPath, "utf8");

const input = {
  language: "Solidity",
  sources: {
    "Lottery.sol": {
      content: source,
    },
  },
  settings: {
    outputSelection: {
      "Lottery.sol": {
        Lottery: ["abi", "evm.bytecode.object"],
      },
    },
  },
};
const output = JSON.parse(solc.compile(JSON.stringify(input))).contracts;
// console.log(output);

module.exports = output["Lottery.sol"].Lottery;
