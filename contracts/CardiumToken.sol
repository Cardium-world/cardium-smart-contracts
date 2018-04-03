pragma solidity ^0.4.18;
import "zeppelin-solidity/contracts/ownership/Ownable.sol";
import "zeppelin-solidity/contracts/token/ERC20/StandardToken.sol";
import "zeppelin-solidity/contracts/token/ERC20/BurnableToken.sol";
import "zeppelin-solidity/contracts/lifecycle/Pausable.sol";


/*
 * CardiumToken is a standard ERC20 token with some additional functionalities:
 * - Transfers are only enabled after contract owner enables it (after the ICO)
 *
 * Note: Token Offering == Initial Coin Offering(ICO)
 */

contract CardiumToken is StandardToken, BurnableToken, Ownable, Pausable {
    string public constant symbol = "CAD";
    string public constant name = "Cardium Token";
    uint8 public constant decimals = 2;
    uint256 public constant INITIAL_SUPPLY = 475372000000 * (10 ** uint256(decimals));

    /**
     * Check if address is a valid destination to transfer tokens to
     * - must not be zero address
     * - must not be the token address
     */
    modifier validDestination(address to) {
        require(to != address(0x0));
        require(to != address(this));
        _;
    }

    /**
     * Token contract constructor
     */
    function CardiumToken() public {
        totalSupply = INITIAL_SUPPLY;

        // Mint tokens
        balances[msg.sender] = totalSupply;
        Transfer(address(0x0), msg.sender, totalSupply);
    }

    /**
     * Transfer from sender to another account
     *
     * @param to Destination address
     * @param value Amount of tokens to send
     */
    function transfer(address to, uint256 value) public validDestination(to) whenNotPaused returns (bool) {
        return super.transfer(to, value);
    }

    /**
     * Transfer from `from` account to `to` account using allowance in `from` account to the sender
     *
     * @param from Origin address
     * @param to Destination address
     * @param value Amount of tokens to send
     */
    function transferFrom(address from, address to, uint256 value) public validDestination(to) whenNotPaused returns (bool) {
        return super.transferFrom(from, to, value);
    }

    /**
     * Burn token, only owner is allowed to do this
     *
     * @param value Amount of tokens to burn
     */
    function burn(uint256 value) public onlyOwner {
        super.burn(value);
    }
}