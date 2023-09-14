// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// You can also run a script with `npx hardhat run <script>`. If you do that, Hardhat
// will compile your contracts, add the Hardhat Runtime Environment's members to the
// global scope, and execute the script.
const hre = require("hardhat");

async function main() {

  const initialSupply = 1000000000;

  const codexDAO = await hre.ethers.deployContract("codexDAOGovernance", [initialSupply]);

  await codexDAO.waitForDeployment();



  console.log(
    `Contract deployed to ${codexDAO.target}`
  );
  const deployer = codexDAO.runner.address;
  console.log(codexDAO.runner.address);
  
  console.log("creating proposal:", await codexDAO.createProposal("1rst Proposal of CodexDAO", 5000));


  console.log("balance:", await codexDAO.claimFreeTokens())

  console.log("updated balance:", await codexDAO.balanceOf(deployer))

}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
