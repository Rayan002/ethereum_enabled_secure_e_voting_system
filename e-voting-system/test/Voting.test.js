const Voting = artifacts.require("Voting");

contract("Voting", (accounts) => {
    const [admin, voter1, voter2] = accounts;

    let votingInstance;

    before(async () => {
        votingInstance = await Voting.new(5); // 5 minutes election duration
    });

    it("should set the correct election admin", async () => {
        const electionAdmin = await votingInstance.electionAdmin();
        assert.equal(electionAdmin, admin, "Admin is not correctly set");
    });

    it("should register a voter", async () => {
        await votingInstance.registerVoter(voter1, { from: admin });
        const voter = await votingInstance.voters(voter1);
        assert.equal(voter.isRegistered, true, "Voter was not registered");
    });

    it("should not allow a non-admin to register a voter", async () => {
        try {
            await votingInstance.registerVoter(voter2, { from: voter1 });
        } catch (error) {
            assert.include(error.message, "Only admin can perform this action", "Non-admin was able to register a voter");
            return;
        }
        assert.fail("Expected error was not thrown");
    });

    it("should allow voting by a registered voter", async () => {
        await votingInstance.addCandidate("Alice", { from: admin });
        await votingInstance.vote(0, { from: voter1 });
        const voter = await votingInstance.voters(voter1);
        assert.equal(voter.hasVoted, true, "Voter was not able to vote");
    });

    it("should not allow double voting", async () => {
        try {
            await votingInstance.vote(0, { from: voter1 });
        } catch (error) {
            assert.include(error.message, "You have already voted", "Voter was able to vote twice");
            return;
        }
        assert.fail("Expected error was not thrown");
    });

    it("should not allow voting by an unregistered voter", async () => {
        try {
            await votingInstance.vote(0, { from: voter2 });
        } catch (error) {
            assert.include(error.message, "You are not registered to vote", "Unregistered voter was able to vote");
            return;
        }
        assert.fail("Expected error was not thrown");
    });

    it("should tally votes correctly and declare the winner", async () => {
        // Log the current block timestamp before increasing time
        let currentTimestamp = (await web3.eth.getBlock('latest')).timestamp;
        console.log("Current block timestamp before time increase:", currentTimestamp);

        // Simulate the passage of time so that the election can end
        await web3.currentProvider.send({
            jsonrpc: "2.0",
            method: "evm_increaseTime",
            params: [300], // Increase time by 5 minutes (300 seconds)
            id: new Date().getTime(),
        }, () => {});

        // Mine a new block to apply the time change
        await web3.currentProvider.send({
            jsonrpc: "2.0",
            method: "evm_mine",
            id: new Date().getTime(),
        }, () => {});

        // Log the current block timestamp after increasing time
        currentTimestamp = (await web3.eth.getBlock('latest')).timestamp;
        console.log("Current block timestamp after time increase:", currentTimestamp);

        // End the election after time has passed
        await votingInstance.endElection({ from: admin });

        // Get the winner
        const winner = await votingInstance.getWinner();
        assert.equal(winner, "Alice", "Winner was not correctly declared");
    });
});
