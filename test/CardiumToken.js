const CardiumToken = artifacts.require("./CardiumToken.sol");
const util = require('./util');
const BigNumber = web3.BigNumber;


contract('CardiumToken - burning', function (accounts) {
    // account[0] points to the owner on the testRPC setup
    const owner = accounts[0];
    const user1 = accounts[1];

    let token = null;

    beforeEach(async function () {
        token = await CardiumToken.new();
    });

    it('should allow to burn your own tokens', async function () {
        //check balance
        const balanceBefore = await token.balanceOf(owner);
        assert.strictEqual(balanceBefore.toString(), '47537200000000')
        //check total supply
        const totalBefore = await token.totalSupply();
        assert.strictEqual(totalBefore.toString(), '47537200000000')
        //burn
        await token.burn('1', { from: owner });

        // check balance
        const balanceAfter = await token.balanceOf(owner)
        assert.strictEqual(balanceAfter.toString(), '47537199999999')
        // check total supply
        const totalAfter = await token.totalSupply()
        assert.strictEqual(totalAfter.toString(), '47537199999999')
    });

    it("should not allow to burn tokens for non-admin", async function () {
        // Owner transfers 10 tokens to user1
        await token.transfer(user1, 10);
        await util.assertRevert(token.burn(5, { from: user1 }));
    });

});



contract('CardiumToken - transfer', function (accounts) {
    // account[0] points to the owner on the testRPC setup
    const owner = accounts[0];
    const user1 = accounts[1];

    let token = null;

    beforeEach(async function () {
        token = await CardiumToken.new();
    });

    it('should allow transfer', async function () {
        //check balances
        assert.strictEqual((await token.balanceOf(owner)).toString(), '47537200000000')
        assert.strictEqual((await token.balanceOf(user1)).toString(), '0')

        //transfer
        await token.transfer(user1, '123');

        //check balances
        assert.strictEqual((await token.balanceOf(owner)).toString(), '47537199999877')
        assert.strictEqual((await token.balanceOf(user1)).toString(), '123')
    });

    it("should reject transfer if you have no enough funds", async function () {
        await token.transfer(user1, 10);
        await util.assertRevert(token.burn(11, { from: user1 }));
    });

    it("should not allow ETH sending", async function () {
        const promise = token.sendTransaction({ value: 20000, from: owner })
        await util.assertRevert(promise)
    });
});



contract('CardiumToken - freezing', function (accounts) {
    // account[0] points to the owner on the testRPC setup
    const owner = accounts[0];
    const user1 = accounts[1];
    const otherUser = accounts[2];

    let token = null;

    beforeEach(async function () {
        token = await CardiumToken.new();
    });

    it('should obey freeze functionality for transfer', async function () {
        //not frozen by default
        assert.strictEqual('' + await token.paused(), 'false')

        //freeze
        await token.pause()
        assert.strictEqual('' + await token.paused(), 'true')

        //try to transfer - not successfull
        await util.assertRevert(token.transfer(user1, '123'));

        //un-freeze
        await token.unpause()
        assert.strictEqual('' + await token.paused(), 'false')

        //ok then, just usual transfer

        //check balances
        assert.strictEqual((await token.balanceOf(owner)).toString(), '47537200000000')
        assert.strictEqual((await token.balanceOf(user1)).toString(), '0')

        //transfer
        await token.transfer(user1, '123');

        //check balances
        assert.strictEqual((await token.balanceOf(owner)).toString(), '47537199999877')
        assert.strictEqual((await token.balanceOf(user1)).toString(), '123')
    });

    // it('should obey freeze functionality for transferFrom', async function () {
    //     //not frozen by default
    //     assert.strictEqual('' + await token.paused(), 'false')

    //     //freeze
    //     await token.pause()
    //     assert.strictEqual('' + await token.paused(), 'true')

    //     //try to transfer - not successfull
    //     await token.approve(owner, user1, '123')
    //     await util.assertRevert(token.transferFrom(owner, user1, '123', { from: otherUser }));

    //     //un-freeze
    //     await token.unpause()
    //     assert.strictEqual('' + await token.paused(), 'false')

    //     //ok then, just usual transfer

    //     //check balances
    //     assert.strictEqual((await token.balanceOf(owner)).toString(), '47537200000000')
    //     assert.strictEqual((await token.balanceOf(user1)).toString(), '0')

    //     //transfer
    //     await token.transferFrom(owner, user1, '123');

    //     //check balances
    //     assert.strictEqual((await token.balanceOf(owner)).toString(), '47537199999877')
    //     assert.strictEqual((await token.balanceOf(user1)).toString(), '123')
    // });

    it("should allow to freeze only for admin", async function () {
        assert.strictEqual('' + await token.paused(), 'false')

        await util.assertRevert(token.pause({ from: user1 }));
        assert.strictEqual('' + await token.paused(), 'false')

        await token.pause({ from: owner })
        assert.strictEqual('' + await token.paused(), 'true')
    });

});
