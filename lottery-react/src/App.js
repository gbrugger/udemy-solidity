import "./App.css";
import React from "react";
// import web3 from "./web3";
import lottery from "./lottery";
import web3 from "./web3";

class App extends React.Component {
  state = { manager: "", players: [], balance: "", value: "", message: "" };

  async componentDidMount() {
    const manager = await lottery.methods.manager().call();
    const players = await lottery.methods.getPlayers().call();
    const balance = await web3.eth.getBalance(lottery.options.address);

    this.setState({ manager, players, balance });
  }

  onSubmit = async event => {
    event.preventDefault();

    const accounts = await web3.eth.getAccounts();

    this.setState({ message: "Waiting on transaction success..." });
    // const gasPrice = web3.utils.toWei("1", "gwei");

    try {
      const receipt = await lottery.methods.enter().send({
        from: accounts[0],
        value: web3.utils.toWei(this.state.value, "ether"),
        data: web3.eth.abi.encodeFunctionSignature("enter()"),
      });
      this.setState({
        message: `You have been entered! Transaction hash: ${receipt.transactionHash}`,
      });
    } catch (err) {
      this.setState({ message: err.message });
    }
  };

  onClick = async () => {
    const accounts = await web3.eth.getAccounts();

    this.setState({ message: "Waiting on transaction success..." });

    const receipt = await lottery.methods.pickWinner().send({
      from: accounts[0],
      data: web3.eth.abi.encodeFunctionSignature("pickWinner()"),
    });

    this.setState({
      message: `A winner has been picked! Transaction hash: ${receipt.transactionHash}`,
    });
  };
  render() {
    return (
      <div>
        <h2>Lottery Contract</h2>
        <p>This contract is managed by {this.state.manager}</p>
        <p>
          There are currently {this.state.players.length} people entered,
          competing to win {web3.utils.fromWei(this.state.balance, "ether")}{" "}
          ether!
        </p>

        <hr />

        <form onSubmit={this.onSubmit}>
          <h4>Want to try your luck?</h4>
          <div>
            <label>Amount of ether to enter</label>
            <input
              value={this.state.value}
              onChange={event => this.setState({ value: event.target.value })}
            />
          </div>
          <button>Enter</button>
        </form>

        <hr />

        <h4>Ready to pick a winner?</h4>
        <button onClick={this.onClick}>Pick a winner!</button>

        <hr />

        <h1>{this.state.message}</h1>
      </div>
    );
  }
}
export default App;
