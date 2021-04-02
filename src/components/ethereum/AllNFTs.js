import React, { useState, useEffect } from 'react';
import { BufferList } from "bl";
import ERC721 from '../../contracts/ERC721.json';
import NFTCards from './NFTCards.js'

const AllNFTs = ({ web3, accounts, nftFractionsDexContract, ipfs }) => {
    const [nftList, setNftList] = useState([]);

    useEffect(() => {
        const loadNfts = async () => {
            const nftsFromIpfs = [];
            const tokenIds = await nftFractionsDexContract.methods.getTokenIds().call();
            debugger
            for (let tokenId of tokenIds) {
                const tokenData = await nftFractionsDexContract.methods.getTokenData(tokenId).call();
                const myShares = await nftFractionsDexContract.methods.balanceOf(accounts[0], tokenId).call()
                const erc721 = new web3.eth.Contract(ERC721.abi, tokenData.erc721ContractAddress);
                const tokenURI = await erc721.methods.tokenURI(tokenData.erc721TokenId).call();
                let nftMetadataFromIPFS = { name: 'name' };
                for await (const file of ipfs.get(tokenURI)) {
                    const content = new BufferList()
                    for await (const chunk of file.content) {
                        content.append(chunk)
                    }
                    nftMetadataFromIPFS = JSON.parse(content.toString());
                }
                nftMetadataFromIPFS.myShares = myShares;
                nftMetadataFromIPFS.sharesAmount = tokenData.totalFractionsAmount;
                nftsFromIpfs.push(nftMetadataFromIPFS);
            }
            setNftList(nftsFromIpfs);
        }
        loadNfts();
    }, []);

    return (
        <>
            <NFTCards nftList={nftList} />
        </>
    )

}

export default AllNFTs;