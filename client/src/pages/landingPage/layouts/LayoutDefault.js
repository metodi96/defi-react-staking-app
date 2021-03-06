import React, { useContext } from 'react';
import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';
import AppContext from '../../../appContext'
import '../assets/scss/landingPage.scoped.scss';
import { Dimmer, Loader } from 'semantic-ui-react';

const LayoutDefault = ({ children, metoTokens, daiTokens }) => {
  const { screenBlocked } = useContext(AppContext)
  return (
    <>
      <Header navPosition="right" className="reveal-from-bottom" metoTokens={metoTokens} daiTokens={daiTokens} />
      <main className="site-content">
        {children}
      </main>
      <Footer />
      <Dimmer active={screenBlocked} style={{ zIndex: '9999' }}>
        <Loader indeterminate content='Waiting for transaction to finish...' />
      </Dimmer>
    </>
  )
};

export default LayoutDefault;