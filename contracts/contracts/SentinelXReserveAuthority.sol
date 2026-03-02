/// @title SentinelX Reserve Authority
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/*
    SentinelX Reserve Authority
    CRE Runtime Report Receiver
    DON-Signed Proof-of-Reserve Enforcement
*/

import "./cre/interfaces/ReceiverTemplate.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

interface IGlobalGuardian {
    function pause() external;
    function unpause() external;
    function paused() external view returns (bool);
}

contract SentinelXReserveAuthority is ReceiverTemplate {
	 // =============================================================
    // STORAGE
    // =============================================================
    address public immutable guardian;
    address public immutable stableToken;

    uint256 public lastReserves;
    uint256 public lastSupply;
    uint256 public lastRiskScore;
    uint256 public lastBackingRatio;

    uint256 public lastReportTimestamp;
    uint256 public maxReportDelay = 1 hours;

    uint256 public minBackingRatio = 1e18; // 100%
    uint256 public maxRiskScore = 70;

    bool public systemFrozenByPoR;
// =============================================================
    // EVENTS
    // =============================================================
    event ReserveReportProcessed(
        uint256 reserves,
        uint256 supply,
        uint256 riskScore,
        uint256 backingRatio,
        bool systemPaused
    );

    event SystemFrozenByPoR(
    uint256 ratio,
    uint256 riskScore,
    string reason
);
    event SystemUnfrozen(uint256 ratio);
    event ThresholdsUpdated(uint256 ratio, uint256 risk);
    event MaxReportDelayUpdated(uint256 newDelay);

    constructor(
        address _forwarder,
        address _guardian,
        address _stableToken
    )
        ReceiverTemplate(_forwarder)
    {
        require(_guardian != address(0), "Invalid guardian");
        require(_stableToken != address(0), "Invalid stable token");

        guardian = _guardian;
        stableToken = _stableToken;
    }
// =============================================================
    // CRE REPORT ENTRYPOINT (DON-SIGNED)
    // =============================================================

    /*
        Payload expected:
        abi.encode(
            uint256 reserves,
            uint256 supply,
            uint256 riskScore
        )
    */
    function _processReport(bytes calldata payload) internal override {

        (
            uint256 reserves,
            uint256 supply,
            uint256 riskScore
        ) = abi.decode(payload, (uint256, uint256, uint256));

        require(supply > 0, "Invalid supply");

        uint256 onchainSupply = IERC20(stableToken).totalSupply();
        require(onchainSupply >= supply, "Supply mismatch");

        uint256 ratio = (reserves * 1e18) / supply;

        lastReserves = reserves;
        lastSupply = supply;
        lastRiskScore = riskScore;
        lastBackingRatio = ratio;
        lastReportTimestamp = block.timestamp;

        bool shouldPause = (ratio < minBackingRatio || riskScore > maxRiskScore);

        if (shouldPause && !IGlobalGuardian(guardian).paused()) {
    IGlobalGuardian(guardian).pause();
    systemFrozenByPoR = true;

    if (ratio < minBackingRatio) {
        emit SystemFrozenByPoR(ratio, riskScore, "UNDERCOLLATERALIZED");
    } else {
        emit SystemFrozenByPoR(ratio, riskScore, "RISK_THRESHOLD_BREACH");
    }
}

        emit ReserveReportProcessed(
            reserves,
            supply,
            riskScore,
            ratio,
            shouldPause
        );
    }
   // =============================================================
    // FRESHNESS CHECK
    // =============================================================
        function enforceFreshness() external {
        if (!isReportFresh() && !IGlobalGuardian(guardian).paused()) {
            IGlobalGuardian(guardian).pause();
            systemFrozenByPoR = true;
            emit SystemFrozenByPoR(
                lastBackingRatio,
                lastRiskScore,
                "STALE_REPORT"
            );
        }
    }

    function isReportFresh() public view returns (bool) {
        return block.timestamp - lastReportTimestamp <= maxReportDelay;
    }

    function updateThresholds(uint256 _ratio, uint256 _risk)
        external
        onlyOwner
    {
        minBackingRatio = _ratio;
        maxRiskScore = _risk;
        emit ThresholdsUpdated(_ratio, _risk);
    }

    function updateMaxReportDelay(uint256 newDelay)
        external
        onlyOwner
    {
        require(newDelay >= 5 minutes, "Too small");
        maxReportDelay = newDelay;
        emit MaxReportDelayUpdated(newDelay);
    }

// =============================================================
    // CONTROLLED RECOVERY
    // =============================================================

    function attemptUnpause() external onlyOwner {
        require(systemFrozenByPoR, "Not frozen");
        require(lastBackingRatio >= minBackingRatio, "Undercollateralized");
        require(lastRiskScore <= maxRiskScore, "Risk high");
        require(isReportFresh(), "Report stale");

        IGlobalGuardian(guardian).unpause();
        systemFrozenByPoR = false;

        emit SystemUnfrozen(lastBackingRatio);
    }
// =============================================================
    // VIEW HELPERS
    // =============================================================

    function getReserveStatus()
        external
        view
        returns (
            uint256 reserves,
            uint256 supply,
            uint256 ratio,
            uint256 riskScore,
            bool frozen,
            bool fresh
        )
    {
        return (
            lastReserves,
            lastSupply,
            lastBackingRatio,
            lastRiskScore,
            systemFrozenByPoR,
            isReportFresh()
        );
    }
}