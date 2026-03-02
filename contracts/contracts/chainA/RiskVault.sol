//chainA/RiskVault.sol
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

interface IGlobalGuardian {
    function paused() external view returns (bool);
}

contract RiskVault {

    error NotOwner();
    error NotAuthorized();
    error InvalidValue();
    error GuardianNotSet();
    error SystemPaused();
    error VaultLocked();
    error InvalidEscalation();

    enum RiskTier { LOW, MEDIUM, HIGH }
    enum EscalationLevel { NONE, WARNING, RESTRICT, PARTIAL, FULL }

    uint256 public collateral;
    uint256 public debt;

    bool public isLocked;
    bool public restrictedMode;

    RiskTier public riskTier;
    EscalationLevel public lastEscalation;

    address public owner;
    address public riskEngine;
    address public guardian;

    event VaultInitialized(uint256 collateral, uint256 debt, RiskTier tier);
    event EscalationTriggered(EscalationLevel level, uint256 health, uint256 price);
    event RestrictedModeEnabled();
    event PartialLiquidation(uint256 reducedDebt);
    event FullLiquidation(uint256 health, uint256 price);
    event RiskEngineUpdated(address indexed engine);
    event GuardianUpdated(address indexed guardian);

    modifier onlyOwner() {
        if (msg.sender != owner) revert NotOwner();
        _;
    }

    modifier onlyRiskEngine() {
        if (msg.sender != riskEngine) revert NotAuthorized();
        _;
    }

    modifier systemActive() {
        if (guardian == address(0)) revert GuardianNotSet();
        if (IGlobalGuardian(guardian).paused()) revert SystemPaused();
        _;
    }

    modifier notLocked() {
        if (isLocked) revert VaultLocked();
        _;
    }

    constructor(
        uint256 _collateral,
        uint256 _debt,
        RiskTier _tier
    ) {
        if (_collateral == 0 || _debt == 0) revert InvalidValue();

        collateral = _collateral;
        debt = _debt;
        riskTier = _tier;
        owner = msg.sender;

        emit VaultInitialized(_collateral, _debt, _tier);
    }

    function setRiskEngine(address _engine) external onlyOwner {
        if (_engine == address(0)) revert InvalidValue();
        riskEngine = _engine;
        emit RiskEngineUpdated(_engine);
    }

    function setGuardian(address _guardian) external onlyOwner {
        if (_guardian == address(0)) revert InvalidValue();
        guardian = _guardian;
        emit GuardianUpdated(_guardian);
    }

    function getHealthRatio(uint256 price) public view returns (uint256) {
        if (price == 0) revert InvalidValue();
        return (collateral * price * 100) / debt;
    }

    // ---- ESCALATION FLOW ----

    function triggerWarning(uint256 health, uint256 price)
        external
        onlyRiskEngine
        systemActive
        notLocked
    {
        if (lastEscalation != EscalationLevel.NONE) revert InvalidEscalation();

        lastEscalation = EscalationLevel.WARNING;
        emit EscalationTriggered(EscalationLevel.WARNING, health, price);
    }

    function enableRestrictedMode(uint256 health, uint256 price)
        external
        onlyRiskEngine
        systemActive
        notLocked
    {
        if (lastEscalation != EscalationLevel.WARNING) revert InvalidEscalation();

        restrictedMode = true;
        lastEscalation = EscalationLevel.RESTRICT;

        emit RestrictedModeEnabled();
        emit EscalationTriggered(EscalationLevel.RESTRICT, health, price);
    }

    function partialLiquidation(
        uint256 reductionAmount,
        uint256 health,
        uint256 price
    )
        external
        onlyRiskEngine
        systemActive
        notLocked
    {
        if (lastEscalation != EscalationLevel.RESTRICT) revert InvalidEscalation();
        if (reductionAmount == 0 || reductionAmount >= debt) revert InvalidValue();

        debt -= reductionAmount;
        lastEscalation = EscalationLevel.PARTIAL;

        emit PartialLiquidation(reductionAmount);
        emit EscalationTriggered(EscalationLevel.PARTIAL, health, price);
    }

    function fullLiquidation(uint256 health, uint256 price)
        external
        onlyRiskEngine
        systemActive
        notLocked
    {
        if (lastEscalation != EscalationLevel.PARTIAL) revert InvalidEscalation();

        isLocked = true;
        lastEscalation = EscalationLevel.FULL;

        emit FullLiquidation(health, price);
        emit EscalationTriggered(EscalationLevel.FULL, health, price);
    }

    function resetVault() external onlyOwner {
        isLocked = false;
        restrictedMode = false;
        lastEscalation = EscalationLevel.NONE;
    }
    function freezeVault(uint256 health, uint256 price)
    external
    onlyRiskEngine
    systemActive
    notLocked
{
    if (lastEscalation == EscalationLevel.FULL)
        revert InvalidEscalation();

    restrictedMode = true;
    lastEscalation = EscalationLevel.RESTRICT;

    emit EscalationTriggered(EscalationLevel.RESTRICT, health, price);
}
function getVaultSummary()
    external
    view
    returns (
        uint256 _collateral,
        uint256 _debt,
        uint256 _healthLocked,
        EscalationLevel _escalation,
        bool _locked,
        bool _restricted
    )
{
    return (
        collateral,
        debt,
        0,
        lastEscalation,
        isLocked,
        restrictedMode
    );
}
}