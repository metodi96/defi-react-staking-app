//if metamask is installed but not connected
export const handleConnect = () => {
    window.ethereum.enable();
};

//if metamask is not installed at all
export const handleInstall = () => {
    window.open(
        'https://metamask.io/download.html',
        '_blank'
    );
};

