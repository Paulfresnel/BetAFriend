// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";


contract codexDAOGovernance is ERC20 {

    address public owner;
    uint public proposalId = 0;

    struct Proposal {
        string title;
        address creator;
        uint totalForVoteAmount;
        uint totalAgainstVoteAmount;
        bool finished;
        uint creationDate;
    }

    mapping (address => mapping (uint => uint)) public proposalsVoteWeight;
    mapping(address => bool) public hasClaimed;
    mapping(uint => Proposal) public publicProposals;

    event newProposal(address indexed creator, uint indexed proposalId, uint creationDate);
    event newVote(address indexed voter, uint indexed proposalId, uint timestamp);
    event freeTokenClaim(address indexed claimer, uint timestamp);



    constructor(uint _initialSupply) ERC20("codexDAOToke,", "CDT"){
        _mint(msg.sender, _initialSupply);
        owner = msg.sender;
    }

    function claimFreeTokens() public isNewUser {
        _approve(owner, msg.sender, 10000);
        transferFrom(owner, msg.sender, 10000);
        uint ownerBalance = balanceOf(owner);
        ownerBalance -= 10000;
        uint senderBalance = balanceOf(msg.sender);
        senderBalance += 10000;
        hasClaimed[msg.sender] = true;
        emit freeTokenClaim(msg.sender, block.timestamp);
    }

    function addressBalance(address _userBalance) public view returns(uint) {
        uint userBalance = balanceOf(_userBalance);
        return userBalance;
    }

    function substractAmount(address _userBalance, uint _amountToDeduct) public view returns(uint) {
        uint userBalance = balanceOf(_userBalance);
        userBalance -= _amountToDeduct;
        return userBalance;
    }


    function castVote(uint _proposalId, uint voteAmount, bool voteIntention) public onlyHolders {
        require(addressBalance(msg.sender) >= voteAmount, "You do not have enough funds");
        require(proposalsVoteWeight[msg.sender][_proposalId] == 0, "You already voted on this proposal");
        if (voteIntention == true){
            substractAmount(msg.sender, voteAmount);
            publicProposals[_proposalId].totalForVoteAmount += voteAmount;

        }
        else {
            substractAmount(msg.sender, voteAmount);
            publicProposals[_proposalId].totalAgainstVoteAmount += voteAmount;
        }
        proposalsVoteWeight[msg.sender][_proposalId] += voteAmount;
        emit newVote(msg.sender, _proposalId, block.timestamp);
    }

    function createProposal(string memory title, uint _initialVote) public onlyHolders {
        require (_initialVote >= 150, "Minimum 150 Tokens to initiate a new proposal");
        require(addressBalance(msg.sender) >= _initialVote, "You do not have enough funds");
        
        Proposal memory proposal = publicProposals[proposalId];
        proposal.title = title;
        proposal.totalForVoteAmount = _initialVote;
        proposal.creator = msg.sender;
        proposal.creationDate = block.timestamp;
        emit newProposal(msg.sender, proposalId, block.timestamp);
        proposalId += 1;
    }

    function getProposalVoteCount(uint _proposalId) public view returns (uint, uint){
        Proposal memory proposal = publicProposals[_proposalId];
        return (proposal.totalForVoteAmount, proposal.totalAgainstVoteAmount);
    }

    modifier isNewUser{
        require(hasClaimed[msg.sender] == false, "Has already claimed");
        _;
    }

    modifier onlyHolders{
        require(addressBalance(msg.sender) >=500, "You need at least 500 Tokens to be able to vote");
        _;
    }

}