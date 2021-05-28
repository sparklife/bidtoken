let AuctionDeadline = artifacts.require('./TestAuction')
const BigNumber = require('bignumber.js')

contract('Auction', function(accounts) {

    let contract;
    let contractCreator = accounts[0];
    let beneficiary = accounts[1];

    const ONE_ETH = new BigNumber(1000000000000000000);
    const ERROR_MSG = 'Returned error: VM Exception while processing transaction: revert';
    const ONGOING_STATE = 0;
    const FAILED_STATE = 1;
    const SUCCEEDED_STATE = 2;
    const PAID_OUT_STATE = 3;

    beforeEach(async function() {
        contract = await AuctionDeadline.new('funding', 1, 10, beneficiary, {from: contractCreator, gas: 2000000});
    });

   /* it('Contrato Inicializado.', async function() {
        let contractName = await contract.name.call()
        expect(contractName).to.equal('funding');

        let targetAmount = await contract.targetAmount.call()
        expect(ONE_ETH.isEqualTo(targetAmount)).to.equal(true);

        let Deadline = await contract.deadline.call()
        expect(Deadline.toNumber()).to.equal(600);

        let actualBeneficiary = await contract.beneficiary.call()
        expect(actualBeneficiary).to.equal(beneficiary);

        let state = await contract.state.call()
        expect(state.valueOf().toNumber()).to.equal(ONGOING_STATE);
    });*/

    it('Bids made.', async function() {
        await contract.contribute({value: ONE_ETH, from: contractCreator});

        let contributed = await contract.amounts.call(contractCreator);
        expect(ONE_ETH.isEqualTo(contributed)).to.equal(true);

        let totalCollected = await contract.totalCollected.call();
        expect(ONE_ETH.isEqualTo(totalCollected)).to.equal(true);
    });

    it('You cannot bid after the deadline.', async function() {
        try {
            await contract.setCurrentTime(601);
            await contract.sendTransaction({
                value: ONE_ETH,
                from: contractCreator
            });
            expect.fail();
        } catch (error) {
            expect(error.message).to.equal(ERROR_MSG);
        }
    })

    it('Auction Concluded.', async function() {
        await contract.contribute({value: ONE_ETH, from: contractCreator});
        await contract.setCurrentTime(601);
        await contract.finishAuction();
        let estado = await contract.state.call();

        expect(estado.valueOf().toNumber()).to.equal(SUCCEEDED_STATE);
    });

    it('Auction Failed. No winner.', async function() {
        await contract.setCurrentTime(601);
        await contract.finishAuction();
        let estado = await contract.state.call();

        expect(estado.valueOf().toNumber()).to.equal(FAILED_STATE);
    });

    it('Collecting money paid by the winner.', async function() {
        await contract.contribute({value: ONE_ETH, from: contractCreator});
        await contract.setCurrentTime(601);
        await contract.finishAuction();

        let initAmount = await web3.eth.getBalance(beneficiary);
        await contract.collect({from: contractCreator});

        let newBalance = await web3.eth.getBalance(beneficiary);
        let difference = newBalance - initAmount;
        expect(ONE_ETH.isEqualTo(difference)).to.equal(true);

        let fundingState = await contract.state.call()
        expect(fundingState.valueOf().toNumber()).to.equal(PAID_OUT_STATE);
    });

    it('Collecting contract funds.', async function() {
        await contract.contribute({value: ONE_ETH - 100, from: contractCreator});
        await contract.setCurrentTime(601);
        await contract.finishAuction();

        await contract.withdraw({from: contractCreator});
        let amount = await contract.amounts.call(contractCreator);
        expect(amount.toNumber()).to.equal(0);
    });

    it('Issued event.', async function() {
        await contract.setCurrentTime(601);
        const transaction = await contract.finishAuction();

        const events = transaction.logs
        expect(events.length).to.equal(1);

        const event = events[0]
        expect(event.args.totalCollected.toNumber()).to.equal(0);
        expect(event.args.succeeded).to.equal(false);
    });

});
