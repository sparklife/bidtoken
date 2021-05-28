// SPDX-License-Identifier: MIT
pragma solidity ^0.8.3;
import "./Bid.sol";

contract TestAuction is Bid {
    uint time;

    constructor(
        string memory contractName,
        uint targetAmountEth,
        uint durationInMin,
        address payable beneficiaryAddress
    )
        Bid(contractName, targetAmountEth, durationInMin, beneficiaryAddress)
    {

    }

    function currentTime() override internal view returns(uint) {
        return time;
    }

    function setCurrentTime(uint newTime) public {
        time = newTime;
    }
}