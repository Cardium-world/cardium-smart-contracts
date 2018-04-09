// #1 Get an instance of the contract to be deployed/migrated
var CardiumToken = artifacts.require("./CardiumToken.sol");

module.exports = function (deployer) {
    deployer.deploy(CardiumToken);
};