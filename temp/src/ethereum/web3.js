import Web3 from 'web3'

export const web3 = new Web3(window.web3.currentProvider)

// Visualizar o provider 
console.log(window.web3.currentProvider)


/*

Exemplo para definição do provider para a rede Blockchain

if ((typeof window.ethereum !== 'undefined') || (typeof window.web3 !== 'undefined')) {
        return new Web3(window['ethereum'] || window.web3.currentProvider)
    } else {
        return new Web3(new Web3.providers.HttpProvider("https://mainnet.infura.io/v3/..."))
}


Use window.ethereum.enable() para solicitar permissão no Metamask

*/