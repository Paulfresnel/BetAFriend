// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// You can also run a script with `npx hardhat run <script>`. If you do that, Hardhat
// will compile your contracts, add the Hardhat Runtime Environment's members to the
// global scope, and execute the script.
const hre = require("hardhat");
require('dotenv').config();

async function main() {
    
    const privateKey = process.env.PRIVATE_KEY;

    const provider = ethers.getDefaultProvider(process.env.ALCHEMY_URL);

    const wallet = new ethers.Wallet(privateKey, provider);

  const contract = await hre.ethers.getContractFactory("codexDAOGovernance");

  const codexDAO = await contract.attach("0x3Fd1BE14784F3AB44e1206A93792d69B86d8Ff76");

  const signer = "0x438Ce7f768E70A27673C7c5A68A3637faB2F12eB";

  console.log("contract interface fetched:", codexDAO);

  console.log("balance previous:", await codexDAO.balanceOf(signer))

  await codexDAO.connect(wallet).createProposal("1rst CodexDAO Footprint", 500);
  
  console.log("proposal created");

  console.log("balance after:", await codexDAO.balanceOf(signer));

  codexDAO.on("newProposal", async (creator, proposalId) => {
    console.log("new proposal detected");
    await console.log("Creator:"+ creator);
    await console.log("Proposal Id:"+ proposalId);
  })

  console.log("total proposal votes:", await codexDAO.getProposalVoteCount(0));

}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
