import { 
    getTokenFarmContractInstance
} from './assets'

export const getStakersNumber = async (web3) => {
    const tokenFarmContract = getTokenFarmContractInstance(web3);
    console.log(tokenFarmContract)
    const stakersArray = await tokenFarmContract.methods.getStakers().call();
    return stakersArray.length
}