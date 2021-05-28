// SPDX-License-Identifier: MIT
pragma solidity ^0.8.3;

contract Bid {
  enum State { Progress, Fail, Success, Paid }

  event AuctionFinished(
        address addr,
        uint totalCollected,
        bool succeeded
  );
  string internal constant NAME = 'Bid Token';
  string internal constant SYMBOL = 'Bid';
  uint8 internal constant DECIMALS = 18;

  uint256 public constant REVISION = 1;

  string contractName;
  uint public targetAmount;
  uint public deadline;
  address payable public participant;
  address public owner;
  State public state;

  mapping(address => uint) public amounts;
  bool public collected;
  uint public totalCollected;  
  
  modifier inState(State expectedState) {
    require(state == expectedState, "Invalid State");
    _;
  }

  constructor (
    string memory name,
    uint targetAmountEth,
    uint durationTime,
    address payable participantAdress
    ) {

    contractName = name;
    targetAmount = etherToWai(targetAmountEth);
    deadline = currentTime() +  minutesToSeconsd(durationTime );
    participant =  participantAdress;
    owner = msg.sender;
    state = State.Progress;
  }

   function contribute() public payable inState(State.Progress) {
        require(beforeDeadline(), "Not is permissioned bids after the deadline");
        amounts[msg.sender] += msg.value;
        totalCollected += msg.value;

        if (totalCollected >= targetAmount) {
            collected = true;
        }
    }

  function finishAuction() public inState(State.Progress) {
        require(!beforeDeadline(), "Not is possible finish the auction before the deadline");

        if (!collected) {
            state = State.Fail;
        } else {
            state = State.Success;
        }

        emit AuctionFinished(address(this), totalCollected, collected);
    }

    function collect() public inState(State.Success) {
        if (participant.send(totalCollected)) {
            state = State.Paid;
        } else {
            state = State.Fail;
        }
    }

    function withdraw() public inState(State.Fail) {
        require(amounts[msg.sender] > 0, "Anyone bid was done.");
        uint contributed = amounts[msg.sender];
        amounts[msg.sender] = 0;
        address payable addr1 = payable(msg.sender);
        if (!addr1.send(contributed)) {
            amounts[addr1] = contributed;
        }
    }


    function beforeDeadline() public view returns(bool) {
        return currentTime() < deadline;
    }

    function currentTime() internal view virtual returns(uint) {
        return block.timestamp;
    }

    function getTotalCollected() public view returns(uint) {
        return totalCollected;
    }

    function inProgress() public view returns (bool) {
        return state == State.Progress || state == State.Success;
    }

    function isSuccessful() public view returns (bool) {
        return state == State.Paid;
    }

     function etherToWai(uint sumInEth) public pure returns(uint)  {
    return sumInEth * 1 ether;
    }

    function minutesToSeconsd(uint timeInMin) public pure returns(uint)  {
      return timeInMin * 1 minutes;
    }
}
