// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract Voting {
    struct Candidate {
        uint id;
        string name;
        uint voteCount;
    }

    struct Voter {
        bool isRegistered;
        bool hasVoted;
        uint votedCandidateId;
    }

    address public electionAdmin;
    mapping(address => Voter) public voters;
    Candidate[] public candidates;
    uint public electionEndTime;
    bool public electionEnded;

    modifier onlyAdmin() {
        require(msg.sender == electionAdmin, "Only admin can perform this action");
        _;
    }

    modifier onlyDuringElection() {
        require(block.timestamp <= electionEndTime, "Election has ended");
        _;
    }

    constructor(uint _electionDurationMinutes) {
        electionAdmin = msg.sender;
        electionEndTime = block.timestamp + (_electionDurationMinutes * 1 minutes);
        electionEnded = false;
    }

    function registerVoter(address _voter) external onlyAdmin {
        require(!voters[_voter].isRegistered, "Voter is already registered");
        voters[_voter].isRegistered = true;
    }

    function addCandidate(string memory _name) external onlyAdmin {
        candidates.push(Candidate({
            id: candidates.length,
            name: _name,
            voteCount: 0
        }));
    }

    function vote(uint _candidateId) external onlyDuringElection {
        require(voters[msg.sender].isRegistered, "You are not registered to vote");
        require(!voters[msg.sender].hasVoted, "You have already voted");
        require(_candidateId < candidates.length, "Invalid candidate ID");

        voters[msg.sender].hasVoted = true;
        voters[msg.sender].votedCandidateId = _candidateId;
        candidates[_candidateId].voteCount++;
    }

    function endElection() external onlyAdmin {
        require(!electionEnded, "Election already ended");
        require(block.timestamp >= electionEndTime, "Cannot end election before time");

        electionEnded = true;
    }

    function getWinner() external view returns (string memory winnerName) {
        require(electionEnded, "Election is still ongoing");

        uint maxVotes = 0;
        for (uint i = 0; i < candidates.length; i++) {
            if (candidates[i].voteCount > maxVotes) {
                maxVotes = candidates[i].voteCount;
                winnerName = candidates[i].name;
            }
        }
    }
}
