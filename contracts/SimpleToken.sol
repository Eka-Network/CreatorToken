pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
//import "@openzeppelin/contracts/token/ERC20/ERC20Detailed.sol";

/**
 * @title SimpleToken
 * @dev Very simple ERC20 Token example, where all tokens are pre-assigned to the creator.
 * Note they can later distribute these tokens as they wish using `transfer` and other
 * `ERC20` functions.
 */
contract SimpleToken is ERC20 {

uint public count;

    constructor (
	string memory _name,
    string memory _symbol,
	uint _count
	
	)      

	public ERC20(_name,_symbol) {
        _mint(msg.sender, _count * (10 ** uint256(decimals())));
    }
}