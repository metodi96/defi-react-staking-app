import React, { useState, useEffect, useContext } from 'react'
import { Button, Form, Image, Label } from 'semantic-ui-react';
import AppContext from '../../../../appContext'
import {
    getStakersNumber
} from '../../../../utils/tokenstaking'
import daiImg from '../../assets/images/dai.png'

function TokenStaking() {
    const [stakersNumber, setStakerNumber] = useState(0)
    const [stakedTokens, setStakedTokens] = useState('')
    const [isDisabled, setIsDisabled] = useState(true)
    const regExFloatStrict = /^([0-9]*[.])?[0-9]+$/;
    const { web3 } = useContext(AppContext);
    useEffect(() => {
        (async () => {
            setStakerNumber(await getStakersNumber(web3))
            if (stakedTokens !== '' && regExFloatStrict.test(stakedTokens)) {
                setIsDisabled(false)
            } else setIsDisabled(true)
        })();
    }, [web3, regExFloatStrict, stakedTokens]);

    const handleInput = (e, { value }) => {
        //1231. is valid at this point - we would cover this case on submit!
        const regExFloatNotStrict = /^([0-9]*[.])?([0-9]?)+$/;
        if (value === '' || regExFloatNotStrict.test(value)) {
            setStakedTokens(value)
        }
    }

    const handleSubmit = () => {
        console.log('User has staked ', stakedTokens, ' DAI tokens')
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
