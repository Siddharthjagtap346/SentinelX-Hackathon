// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

interface IRiskExecutor {

    enum ActionType { NONE, PARTIAL, FULL, FREEZE }

    function lastVault() external view returns (address);
    function lastTimestamp() external view returns (uint256);
    function lastAction() external view returns (ActionType);

    function vaultNonce(address vault) external view returns (uint256);
    function executedMessages(bytes32 id) external view returns (bool);

    function executePartial(address vault, uint256 nonce) external;
    function executeFull(address vault, uint256 nonce) external;
    function freezeSystem(address vault, uint256 nonce) external;

    function riskEngine() external view returns (address);
    function setRiskEngine(address _engine) external;
}