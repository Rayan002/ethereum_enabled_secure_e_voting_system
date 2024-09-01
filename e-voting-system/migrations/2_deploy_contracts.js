// const Voting = artifacts.require("Voting");

// module.exports = function (deployer) {
//   deployer.deploy(Voting, 5); // Pass constructor arguments if needed
// };

const Voting = artifacts.require("Voting");

module.exports = function (deployer) {
  deployer.deploy(Voting, 5); // Ensure this constructor argument is valid
};

// const Test = artifacts.require("Test");

// module.exports = function (deployer) {
//   deployer.deploy(Test);
// };

