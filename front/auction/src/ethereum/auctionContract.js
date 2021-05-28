import { web3 } from "./web3"
import auctionAbi from "./auctionAbi"

export function createContract(contractAddress) {
    return new web3.eth.Contract(auctionAbi, contractAddress)
}