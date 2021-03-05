import React from 'react';
import ReactDOM from 'react-dom';

import App from './App';
import getWeb3 from './web3-config';
import "./styles/styles.scss";
import * as serviceWorker from './serviceWorker';
import { BrowserRouter } from 'react-router-dom';

//inject web3 into the App.js
getWeb3().then(web3 => {
    ReactDOM.render(
        <BrowserRouter>
            <App web3={web3} />
        </BrowserRouter>,
        document.getElementById('root')
    );
});

serviceWorker.unregister();