const CardiumTokenOffering = artifacts.require("./CardiumTokenOffering.sol");
const CardiumToken = artifacts.require("./CardiumToken.sol");

const util = require('./util');
const BigNumber = web3.BigNumber;


contract('CardiumTokenOffering - buy tokens', function (accounts) {
    const owner = accounts[0];
    const investor = accounts[1];
    const otherGuy = accounts[2];


    let token = null;
    let instance = null;

    beforeEach(async function () {
        token = await CardiumToken.new();
        instance = await CardiumTokenOffering.new('10', token.address);
    });

    it('should accept payments and send tokens', async () => {
        await token.transfer(instance.address, '400000')
        //check token balances
        assert.strictEqual('' + await token.balanceOf(instance.address), '400000')
        assert.strictEqual('' + await token.balanceOf(investor), '0')

        //check wei balance
        assert.strictEqual('' + await util.getBalance(instance), '0')

        // //buy
        await instance.sendTransaction({ value: 20000, from: investor })

        // //check token balances
        assert.strictEqual('' + await token.balanceOf(instance.address), '398000')
        assert.strictEqual('' + await token.balanceOf(investor), '2000')

        // //check wei balance
        assert.strictEqual('' + await util.getBalance(instance.address), '20000')
    })

    it('should not accept payments if transfer is failed (token on pause)', async () => {
        await token.transfer(instance.address, '400000')
        //check token balances
        assert.strictEqual('' + await token.balanceOf(instance.address), '400000')
        assert.strictEqual('' + await token.balanceOf(investor), '0')

        //check wei balance
        assert.strictEqual('' + await util.getBalance(instance), '0')

        //pause
        await token.pause({ from: owner })

        // //buy
        const promise = instance.sendTransaction({ value: 20000, from: investor })
        await util.assertRevert(promise)

        // //check token balances
        assert.strictEqual('' + await token.balanceOf(instance.address), '400000')
        assert.strictEqual('' + await token.balanceOf(investor), '0')

        // //check wei balance
        assert.strictEqual('' + await util.getBalance(instance.address), '0')
    })
    it('should not accept payments if transfer is failed (no enough tokens)', async () => {
        await token.transfer(instance.address, '1999')
        //check token balances
        assert.strictEqual('' + await token.balanceOf(instance.address), '1999')
        assert.strictEqual('' + await token.balanceOf(investor), '0')

        //check wei balance
        assert.strictEqual('' + await util.getBalance(instance), '0')

        // //buy
        const promise = instance.sendTransaction({ value: 20000, from: investor })
        await util.assertRevert(promise)

        // //check token balances
        assert.strictEqual('' + await token.balanceOf(instance.address), '1999')
        assert.strictEqual('' + await token.balanceOf(investor), '0')

        // //check wei balance
        assert.strictEqual('' + await util.getBalance(instance.address), '0')
    })

});

contract('CardiumTokenOffering - change price', function (accounts) {
    const owner = accounts[0];
    const investor = accounts[1];
    const otherGuy = accounts[2];


    let token = null;
    let instance = null;

    beforeEach(async function () {
        token = await CardiumToken.new();
        instance = await CardiumTokenOffering.new('10', token.address);
    });

    it('should send amount of tokens depending on price', async () => {
        await token.transfer(instance.address, '10000')

        //check token balances
        assert.strictEqual('' + await token.balanceOf(instance.address), '10000')
        assert.strictEqual('' + await token.balanceOf(investor), '' + 0)


        //price 10
        await instance.setPrice(10)
        await instance.sendTransaction({ value: 50, from: investor })
        assert.strictEqual('' + await token.balanceOf(investor), '' + (0 + 5))

        //price 20
        await instance.setPrice(20)
        await instance.sendTransaction({ value: 50, from: investor })
        assert.strictEqual('' + await token.balanceOf(investor), '' + (0 + 5 + 2))

        //price 30
        await instance.setPrice(30)
        await instance.sendTransaction({ value: 50, from: investor })
        assert.strictEqual('' + await token.balanceOf(investor), '' + (0 + 5 + 2 + 1))

        //price 123
        await instance.setPrice(123)
        await instance.sendTransaction({ value: 12300, from: investor })
        assert.strictEqual('' + await token.balanceOf(investor), '' + (0 + 5 + 2 + 1 + 100))
    })
    it('should reject price changing for non-owner', async () => {
        assert.strictEqual('' + await instance.tokenPrice(), '10')

        await util.assertRevert(instance.setPrice('100', { from: investor }));
        assert.strictEqual('' + await instance.tokenPrice(), '10')

        await instance.setPrice('10000000', { from: owner })
        assert.strictEqual('' + await instance.tokenPrice(), '10000000')
    })
});

contract('CardiumTokenOffering - open/close offering', function (accounts) {
    const owner = accounts[0];
    const investor = accounts[1];
    const otherGuy = accounts[2];

    let token = null;
    let instance = null;

    beforeEach(async function () {
        token = await CardiumToken.new();
        instance = await CardiumTokenOffering.new('10', token.address);
    });

    it('should accept money only if offering is opened', async () => {
        await token.transfer(instance.address, '400000')

        //not paused by default
        assert.strictEqual('false', '' + await instance.paused())

        //buy
        await instance.sendTransaction({ value: 20000, from: investor })

        //check balances - 2000 tokens bought
        assert.strictEqual('' + await token.balanceOf(investor), '2000')
        assert.strictEqual('' + await util.getBalance(instance.address), '20000')

        //pause
        await instance.pause()
        assert.strictEqual('true', '' + await instance.paused())

        //expect fail on buy
        await util.assertRevert(instance.sendTransaction({ value: 20000, from: investor }));

        //check balances - nothing changed
        assert.strictEqual('' + await token.balanceOf(investor), '2000')
        assert.strictEqual('' + await util.getBalance(instance.address), '20000')

        //unpause
        await instance.unpause()
        assert.strictEqual('false', '' + await instance.paused())

        //buy
        await instance.sendTransaction({ value: 100, from: investor })

        //check balances - 10 tokens bought
        assert.strictEqual('' + await token.balanceOf(investor), '2010')
        assert.strictEqual('' + await util.getBalance(instance.address), '20100')
    })
    it('should reject opening/closing for non-owner', async () => {
        assert.strictEqual('false', '' + await instance.paused())

        //pause - non owner
        await util.assertRevert(instance.pause({ from: investor }));
        assert.strictEqual('false', '' + await instance.paused())

        //pause - owner
        await instance.pause({ from: owner })
        assert.strictEqual('true', '' + await instance.paused())

        //unpause - non owner
        await util.assertRevert(instance.unpause({ from: investor }));
        assert.strictEqual('true', '' + await instance.paused())

        //unpause - owner
        await instance.unpause({ from: owner })
        assert.strictEqual('false', '' + await instance.paused())
    })
});