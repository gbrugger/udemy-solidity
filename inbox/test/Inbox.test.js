const assert = require("assert");
const ganache = require("ganache");
const { Web3 } = require("web3");

const web3 = new Web3(ganache.provider());
const { abi, evm } = require("../compile");

let accounts;
let inbox;
const INITIAL_STRING = "Hi there!";

beforeEach(async () => {
  //Get a list of all accounts
  accounts = await web3.eth.getAccounts();
  //Use one of those accounts to deploy the contract
  inbox = await new web3.eth.Contract(abi)
    .deploy({
      data: evm.bytecode.object,
      arguments: [INITIAL_STRING],
    })
    .send({ from: accounts[0], gas: web3.utils.toWei(1, "Mwei") });
});

describe("Inbox", () => {
  it("deploys a contract", () => {
    assert.ok(inbox.options.address);
    // console.log(inbox);
  });

  it("has initial message", async () => {
    const message = await inbox.methods.message().call();
    assert.equal(message, INITIAL_STRING);
  });

  it("can change the message", async () => {
    await inbox.methods
      .setMessage("bye")
      .send({ from: accounts[0], gas: web3.utils.toWei(1, "mwei") });

    const message = await inbox.methods.message().call();
    assert.equal(message, "bye");
  });
});
