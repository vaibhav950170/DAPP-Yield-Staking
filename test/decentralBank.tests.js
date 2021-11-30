const Tether = artifacts.require('Tether');
const RWD = artifacts.require('RWD');
const DecentralBank = artifacts.require('DecentralBank');

require('chai')
.use(require('chai-as-promised'))
.should()

contract('DecenteralBank', ([owner,customer]) => {
    //All of the code goes here for testing
    let tether, rwd, decentralBank

    function tokens(number) {
        return web3.utils.toWei(number,'ether')
    }
    before(async () => {
        //Load contracts
        tether = await Tether.new()
        rwd = await RWD.new()
        decentralBank = await DecentralBank.new(rwd.address, tether.address)

        //Transfer all token to decenteralbank
        await rwd.transfer(decentralBank.address,tokens('1000000'))
        await tether.transfer(customer, tokens('100'),{from: owner})
    })
    describe('Tether',async () => {
        it('matches name successfully', async () => {
            const name =await tether.name()
            assert.equal(name,'Tether')
        })
    })

    describe('RWD',async () => {
        it('matches name successfully', async () => {
            const name =await rwd.name()
            assert.equal(name,'Reward Token')
        })
    })

    describe('Decenteral Bank Deployement',async () => {
        it('matches name successfully', async () => {
            const name =await decentralBank.name()
            assert.equal(name,'Decentral Bank')
        })

        it('contract has tokens', async () =>{
            let balance = await rwd.balanceOf(decentralBank.address)
            assert.equal(balance,tokens('1000000'))
        })

    describe('Yield Farming', async ()=>{
        it('rewards tokens for staking', async() =>{
            let result
            //check investor balance
            result = await tether.balanceOf(customer)
            assert.equal(result.toString(),tokens('100'),'customer mock wallet balance before staking')
       

        // check staking for customer
        await tether.approve(decentralBank.address, tokens('100'),{from:customer})
        await decentralBank.depositTokens(tokens('100'), {from:customer})
        // //check updated balance of customer
        result = await tether.balanceOf(customer)
        assert.equal(result.toString(),tokens('0'),'customer mock wallet balance after staking')

        // //check updated balance of decentral bank
        result = await tether.balanceOf(decentralBank.address)
        assert.equal(result.toString(),tokens('100'),'decentral bank mock wallet balance after staking')

        // //isstaking balance
        result = await decentralBank.isStaked(customer)
        assert.equal(result.toString(),'true','customer is staking status after staking ')

        //Issue tokens
        await decentralBank.issueTokens({from:owner})

         //Ensure only the owner issue tokens
         await decentralBank.issueTokens({from:customer}).should.be.rejected;

        //unstake Tokens
        await decentralBank.unstakeTokens({from:customer})

        //check unstaking balances
        result = await tether.balanceOf(customer)
        assert.equal(result.toString(),tokens('100'),'customer mock wallet balance after unstaking')

        // //check updated balance of decentral bank
        result = await tether.balanceOf(decentralBank.address)
        assert.equal(result.toString(),tokens('0'),'decentral bank mock wallet balance after staking')

        // //isstaking update
        result = await decentralBank.isStaked(customer)
        assert.equal(result.toString(),'false','customer is no longer staking status after unstaking ')
    })
})

    })


})