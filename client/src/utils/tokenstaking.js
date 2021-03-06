import {
    getTokenFarmContractInstance
} from './assets'

export const getStakersNumber = async (web3) => {
    const tokenFarmContract = getTokenFarmContractInstance(web3);
    const stakersArray = await tokenFarmContract.methods.getStakers().call();
    return stakersArray.length
}

export const getStakingBalanceOf = async (account, web3) => {
    if (account) {
        const tokenFarmContract = getTokenFarmContractInstance(web3)
        const stakingBalance = await tokenFarmContract.methods.stakingBalance(account).call()
        return web3.utils.fromWei(stakingBalance, 'ether')
    } return 0
}