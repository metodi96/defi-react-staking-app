import React, { useRef, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import ScrollReveal from './utils/ScrollReveal';
//import { Loader, Dimmer } from 'semantic-ui-react';

import '../landingPage/assets/scss/landingPage.scoped.scss';

// Layouts
import LayoutDefault from './layouts/LayoutDefault';

// Views 
import Home from './views/Home';


const LandingPage = () => {

    const childRef = useRef();
    let location = useLocation();
    const Layout = (LayoutDefault === undefined) ? props => (<>{props.children}</>) : LayoutDefault;



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
                    <Layout>
                        <Home />
                    </Layout>
                )} />

            {/*isLoaded &&
                <Dimmer active={true} >
                    <Loader content='Loading...' />
                </Dimmer>
            */}
        </>
    );
};

export default LandingPage;