import React, { useState, useEffect, useContext } from 'react'
import { Button, Form, Image, Label } from 'semantic-ui-react';
import AppContext from '../../../../appContext'
import {
    getStakersNumber, getStakingBalanceOf
} from '../../../../utils/tokenstaking'
import {
    getTokenFarmContractInstance,
    getDaiTokenContractInstance,
    convertToWei
} from '../../../../utils/assets'
import daiImg from '../../assets/images/dai.png'
import { toast } from 'react-toastify';
import moment from 'moment'
import Countdown from './partials/Countdown';

function TokenStaking({ handleTokensChange }) {
    const [stakersNumber, setStakerNumber] = useState(0)
    const [stakingBalance, setStakingBalance] = useState(0)
    const [timeOfStaking, setTimeOfStaking] = useState(undefined)
    const [stakedTokens, setStakedTokens] = useState('')
    const [tokenFarmContract, setTokenFarmContract] = useState(undefined)
    const [daiTokenContract, setDaiTokenContract] = useState(undefined)
    const [isDisabled, setIsDisabled] = useState(true)
    const regExFloatStrict = /^([0-9]*[.])?[0-9]+$/;
    const { web3, account, handleBlockScreen } = useContext(AppContext);

    useEffect(() => {
        (async () => {
            setStakingBalance(await getStakingBalanceOf(account, web3))
            setStakerNumber(await getStakersNumber(web3))
            if (stakedTokens !== '' && regExFloatStrict.test(stakedTokens)) {
                setIsDisabled(false)
            } else setIsDisabled(true)
        })();
    }, [web3, regExFloatStrict, stakedTokens, account]);

    useEffect(() => {
        const tokenFarmContract = getTokenFarmContractInstance(web3)
        setTokenFarmContract(tokenFarmContract)
        setDaiTokenContract(getDaiTokenContractInstance(web3))
    }, [web3])

    useEffect(() => {
        (async () => {
            if (account) {
                console.log('HELLO')
                const timeOfStaking = await tokenFarmContract.methods.timeOfStakingFor(account).call()
                setTimeOfStaking(timeOfStaking)
                console.log(typeof timeOfStaking !== 'undefined' ? timeOfStaking : 'Not staked')
            }
        })()
    }, [account, tokenFarmContract])


    const handleInput = (e, { value }) => {
        //1231. is valid at this point - we would cover this case on submit!
        const regExFloatNotStrict = /^([0-9]*[.])?([0-9]?)+$/;
        if (value === '' || regExFloatNotStrict.test(value)) {
            setStakedTokens(value)
        }
    }

    const handleSubmitStake = async () => {
        handleBlockScreen(true)
        const stakedAmountInWei = convertToWei(stakedTokens, web3)
        try {
            await daiTokenContract.methods.approve(tokenFarmContract._address, stakedAmountInWei).send({ from: account, gas: '2000000' }).on('receipt', async (txReceiptApproved) => {
                await tokenFarmContract.methods.stakeTokens(stakedAmountInWei).send({ from: account, gas: '2000000' })
                    .on('receipt', async (txReceiptStaked) => {
                        handleBlockScreen(false)
                        handleTokensChange()
                        toast.success(`Successfully staked! You paid ${(txReceiptApproved.gasUsed * web3.utils.fromWei((await web3.eth.getGasPrice()), 'ether')).toFixed(5)} ether for the approval
                                and ${(txReceiptStaked.gasUsed * web3.utils.fromWei((await web3.eth.getGasPrice()), 'ether')).toFixed(5)} ether for the staking.`, {
                            position: "top-right",
                            autoClose: 5000,
                            hideProgressBar: false,
                            closeOnClick: true,
                            pauseOnHover: true,
                            draggable: true,
                            progress: undefined,
                        });
                    })
            })

        } catch (err) {
            handleBlockScreen(false)
            toast.error('Could not stake. Either tx cancelled or something went wrong with the staking.', {
                position: "top-right",
                autoClose: 5000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                progress: undefined,
            })
        }
    }

    const handleSubmitWithdraw = async () => {
        handleBlockScreen(true)
        const stakedAmountInWei = convertToWei(stakedTokens, web3)
        try {
            await tokenFarmContract.methods.withdrawTokens(stakedAmountInWei).send({ from: account, gas: '2000000' })
                .on('receipt', async (txReceiptWithdrawn) => {
                    handleBlockScreen(false)
                    handleTokensChange()
                    toast.success(`Successfully unstaked ${stakedTokens} tokens! You paid ${(txReceiptWithdrawn.gasUsed * web3.utils.fromWei((await web3.eth.getGasPrice()), 'ether')).toFixed(5)} ether for the withdrawing.`, {
                        position: "top-right",
                        autoClose: 5000,
                        hideProgressBar: false,
                        closeOnClick: true,
                        pauseOnHover: true,
                        draggable: true,
                        progress: undefined,
                    });
                })
        } catch (err) {
            handleBlockScreen(false)
            toast.error('Could not withdraw. Either tx cancelled or something went wrong with the withdrawing.', {
                position: "top-right",
                autoClose: 5000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                progress: undefined,
            })
        }
    }

    const renderWithdrawButtonOrCountdown = () => {
        if (timeOfStaking) {
            const timeTillDate = moment.unix(parseInt(timeOfStaking)).add(24, 'hours').format('MM DD YYYY, h:mm a')
            const diff = moment(timeTillDate, 'MM DD YYYY, h:mm a').diff(moment())
            return (
                diff > 0 ?
                <Countdown
                    timeTillDate={timeTillDate}
                    timeFormat="MM DD YYYY, h:mm a"
                />
                :
                <Button
                    disabled={isDisabled}
                    className='input-container__button'
                    style={{ marginTop: '1em' }}
                    onClick={handleSubmitWithdraw}>Withdraw DAI tokens
                </Button>
            )
        }
    }

    return (
        <div className="section-header center-content ">
            <div>
                <div className='staking-stats'>
                    <span className="m-0 mb-32 reveal-from-bottom section-subtitle" data-reveal-delay="400" >
                        Total number of stakers: <b className='staking-stats__number'>{stakersNumber}</b>
                    </span>
                    <span className="m-0 mb-32 reveal-from-bottom section-subtitle" data-reveal-delay="400" >
                        You have staked: <b className='staking-stats__number'>{stakingBalance}</b> tokens
                    </span>
                </div>
                <div className='input-container'>
                    <Form className='input-container__form'>
                        <Form.Input
                            labelPosition='right'
                            placeholder='0.0'
                            className='input-field'
                            onChange={handleInput}
                            value={stakedTokens}
                        >
                            <input className='input-field__input' />
                            <Label basic image className='dai-label-and-image'><Image src={daiImg} className='input-field__image' /><span className='dai-label'>DAI</span></Label>
                        </Form.Input>
                        <Button disabled={isDisabled} className='input-container__button' onClick={handleSubmitStake}>Stake DAI tokens</Button>
                        {renderWithdrawButtonOrCountdown()}
                    </Form>
                </div>
            </div>
        </div>
    )
}

export default TokenStaking
