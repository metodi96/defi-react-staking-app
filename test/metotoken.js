const MetoToken = artifacts.require("./MetoToken.sol");

contract("MetoToken", accounts => {
    it("...should set the total supply to 10000000.", async () => {
        const metoTokenInstance = await MetoToken.deployed();
        // gets the value set by constructor which is 10.000.000
        const totalSupply = await metoTokenInstance.totalSupply();

        assert.equal(totalSupply.toNumber(), 10000000, "The value 10.000.000 was not set as a total supply.");
    });
});