var Auction = artifacts.require("./Bid.sol");

module.exports = function(deployer) {
  deployer.deploy(
    Auction, 
    "Auction Lamborghini",
    1,
    20,
    "0x48b5427F3A263a30196B6e5AB12937286BFc8954"
  );
};
