function toEther(n) {
    return web3.toWei(n, "ether");
}

module.exports = {
    assertRevert: async promise => {
        try {
            await promise;
            assert.fail('Expected revert not received');
        } catch (error) {
            const revetFound = error.message.search('revert') >= 0;
            assert(revetFound, `Expected "revert", got ${error} instead`);
        }
    },

    timeTravelInSeconds: function (durationInSec) {
        const id = Date.now()
        return new Promise((resolve, reject) => {
            web3.currentProvider.sendAsync({
                jsonrpc: '2.0',
                method: 'evm_increaseTime',
                params: [durationInSec],
                id: id,
            }, err1 => {
                if (err1) return reject(err1)

                web3.currentProvider.sendAsync({
                    jsonrpc: '2.0',
                    method: 'evm_mine',
                    id: id + 1,
                }, (err2, res) => {
                    return err2 ? reject(err2) : resolve(res)
                })
            })
        })
    },
    getAddressBalance: (account, at) =>
        promisify(cb => web3.eth.getBalance(account, at, cb)),

    getBalance: async contract => {
        if (typeof contract === 'string') {
            const balance = await getAddressBalance(contract)
            return balance.toString()
        } else {
            return contract.contract._eth.getBalance(contract.address).toNumber()
        }
    },

    toEther: toEther,

    toBee: toEther,

    halfEther: toEther(0.5),
    oneEther: toEther(1),
    twoEther: toEther(2),
    threeEther: toEther(3),
    fourEther: toEther(4),
    fiveEther: toEther(5),
    sixEther: toEther(6),
    eightEther: toEther(8),
    tenEther: toEther(10),
    hundredEther: toEther(100),

    GAS_LIMIT_IN_WEI: 50000000000,
    zeroAddress: '0x0000000000000000000000000000000000000000',
}