import Web3 from "web3";

window.addEventListener("load", async () => {
  try {
    await window.ethereum.request({ method: "eth_requestAccounts" });
  } catch (err) {
    if (err.code === 4001) {
      console.log("Access to account rejected.");
    } else {
      console.error(err);
    }
  }
});

const web3 = new Web3(window.ethereum);

export default web3;
