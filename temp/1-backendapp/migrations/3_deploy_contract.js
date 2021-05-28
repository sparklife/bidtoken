var Leilao = artifacts.require("./Leilao.sol");

module.exports = function(deployer) {
  deployer.deploy(
    Leilao, 
    "Leilao Ferrari",
    8,
    20,
    "xxx"
  );
};
