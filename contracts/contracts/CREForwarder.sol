// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * Minimal local CRE Forwarder
 * This simulates the official Chainlink forwarder
 */
contract CREForwarder {

    address public don; // allowed DON caller

    constructor(address _don) {
        don = _don;
    }

    modifier onlyDON() {
        require(msg.sender == don, "Not DON");
        _;
    }

    function forward(address target, bytes calldata data)
        external
        onlyDON
        returns (bytes memory)
    {
        (bool success, bytes memory result) = target.call(data);
        require(success, "Forwarded call failed");
        return result;
    }
}