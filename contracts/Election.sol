pragma solidity ^0.5.16;

contract Election {
    // add candidate
    // read candidate
    // vote for candidate
    // constructor
    constructor() public{
        addCandidate("Candidate 1");
        addCandidate("Candidate 2");
    }

    struct Candidate {
        uint id;
        string name;
        uint voteCount;
    }

    mapping(uint => Candidate) public candidates; //key-value pair    1 : candidate1 2: candidate2
    uint public candidatesCount;

    function addCandidate(string memory _name) private { //_variable = function argument not a state variable
        candidatesCount++;
        candidates[candidatesCount] = Candidate(candidatesCount, _name, 0);
    }

    mapping(address => bool) public voters;

    event votedEvent (
        uint indexed _candidateId
    );

    function vote (uint _candidateId) public {
        // require that they haven't voted before
        require(!voters[msg.sender]);

        // require a valid candidate
        require(_candidateId > 0 && _candidateId <= candidatesCount);

        // record that voter has voted
        voters[msg.sender] = true;

        // update candidate vote Count
        candidates[_candidateId].voteCount ++;

        // trigger voted event
        emit votedEvent(_candidateId);
    }
}

// truffle migrate --reset
// The code and the data in the blockchin is immutable. If we do any changes in the smart contract, we have to redeploy it
// with the --reset flag. Then it will delete the previous data and deploy the new one.
