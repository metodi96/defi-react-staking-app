import React from 'react';
// import sections
import Hero from '../components/sections/Hero';
import FeaturesTiles from '../components/sections/FeaturesTiles';
import TokenStaking from '../components/sections/TokenStaking'
import '../assets/scss/landingPage.scoped.scss';


const Home = ({ handleTokensChange }) => {

  return (
    <>
      <Hero />
      <TokenStaking handleTokensChange={handleTokensChange} />
      <FeaturesTiles />
    </>
  );
}

export default Home;