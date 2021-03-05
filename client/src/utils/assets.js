import MetoToken from '../contracts/MetoToken.json';
import DaiToken from '../contracts/DaiToken.json';
import TokenFarm from '../contracts/TokenFarm.json'

export const getMetoTokenContractInstance = (web3) => {
    return new web3.eth.Contract(
        MetoToken.abi,
        process.env.REACT_APP_METO_TOKEN_ADDRESS,
    );
};

export const getDaiTokenContractInstance = (web3) => {
    return new web3.eth.Contract(
        DaiToken.abi,
        process.env.REACT_APP_DAI_TOKEN_ADDRESS,
    );
};

export const getTokenFarmContractInstance = (web3) => {
    return new web3.eth.Contract(
        TokenFarm.abi,
        process.env.REACT_APP_TOKEN_FARM_ADDRESS,
    );
};

export const checkDaiTokensFor = async (web3, account) => {
    const daiContract = getDaiTokenContractInstance(web3);
    const daiTokensOfWalletAddress = await daiContract.methods.getBalanceOf(account).call();
    return daiTokensOfWalletAddress
}

export const checkMetoTokensFor = async (web3, account) => {
    const metoContract = getMetoTokenContractInstance(web3);
    const metoTokensOfWalletAddress = await metoContract.methods.getBalanceOf(account).call();
    return metoTokensOfWalletAddress
}

export const convertToTokens = (n, web3) => {
    return web3.utils.fromWei(n, 'ether');
}