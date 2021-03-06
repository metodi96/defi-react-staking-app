import React, { useState, useEffect, useContext } from 'react'
import { Button, Form, Image, Label } from 'semantic-ui-react';
import AppContext from '../../../../appContext'
import {
    getStakersNumber
} from '../../../../utils/tokenstaking'
import {
    getTokenFarmContractInstance,
    getDaiTokenContractInstance,
    convertToWei
} from '../../../../utils/assets'
import daiImg from '../../assets/images/dai.png'
import { toast } from 'react-toastify';

function TokenStaking() {
    const [stakersNumber, setStakerNumber] = useState(0)
    const [stakedTokens, setStakedTokens] = useState('')
    const [tokenFarmContract, setTokenFarmContract] = useState(undefined)
    const [daiTokenContract, setDaiTokenContract] = useState(undefined)
    const [isDisabled, setIsDisabled] = useState(true)
    const regExFloatStrict = /^([0-9]*[.])?[0-9]+$/;
    const { web3, account } = useContext(AppContext);

    useEffect(() => {
        (async () => {
            setStakerNumber(await getStakersNumber(web3))
            if (stakedTokens !== '' && regExFloatStrict.test(stakedTokens)) {
                setIsDisabled(false)
            } else setIsDisabled(true)
        })();
    }, [web3, regExFloatStrict, stakedTokens]);

    useEffect(() => {
        setTokenFarmContract(getTokenFarmContractInstance(web3))
        setDaiTokenContract(getDaiTokenContractInstance(web3))
    }, [web3])

    const handleInput = (e, { value }) => {
        //1231. is valid at this point - we would cover this case on submit!
        const regExFloatNotStrict = /^([0-9]*[.])?([0-9]?)+$/;
        if (value === '' || regExFloatNotStrict.test(value)) {
            setStakedTokens(value)
        }
    }

    const handleSubmit = async () => {
        const stakedAmountInWei = convertToWei(stakedTokens, web3)
        try {
            await daiTokenContract.methods.approve(tokenFarmContract._address, stakedAmountInWei).send({ from: account, gas: '2000000' }).on('receipt', async (txReceiptApproved) => {
                await tokenFarmContract.methods.stakeTokens(stakedAmountInWei).send({ from: account, gas: '2000000' })
                    .on('receipt', async (txReceiptStaked) => {
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

    return (
        <div className="section-header center-content ">
            <div>
                <p className="m-0 mb-32 reveal-from-bottom section-subtitle" data-reveal-delay="400" >
                    Total number of stakers: <b>{stakersNumber}</b>
                </p>
                <div className='input-container'>
                    <Form>
                        <Form.Input
                            labelPosition='right'
                            placeholder='0.0'
                            className='input-field'
                            onChange={handleInput}
                            value={stakedTokens}
                        >
                            <Label basic>Stake</Label>
                            <input />
                            <Label basic image><Image src={daiImg} className='input-field__image' />DAI</Label>
                        </Form.Input>
                        <Button disabled={isDisabled} className='input-container__button' onClick={handleSubmit}>Submit</Button>
                    </Form>
                </div>
            </div>
        </div>
    )
}

export default TokenStaking
