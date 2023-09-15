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
        uint proposalId;
        address[] voters;
    }

    mapping (address user => mapping (uint _proposalId => uint)) public proposalsVoteWeight;
    mapping(address user => bool) public hasClaimed;
    mapping(uint _proposalId => Proposal) public publicProposals;
    mapping (uint _proposalId => mapping (address user => uint)) public userTokensLockedInProposal;

    event newProposal(address indexed creator, uint indexed proposalId, uint creationDate);
    event newVote(address indexed voter, uint indexed proposalId, uint timestamp);
    event freeTokenClaim(address indexed claimer, uint timestamp);
    event claimedProposalStake(address indexed claimer, uint indexed _proposalId);

k  

    constructor(uint _initialSupply) ERC20("codexDAOToke,", "CDT"){
        _mint(msg.sender, _initialSupply);
        owner = msg.sender;
    }

    // Allows new users to claim 10,000 Free tokens - only allowed once per address

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

    // Returns the user tokens balance.

    function addressBalance(address _userBalance) public view returns(uint) {
        uint userBalance = balanceOf(_userBalance);
        return userBalance;
    }

    // Deducts an amount of tokens from a user to be locked on a proposals' Vault.

    function substractAmount(uint _proposalId, address _userBalance, uint _amountToDeduct) public view returns(uint) {
        _approve(msg.sender, address(this), _amountToDeduct);
        transfer(address(this), _amountToDeduct);
        userTokensLockedInProposal[_proposalId][msg.sender] += _amountToDeduct;
        uint userBalance = balanceOf(_userBalance);
        userBalance -= _amountToDeduct;
        return userBalance;
    }

    // Allows users to cast a FOR or AGAINST vote on an existing and ongoing proposal


    function castVote(uint _proposalId, uint voteAmount, bool voteIntention) proposalIsActive(uint _proposalId) public onlyHolders {
        Proposal memory proposal = publicProposals[_proposalId];
        require(block.timestamp <= proposal.creationDate + 1 week, "Proposal is finished");
        require(addressBalance(msg.sender) >= voteAmount, "You do not have enough funds");
        require(proposalsVoteWeight[msg.sender][_proposalId] == 0, "You already voted on this proposal");
        if (voteIntention == true){
            substractAmount(_proposalId, msg.sender, voteAmount);
            publicProposals[_proposalId].totalForVoteAmount += voteAmount;

        }
        else {
            substractAmount(_proposalId, msg.sender, voteAmount);
            publicProposals[_proposalId].totalAgainstVoteAmount += voteAmount;
        }
        publicProposals[_proposalId].voters.push(msg.sender);
        proposalsVoteWeight[msg.sender][_proposalId] += voteAmount;
        emit newVote(msg.sender, _proposalId, block.timestamp);
    }

    // Allows users to create their own proposal if they have over 500 tokens.
    // Creator sends their initialVote tokens amount to the proposal Vault.

    function createProposal(string memory title, uint _initialVote) public onlyHolders {
        require (_initialVote >= 150, "Minimum 150 Tokens to initiate a new proposal");
        require(title.length > 4, "Title is too short");
        require(addressBalance(msg.sender) >= _initialVote, "You do not have enough funds");
        _approve(msg.sender, address(this), _initialVote);
        transfer(address(this), _initialVote);
        userTokensLockedInProposal[proposalId][msg.sender] += _initialVote;
        Proposal memory proposal = publicProposals[proposalId];
        proposal.title = title;
        proposal.totalForVoteAmount = _initialVote;
        proposal.creator = msg.sender;
        proposal.creationDate = block.timestamp;
        proposal.proposalId = proposalId;
        proposal.voters.push(msg.sender); 
        emit newProposal(msg.sender, proposalId, block.timestamp);
        proposalId += 1;
    }

    // Returns the number of FOR & AGAINST votes for a proposal

    function getProposalVoteCount(uint _proposalId) public view returns (uint, uint){
        Proposal memory proposal = publicProposals[_proposalId];
        return (proposal.totalForVoteAmount, proposal.totalAgainstVoteAmount);
    }

    // Function will first check if proposal is over and tick it correctly.
    // Returns remaining time before proposal ends.

    function checkRemainingProposalTime(uint _proposalId) public returns (uint) {
        require(_proposalId <= proposalId, "This proposal doesn't exist");
        Proposal memory proposal = publicProposals[_proposalId];
        require(proposal.finsihed == false, "Proposal is not active anymore");
        if (block.timestamp <= proposal.creationDate + 1 week){
            proposal.finished = true;
            return 0;
        }
        else {
            return (block.timestamp - proposal.creationDate);
        }
    }

    // Allows users to claim their tokens once the proposal is over.

    function claimTokensFromProposal(uint _proposalId) public {
        uint userTokens = userTokensLockedInProposal[_proposalId][msg.sender];
        require(userTokens>= 500, "Don't have any tokens in proposal");
        _approve(address(this), userTokens);
        transferFrom(address(this), msg.sender, userTokens);
        userTokensLockedInProposal[_proposalId][msg.sender] = 0;
        emit claimedProposalStake(msg.sender, _proposalId);
    }

    // Only allow users who have not claimed their FreeTokensBonus yet.

    modifier isNewUser{
        require(hasClaimed[msg.sender] == false, "Has already claimed");
        _;
    }

    // Only users with over 500 tokens balance will be able to call.

    modifier onlyHolders{
        require(addressBalance(msg.sender) >=500, "You need at least 500 Tokens to be able to vote");
        _;
    }

    // Checks if proposal is active otherwise reverts.

    modifier proposalIsActive (uint _proposalId){
        Proposal memory proposal = publicProposals[_proposalId];
        require(block.timestamp <= proposal.creationDate + 1 week, "Proposal is not active anymore");
    }

}