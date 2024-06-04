// SPDX-License-Identifier: MIT
pragma solidity >=0.8.10;

import "openzeppelin-contracts/contracts/token/ERC721/ERC721.sol";
import "openzeppelin-contracts/contracts/utils/Strings.sol";
import "openzeppelin-contracts/contracts/access/Ownable.sol";
import "openzeppelin-contracts/contracts/token/ERC721/extensions/ERC721Enumerable.sol";

error MintPriceNotPaid();
error MaxSupply();
error NonExistentTokenURI();
error WithdrawTransfer();

contract FarconcertTicket is ERC721Enumerable, Ownable {
    using Strings for uint256;
    string public baseURI;
    string public redeemedBaseUri;
    uint256 public currentTokenId;
    uint256 public constant MAX_SUPPLY = 750;
    uint256 public constant MINT_PRICE = 0.005 ether;
    mapping(uint256 => bool) public redeemed;

    constructor(
        string memory _name,
        string memory _symbol,
        string memory _baseURI,
        string memory _redeemedBaseURI
    ) ERC721(_name, _symbol) Ownable(msg.sender) {
        baseURI = _baseURI;
        redeemedBaseUri = _redeemedBaseURI;

        for (uint i = 0; i < 50; i++) {
            uint256 newTokenId = currentTokenId + 1;
            if (newTokenId > MAX_SUPPLY) {
                revert MaxSupply();
            }
            currentTokenId = newTokenId;
            _safeMint(0x9266F125fb2EcB730D9953b46dE9C32e2Fa83E4a, newTokenId);
        }
    }

    function contractURI() public pure returns (string memory) {
        return
            "https://arweave.net/dspyJcrpFpjgcbnTYAF08CzVAYbUpPUZ-wwGbo3mPxs";
    }

    function airdrop(address[] memory recipients) external onlyOwner {
        for (uint i = 0; i < recipients.length; i++) {
            uint256 newTokenId = currentTokenId + 1;
            if (newTokenId > MAX_SUPPLY) {
                revert MaxSupply();
            }
            currentTokenId = newTokenId;
            _safeMint(recipients[i], newTokenId);
        }
    }

    function mintTo(address recipient) public payable returns (uint256) {
        if (msg.value != MINT_PRICE) {
            revert MintPriceNotPaid();
        }
        uint256 newTokenId = currentTokenId + 1;
        if (newTokenId > MAX_SUPPLY) {
            revert MaxSupply();
        }
        currentTokenId = newTokenId;
        _safeMint(recipient, newTokenId);
        return newTokenId;
    }

    function tokenURI(
        uint256 tokenId
    ) public view virtual override returns (string memory) {
        if (ownerOf(tokenId) == address(0)) {
            revert NonExistentTokenURI();
        } else if (redeemed[tokenId]) {
            return
                bytes(redeemedBaseUri).length > 0
                    ? string(
                        abi.encodePacked(redeemedBaseUri, tokenId.toString())
                    )
                    : "";
        }
        return
            bytes(baseURI).length > 0
                ? string(abi.encodePacked(baseURI, tokenId.toString()))
                : "";
    }

    function withdrawPayments(address payable payee) external onlyOwner {
        if (address(this).balance == 0) {
            revert WithdrawTransfer();
        }

        payable(payee).transfer(address(this).balance);
    }

    function redeem(uint256 ticketId) external onlyOwner {
        require(!redeemed[ticketId], "Ticket has already been redeemed.");
        redeemed[ticketId] = true;
    }

    function _checkOwner() internal view override {
        require(msg.sender == owner(), "Ownable: caller is not the owner");
    }
}
