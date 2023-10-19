const assert = require("assert");
const ganache = require("ganache");
const { Web3 } = require("web3");

const web3 = new Web3(ganache.provider());

const { abi, evm } = require("../compile");

let lottery;
let accounts;

beforeEach(async () => {
  accounts = await web3.eth.getAccounts();

  lottery = await new web3.eth.Contract(abi)
    .deploy({ data: evm.bytecode.object })
    .send({ from: accounts[0], gas: "1000000" });
});

describe("Lottery Contract", () => {
  it("deploys a contract", () => {
    assert.ok(lottery.options.address);
  });

  it("allows one account to enter", async () => {
    await lottery.methods
      .enter()
      .send({ from: accounts[0], value: web3.utils.toWei("0.0101", "ether") });

    const players = await lottery.methods
      .getPlayers()
      .call({ from: accounts[0] });

    assert.equal(accounts[0], players[0]);
    assert.equal(1, players.length);
  });

  it("allows multiple accounts to enter", async () => {
    const numPlayers = 3;
    for (let i = 0; i < numPlayers; i++) {
      await lottery.methods.enter().send({
        from: accounts[i],
        value: web3.utils.toWei("0.0101", "ether"),
      });
    }

    const players = await lottery.methods
      .getPlayers()
      .call({ from: accounts[0] });

    for (let i = 0; i < numPlayers; i++) {
      assert.equal(accounts[0], players[0]);
    }
    assert.equal(numPlayers, players.length);
  });

  it("requires a minimun amount of ether to enter", async () => {
    try {
      await lottery.methods.enter().send({
        from: accounts[0],
        value: web3.utils.toWei("0.001", "ether"),
      });
      assert(false);
    } catch (err) {
      assert(err);
    }
  });

  it("should call pickWinner only by manager", async () => {
    try {
      await lottery.methods.pickWinner().send({
        from: accounts[1],
      });
      assert(false);
    } catch (err) {
      assert(err);
    }
  });

  it("sends money to the winner and resets the players array", async () => {
    const gasPrice = web3.utils.toWei("1", "gwei");
    const value = web3.utils.toWei("2", "ether");

    const initialBalance = await web3.eth.getBalance(accounts[0]);

    const receipt1 = await lottery.methods.enter().send({
      from: accounts[0],
      value: value,
      gasPrice: gasPrice,
    });

    let gasUsed = web3.utils.toBigInt(
      web3.utils.toWei(receipt1.gasUsed, "gwei")
    );

    const receipt2 = await lottery.methods
      .pickWinner()
      .send({ from: accounts[0], gasPrice: gasPrice });

    gasUsed += web3.utils.toBigInt(web3.utils.toWei(receipt2.gasUsed, "gwei"));

    const finalBalance = await web3.eth.getBalance(accounts[0]);
    const difference = finalBalance - initialBalance;

    assert.equal(difference, -gasUsed);
    const players = await lottery.methods.getPlayers().call();
    assert.equal(0, players.length);
    assert.equal(0, await web3.eth.getBalance(lottery.options.address));
  });
});
