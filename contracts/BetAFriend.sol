// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

// To use console.log
import "hardhat/console.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";


contract BetAFriend is ERC20 {

    address private deployer;

    struct BetData{
        address player1;
        address player2;
        uint _sumLocked;
        address winner;
        address loser;
    }

    uint public maxBonusTokens;

    mapping (address => mapping(uint => BetData)) public systemBets;
    mapping (address => bool) public newUsers;

    event newBet(address player1, address player2, uint betReference);
    event betResolved(uint betReference, address winner);


    constructor(uint256 initialSupply) ERC20("BetAFriend", "BAF") {
        maxBonusTokens = initialSupply/10;
        _mint(msg.sender, initialSupply);
        deployer = msg.sender;
    }

    function checkBet(uint _betReference) public returns (string memory, bool){
        require((systemBets[msg.sender][_betReference].player1 == msg.sender || systemBets[msg.sender][_betReference].player2 == msg.sender ), "You're not a player from this bet");
        if(systemBets[msg.sender][_betReference].winner != msg.sender){
            emit betResolved(_betReference, msg.sender);
            return ("Loser", false);
        } else{
            emit betResolved(_betReference, msg.sender);
            return ("Winner", true);
        }
    }
    
    function claimNewUserBonus() public {
        require (newUsers[msg.sender] == false, "Already a user");
        newUsers[msg.sender] = true;
        require(maxBonusTokens >= 20000, "No more Bonus to claim");
        transferFrom(deployer, msg.sender, 20000);
        maxBonusTokens -= 20000;
    }

    function remainingBonusTokens() external onlyDeployer view returns(uint){
        return maxBonusTokens;
    }

    modifier onlyDeployer {
        require(msg.sender == deployer, "Not authorized");
        _;
    }

    

}