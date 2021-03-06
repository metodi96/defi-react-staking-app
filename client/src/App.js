import React, { useEffect, useState } from 'react';
import { Route } from 'react-router-dom';
import AppContext from './appContext';
import { Loader, Dimmer } from 'semantic-ui-react';
import LandingPage from './pages/landingPage/LandingPage'
import 'semantic-ui-css/semantic.min.css';
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css';
const App = ({ web3 }) => {
  const [account, setAccount] = useState('');
  const [networkId, setNetworkId] = useState('');
  const [hasWalletAddress, setHasWalletAddress] = useState(false);
  const [hasAccountChanged, setHasAccountChanged] = useState(false);
  const [screenBlocked, setScreenBlocked] = useState(false);
  //const location = useLocation();

  useEffect(() => {
    const init = async () => {
      if (window.ethereum) {
        const networkId = await web3.eth.net.getId();
        setNetworkId(networkId);
        const [selectedAccount] = await web3.eth.getAccounts();
        setAccount(web3.utils.toChecksumAddress(selectedAccount));
        window.ethereum.on('accountsChanged', function (accounts) {
          setHasAccountChanged(true);
          if (!accounts[0]) {
            setHasWalletAddress(false);
          } else {
            setHasWalletAddress(true);
            setAccount(accounts[0]);
          }
        });
        window.ethereum.on('chainChanged', (_chainId) => window.location.reload());
      }
    };
    init();
  }, [web3.utils, web3.eth]);

  const handleBlockScreen = (blocked) => {
    setScreenBlocked(blocked);
  };

  const handleAccountChanged = (newHasAccountChanged) => {
    setHasAccountChanged(newHasAccountChanged);
  };

  return (
    <AppContext.Provider value={{
      web3,
      handleBlockScreen,
      account,
      hasWalletAddress,
      hasAccountChanged,
      handleAccountChanged,
      networkId
    }}
    >
      <Route path='/' exact component={LandingPage} />
      <ToastContainer autoClose={10000} />
      <Dimmer active={screenBlocked} style={{ zIndex: '9999' }}>
        {screenBlocked && <Loader indeterminate content='Waiting for transaction to finish...' />}
      </Dimmer>
    </AppContext.Provider>
  );
}

export default App;
