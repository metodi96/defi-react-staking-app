import React, { useState, useRef, useEffect, useContext } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import Logo from './partials/Logo';
import { Popup, Image, Button } from 'semantic-ui-react'
import '../../assets/scss/landingPage.scoped.scss';
import { handleConnect, handleInstall } from '../../../../utils/metamask'
import AppContext from '../../../../appContext'
import etherImg from '../../assets/images/ether-wallet.png'

const propTypes = {
  navPosition: PropTypes.string,
  hideNav: PropTypes.bool,
  hideSignin: PropTypes.bool,
  bottomOuterDivider: PropTypes.bool,
  bottomDivider: PropTypes.bool
};

const defaultProps = {
  navPosition: '',
  hideNav: false,
  hideSignin: false,
  bottomOuterDivider: false,
  bottomDivider: false
};

const Header = ({
  className,
  navPosition,
  hideNav,
  hideSignin,
  bottomOuterDivider,
  bottomDivider,
  ...props
}) => {

  const { account, hasWalletAddress } = useContext(AppContext);

  const [isActive, setIsactive] = useState(false);

  const nav = useRef(null);
  const hamburger = useRef(null);

  useEffect(() => {
    isActive && openMenu();
    document.addEventListener('keydown', keyPress);
    document.addEventListener('click', clickOutside);
    return () => {
      document.removeEventListener('keydown', keyPress);
      document.removeEventListener('click', clickOutside);
      closeMenu();
    };
  });

  const openMenu = () => {
    document.body.classList.add('off-nav-is-active');
    nav.current.style.maxHeight = nav.current.scrollHeight + 'px';
    setIsactive(true);
  };

  const closeMenu = () => {
    document.body.classList.remove('off-nav-is-active');
    nav.current && (nav.current.style.maxHeight = null);
    setIsactive(false);
  };

  const keyPress = (e) => {
    isActive && e.keyCode === 27 && closeMenu();
  };

  const clickOutside = (e) => {
    if (!nav.current) return;
    if (!isActive || nav.current.contains(e.target) || e.target === hamburger.current) return;
    closeMenu();
  };

  const classes = classNames(
    'site-header',
    bottomOuterDivider && 'has-bottom-divider',
    className
  );

  const renderMetaMaskLabel = () => {
    if (window.ethereum) {
      return !hasWalletAddress && !account ?
        <Button className='connect-metamask' onClick={handleConnect}>No wallet address detected</Button>
        : account;
    } else {
      return <Button className='connect-metamask' onClick={handleInstall}>Install MetaMask</Button>;
    }
  };

  return (
    <header
      {...props}
      className={classes}
    // style={{background: '#1B2428'}}
    >
      <div className="container">
        <div className={
          classNames(
            'site-header-inner',
            bottomDivider && 'has-bottom-divider'
          )}>
          <Logo />
          {!hideNav &&
            <>
              <button
                ref={hamburger}
                className="header-nav-toggle"
                onClick={isActive ? closeMenu : openMenu}
              >
                <span className="screen-reader">Menu</span>
                <span className="hamburger">
                  <span className="hamburger-inner"></span>
                </span>
              </button>
              <nav
                ref={nav}
                className={
                  classNames(
                    'header-nav',
                    isActive && 'is-active'
                  )}>
                <div className="header-nav-inner">
                  {/*<ul className={
                    classNames(
                      'list-reset text-xs',
                      navPosition && `header-nav-${navPosition}`
                    )}>
                    <li>
                      <Link to="#0" onClick={closeMenu}>Documentation</Link>
                    </li>
                  </ul>*/}
                  <ul className="list-reset header-nav-right">
                    <li>
                      <Popup content='Wallet address' trigger={
                        <div rel="noopener noreferrer" className='metamask-wallet'>
                          <Image src={etherImg} size='mini'
                            style={{ marginRight: '5px', verticalAlign: 'middle' }}
                          />
                          <span style={{ wordBreak: 'break-all', color: '#dadada !important', fontSize: '0.9em', lineHeight: '1.5em', }}>
                            <b>{renderMetaMaskLabel()}</b>
                          </span>
                        </div>
                      } />
                      {/*<Link to="/dashboard" className="button button-primary button-wide-mobile button-sm" onClick={closeMenu}>Go to App</Link>*/}
                    </li>
                  </ul>
                </div>
              </nav>
            </>}
        </div>
      </div>
    </header>
  );
};

Header.propTypes = propTypes;
Header.defaultProps = defaultProps;

export default Header;
