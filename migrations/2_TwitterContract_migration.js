// Help Truffle find `TwitterContract.sol` in the `/contracts` directory
const TwitterContract = artifacts.require("TwitterContract");

module.exports = function(deployer) {
    // Command Truffle to deploy the Smart Contract
    deployer.deploy(TwitterContract);
};
