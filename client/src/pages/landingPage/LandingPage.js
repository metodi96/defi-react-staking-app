import React, { useRef, useEffect, useCallback, useContext, useState } from 'react';
import { useLocation } from 'react-router-dom';
import ScrollReveal from './utils/ScrollReveal';
import AppContext from '../../appContext'
import '../landingPage/assets/scss/landingPage.scoped.scss';
import { checkDaiTokensFor, checkMetoTokensFor, convertToTokens } from '../../utils/assets'
// Layouts
import LayoutDefault from './layouts/LayoutDefault';

// Views 
import Home from './views/Home';


const LandingPage = () => {
    const { web3, account } = useContext(AppContext)
    const childRef = useRef();
    let location = useLocation();
    const Layout = (LayoutDefault === undefined) ? props => (<>{props.children}</>) : LayoutDefault;

    const [metoTokens, setMetoTokens] = useState(0)
    const [daiTokens, setDaiTokens] = useState(0)

    const handleTokensChange = useCallback(async () => {
        const metoTokens = await checkMetoTokensFor(web3, account)
        const daiTokens = await checkDaiTokensFor(web3, account)
        setMetoTokens(convertToTokens(metoTokens, web3));
        setDaiTokens(convertToTokens(daiTokens, web3));
    }, [account, web3])

    useEffect(() => {
        (async () => {
            //it could happen that account is empty when this useEffect runs initially, hence the guard
            if (account) handleTokensChange()
        })();
    }, [account, handleTokensChange]);

    useEffect(() => {
        document.body.classList.add('is-loaded');
        childRef.current.init();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [location]);

    return (
        <>
            <ScrollReveal
                ref={childRef}
                children={() => (
                    <Layout metoTokens={metoTokens} daiTokens={daiTokens}>
                        <Home handleTokensChange={handleTokensChange} />
                    </Layout>
                )} />
        </>
    );
};

export default LandingPage;