//chainA/GlobalGuardian.sol
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract GlobalGuardian {

    error NotOwner();
    error AlreadyPaused();
    error NotPaused();
    error InvalidOwner();

    address public owner;
    bool public paused;

    event SystemPaused();
    event SystemUnpaused();
    event OwnershipTransferred(address indexed oldOwner, address indexed newOwner);

    modifier onlyOwner() {
        if (msg.sender != owner) revert NotOwner();
        _;
    }

    constructor() {
        owner = msg.sender;
    }

    function pause() external onlyOwner {
        if (paused) revert AlreadyPaused();
        paused = true;
        emit SystemPaused();
    }

    function unpause() external onlyOwner {
        if (!paused) revert NotPaused();
        paused = false;
        emit SystemUnpaused();
    }

    function transferOwnership(address newOwner) external onlyOwner {
        if (newOwner == address(0)) revert InvalidOwner();
        emit OwnershipTransferred(owner, newOwner);
        owner = newOwner;
    }
}