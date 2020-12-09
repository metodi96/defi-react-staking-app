import React, { useState, useEffect } from "react";
import DaiToken from "./contracts/DaiToken.json";
import MetoToken from "./contracts/MetoTokenV2Farm.json";
import TokenFarm from "./contracts/TokenFarm.json";
import getWeb3 from "./getWeb3";

import "./App.css";

function App() {
  const [web3, setWeb3] = useState(undefined);
  const [accounts, setAccounts] = useState(undefined);
  const [contractDai, setContractDai] = useState(undefined);
  const [contractMeto, setContractMeto] = useState(undefined);
  const [contractTokenFarm, setContractTokenFarm] = useState(undefined);
  const [daiName, setDaiName] = useState("");

  useEffect(() => {
    const init = async () => {
      try {
        // Get network provider and web3 instance.
        const web3 = await getWeb3();

        // Use web3 to get the user's accounts.
        const accounts = await web3.eth.getAccounts();

        // Get the contract instance.
        const networkId = await web3.eth.net.getId();
        console.log(networkId)
        const deployedNetworkDai = DaiToken.networks[networkId];
        console.log(deployedNetworkDai && deployedNetworkDai.address)
        const deployedNetworkMeto = MetoToken.networks[networkId];
        console.log(deployedNetworkMeto && deployedNetworkMeto.address)
        const deployedNetworkTokenFarm = TokenFarm.networks[networkId];
        console.log(deployedNetworkTokenFarm && deployedNetworkTokenFarm.address)
        const instanceDai = new web3.eth.Contract(
          DaiToken.abi,
          deployedNetworkDai && deployedNetworkDai.address,
        );
        const instanceMeto = new web3.eth.Contract(
          MetoToken.abi,
          deployedNetworkMeto && deployedNetworkMeto.address,
        );

        const instanceTokenFarm = new web3.eth.Contract(
          TokenFarm.abi,
          deployedNetworkTokenFarm && deployedNetworkTokenFarm.address,
        );


        // Set web3, accounts, and contract to the state, and then proceed with an
        // example of interacting with the contract's methods.
        //this.setState({ web3, accounts, contract: instance }, this.runExample);
        setWeb3(web3);
        setAccounts(accounts);
        setContractDai(instanceDai);
        setContractMeto(instanceMeto);
        setContractTokenFarm(instanceTokenFarm);
      } catch (error) {
        // Catch any errors for any of the above operations.
        alert(
          `Failed to load web3, accounts, or contract. Check console for details.`,
        );
        console.error(error);
      }
    }
    init();
  }, []);

  useEffect(() => {
    const load = async () => {
      // Stores a given value, 5 by default.
      console.log(accounts[0]);
      //await contract.methods.set(10).send({ from: accounts[0] });

      // Get the value from the contract to prove it worked.
      const response = await contractDai.methods.name().call();

      // Update state with the result.
      setDaiName(response);
    }
    if (typeof web3 !== 'undefined' && typeof accounts !== 'undefined' && typeof contractDai !== 'undefined' && typeof contractMeto !== 'undefined'
      && typeof contractTokenFarm !== 'undefined') {
      load();
    }
  }, [web3, accounts, contractDai, contractTokenFarm, contractMeto]);

  if (typeof web3 === undefined) {
    return <div>Loading Web3, accounts, and contract...</div>;
  }
  return (
    <div className="App">
      <p>The DAI Token name is: {daiName}</p>
    </div>
  );
}

export default App;
