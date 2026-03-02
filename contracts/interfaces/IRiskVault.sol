//interfaces/IRiskVault.sol
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

interface IRiskVault {

    enum RiskTier { LOW, MEDIUM, HIGH }
    enum EscalationLevel { NONE, WARNING, RESTRICT, PARTIAL, FULL }

    function collateral() external view returns (uint256);
    function debt() external view returns (uint256);

    function isLocked() external view returns (bool);
    function restrictedMode() external view returns (bool);

    function riskTier() external view returns (RiskTier);
    function lastEscalation() external view returns (EscalationLevel);

    function getHealthRatio(uint256 price) external view returns (uint256);

    function triggerWarning(uint256 health, uint256 price) external;
    function enableRestrictedMode(uint256 health, uint256 price) external;
    function partialLiquidation(uint256 reductionAmount, uint256 health, uint256 price) external;
    function fullLiquidation(uint256 health, uint256 price) external;

    function riskEngine() external view returns (address);
    function setRiskEngine(address _engine) external;

    function guardian() external view returns (address);
    function setGuardian(address _guardian) external;
}