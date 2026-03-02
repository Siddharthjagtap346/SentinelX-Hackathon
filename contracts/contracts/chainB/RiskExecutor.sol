//chainB/RiskExecutor.sol
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

interface IRiskVault {
    function triggerWarning(uint256 health, uint256 price) external;
    function enableRestrictedMode(uint256 health, uint256 price) external;
    function partialLiquidation(uint256 reductionAmount, uint256 health, uint256 price) external;
    function fullLiquidation(uint256 health, uint256 price) external;
    function freezeVault(uint256 health, uint256 price) external;
}
interface IGlobalGuardian {
    function paused() external view returns (bool);
}
contract RiskExecutor {

    error NotOwner();
    error NotAuthorized();
    error InvalidAddress();
    error VaultNotApproved();
    error ReplayDetected();
    error InvalidNonce();

    enum ActionType { NONE, PARTIAL, FULL, FREEZE }

    address public owner;
    address public riskEngine;
    address public guardian;
    // 🔥 Multi-vault guardrail
    mapping(address => bool) public approvedVaults;

    // 🔐 Replay protection
    mapping(bytes32 => bool) public executedMessages;

    // 🔢 Optional per-vault nonce
    mapping(address => uint256) public vaultNonce;

    address public lastVault;
    uint256 public lastTimestamp;
    ActionType public lastAction;
    FreezeReason public lastReason;

    enum FreezeReason {
    NONE,
    RESERVE_BREACH,
    SYSTEMIC_RISK,
    VOLATILITY_SPIKE,
    MANUAL
}

    event ActionExecuted(
    address indexed vault,
    ActionType action,
    FreezeReason reason,
    uint256 nonce,
    uint256 timestamp
);

    event RiskEngineUpdated(address indexed engine);
    event OwnershipTransferred(address indexed oldOwner, address indexed newOwner);
    event VaultApproved(address indexed vault);
    event VaultRemoved(address indexed vault);

    modifier onlyOwner() {
        if (msg.sender != owner) revert NotOwner();
        _;
    }

    modifier onlyRiskEngine() {
        if (msg.sender != riskEngine) revert NotAuthorized();
        _;
    }
    modifier systemActive() {
    if (guardian != address(0) && IGlobalGuardian(guardian).paused())
        revert NotAuthorized();
    _;
}
    constructor() {
        owner = msg.sender;
    }

    function transferOwnership(address newOwner) external onlyOwner {
        if (newOwner == address(0)) revert InvalidAddress();
        emit OwnershipTransferred(owner, newOwner);
        owner = newOwner;
    }
function setGuardian(address _guardian) external onlyOwner {
    if (_guardian == address(0)) revert InvalidAddress();
    guardian = _guardian;
}
    function setRiskEngine(address _engine) external onlyOwner {
        if (_engine == address(0)) revert InvalidAddress();
        riskEngine = _engine;
        emit RiskEngineUpdated(_engine);
    }

    // 🔥 Multi-vault management

    function addVault(address vault) external onlyOwner {
        if (vault == address(0)) revert InvalidAddress();
        approvedVaults[vault] = true;
        emit VaultApproved(vault);
    }

    function removeVault(address vault) external onlyOwner {
        approvedVaults[vault] = false;
        emit VaultRemoved(vault);
    }

    // 🔐 Execution with replay protection + nonce

    function executePartial(
    address vault,
    uint256 nonce,
    uint256 reductionAmount,
    uint256 health,
    uint256 price
) external onlyRiskEngine systemActive {
    _executePartial(vault, nonce, reductionAmount, health, price);
}

    function executeFull(address vault, uint256 nonce, uint256 health, uint256 price) external onlyRiskEngine systemActive {
        _execute(vault, ActionType.FULL, nonce, health, price);
    }

    function freezeSystem(address vault, uint256 nonce, uint256 health, uint256 price) external onlyRiskEngine systemActive {
        _execute(vault, ActionType.FREEZE, nonce, health, price);
    }
function _executePartial(
    address vault,
    uint256 nonce,
    uint256 reductionAmount,
    uint256 health,
    uint256 price
) internal {

    _validateVault(vault);

    if (nonce != vaultNonce[vault] + 1) revert InvalidNonce();

    bytes32 messageId = keccak256(
    abi.encode(
        vault,
        ActionType.PARTIAL,
        nonce,
        reductionAmount
    )
);

    if (executedMessages[messageId]) revert ReplayDetected();

    executedMessages[messageId] = true;
    vaultNonce[vault] = nonce;

    IRiskVault(vault).partialLiquidation(
        reductionAmount,
        health,
        price
    );

    _record(vault, ActionType.PARTIAL, FreezeReason.NONE, nonce);
}
    

function _execute(
    address vault,
    ActionType action,
    uint256 nonce,
    uint256 health,
    uint256 price
) internal {

    _validateVault(vault);

    if (nonce != vaultNonce[vault] + 1) revert InvalidNonce();

    bytes32 messageId = keccak256(
        abi.encode(vault, action, nonce)
    );

    if (executedMessages[messageId]) revert ReplayDetected();

    executedMessages[messageId] = true;
    vaultNonce[vault] = nonce;

    // 🔥 CALL VAULT STATE MACHINE
    IRiskVault v = IRiskVault(vault);

   
if (action == ActionType.FULL) {
    v.fullLiquidation(health, price);
}
else if (action == ActionType.FREEZE) {
    v.freezeVault(health, price);
}

    FreezeReason reason = FreezeReason.NONE;

if (action == ActionType.FREEZE) {
    reason = FreezeReason.SYSTEMIC_RISK;
}

_record(vault, action, reason, nonce);
}

    function _validateVault(address vault) internal view {
        if (vault == address(0)) revert InvalidAddress();
        if (!approvedVaults[vault]) revert VaultNotApproved();
    }

    function _record(
    address vault,
    ActionType action,
    FreezeReason reason,
    uint256 nonce
) internal {
        lastVault = vault;
        lastTimestamp = block.timestamp;
        lastAction = action;
        lastReason = reason;

        emit ActionExecuted(vault, action, reason, nonce, block.timestamp);
    }
}