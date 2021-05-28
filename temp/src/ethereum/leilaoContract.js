import { web3 } from "./web3"
import leilaoAbi from "./leilaoAbi"

export function createContract(contractAddress) {
    return new web3.eth.Contract(leilaoAbi, contractAddress)
}